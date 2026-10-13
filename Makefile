.PHONY: install dev build preview test gate docker docker-run docker-stop clean

IMAGE := homelab-weave
PORT  := 8080
NODE_MODULES := node_modules/.pnpm/lock.yaml

# ── Dependencies ──────────────────────────────────────────────

$(NODE_MODULES): pnpm-lock.yaml
	pnpm install --frozen-lockfile
	@touch $@

install: $(NODE_MODULES)

# ── Development ───────────────────────────────────────────────

dev: $(NODE_MODULES)
	pnpm dev

preview: build
	pnpm preview

# ── Build ─────────────────────────────────────────────────────

build: $(NODE_MODULES)
	pnpm build

# ── Test ──────────────────────────────────────────────────────

format:
	pnpm format

typecheck: $(NODE_MODULES)
	pnpm typecheck

lint: $(NODE_MODULES)
	pnpm lint

test: $(NODE_MODULES)
	pnpm test

test-browser: build
	HOMELAB_PRODUCTION=true HOMELAB_TEST_PORT=5185 pnpm test:browser

# ── Full validation gate ─────────────────────────────────────

gate: format typecheck lint test build test-browser

# ── Docker ────────────────────────────────────────────────────

docker:
	docker build -t $(IMAGE):local .

docker-run: docker
	docker run --rm -d -p $(PORT):8080 --name $(IMAGE) $(IMAGE):local
	@echo "Running at http://localhost:$(PORT)"

docker-stop:
	docker stop $(IMAGE) 2>/dev/null || true

docker-verify: docker-run
	@sleep 1
	@echo "── / ──"
	@curl -sI http://127.0.0.1:$(PORT)/ | grep -iE 'HTTP|cache-control'
	@echo "── /sw.js ──"
	@curl -sI http://127.0.0.1:$(PORT)/sw.js | grep -iE 'HTTP|cache-control'
	@echo "── /healthz ──"
	@curl -sI http://127.0.0.1:$(PORT)/healthz | grep -iE 'HTTP'
	@$(MAKE) docker-stop

# ── Cleanup ───────────────────────────────────────────────────

clean:
	rm -rf dist apps/web/dist packages/core/dist node_modules
