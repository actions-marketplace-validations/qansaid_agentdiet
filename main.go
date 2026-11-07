// Command agentdiet measures the context an AI coding agent loads before you
// type a single word, and tells you what to cut.
package main

import (
	"flag"
	"fmt"
	"io"
	"os"
	"runtime/debug"
	"strings"

	"github.com/qansaid/agentdiet/internal/audit"
)

// version is stamped at release time with -X main.version={{.Version}} by
// goreleaser. Builds that cannot pass ldflags — `go install
// github.com/qansaid/agentdiet@v0.1.4`, which is how action.yml installs
// the tool — fall back to the module version recorded in the build info, so
// they still report the tag they came from instead of "dev".
var version = "dev"

func init() {
	if bi, ok := debug.ReadBuildInfo(); ok {
		version = resolveVersion(version, bi.Main.Version)
	}
}

// resolveVersion picks the version a binary reports. An ldflags stamp always
// wins; otherwise the build info's module version is used with its leading "v"
// trimmed. A source build ("(devel)" or no version) keeps "dev", which is an
// honest answer for a binary that was never released.
func resolveVersion(stamped, moduleVersion string) string {
	if stamped != "dev" {
		return stamped
	}
	v := strings.TrimPrefix(moduleVersion, "v")
	if v == "" || v == "(devel)" {
		return stamped
	}
	return v
}

func main() {
	os.Exit(run(os.Args[1:], os.Stdout, os.Stderr))
}

func run(args []string, stdout, stderr io.Writer) int {
	fs := flag.NewFlagSet("agentdiet", flag.ContinueOnError)
	fs.SetOutput(stderr)

	var (
		asJSON    = fs.Bool("json", false, "machine-readable report")
		asBadge   = fs.Bool("badge", false, "emit a shields.io endpoint JSON document")
		window    = fs.Int("window", 200000, "context window to report share against")
		price     = fs.Float64("price", 3.00, "USD per 1M input tokens, for the cost line")
		maxTokens = fs.Int("max-tokens", 0, "exit 1 when always-on tokens exceed this budget (CI gate)")
		top       = fs.Int("top", audit.DefaultTop, "max files listed per section")
		showVer   = fs.Bool("version", false, "print version and exit")
	)
	fs.Usage = func() {
		fmt.Fprintf(stderr, `agentdiet %s — what your coding agent reads before you type

usage:
  agentdiet [path] [flags]

flags:
`, version)
		fs.PrintDefaults()
		fmt.Fprint(stderr, `
exit codes:
  0  audit completed, within budget
  1  always-on tokens exceeded --max-tokens
  2  audit could not run

examples:
  agentdiet                         audit the current repository
  agentdiet --json                  pipe the numbers into a dashboard
  agentdiet --max-tokens 4000       fail CI when the always-on tax grows
  agentdiet --badge > badge.json    publish the score as a README badge
`)
	}

	// Flags may appear before or after the path: `agentdiet . --json` is what
	// people type, but the stdlib flag package stops parsing at the first
	// positional argument. Peel positionals off and keep parsing.
	positional, err := parseInterleaved(fs, args)
	if err != nil {
		return 2
	}
	if *showVer {
		fmt.Fprintf(stdout, "agentdiet %s\n", version)
		return 0
	}

	root := "."
	if len(positional) > 0 {
		root = positional[0]
	}
	if len(positional) > 1 {
		fmt.Fprintf(stderr, "agentdiet: unexpected argument %q (one path at a time)\n", positional[1])
		return 2
	}
	if *window <= 0 {
		fmt.Fprintln(stderr, "agentdiet: --window must be positive")
		return 2
	}

	rep, err := audit.Discover(root, version, *window, *price)
	if err != nil {
		fmt.Fprintf(stderr, "agentdiet: %v\n", err)
		return 2
	}

	switch {
	case *asBadge:
		stdout.Write(rep.Badge())
	case *asJSON:
		b, err := rep.JSON()
		if err != nil {
			fmt.Fprintf(stderr, "agentdiet: %v\n", err)
			return 2
		}
		stdout.Write(b)
	default:
		rep.RenderTextTop(stdout, *top)
	}

	if *maxTokens > 0 && rep.AlwaysOnTokens > *maxTokens {
		fmt.Fprintf(stderr, "\nagentdiet: %d always-on tokens exceeds budget of %d\n",
			rep.AlwaysOnTokens, *maxTokens)
		return 1
	}
	return 0
}

// parseInterleaved parses flags that surround positional arguments,
// returning the positionals in order.
func parseInterleaved(fs *flag.FlagSet, args []string) ([]string, error) {
	var positional []string
	rest := args
	for {
		if err := fs.Parse(rest); err != nil {
			return nil, err
		}
		if fs.NArg() == 0 {
			return positional, nil
		}
		positional = append(positional, fs.Arg(0))
		rest = fs.Args()[1:]
	}
}
