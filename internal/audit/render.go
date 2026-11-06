package audit

import (
	"encoding/json"
	"fmt"
	"io"
	"strconv"
	"strings"
)

// DefaultTop caps how many files a section prints. Long skill lists are usually
// copy-paste across several client directories and drown the two numbers the
// reader came for.
const DefaultTop = 8

// Badge is the shields.io endpoint document. Shipping it in the binary turns
// every adopter's README into a growth loop: the badge links back here and
// updates itself from CI without anyone maintaining a number by hand.
func (r *Report) Badge() []byte {
	color := map[string]string{
		"A": "brightgreen", "B": "green", "C": "yellow", "D": "orange", "F": "red",
	}[r.Grade]
	if color == "" {
		color = "lightgrey"
	}
	doc := struct {
		SchemaVersion int    `json:"schemaVersion"`
		Label         string `json:"label"`
		Message       string `json:"message"`
		Color         string `json:"color"`
	}{
		SchemaVersion: 1,
		Label:         "agent context",
		Message:       fmt.Sprintf("%s tok · %s", compact(r.AlwaysOnTokens), r.Grade),
		Color:         color,
	}
	b, _ := json.MarshalIndent(doc, "", "  ")
	return append(b, '\n')
}

// JSON renders the machine-readable report.
func (r *Report) JSON() ([]byte, error) {
	b, err := json.MarshalIndent(r, "", "  ")
	if err != nil {
		return nil, err
	}
	return append(b, '\n'), nil
}

// RenderText writes the human report with the default row cap.
func (r *Report) RenderText(w io.Writer) { r.RenderTextTop(w, DefaultTop) }

// RenderTextTop writes the human report showing at most top files per section.
func (r *Report) RenderTextTop(w io.Writer, top int) {
	if top <= 0 {
		top = DefaultTop
	}

	fmt.Fprintf(w, "agentdiet %s  ·  %s\n", r.Version, r.Root)
	fmt.Fprintf(w, "estimator: %s\n", r.Estimator)

	sections := []struct {
		title string
		tier  Tier
	}{
		{"ALWAYS-ON   paid on every request, before you type", TierAlwaysOn},
		{"SCOPED   loaded only while editing that subtree", TierScoped},
		{"ON-DEMAND   costs nothing until the agent opens it", TierOnDemand},
		{"CONFIG   not context; declares what the agent may call", TierConfig},
	}
	parts := []string{}
	for _, s := range sections {
		if block, ok := r.section(s.title, s.tier, top); ok {
			parts = append(parts, block)
		}
	}
	if len(parts) > 0 {
		fmt.Fprint(w, "\n"+strings.Join(parts, "\n\n"))
	}

	fmt.Fprintf(w, "\n\nTOTAL      %s always-on tokens  (%.2f%% of a %s-token window)\n",
		commas(r.AlwaysOnTokens), r.AlwaysOnShare, commas(r.Window))
	fmt.Fprintf(w, "GRADE      %s  (budget %s)   on-demand surface: %s tokens\n",
		r.Grade, commas(r.GradeBudget), commas(r.OnDemandTokens))
	fmt.Fprintf(w, "COST       $%.2f per 1,000 sessions at $%.2f per 1M input tokens\n",
		r.CostPer1kSessions, r.PricePerMTok)

	fmt.Fprintln(w, "\nFINDINGS")
	if len(r.Findings) == 0 {
		fmt.Fprintln(w, "  · nothing to trim — your context is lean")
	}
	for _, f := range r.Findings {
		fmt.Fprintf(w, "  · %s\n    → %s\n", f.Detail, f.Fix)
	}

	if r.AlwaysOnTokens > 0 && r.OnDemandTokens > 3*r.AlwaysOnTokens {
		fmt.Fprintf(w, "\nNOTE       %s tokens sit on demand — %.1fx the always-on tax, and free.\n",
			commas(r.OnDemandTokens), float64(r.OnDemandTokens)/float64(r.AlwaysOnTokens))
	}

	fmt.Fprintln(w, "\n--json for machines  ·  --badge for shields.io  ·  github.com/indraoverflow/agentdiet")
}

// section renders one tier and reports whether it had anything to show.
func (r *Report) section(title string, tier Tier, top int) (string, bool) {
	files := make([]File, 0, 8)
	for _, f := range r.Files {
		if f.Tier == tier {
			files = append(files, f)
		}
	}
	if len(files) == 0 {
		return "", false
	}

	shown := files
	hidden, hiddenTokens := 0, 0
	if len(files) > top {
		shown = files[:top]
		for _, f := range files[top:] {
			hidden++
			hiddenTokens += f.Tokens
		}
	}

	width := 6
	for _, f := range shown {
		if n := len(commas(f.Tokens)); n > width {
			width = n
		}
	}

	var b strings.Builder
	b.WriteString(title)
	for _, f := range shown {
		if tier == TierConfig {
			fmt.Fprintf(&b, "\n  %*s  %-11s  %s", width, commas(f.Tokens), f.Kind, f.Path)
			continue
		}
		share := 0.0
		if r.Window > 0 {
			share = float64(f.Tokens) / float64(r.Window) * 100
		}
		fmt.Fprintf(&b, "\n  %*s  %5.2f%%  %6s  %s", width, commas(f.Tokens), share, commas(f.Lines)+" L", f.Path)
	}
	if hidden > 0 {
		fmt.Fprintf(&b, "\n  %*s  %5s  %6s  … %d more files", width, "—", "—", fmt.Sprintf("+%s", compact(hiddenTokens)), hidden)
	}
	return b.String(), true
}

func commas(n int) string {
	s := strconv.Itoa(n)
	if len(s) <= 3 {
		return s
	}
	neg := false
	if s[0] == '-' {
		neg = true
		s = s[1:]
	}
	var parts []string
	for len(s) > 3 {
		parts = append([]string{s[len(s)-3:]}, parts...)
		s = s[:len(s)-3]
	}
	parts = append([]string{s}, parts...)
	out := strings.Join(parts, ",")
	if neg {
		return "-" + out
	}
	return out
}

// compact renders 1234 as 1.2k, for badge messages only.
func compact(n int) string {
	switch {
	case n >= 1_000_000:
		return fmt.Sprintf("%.1fM", float64(n)/1e6)
	case n >= 1000:
		return fmt.Sprintf("%.1fk", float64(n)/1e3)
	default:
		return strconv.Itoa(n)
	}
}
