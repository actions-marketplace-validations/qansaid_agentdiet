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
