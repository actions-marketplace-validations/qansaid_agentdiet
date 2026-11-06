## What changed

<!-- One paragraph. What behaviour is different after this PR? -->

## Why

<!-- The number this improves, or the file convention it adds. -->

## Verification

```
$ make test
<!-- paste the tail of the output -->
```

If the change alters report output, paste before/after of the affected lines:

```
before:
after:
```

## Checklist

- [ ] `make test` passes
- [ ] `gofmt` clean (`gofmt -l .` prints nothing)
- [ ] No new dependencies
- [ ] README updated if a file convention, flag, or finding was added
- [ ] One change in this PR
