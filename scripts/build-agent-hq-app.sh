#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
APP_PATH="$(pwd)/Agent HQ.app"
SCRIPT_PATH="$(pwd)/scripts/agent-hq-launcher.applescript"
rm -rf "$APP_PATH"
osacompile -o "$APP_PATH" "$SCRIPT_PATH"
echo "Built $APP_PATH"
