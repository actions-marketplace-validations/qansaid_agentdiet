package main

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestBudgetGateExitCode(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "AGENTS.md"), []byte(strings.Repeat("rule text ", 800)), 0o644); err != nil {
		t.Fatal(err)
	}

	var out, errOut bytes.Buffer
	if code := run([]string{"--max-tokens", "10", dir}, &out, &errOut); code != 1 {
		t.Fatalf("exit = %d, want 1 for an over-budget repo", code)
	}
	if !strings.Contains(errOut.String(), "exceeds budget") {
		t.Fatalf("no budget message on stderr: %q", errOut.String())
	}
}

func TestWithinBudgetExitsZero(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "AGENTS.md"), []byte("short"), 0o644); err != nil {
		t.Fatal(err)
	}
	var out, errOut bytes.Buffer
	if code := run([]string{"--max-tokens", "10000", dir}, &out, &errOut); code != 0 {
		t.Fatalf("exit = %d, want 0; stderr=%s", code, errOut.String())
	}
}

func TestBadgeFlagWritesOnlyJSON(t *testing.T) {
	dir := t.TempDir()
	var out, errOut bytes.Buffer
	if code := run([]string{"--badge", dir}, &out, &errOut); code != 0 {
		t.Fatalf("exit = %d", code)
	}
	if !strings.HasPrefix(strings.TrimSpace(out.String()), "{") {
		t.Fatalf("badge output is not a JSON document: %q", out.String())
	}
}

func TestBadWindowRejected(t *testing.T) {
	var out, errOut bytes.Buffer
	if code := run([]string{"--window", "0", t.TempDir()}, &out, &errOut); code != 2 {
		t.Fatalf("exit = %d, want 2", code)
	}
}

func TestVersionFlag(t *testing.T) {
	var out, errOut bytes.Buffer
	if code := run([]string{"--version"}, &out, &errOut); code != 0 {
		t.Fatalf("exit = %d", code)
	}
	if !strings.Contains(out.String(), version) {
		t.Fatalf("version output = %q", out.String())
	}
}

func TestResolveVersionPrefersLdflagsStamp(t *testing.T) {
	// goreleaser passes -X main.version={{ .Version }}; that stamp must win
	// even when the build info carries a module version of its own.
	if got := resolveVersion("0.1.5", "v0.1.4"); got != "0.1.5" {
		t.Fatalf("resolveVersion = %q, want the ldflags stamp 0.1.5", got)
	}
	if got := resolveVersion("9.9.9-ci", "(devel)"); got != "9.9.9-ci" {
		t.Fatalf("resolveVersion = %q, want the ldflags stamp 9.9.9-ci", got)
	}
}

func TestResolveVersionFallsBackToModuleVersion(t *testing.T) {
	// `go install module@v0.1.4` cannot pass ldflags; the module version in
	// the build info is the only honest source, and "v" is trimmed to match
	// the tarball's `agentdiet 0.1.4` output.
	if got := resolveVersion("dev", "v0.1.4"); got != "0.1.4" {
		t.Fatalf("resolveVersion = %q, want 0.1.4", got)
	}
	if got := resolveVersion("dev", "v0.1.5-0.20261106031500-abc1234"); got != "0.1.5-0.20261106031500-abc1234" {
		t.Fatalf("resolveVersion = %q, want the pseudo-version without the leading v", got)
	}
}

func TestResolveVersionKeepsDevForSourceBuilds(t *testing.T) {
	for _, moduleVersion := range []string{"", "(devel)"} {
		if got := resolveVersion("dev", moduleVersion); got != "dev" {
			t.Fatalf("resolveVersion(dev, %q) = %q, want dev", moduleVersion, got)
		}
	}
}

func TestFlagsMayFollowThePath(t *testing.T) {
	dir := t.TempDir()
	var out, errOut bytes.Buffer
	if code := run([]string{dir, "--json"}, &out, &errOut); code != 0 {
		t.Fatalf("exit = %d; stderr=%s", code, errOut.String())
	}
	if !strings.HasPrefix(strings.TrimSpace(out.String()), "{") {
		t.Fatalf("--json after the path was ignored: %q", out.String())
	}
}

func TestSecondPathIsRejected(t *testing.T) {
	var out, errOut bytes.Buffer
	if code := run([]string{t.TempDir(), t.TempDir()}, &out, &errOut); code != 2 {
		t.Fatalf("exit = %d, want 2 for two paths", code)
	}
}
