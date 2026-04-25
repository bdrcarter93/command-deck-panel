#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
npm run build
mkdir -p dist/data
cp -f public/data/*.json dist/data/
exec npx serve -s dist -l 3000
