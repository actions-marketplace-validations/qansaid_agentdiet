package audit

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func writeFile(t *testing.T, root, rel, content string) {
	t.Helper()
	p := filepath.Join(root, filepath.FromSlash(rel))
	if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(p, []byte(content), 0o644); err != nil {
		t.Fatal(err)
	}
}

const shared = "Always run the tests before claiming the change works, and paste the command you actually ran in the pull request body."

func fixture(t *testing.T) *Report {
	t.Helper()
	root := t.TempDir()

	writeFile(t, root, "AGENTS.md", `# Agents

Be direct. No filler.

`+shared+`

## Build

`+"```"+`bash
make test
`+"```"+`
`)
	writeFile(t, root, "CLAUDE.md", `# Claude

`+shared+`

Use the repository Makefile for every task.
`)
	writeFile(t, root, ".cursorrules", "Prefer small diffs.\n")
	writeFile(t, root, ".claude/skills/release/SKILL.md", strings.Repeat("Release steps and rollback procedure. ", 40))
	writeFile(t, root, ".cursor/rules/api.mdc", "---\nglobs: services/api/**\n---\nUse DTOs at the boundary.\n")
	writeFile(t, root, "services/api/AGENTS.md", "# API module\n\nKeep handlers thin.\n")
	writeFile(t, root, ".mcp.json", `{"mcpServers":{"github":{},"postgres":{}}}`)
	writeFile(t, root, ".claude/settings.json", `{"permissions":{"allow":["Bash(make test)"]}}`)
	// Must be ignored.
	writeFile(t, root, "node_modules/pkg/AGENTS.md", strings.Repeat("vendored noise ", 500))
	writeFile(t, root, "vendor/x/CLAUDE.md", strings.Repeat("vendored noise ", 500))

	rep, err := Discover(root, "test", 200000, 3.0)
	if err != nil {
		t.Fatal(err)
	}
	return rep
}

func TestDiscoverTiers(t *testing.T) {
	rep := fixture(t)

	want := map[string]Tier{
		"AGENTS.md":                       TierAlwaysOn,
		"CLAUDE.md":                       TierAlwaysOn,
		".cursorrules":                    TierAlwaysOn,
		"services/api/AGENTS.md":          TierScoped,
		".claude/skills/release/SKILL.md": TierOnDemand,
		".cursor/rules/api.mdc":           TierOnDemand,
		".mcp.json":                       TierConfig,
		".claude/settings.json":           TierConfig,
	}
	got := map[string]Tier{}
	for _, f := range rep.Files {
		got[f.Path] = f.Tier
	}
	for path, tier := range want {
		if got[path] != tier {
			t.Errorf("%s: tier = %q, want %q", path, got[path], tier)
		}
	}
	for path := range got {
		if strings.HasPrefix(path, "node_modules/") || strings.HasPrefix(path, "vendor/") {
			t.Errorf("%s should have been skipped", path)
		}
	}
}

func TestTotalsOnlyCountTheirTier(t *testing.T) {
	rep := fixture(t)

	var always int
	for _, f := range rep.Files {
		if f.Tier == TierAlwaysOn {
			always += f.Tokens
		}
	}
	if rep.AlwaysOnTokens != always {
		t.Fatalf("AlwaysOnTokens = %d, want %d", rep.AlwaysOnTokens, always)
	}
	if rep.OnDemandTokens == 0 {
		t.Fatal("on-demand tokens were not counted")
	}
	if rep.ScopedTokens == 0 {
		t.Fatal("scoped tokens were not counted")
	}
	if rep.AlwaysOnTokens >= rep.OnDemandTokens {
		t.Fatalf("fixture should have a heavier on-demand surface: %d vs %d", rep.AlwaysOnTokens, rep.OnDemandTokens)
	}
}

func TestDuplicateFindingRecoverableTokens(t *testing.T) {
	rep := fixture(t)

	var found bool
	for _, f := range rep.Findings {
		if f.Kind == "duplicate" && strings.Contains(f.Detail, "CLAUDE.md") && strings.Contains(f.Detail, "AGENTS.md") {
			found = true
			if f.Tokens < 15 {
				t.Errorf("duplicate block of %d tokens is suspiciously small", f.Tokens)
			}
		}
	}
	if !found {
		t.Fatalf("shared paragraph was not reported as duplicate; findings = %+v", rep.Findings)
	}
}

func TestNearDuplicateInstructions(t *testing.T) {
	// The real-world case: CLAUDE.md was created by copying AGENTS.md and then
	// drifting. Only one of them should survive.
	root := t.TempDir()
	body := "# Rules\n\n" + shared + "\n\nRun `make test` before every commit, and never rewrite published migrations.\n"
	writeFile(t, root, "AGENTS.md", body)
	writeFile(t, root, "CLAUDE.md", body+"\nExtra line for the tool.\n")

	rep, err := Discover(root, "test", 200000, 3.0)
	if err != nil {
		t.Fatal(err)
	}
	for _, f := range rep.Findings {
		if f.Kind == "near-duplicate" {
			return
		}
	}
	t.Fatalf("a copy-pasted CLAUDE.md was not reported as near-duplicate: %+v", rep.Findings)
}

func TestDistinctFilesAreNotFlaggedAsNearDuplicate(t *testing.T) {
	root := t.TempDir()
	writeFile(t, root, "AGENTS.md", "# Build\n\nUse `make test` and keep commits atomic.\n")
	writeFile(t, root, "CLAUDE.md", "# Shell\n\nPrefer ripgrep over grep, and never pipe long output through head.\n")
	rep, err := Discover(root, "test", 200000, 3.0)
	if err != nil {
		t.Fatal(err)
	}
	for _, f := range rep.Findings {
		if f.Kind == "near-duplicate" {
			t.Fatalf("unrelated files flagged: %+v", f)
		}
	}
}

func TestMCPNames(t *testing.T) {
	rep := fixture(t)
	if len(rep.MCPServers) != 2 {
		t.Fatalf("MCPServers = %v, want github and postgres", rep.MCPServers)
	}
	if rep.MCPServers[0] != "github" || rep.MCPServers[1] != "postgres" {
		t.Fatalf("MCPServers not sorted: %v", rep.MCPServers)
	}
}

func TestMCPDialects(t *testing.T) {
	cases := map[string][]string{
		`{"mcpServers":{"a":{},"b":{}}}`: {"a", "b"},
		`{"servers":{"c":{}}}`:           {"c"},
		`{"mcp":{"servers":{"d":{}}}}`:   {"d"},
		`{"unrelated":true}`:             nil,
		`not json at all`:                nil,
	}
	for in, want := range cases {
		got := mcpServerNames(in)
		if len(got) != len(want) {
			t.Errorf("%s -> %v, want %v", in, got, want)
			continue
		}
		for i := range want {
			if got[i] != want[i] {
				t.Errorf("%s -> %v, want %v", in, got, want)
			}
		}
	}
}

func TestEstimateProseAndCode(t *testing.T) {
	prose := strings.Repeat("abcd ", 400) // 2000 chars, no fence
	if got := Estimate(prose); got < 420 || got > 470 {
		t.Errorf("prose: %d tokens for 2000 chars, want ~444", got)
	}

	code := "```\n" + strings.Repeat("x", 3000) + "\n```\n"
	if got := Estimate(code); got < 860 || got > 940 {
		t.Errorf("code: %d tokens for 3000 fenced chars, want ~890", got)
	}

	if got := Estimate(""); got != 0 {
		// ceil(0/4)+ceil(0/3) == 0; an empty document must not claim a token.
		t.Errorf("empty: %d, want 0", got)
	}
}

func TestGradeBoundaries(t *testing.T) {
	cases := []struct {
		tokens int
		grade  string
	}{
		{0, "A"}, {1500, "A"}, {1501, "B"}, {4000, "B"}, {4001, "C"},
		{8000, "C"}, {8001, "D"}, {16000, "D"}, {16001, "F"},
	}
	for _, c := range cases {
		g, _ := gradeFor(c.tokens)
		if g != c.grade {
			t.Errorf("%d -> %s, want %s", c.tokens, g, c.grade)
		}
	}
}

func TestBadgeIsValidShieldsEndpoint(t *testing.T) {
	rep := fixture(t)
	var doc struct {
		SchemaVersion int    `json:"schemaVersion"`
		Label         string `json:"label"`
		Message       string `json:"message"`
		Color         string `json:"color"`
	}
	if err := json.Unmarshal(rep.Badge(), &doc); err != nil {
		t.Fatal(err)
	}
	if doc.SchemaVersion != 1 || doc.Label != "agent context" || doc.Message == "" || doc.Color == "" {
		t.Fatalf("bad badge document: %+v", doc)
	}
}

func TestRenderTextHasTheHeadlineNumbers(t *testing.T) {
	rep := fixture(t)
	var sb strings.Builder
	rep.RenderText(&sb)
	out := sb.String()
	for _, want := range []string{"ALWAYS-ON", "TOTAL", "GRADE", "COST", "estimator:"} {
		if !strings.Contains(out, want) {
			t.Errorf("report is missing %q:\n%s", want, out)
		}
	}
	if strings.Contains(out, "node_modules") {
		t.Error("vendored files leaked into the report")
	}
}

func TestMissingPathIsAnError(t *testing.T) {
	if _, err := Discover(filepath.Join(t.TempDir(), "nope"), "test", 200000, 3); err == nil {
		t.Fatal("expected an error for a missing path")
	}
}

func TestEmptyDirectoryIsClean(t *testing.T) {
	rep, err := Discover(t.TempDir(), "test", 200000, 3)
	if err != nil {
		t.Fatal(err)
	}
	if rep.AlwaysOnTokens != 0 || rep.Grade != "A" || len(rep.Findings) != 0 {
		t.Fatalf("empty repo should be clean: %+v", rep)
	}
}

func TestJSONRoundTrip(t *testing.T) {
	rep := fixture(t)
	b, err := rep.JSON()
	if err != nil {
		t.Fatal(err)
	}
	var back map[string]any
	if err := json.Unmarshal(b, &back); err != nil {
		t.Fatalf("report JSON does not parse: %v", err)
	}
	for _, key := range []string{"alwaysOnTokens", "grade", "files", "findings", "estimator"} {
		if _, ok := back[key]; !ok {
			t.Errorf("JSON missing %q", key)
		}
	}
}

func TestNakamaWorkspaceIsAlwaysOn(t *testing.T) {
	root := t.TempDir()

	// A Nakama profile workspace keeps the agent's prompt in four files at the
	// workspace root and composes all of them into the system prompt.
	writeFile(t, root, "SOUL.md", "# Identity\n\nYou are a careful reviewer who reads the diff before commenting.\n")
	writeFile(t, root, "STYLE.md", "# Style\n\nShort sentences. No preamble.\n")
	writeFile(t, root, "INSTRUCTIONS.md", "# Instructions\n\nRun the tests before claiming a change works.\n")
	writeFile(t, root, "MEMORY.md", "# Memory\n\nThe project uses Bun and mise.\n")
	writeFile(t, root, "skills/review/SKILL.md", "# Review\n\nRead the diff twice.\n")

	rep, err := Discover(root, "test", 200000, 3)
	if err != nil {
		t.Fatal(err)
	}

	alwaysOn := map[string]bool{}
	for _, f := range rep.Files {
		if f.Tier == TierAlwaysOn {
			alwaysOn[f.Path] = true
		}
	}
	for _, want := range []string{"SOUL.md", "STYLE.md", "INSTRUCTIONS.md", "MEMORY.md"} {
		if !alwaysOn[want] {
			t.Errorf("%s was not counted as always-on", want)
		}
	}
	if len(alwaysOn) != 4 {
		t.Errorf("always-on files = %d, want 4", len(alwaysOn))
	}
	if rep.AlwaysOnTokens == 0 {
		t.Fatal("always-on tokens = 0: the workspace prompt is being paid for and not reported")
	}
	if rep.OnDemandTokens == 0 {
		t.Error("the skill should stay on-demand, not join the always-on total")
	}
	if rep.OnDemandTokens >= rep.AlwaysOnTokens+rep.OnDemandTokens {
		t.Error("on-demand tokens swallowed the workspace prompt")
	}
}

func TestNakamaWorkspaceOutsideRootIsDetected(t *testing.T) {
	root := t.TempDir()
	writeFile(t, root, "agents/reviewer/SOUL.md", "# Identity\n\nYou review pull requests.\n")
	writeFile(t, root, "agents/reviewer/MEMORY.md", "# Memory\n\nReviews use the team checklist.\n")

	rep, err := Discover(root, "test", 200000, 3)
	if err != nil {
		t.Fatal(err)
	}
	if len(rep.Files) != 2 {
		t.Fatalf("files = %d, want 2", len(rep.Files))
	}
	for _, f := range rep.Files {
		if f.Tier != TierAlwaysOn {
			t.Errorf("%s tier = %q, want always-on", f.Path, f.Tier)
		}
	}
}

func TestSoulFileNamesWithoutAWorkspaceAreIgnored(t *testing.T) {
	root := t.TempDir()

	// The same filenames outside a Nakama workspace carry no guarantee of being
	// loaded into a prompt, and INSTRUCTIONS.md is common enough that guessing
	// would inflate every report.
	writeFile(t, root, "docs/STYLE.md", "# Style guide\n\nHow we write documentation.\n")
	writeFile(t, root, "docs/INSTRUCTIONS.md", "# Build instructions\n\nRun make docs.\n")
	writeFile(t, root, "MEMORY.md", "# Notes\n\nScratch notes, not a prompt.\n")

	rep, err := Discover(root, "test", 200000, 3)
	if err != nil {
		t.Fatal(err)
	}
	if len(rep.Files) != 0 {
		t.Fatalf("files = %d, want 0: %+v", len(rep.Files), rep.Files)
	}
	if rep.AlwaysOnTokens != 0 {
		t.Fatalf("always-on tokens = %d, want 0", rep.AlwaysOnTokens)
	}
}
