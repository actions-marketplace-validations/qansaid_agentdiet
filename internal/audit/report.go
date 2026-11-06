package audit

import (
	"fmt"
	"math"
	"sort"
	"strings"
)

// Grade budgets are absolute always-on tokens, not percentages of the window.
// A percentage of 200k makes every real repository an "A" and the grade becomes
// decoration; 4,000 tokens of instructions before the user has typed a word is
// already a lot of standing attention to spend.
var gradeBudgets = []struct {
	Grade string
	Max   int
}{
	{"A", 1500},
	{"B", 4000},
	{"C", 8000},
	{"D", 16000},
}

func gradeFor(tokens int) (string, int) {
	for _, g := range gradeBudgets {
		if tokens <= g.Max {
			return g.Grade, g.Max
		}
	}
	return "F", 16000
}

func (r *Report) compute() {
	for _, f := range r.Files {
		switch f.Tier {
		case TierAlwaysOn:
			r.AlwaysOnTokens += f.Tokens
		case TierScoped:
			r.ScopedTokens += f.Tokens
		case TierOnDemand:
			r.OnDemandTokens += f.Tokens
		}
	}
	if r.Window > 0 {
		r.AlwaysOnShare = math.Round(float64(r.AlwaysOnTokens)/float64(r.Window)*10000) / 100
	}
	r.Grade, r.GradeBudget = gradeFor(r.AlwaysOnTokens)
	r.CostPer1kSessions = math.Round(float64(r.AlwaysOnTokens)*1000/1e6*r.PricePerMTok*100) / 100
	r.Findings = r.detectFindings()
}

// detectFindings runs the cheap static checks that produce the report's advice.
func (r *Report) detectFindings() []Finding {
	out := []Finding{}

	// 1. Verbatim blocks present in more than one file. This is the most common
	// real-world bloat: CLAUDE.md and AGENTS.md maintained in parallel, or the
	// same "use TypeScript strict mode" paragraph in five rule files.
	blocks := map[string][]string{} // normalized block -> files
	blockTokens := map[string]int{}
	for _, f := range r.Files {
		if f.Tier == TierConfig {
			continue
		}
		seen := map[string]bool{}
		for _, b := range splitBlocks(f.content) {
			norm := normalizeBlock(b)
			if len(norm) < 40 || seen[norm] {
				continue
			}
			seen[norm] = true
			blocks[norm] = append(blocks[norm], f.Path)
			blockTokens[norm] = Estimate(b)
		}
	}

	type dup struct {
		files  []string
		tokens int // tokens recoverable if kept once
	}
	dups := []dup{}
	byPair := map[string]*dup{}
	for norm, paths := range blocks {
		if len(paths) < 2 {
			continue
		}
		sort.Strings(paths)
		key := strings.Join(paths, "\x00")
		d, ok := byPair[key]
		if !ok {
			d = &dup{files: paths}
			byPair[key] = d
		}
		d.tokens += blockTokens[norm] * (len(paths) - 1)
	}
	for _, d := range byPair {
		dups = append(dups, *d)
	}
	sort.Slice(dups, func(i, j int) bool { return dups[i].tokens > dups[j].tokens })
	limit := len(dups)
	if limit > 3 {
		limit = 3
	}
	for _, d := range dups[:limit] {
		if d.tokens < 20 {
			continue
		}
		out = append(out, Finding{
			Kind:   "duplicate",
			Tokens: d.tokens,
			Detail: fmt.Sprintf("%s tokens repeated across %s", commas(d.tokens), joinPaths(d.files)),
			Fix:    "keep the text in one file and point at it from the others",
		})
	}

	// 2. Near-duplicate instruction files: one is a stale copy of the other.
	for i := 0; i < len(r.Files); i++ {
		for j := i + 1; j < len(r.Files); j++ {
			a, b := r.Files[i], r.Files[j]
			if a.Tier == TierConfig || b.Tier == TierConfig || a.Kind != b.Kind {
				continue
			}
			if a.Kind != "instructions" {
				continue
			}
			overlap, smaller := blockOverlap(a.content, b.content)
			if smaller == 0 || overlap/smaller < 0.6 || smaller < 3 {
				continue
			}
			out = append(out, Finding{
				Kind:   "near-duplicate",
				Tokens: minInt(a.Tokens, b.Tokens),
				Detail: fmt.Sprintf("%s is %.0f%% contained in %s", b.Path, overlap/smaller*100, a.Path),
				Fix:    "keep one canonical file; the other should be a pointer, not a copy",
			})
		}
	}

	// 3. Single files that are big enough to dominate the always-on budget.
	for _, f := range r.Files {
		if f.Tier == TierConfig {
			continue
		}
		if f.Tier == TierAlwaysOn && f.Tokens > 3000 {
			out = append(out, Finding{
				Kind:   "oversize",
				Tokens: f.Tokens,
				Detail: fmt.Sprintf("%s is %s tokens loaded on every request", f.Path, commas(f.Tokens)),
				Fix:    "move reference material into a skill or docs/ and keep the root file to rules",
			})
		}
	}

	// 4. Declared surface: MCP servers add tool schemas to the prompt as soon
	// as a session connects, which is a different cost than a file.
	if n := len(r.MCPServers); n > 0 {
		noun := "servers"
		if n == 1 {
			noun = "server"
		}
		out = append(out, Finding{
			Kind:   "scope",
			Tokens: 0,
			Detail: fmt.Sprintf("%d MCP %s declared (%s); tool schemas enter the prompt on connect", n, noun, strings.Join(r.MCPServers, ", ")),
			Fix:    "disable servers you do not use in this repo — schema cost scales with tool count",
		})
	}

	return out
}

// splitBlocks cuts a document into blank-line separated paragraphs.
func splitBlocks(content string) []string {
	raw := strings.Split(strings.ReplaceAll(content, "\r\n", "\n"), "\n\n")
	out := make([]string, 0, len(raw))
	for _, b := range raw {
		b = strings.TrimSpace(b)
		if b != "" {
			out = append(out, b)
		}
	}
	return out
}

// normalizeBlock lowercases and strips everything but letters and digits, so
// reflowed or re-punctuated copies of the same sentence still match.
func normalizeBlock(s string) string {
	var b strings.Builder
	b.Grow(len(s))
	for _, r := range strings.ToLower(s) {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r > 127 {
			b.WriteRune(r)
		}
	}
	return b.String()
}

// blockOverlap returns how many of the smaller document's blocks appear in the
// larger one, and how many blocks the smaller document has.
func blockOverlap(a, b string) (found, smaller float64) {
	as := map[string]bool{}
	for _, x := range splitBlocks(a) {
		as[normalizeBlock(x)] = true
	}
	bs := map[string]bool{}
	for _, x := range splitBlocks(b) {
		bs[normalizeBlock(x)] = true
	}
	if len(as) == 0 || len(bs) == 0 {
		return 0, 0
	}
	small, big := as, bs
	if len(as) > len(bs) {
		small, big = bs, as
	}
	for k := range small {
		if big[k] {
			found++
		}
	}
	return found, float64(len(small))
}

// joinPaths lists at most three paths; a finding is a nudge, not a manifest.
func joinPaths(paths []string) string {
	if len(paths) <= 3 {
		return strings.Join(paths, " ↔ ")
	}
	return fmt.Sprintf("%s and %d more", strings.Join(paths[:2], " ↔ "), len(paths)-2)
}

func minInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}
