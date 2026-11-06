BINARY := agentdiet
VERSION := $(or $(shell git describe --tags --always --dirty 2>/dev/null | sed 's/^v//'),dev)
LDFLAGS := -s -w -X main.version=$(VERSION)

.PHONY: build test vet fmt tidy run demo clean

build:
	go build -trimpath -ldflags="$(LDFLAGS)" -o $(BINARY) .

test:
	go test ./... -race -count=1

vet:
	go vet ./...

fmt:
	gofmt -l -w .

tidy:
	go mod tidy

run: build
	./$(BINARY) .

demo: build
	./$(BINARY) --top 4 .

clean:
	rm -f $(BINARY) cover.out
