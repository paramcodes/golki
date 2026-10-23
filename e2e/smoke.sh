#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export AGENT_BROWSER_ENGINE=lightpanda

bun run dev >/tmp/golki-dev.log 2>&1 &
DEV_PID=$!
trap 'kill $DEV_PID 2>/dev/null || true' EXIT

for i in $(seq 1 30); do
  if curl -s http://localhost:3000/login >/dev/null 2>&1; then break; fi
  sleep 1
done

agent-browser open http://localhost:3000/login
agent-browser wait --load networkidle
agent-browser snapshot -i | head -20
agent-browser close

echo "smoke ok"
