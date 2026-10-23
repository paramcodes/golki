# E2E (agent-browser + Lightpanda)

Engine: Lightpanda (9x faster, 16x less RAM) via `--engine lightpanda`.
Chrome fallback: set `AGENT_BROWSER_ENGINE=chrome` if a spec needs a missing Web API.

## Run

```
bun run dev &   # start app
AGENT_BROWSER_ENGINE=lightpanda agent-browser open http://localhost:3000/login
agent-browser snapshot -i
# ... assertions via agent-browser get text / click / fill
```

See `e2e/smoke.sh`.
