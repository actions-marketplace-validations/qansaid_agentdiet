package audit

import "math"

// Estimator is the human-readable description of how tokens are counted.
// Published in every report so the number never looks like a black box.
const Estimator = "prose chars/4.5 + fenced-code chars/3.4, rounded up per segment (measured MAE 8% vs cl100k_base)"

// Estimate returns an approximate token count for a document.
//
// It is deliberately tokenizer-independent: agentdiet scans a repository on the
// user's machine with no network access and no 2 MB vocabulary embedded in the
// binary. Prose is estimated at 4.5 characters per token and fenced code at 3.4,
// calibrated against cl100k_base on 137 real agent-configuration files: mean
// error +1.2%, median +0.4%, mean absolute error 8.1%, 87% of files within
// +/-15% (p10 -10.5%, p90 +16.7%). See docs/estimator.md for the corpus and the
// sweep that chose these divisors. Segments are rounded up separately so a file
// made of many short paragraphs is not under-counted.
func Estimate(content string) int {
	var proseChars, codeChars int
	inFence := false
	lineStart := 0

	for i := 0; i <= len(content); i++ {
		if i == len(content) || content[i] == '\n' {
			line := content[lineStart:i]
			trimmed := trimLeftSpace(line)
			togglesFence := hasPrefix(trimmed, "```") || hasPrefix(trimmed, "~~~")
			if togglesFence {
				inFence = !inFence
			}
			n := len(line)
			if i < len(content) {
				n++ // count the newline itself
			}
			if inFence || togglesFence {
				codeChars += n
			} else {
				proseChars += n
			}
			lineStart = i + 1
		}
	}

	tokens := int(math.Ceil(float64(proseChars)/4.5)) + int(math.Ceil(float64(codeChars)/3.4))
	return tokens
}

func trimLeftSpace(s string) string {
	for i := 0; i < len(s); i++ {
		if s[i] != ' ' && s[i] != '\t' && s[i] != '\r' {
			return s[i:]
		}
	}
	return ""
}

func hasPrefix(s, prefix string) bool {
	return len(s) >= len(prefix) && s[:len(prefix)] == prefix
}
