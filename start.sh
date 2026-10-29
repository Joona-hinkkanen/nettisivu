#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

NODE_BIN=""
if command -v node >/dev/null 2>&1; then
  NODE_BIN="node"
elif [ -x "tools/node/bin/node" ]; then
  NODE_BIN="tools/node/bin/node"
fi

if [ -z "$NODE_BIN" ]; then
  echo "Node.js puuttuu. Asenna se osoitteesta https://nodejs.org/ (LTS)."
  exit 1
fi

"$NODE_BIN" server.js
