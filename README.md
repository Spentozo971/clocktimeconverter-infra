# ClockTime Converter — Infrastructure

Backup of site files and server configs for clocktimeconverter.com, hosted on Oracle Cloud via Nginx + Cloudflare Tunnel.

## Redeploy steps
1. Copy `website/*` into `/usr/share/nginx/html/`
2. Copy `nginx-config/nginx.conf` into `/etc/nginx/nginx.conf`
3. Copy `cloudflared-config/config.yml` into `/etc/cloudflared/config.yml`
4. Restore the Cloudflare tunnel credentials JSON separately (not stored here — kept securely offline)
5. `sudo systemctl enable --now nginx cloudflared`
