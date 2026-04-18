# Stable Named Cloudflare Tunnel Setup

This replaces the Quick Tunnel (random URL, dies on restart) with a permanent named tunnel
that always serves the bridge at the same URL.

---

## What you need to provide (one-time)

**A domain managed by Cloudflare.** Can be any domain you own that has its DNS on Cloudflare.

That's it. All other steps are handled by the setup script.

---

## Steps

### 1. Ryan's action — Cloudflare login (one-time, ~30 seconds)

On Ryan's Mac mini, run:

```bash
cloudflared tunnel login
```

This opens a browser. Pick your Cloudflare-managed domain and authorize.
Writes `~/.cloudflared/cert.pem` — the credential cloudflared uses to manage tunnels.

### 2. Owen runs the provisioning script

After step 1, Owen runs:

```bash
/Volumes/Extreme\ SSD/AOS_ENTERPRISE_CORE/agents/general/command-deck-panel/tunnel/provision.sh
```

This creates the named tunnel, writes the config, and sets up the launchd service.

### 3. Set VITE_API_BASE in Vercel

After step 2, Owen will provide the stable tunnel URL (e.g. `https://openclaw-bridge.yourdomain.com`).
Set `VITE_API_BASE` to that URL in Vercel environment variables.
Owen redeploys. Done — that URL never changes.

---

## How it works

- Named tunnel (`openclaw-bridge`) is registered once in your Cloudflare account.
- Cloudflare assigns a stable UUID to it.
- A CNAME DNS record is created: `openclaw-bridge.yourdomain.com → <uuid>.cfargotunnel.com`
- The tunnel is started as a launchd service on the Mac mini (auto-restarts on crash/reboot).
- The URL `https://openclaw-bridge.yourdomain.com` is permanent — it doesn't change when the Mac mini reboots.

---

## Compared to Quick Tunnel

| | Quick Tunnel | Named Tunnel |
|---|---|---|
| URL | Random, changes on restart | Fixed, permanent |
| Requires Cloudflare domain | No | Yes |
| Requires `cloudflared login` | No | Yes (one-time) |
| Auto-restarts | No | Yes (launchd) |
| Production-safe | No | Yes |
