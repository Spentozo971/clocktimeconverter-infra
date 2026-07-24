# ClockTime Converter — Infrastructure

Backup of site files and server configs for clocktimeconverter.com, hosted on Oracle Cloud via Nginx + Cloudflare Tunnel.

## Redeploy steps
1. Copy `website/*` into `/usr/share/nginx/html/`
2. Copy `nginx-config/nginx.conf` into `/etc/nginx/nginx.conf`
3. Copy `cloudflared-config/config.yml` into `/etc/cloudflared/config.yml`
4. Restore the Cloudflare tunnel credentials JSON separately (not stored here — kept securely offline)
5. `sudo systemctl enable --now nginx cloudflared`

## n8n (Automation Platform)

- Hosted on the same VM via Podman
- Subdomain: n8n.clocktimeconverter.com
- Managed by systemd service: `container-n8n.service`
- Data volume: `n8n_data` (contains workflows, credentials — NOT backed up to GitHub for security)

### Redeploy steps
1. Copy `n8n-config/container-n8n.service` to `/etc/systemd/system/`
2. `sudo systemctl daemon-reload`
3. `sudo systemctl enable --now container-n8n.service`
4. Restore the `n8n_data` volume separately from a secure backup (see below)
