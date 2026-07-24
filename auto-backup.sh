#!/bin/bash
set -e

REPO_DIR="/home/opc/clocktimeconverter-infra"
cd "$REPO_DIR"

# --- Sync website files ---
cp /usr/share/nginx/html/*.html /usr/share/nginx/html/*.css /usr/share/nginx/html/*.js /usr/share/nginx/html/robots.txt "$REPO_DIR/website/" 2>/dev/null

# --- Sync nginx config ---
sudo cp /etc/nginx/nginx.conf "$REPO_DIR/nginx-config/nginx.conf"
sudo chown opc:opc "$REPO_DIR/nginx-config/nginx.conf"

# --- Sync cloudflared config (no credentials) ---
sudo cp /etc/cloudflared/config.yml "$REPO_DIR/cloudflared-config/config.yml"
sudo chown opc:opc "$REPO_DIR/cloudflared-config/config.yml"

# --- Sync n8n systemd service ---
sudo cp /etc/systemd/system/container-n8n.service "$REPO_DIR/n8n-config/container-n8n.service"
sudo chown opc:opc "$REPO_DIR/n8n-config/container-n8n.service"

# --- Commit and push only if something changed ---
git add .
if ! git diff --cached --quiet; then
  git commit -m "Automated backup $(date '+%Y-%m-%d %H:%M:%S')"
  git push origin main
  echo "$(date): Backup pushed to GitHub" >> "$REPO_DIR/backup.log"
else
  echo "$(date): No changes, skipped push" >> "$REPO_DIR/backup.log"
fi
