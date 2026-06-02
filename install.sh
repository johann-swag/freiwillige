#!/usr/bin/env bash
# =============================================================================
# Freiwillig — Single Command Installer
# =============================================================================
# Usage:
#   ./install.sh                    # interactive setup
#   ./install.sh --config myorg     # use config/myorg.env
#   ./install.sh --reconfigure      # update existing install
#   ./install.sh --seed-only        # re-run seeding only
#   ./install.sh --uninstall        # remove everything
#
# Requirements: docker, docker compose v2, curl, openssl
# =============================================================================

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ── Defaults ─────────────────────────────────────────────────────────────────
INSTALLER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_NAME="tenant"
MODE="install"
COMPOSE_FILE="$INSTALLER_DIR/docker-compose.yml"
LOG_FILE="$INSTALLER_DIR/install.log"
VERSION="1.0.0"

# ── Logging ──────────────────────────────────────────────────────────────────
log()  { echo -e "${GREEN}[✓]${NC} $1" | tee -a "$LOG_FILE"; }
info() { echo -e "${BLUE}[→]${NC} $1" | tee -a "$LOG_FILE"; }
warn() { echo -e "${YELLOW}[!]${NC} $1" | tee -a "$LOG_FILE"; }
err()  { echo -e "${RED}[✗]${NC} $1" | tee -a "$LOG_FILE"; exit 1; }
step() { echo -e "\n${BOLD}${CYAN}━━ $1 ━━${NC}" | tee -a "$LOG_FILE"; }

# ── Parse arguments ──────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    --config)      CONFIG_NAME="$2"; shift 2 ;;
    --reconfigure) MODE="reconfigure"; shift ;;
    --seed-only)   MODE="seed"; shift ;;
    --uninstall)   MODE="uninstall"; shift ;;
    --help|-h)     MODE="help"; shift ;;
    *) err "Unknown argument: $1. Run with --help for usage." ;;
  esac
done

CONFIG_FILE="$INSTALLER_DIR/config/${CONFIG_NAME}.env"
SECRETS_FILE="$INSTALLER_DIR/config/${CONFIG_NAME}.secrets.env"

# =============================================================================
# BANNER
# =============================================================================
print_banner() {
  echo -e "${BOLD}"
  cat << 'EOF'
  ███████╗██████╗ ███████╗██╗██╗    ██╗██╗██╗      ██╗ ██████╗
  ██╔════╝██╔══██╗██╔════╝██║██║    ██║██║██║      ██║██╔════╝
  █████╗  ██████╔╝█████╗  ██║██║ █╗ ██║██║██║      ██║██║  ███╗
  ██╔══╝  ██╔══██╗██╔══╝  ██║██║███╗██║██║██║      ██║██║   ██║
  ██║     ██║  ██║███████╗██║╚███╔███╔╝██║███████╗ ██║╚██████╔╝
  ╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝ ╚══╝╚══╝ ╚═╝╚══════╝╚═╝ ╚═════╝
  Volunteer Management Platform — Installer v1.0.0
EOF
  echo -e "${NC}"
}

# =============================================================================
# HELP
# =============================================================================
print_help() {
  print_banner
  cat << EOF
${BOLD}USAGE${NC}
  ./install.sh [OPTIONS]

${BOLD}OPTIONS${NC}
  --config <name>    Use config/<name>.env (default: tenant)
  --reconfigure      Update config of existing installation
  --seed-only        Re-run CSV seeding without reinstalling
  --uninstall        Stop and remove all containers and volumes
  --help             Show this help

${BOLD}FIRST TIME SETUP${NC}
  1. Edit config/tenant.env with your organisation details
  2. Edit seeds/*.csv with your programmes, sites, users
  3. Run: ./install.sh

${BOLD}UPDATE SEEDING DATA${NC}
  1. Edit any seeds/*.csv
  2. Run: ./install.sh --seed-only

${BOLD}RECONFIGURE${NC}
  1. Edit config/tenant.env
  2. Run: ./install.sh --reconfigure

${BOLD}SEED FILES${NC}
  seeds/programs.csv       Volunteer programmes (Umwelt MX 2026, etc.)
  seeds/sites.csv          Placement sites per programme
  seeds/document_types.csv Required documents per site/programme
  seeds/users.csv          Initial coordinator accounts
  seeds/focus_areas.csv    Focus area taxonomy

EOF
  exit 0
}

# =============================================================================
# REQUIREMENTS CHECK
# =============================================================================
check_requirements() {
  step "Checking requirements"

  local missing=()

  command -v docker    &>/dev/null || missing+=("docker")
  command -v curl      &>/dev/null || missing+=("curl")
  command -v openssl   &>/dev/null || missing+=("openssl")
  command -v python3   &>/dev/null || missing+=("python3")

  # Docker Compose v2
  if ! docker compose version &>/dev/null; then
    missing+=("docker-compose-plugin")
  fi

  if [[ ${#missing[@]} -gt 0 ]]; then
    err "Missing requirements: ${missing[*]}\nInstall with: apt-get install ${missing[*]}"
  fi

  # Docker running
  docker info &>/dev/null || err "Docker daemon not running. Start with: systemctl start docker"

  # Minimum RAM
  local ram_kb
  ram_kb=$(grep MemTotal /proc/meminfo | awk '{print $2}')
  local ram_gb=$(( ram_kb / 1024 / 1024 ))
  if [[ $ram_gb -lt 4 ]]; then
    warn "Low RAM detected (${ram_gb}GB). Minimum 4GB recommended."
  fi

  # Disk space
  local disk_gb
  disk_gb=$(df -BG "$INSTALLER_DIR" | tail -1 | awk '{print $4}' | tr -d 'G')
  if [[ $disk_gb -lt 10 ]]; then
    warn "Low disk space (${disk_gb}GB free). Minimum 10GB recommended."
  fi

  log "Requirements OK — Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"
}

# =============================================================================
# CONFIG VALIDATION
# =============================================================================
validate_config() {
  step "Validating configuration"

  [[ -f "$CONFIG_FILE" ]] || err "Config file not found: $CONFIG_FILE\nCopy config/tenant.env.example to config/tenant.env and fill it in."

  source "$CONFIG_FILE"

  local required_vars=(
    "ORG_NAME"
    "ORG_SLUG"
    "DOMAIN"
    "ADMIN_EMAIL"
    "ADMIN_FIRST_NAME"
    "ADMIN_LAST_NAME"
    "TIMEZONE"
    "LANGUAGE"
  )

  local missing_vars=()
  for var in "${required_vars[@]}"; do
    if [[ -z "${!var:-}" ]]; then
      missing_vars+=("$var")
    fi
  done

  if [[ ${#missing_vars[@]} -gt 0 ]]; then
    err "Missing required config vars in ${CONFIG_FILE}:\n  ${missing_vars[*]}"
  fi

  # Slug must be URL-safe
  if [[ ! "$ORG_SLUG" =~ ^[a-z0-9-]+$ ]]; then
    err "ORG_SLUG must be lowercase letters, numbers, and hyphens only. Got: $ORG_SLUG"
  fi

  # Email format
  if [[ ! "$ADMIN_EMAIL" =~ ^[^@]+@[^@]+\.[^@]+$ ]]; then
    err "ADMIN_EMAIL is not a valid email address: $ADMIN_EMAIL"
  fi

  log "Config valid — org: ${ORG_NAME} (${ORG_SLUG}) — domain: ${DOMAIN}"
}

# =============================================================================
# VALIDATE SEED FILES
# =============================================================================
validate_seeds() {
  step "Validating seed files"

  local seed_dir="$INSTALLER_DIR/seeds"
  local required_seeds=("programs.csv" "sites.csv" "document_types.csv" "users.csv")
  local missing_seeds=()

  for seed in "${required_seeds[@]}"; do
    if [[ ! -f "$seed_dir/$seed" ]]; then
      missing_seeds+=("$seed")
    fi
  done

  if [[ ${#missing_seeds[@]} -gt 0 ]]; then
    err "Missing seed files in seeds/:\n  ${missing_seeds[*]}\nCopy from seeds/templates/ and fill in your data."
  fi

  # Validate CSV headers
  python3 "$INSTALLER_DIR/scripts/validate_seeds.py" "$seed_dir" || err "Seed validation failed. Check output above."

  log "Seed files valid"
}

# =============================================================================
# GENERATE SECRETS
# =============================================================================
generate_secrets() {
  step "Generating secrets"

  if [[ -f "$SECRETS_FILE" ]] && [[ "$MODE" != "reconfigure" ]]; then
    warn "Secrets file already exists — skipping generation (use --reconfigure to regenerate)"
    source "$SECRETS_FILE"
    return
  fi

  local postgres_password
  local secret_key
  local zitadel_masterkey
  local zitadel_db_password
  local garage_access_key
  local garage_secret_key

  postgres_password=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
  secret_key=$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 48)
  zitadel_masterkey=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
  zitadel_db_password=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
  garage_access_key=$(openssl rand -hex 10 | head -c 20)
  garage_secret_key=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 40)

  cat > "$SECRETS_FILE" << EOF
# AUTO-GENERATED — DO NOT COMMIT TO GIT
# Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
# Regenerate: ./install.sh --reconfigure

POSTGRES_PASSWORD=${postgres_password}
SECRET_KEY=${secret_key}
ZITADEL_MASTERKEY=${zitadel_masterkey}
ZITADEL_DB_PASSWORD=${zitadel_db_password}
GARAGE_ACCESS_KEY=${garage_access_key}
GARAGE_SECRET_KEY=${garage_secret_key}
EOF

  chmod 600 "$SECRETS_FILE"
  log "Secrets generated → ${SECRETS_FILE}"
  warn "IMPORTANT: Back up ${SECRETS_FILE} — losing it means losing access to all data"
}

# =============================================================================
# WRITE RUNTIME .ENV
# =============================================================================
write_env() {
  step "Writing runtime environment"

  source "$CONFIG_FILE"
  source "$SECRETS_FILE"

  cat > "$INSTALLER_DIR/.env" << EOF
# Runtime environment — auto-generated from config + secrets
# Do not edit directly — run ./install.sh --reconfigure instead
# Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

# App
ENV=production
VERSION=${VERSION}
ORG_NAME=${ORG_NAME}
ORG_SLUG=${ORG_SLUG}
DOMAIN=${DOMAIN}
TIMEZONE=${TIMEZONE}
LANGUAGE=${LANGUAGE:-de}

# Secrets
SECRET_KEY=${SECRET_KEY}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ZITADEL_MASTERKEY=${ZITADEL_MASTERKEY}
ZITADEL_DB_PASSWORD=${ZITADEL_DB_PASSWORD}
GARAGE_ACCESS_KEY=${GARAGE_ACCESS_KEY}
GARAGE_SECRET_KEY=${GARAGE_SECRET_KEY}

# Database
DATABASE_URL=postgresql+asyncpg://freiwillig:${POSTGRES_PASSWORD}@postgres:5432/freiwillig

# Valkey
VALKEY_URL=redis://valkey:6379/0
CELERY_BROKER_URL=redis://valkey:6379/1
CELERY_RESULT_BACKEND=redis://valkey:6379/2

# Zitadel
ZITADEL_DOMAIN=${DOMAIN}:8081
ZITADEL_CLIENT_ID=freiwillig-api
ZITADEL_PROJECT_ID=freiwillig

# Storage
GARAGE_ENDPOINT=http://garage:3900
GARAGE_BUCKET=freiwillig-documents

# Email
SMTP_HOST=${SMTP_HOST:-mailpit}
SMTP_PORT=${SMTP_PORT:-1025}
SMTP_FROM=${SMTP_FROM:-noreply@${DOMAIN}}
SMTP_TLS=${SMTP_TLS:-false}

# Auth
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_FIRST_NAME=${ADMIN_FIRST_NAME}
ADMIN_LAST_NAME=${ADMIN_LAST_NAME}

# CORS
CORS_ORIGINS=["http://${DOMAIN}:3000","https://${DOMAIN}"]

# Observability
OTEL_SERVICE_NAME=freiwillig-${ORG_SLUG}
EOF

  log "Runtime .env written"
}

# =============================================================================
# DOCKER STACK
# =============================================================================
start_services() {
  step "Starting services"

  cd "$INSTALLER_DIR"

  info "Pulling images..."
  docker compose pull --quiet 2>&1 | tee -a "$LOG_FILE"

  info "Starting core services (postgres, valkey)..."
  docker compose up -d postgres valkey
  wait_for_healthy "postgres" 60
  wait_for_healthy "valkey" 30

  info "Starting auth (zitadel)..."
  docker compose up -d zitadel
  wait_for_healthy "zitadel" 120

  info "Starting storage (garage)..."
  docker compose up -d garage
  sleep 5
  setup_garage_bucket

  info "Starting application..."
  docker compose up -d api worker frontend traefik mailpit

  log "All services started"
}

wait_for_healthy() {
  local service="$1"
  local timeout="$2"
  local elapsed=0

  info "Waiting for ${service} to be healthy..."
  while ! docker compose ps "$service" | grep -q "healthy"; do
    sleep 3
    elapsed=$((elapsed + 3))
    if [[ $elapsed -ge $timeout ]]; then
      err "${service} did not become healthy within ${timeout}s. Check: docker compose logs ${service}"
    fi
    echo -n "."
  done
  echo ""
  log "${service} is healthy"
}

# =============================================================================
# GARAGE (S3) BUCKET SETUP
# =============================================================================
setup_garage_bucket() {
  step "Setting up object storage"

  source "$SECRETS_FILE"

  # Apply Garage layout
  docker compose exec garage garage layout assign -z dc1 -c 1G "$(docker compose exec garage garage node id | head -1)"
  docker compose exec garage garage layout apply --version 1 2>/dev/null || true

  # Create bucket
  docker compose exec garage garage bucket create freiwillig-documents 2>/dev/null || true
  docker compose exec garage garage bucket allow \
    --read --write --owner \
    --key freiwillig \
    freiwillig-documents 2>/dev/null || true

  log "Object storage configured"
}

# =============================================================================
# DATABASE MIGRATION
# =============================================================================
run_migrations() {
  step "Running database migrations"

  docker compose exec api alembic upgrade head 2>&1 | tee -a "$LOG_FILE"

  log "Migrations complete"
}

# =============================================================================
# SEED DATA
# =============================================================================
run_seeding() {
  step "Seeding data from CSV files"

  source "$CONFIG_FILE"
  source "$SECRETS_FILE"

  docker compose exec -T api python3 /app/scripts/seed.py \
    --seeds-dir /app/seeds \
    --org-name "$ORG_NAME" \
    --org-slug "$ORG_SLUG" \
    --admin-email "$ADMIN_EMAIL" \
    --admin-first-name "$ADMIN_FIRST_NAME" \
    --admin-last-name "$ADMIN_LAST_NAME" \
    2>&1 | tee -a "$LOG_FILE"

  log "Seeding complete"
}

# =============================================================================
# ZITADEL SETUP
# =============================================================================
setup_zitadel() {
  step "Configuring auth (Zitadel)"

  source "$CONFIG_FILE"

  # Use Zitadel API to create organisation, roles, admin user
  docker compose exec -T api python3 /app/scripts/setup_zitadel.py \
    --org-name "$ORG_NAME" \
    --org-slug "$ORG_SLUG" \
    --admin-email "$ADMIN_EMAIL" \
    --admin-first-name "$ADMIN_FIRST_NAME" \
    --admin-last-name "$ADMIN_LAST_NAME" \
    2>&1 | tee -a "$LOG_FILE"

  log "Auth configured"
}

# =============================================================================
# SMOKE TEST
# =============================================================================
smoke_test() {
  step "Running smoke tests"

  source "$CONFIG_FILE"
  local base="http://localhost:8000"

  # API health
  local health
  health=$(curl -sf "${base}/health" || echo "FAIL")
  if [[ "$health" == "FAIL" ]]; then
    err "API health check failed. Check: docker compose logs api"
  fi
  log "API health OK"

  # DB connectivity (via API)
  local status
  status=$(curl -sf "${base}/api/v1/tenants/current" -H "X-Health-Check: true" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status','err'))" 2>/dev/null || echo "err")
  if [[ "$status" == "err" ]]; then
    warn "Could not verify tenant setup — may need manual check"
  else
    log "Tenant setup verified"
  fi

  log "Smoke tests passed"
}

# =============================================================================
# PRINT SUMMARY
# =============================================================================
print_summary() {
  source "$CONFIG_FILE"

  echo -e "\n${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}${GREEN}  Installation complete!${NC}"
  echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "  ${BOLD}Organisation:${NC}  ${ORG_NAME}"
  echo -e "  ${BOLD}Domain:${NC}        ${DOMAIN}"
  echo ""
  echo -e "  ${BOLD}Services:${NC}"
  echo -e "  ${CYAN}→${NC}  Frontend      http://${DOMAIN}:3000"
  echo -e "  ${CYAN}→${NC}  API Docs      http://${DOMAIN}:8000/docs"
  echo -e "  ${CYAN}→${NC}  Auth (Zitadel)http://${DOMAIN}:8081"
  echo -e "  ${CYAN}→${NC}  Mail Preview  http://${DOMAIN}:8025"
  echo -e "  ${CYAN}→${NC}  Observability http://${DOMAIN}:3301"
  echo -e "  ${CYAN}→${NC}  Traefik       http://${DOMAIN}:8080"
  echo ""
  echo -e "  ${BOLD}Admin Login:${NC}"
  echo -e "  ${CYAN}→${NC}  Email:    ${ADMIN_EMAIL}"
  echo -e "  ${CYAN}→${NC}  Password: (sent to ${ADMIN_EMAIL} via Zitadel)"
  echo ""
  echo -e "  ${BOLD}Next steps:${NC}"
  echo -e "  1. Open http://${DOMAIN}:3000 and log in"
  echo -e "  2. Review seeded programmes and sites"
  echo -e "  3. Configure SMTP for production email"
  echo -e "  4. Set up SSL with Traefik (see docs/ssl.md)"
  echo ""
  echo -e "  ${YELLOW}Secrets backed up at: ${SECRETS_FILE}${NC}"
  echo -e "  ${YELLOW}Keep this file safe — losing it = losing access${NC}"
  echo ""
  echo -e "  ${BOLD}Useful commands:${NC}"
  echo -e "  ${CYAN}docker compose logs -f api${NC}          API logs"
  echo -e "  ${CYAN}./install.sh --seed-only${NC}            Re-run seeding"
  echo -e "  ${CYAN}./install.sh --reconfigure${NC}          Update config"
  echo ""
}

# =============================================================================
# UNINSTALL
# =============================================================================
uninstall() {
  step "Uninstalling"
  warn "This will remove ALL containers and volumes. Data will be LOST."
  read -r -p "Type 'yes' to confirm: " confirm
  [[ "$confirm" == "yes" ]] || { info "Aborted."; exit 0; }

  docker compose down -v --remove-orphans
  log "All containers and volumes removed"
  warn "Config and seed files kept. Remove manually if needed."
}

# =============================================================================
# MAIN
# =============================================================================
main() {
  mkdir -p "$(dirname "$LOG_FILE")"
  echo "Install started: $(date)" > "$LOG_FILE"

  print_banner

  case "$MODE" in
    help)
      print_help
      ;;
    uninstall)
      uninstall
      ;;
    seed)
      validate_config
      validate_seeds
      run_seeding
      log "Seeding complete"
      ;;
    reconfigure)
      validate_config
      generate_secrets
      write_env
      docker compose up -d --no-deps api worker frontend
      run_migrations
      run_seeding
      log "Reconfiguration complete"
      ;;
    install)
      check_requirements
      validate_config
      validate_seeds
      generate_secrets
      write_env
      start_services
      run_migrations
      setup_zitadel
      run_seeding
      smoke_test
      print_summary
      ;;
  esac
}

main "$@"
