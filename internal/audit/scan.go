package audit

import (
	"encoding/json"
	"io/fs"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strings"
)

// Tier says when a file reaches the model.
//
// This is the distinction the whole tool exists for: a 40 KB AGENTS.md is paid
// for on every single request, while a 40 KB skill file costs nothing until the
// agent decides to open it. Tools that report "your repo has 120k tokens of
// agent config" collapse that difference and are useless for decisions.
type Tier string

const (
	// TierAlwaysOn is injected into the system prompt / first user message by
	// the runtime on every conversation, before the user types anything.
	TierAlwaysOn Tier = "always-on"
	// TierScoped is an instruction file that only applies inside a subtree
	// (e.g. services/api/AGENTS.md while editing services/api).
	TierScoped Tier = "scoped"
	// TierOnDemand is discoverable by the agent but loaded only when invoked.
	TierOnDemand Tier = "on-demand"
	// TierConfig is not context by itself, but it declares the surface the
	// agent may call into (MCP servers, hooks, permissions).
	TierConfig Tier = "config"
)

// File is one discovered agent-context file.
type File struct {
	Path   string `json:"path"`
	Kind   string `json:"kind"`
	Tier   Tier   `json:"tier"`
	Bytes  int    `json:"bytes"`
	Lines  int    `json:"lines"`
	Tokens int    `json:"tokens"`

	content string
}

// Finding is a single actionable observation.
type Finding struct {
	Kind   string `json:"kind"`   // duplicate | oversize | near-duplicate | scope
	Tokens int    `json:"tokens"` // tokens involved, 0 when not applicable
	Detail string `json:"detail"`
	Fix    string `json:"fix"`
}

// Report is the complete audit result and the --json payload.
type Report struct {
	Tool         string  `json:"tool"`
	Version      string  `json:"version"`
	Root         string  `json:"root"`
	Estimator    string  `json:"estimator"`
	Window       int     `json:"window"`
	PricePerMTok float64 `json:"pricePerMTok"`

	Files []File `json:"files"`

	AlwaysOnTokens int     `json:"alwaysOnTokens"`
	ScopedTokens   int     `json:"scopedTokens"`
	OnDemandTokens int     `json:"onDemandTokens"`
	AlwaysOnShare  float64 `json:"alwaysOnSharePercent"`

	Grade             string  `json:"grade"`
	GradeBudget       int     `json:"gradeBudget"`
	CostPer1kSessions float64 `json:"costPer1kSessionsUSD"`

	MCPServers []string  `json:"mcpServers"`
	Findings   []Finding `json:"findings"`
}

// skipDirs are never worth walking: VCS metadata, dependency trees, build
// output. A vendored AGENTS.md is not the user's context and counting it would
// make every large repo look bloated.
var skipDirs = map[string]bool{
	".git": true, "node_modules": true, "vendor": true, "dist": true,
	"build": true, "target": true, ".venv": true, "venv": true, ".next": true,
	"coverage": true, ".idea": true, "__pycache__": true, ".mypy_cache": true,
	".terraform": true, ".gradle": true, "out": true, ".turbo": true,
	"testdata": true,
}

const maxFileBytes = 2 << 20 // 2 MiB guard against minified blobs

// classify maps a slash-separated relative path to (kind, tier).
// ok is false when the path is not agent context.
func classify(rel string) (kind string, tier Tier, ok bool) {
	base := path.Base(rel)
	dir := path.Dir(rel)

	switch base {
	case "AGENTS.md", "CLAUDE.md", "GEMINI.md", "JULES.md", ".goosehints":
		if dir == "." || dir == ".claude" || dir == ".codex" {
			return "instructions", TierAlwaysOn, true
		}
		return "instructions", TierScoped, true
	case ".cursorrules", ".windsurfrules", ".clinerules", ".rules":
		if dir == "." {
			return "instructions", TierAlwaysOn, true
		}
	case "copilot-instructions.md":
		if dir == ".github" {
			return "instructions", TierAlwaysOn, true
		}
	case "AGENT.md", "README.agent.md":
		if dir == "." {
			return "instructions", TierAlwaysOn, true
		}
	case "SKILL.md":
		if strings.Contains("/"+rel, "/skills/") {
			return "skill", TierOnDemand, true
		}
	case "mcp.json", ".mcp.json":
		if base == ".mcp.json" || dir == ".cursor" || dir == ".vscode" || dir == ".claude" {
			return "mcp", TierConfig, true
		}
	case "settings.json":
		if dir == ".claude" {
			return "settings", TierConfig, true
		}
	case "config.toml":
		if dir == ".codex" {
			return "settings", TierConfig, true
		}
	}

	if strings.HasPrefix(rel, ".cursor/rules/") && strings.HasSuffix(base, ".mdc") {
		return "cursor-rule", TierOnDemand, true
	}
	if (strings.HasPrefix(rel, ".claude/commands/") ||
		strings.HasPrefix(rel, ".github/prompts/") ||
		strings.HasPrefix(rel, ".github/instructions/")) && strings.HasSuffix(base, ".md") {
		return "command", TierOnDemand, true
	}
	if strings.HasPrefix(rel, ".roo/rules/") || strings.HasPrefix(rel, ".continue/rules/") {
		if strings.HasSuffix(base, ".md") || strings.HasSuffix(base, ".mdc") {
			return "instructions", TierOnDemand, true
		}
	}
	return "", "", false
}

// Discover walks root and returns every agent-context file it finds, plus the
// MCP server names declared by any MCP config.
func Discover(root, version string, window int, price float64) (*Report, error) {
	abs, err := filepath.Abs(root)
	if err != nil {
		return nil, err
	}
	if fi, err := os.Stat(abs); err != nil {
		return nil, err
	} else if !fi.IsDir() {
		return nil, &os.PathError{Op: "open", Path: abs, Err: os.ErrInvalid}
	}

	files := make([]File, 0, 16)
	servers := []string{}
	serverSeen := map[string]bool{}

	err = filepath.WalkDir(abs, func(p string, d fs.DirEntry, err error) error {
		if err != nil {
			return nil // unreadable subtree: skip, do not abort the audit
		}
		if d.IsDir() {
			if p != abs && skipDirs[d.Name()] {
				return filepath.SkipDir
			}
			return nil
		}
		rel, relErr := filepath.Rel(abs, p)
		if relErr != nil {
			return nil
		}
		rel = filepath.ToSlash(rel)

		kind, tier, ok := classify(rel)
		if !ok {
			return nil
		}
		info, statErr := d.Info()
		if statErr != nil || info.Size() > maxFileBytes {
			return nil
		}
		data, readErr := os.ReadFile(p)
		if readErr != nil {
			return nil
		}
		content := string(data)

		files = append(files, File{
			Path:    rel,
			Kind:    kind,
			Tier:    tier,
			Bytes:   len(data),
			Lines:   countLines(content),
			Tokens:  Estimate(content),
			content: content,
		})

		if tier == TierConfig && kind == "mcp" {
			for _, name := range mcpServerNames(content) {
				if !serverSeen[name] {
					serverSeen[name] = true
					servers = append(servers, name)
				}
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	sort.Slice(files, func(i, j int) bool {
		if files[i].Tier != files[j].Tier {
			return tierRank(files[i].Tier) < tierRank(files[j].Tier)
		}
		if files[i].Tokens != files[j].Tokens {
			return files[i].Tokens > files[j].Tokens
		}
		return files[i].Path < files[j].Path
	})
	sort.Strings(servers)

	r := &Report{
		Tool:         "agentdiet",
		Version:      version,
		Root:         abs,
		Estimator:    Estimator,
		Window:       window,
		PricePerMTok: price,
		Files:        files,
		MCPServers:   servers,
	}
	r.compute()
	return r, nil
}

func tierRank(t Tier) int {
	switch t {
	case TierAlwaysOn:
		return 0
	case TierScoped:
		return 1
	case TierOnDemand:
		return 2
	default:
		return 3
	}
}

func countLines(s string) int {
	if s == "" {
		return 0
	}
	n := strings.Count(s, "\n")
	if !strings.HasSuffix(s, "\n") {
		n++
	}
	return n
}

// mcpServerNames extracts declared server names from the three MCP config
// dialects in the wild: {mcpServers:...} (Claude/Cursor), {servers:...} (VS
// Code) and {mcp: {servers:...}}. Unknown shapes yield nothing rather than an
// error: this is a hint, not a validator.
func mcpServerNames(content string) []string {
	var doc map[string]json.RawMessage
	if err := json.Unmarshal([]byte(content), &doc); err != nil {
		return nil
	}
	keys := []string{"mcpServers", "servers"}
	var out []string
	for _, k := range keys {
		raw, ok := doc[k]
		if !ok {
			continue
		}
		var m map[string]json.RawMessage
		if err := json.Unmarshal(raw, &m); err != nil {
			continue
		}
		for name := range m {
			out = append(out, name)
		}
	}
	if raw, ok := doc["mcp"]; ok {
		var nested struct {
			Servers map[string]json.RawMessage `json:"servers"`
		}
		if err := json.Unmarshal(raw, &nested); err == nil {
			for name := range nested.Servers {
				out = append(out, name)
			}
		}
	}
	sort.Strings(out) // map iteration order is random; reports must not be
	return out
}
