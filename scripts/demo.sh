#!/usr/bin/env bash
set -u
cd /home/param/Work/golki
export AGENT_BROWSER_ENGINE=chrome
OUT=docs/demo.mp4
mkdir -p docs

# start recording
ffmpeg -y -f x11grab -r 30 -s 1366x768 -i :0.0 -c:v libx264 -preset ultrafast -crf 28 "$OUT" >/tmp/ffmpeg-demo.log 2>&1 &
FFPID=$!
sleep 2

run() { agent-browser "$@" >/tmp/ab.log 2>&1 || true; sleep 2; }

# login
agent-browser open http://localhost:3000/login; sleep 2
agent-browser snapshot -i >/dev/null 2>&1
# fill via refs from snapshot? Use selectors instead
agent-browser fill 'input[type=email]' 'demo@golki.dev' 2>/dev/null || true; sleep 1
agent-browser fill 'input[type=password]' 'password123' 2>/dev/null || true; sleep 1
agent-browser click 'button[type=submit]' 2>/dev/null || true; sleep 3

# workspaces
agent-browser open http://localhost:3000/workspaces; sleep 3

# board
agent-browser open http://localhost:3000/w/demo/p/DEMO; sleep 4

# issue detail
agent-browser open 'http://localhost:3000/issue/cmvl8rw86000dm677p95r30z0'; sleep 3

# backlog
agent-browser open 'http://localhost:3000/w/demo/p/DEMO/backlog'; sleep 3

# search
agent-browser open 'http://localhost:3000/search?q=sample'; sleep 3

# dark mode toggle on board
agent-browser open http://localhost:3000/w/demo/p/DEMO; sleep 2
agent-browser click 'button:has-text("Dark")' 2>/dev/null || true; sleep 3

agent-browser close 2>/dev/null || true
sleep 2

kill -INT $FFPID 2>/dev/null
wait $FFPID 2>/dev/null
echo "demo recorded: $OUT"
