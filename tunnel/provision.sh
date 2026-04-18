#!/usr/bin/env bash
# provision.sh — Creates a stable named Cloudflare Tunnel for the openclaw bridge.
#
# Prerequisites:
#   1. cloudflared is installed (brew install cloudflared)
#   2. `cloudflared tunnel login` has been run and ~/.cloudflared/cert.pem exists
#
# Usage:
#   ./tunnel/provision.sh [your-cloudflare-domain.com]
#
# If no domain argument is given, the script will prompt for it.
#
# What this does:
#   1. Creates a named tunnel called "openclaw-bridge"
#   2. Writes a tunnel config to ~/.cloudflared/openclaw-bridge.yml
#   3. Creates the CNAME DNS record: openclaw-bridge.<domain> → tunnel
#   4. Writes a launchd plist to ~/Library/LaunchAgents/com.openclaw.bridge-tunnel.plist
#   5. Loads the launchd service (starts it now, restarts on reboot/crash)
#
# After this script, the tunnel URL is:
#   https://openclaw-bridge.<domain>
# Set VITE_API_BASE to that URL in Vercel.

set -euo pipefail

TUNNEL_NAME="openclaw-bridge"
BRIDGE_PORT=8787

# ---- Determine domain ----
DOMAIN="${1:-}"
if [[ -z "$DOMAIN" ]]; then
  echo ""
  echo "Enter your Cloudflare-managed domain (e.g. yourdomain.com):"
  read -r DOMAIN
fi
DOMAIN="${DOMAIN,,}" # lowercase

if [[ -z "$DOMAIN" ]]; then
  echo "ERROR: domain is required." >&2
  exit 1
fi

TUNNEL_HOSTNAME="openclaw-bridge.${DOMAIN}"
CONFIG_FILE="${HOME}/.cloudflared/${TUNNEL_NAME}.yml"
PLIST_FILE="${HOME}/Library/LaunchAgents/com.openclaw.bridge-tunnel.plist"

echo ""
echo "=== Cloudflare Named Tunnel Provisioner ==="
echo "Tunnel name   : ${TUNNEL_NAME}"
echo "Domain        : ${DOMAIN}"
echo "Tunnel URL    : https://${TUNNEL_HOSTNAME}"
echo "Bridge port   : ${BRIDGE_PORT}"
echo ""

# ---- Check login ----
if [[ ! -f "${HOME}/.cloudflared/cert.pem" ]]; then
  echo "ERROR: ~/.cloudflared/cert.pem not found."
  echo "Run: cloudflared tunnel login"
  exit 1
fi

# ---- Create tunnel (idempotent) ----
echo "[1/5] Creating named tunnel '${TUNNEL_NAME}' (idempotent)..."
EXISTING=$(cloudflared tunnel list --output json 2>/dev/null | python3 -c "
import sys, json
data = json.load(sys.stdin)
for t in data:
    if t.get('name') == '${TUNNEL_NAME}':
        print(t['id'])
        break
" 2>/dev/null || true)

if [[ -n "$EXISTING" ]]; then
  TUNNEL_ID="$EXISTING"
  echo "  Tunnel already exists: ${TUNNEL_ID}"
else
  cloudflared tunnel create "$TUNNEL_NAME"
  TUNNEL_ID=$(cloudflared tunnel list --output json 2>/dev/null | python3 -c "
import sys, json
data = json.load(sys.stdin)
for t in data:
    if t.get('name') == '${TUNNEL_NAME}':
        print(t['id'])
        break
")
  echo "  Created tunnel: ${TUNNEL_ID}"
fi

# ---- Write tunnel config ----
echo "[2/5] Writing tunnel config to ${CONFIG_FILE}..."
cat > "$CONFIG_FILE" <<EOF
tunnel: ${TUNNEL_ID}
credentials-file: ${HOME}/.cloudflared/${TUNNEL_ID}.json

ingress:
  - hostname: ${TUNNEL_HOSTNAME}
    service: http://localhost:${BRIDGE_PORT}
  - service: http_status:404
EOF
echo "  Done."

# ---- Create DNS record ----
echo "[3/5] Creating DNS CNAME for ${TUNNEL_HOSTNAME}..."
cloudflared tunnel route dns "$TUNNEL_NAME" "$TUNNEL_HOSTNAME" 2>&1 || true
echo "  Done (may already exist)."

# ---- Write launchd plist ----
echo "[4/5] Writing launchd plist to ${PLIST_FILE}..."
mkdir -p "${HOME}/Library/LaunchAgents"
cat > "$PLIST_FILE" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.openclaw.bridge-tunnel</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/cloudflared</string>
        <string>tunnel</string>
        <string>--config</string>
        <string>${CONFIG_FILE}</string>
        <string>run</string>
        <string>${TUNNEL_NAME}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${HOME}/Library/Logs/openclaw-bridge-tunnel.log</string>
    <key>StandardErrorPath</key>
    <string>${HOME}/Library/Logs/openclaw-bridge-tunnel.err</string>
</dict>
</plist>
EOF
echo "  Done."

# ---- Load launchd service ----
echo "[5/5] Loading launchd service..."
launchctl unload "$PLIST_FILE" 2>/dev/null || true
launchctl load -w "$PLIST_FILE"
echo "  Done."

echo ""
echo "=== Provisioning complete ==="
echo ""
echo "Tunnel URL (stable, permanent): https://${TUNNEL_HOSTNAME}"
echo ""
echo "Next step:"
echo "  Set VITE_API_BASE=https://${TUNNEL_HOSTNAME} in Vercel environment variables"
echo "  then redeploy the Vercel project."
echo ""
echo "To check tunnel status:"
echo "  cloudflared tunnel info ${TUNNEL_NAME}"
echo "  tail -f ~/Library/Logs/openclaw-bridge-tunnel.log"
