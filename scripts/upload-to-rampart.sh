#!/usr/bin/env bash
set -euo pipefail

# Helper script to upload generated security scan reports to Rampart
# Usage:
#   RAMPART_SERVER=https://rampart.dev.k8s.trypair.ai RAMPART_TOKEN=... ./scripts/upload-to-rampart.sh

SERVER="${RAMPART_SERVER:-https://rampart.dev.k8s.trypair.ai}"
TOKEN="${RAMPART_TOKEN:-}"
APP_NAME="${APP_NAME:-rampart-demo-app}"
REPORTS_DIR="${1:-./all-reports}"

if [[ -z "$TOKEN" ]]; then
  echo "WARN: RAMPART_TOKEN is not set. Trying unauthenticated or local dev mode..."
fi

echo "=================================================="
echo "Uploading Security Reports to Rampart ASPM"
echo "Server: $SERVER"
echo "App:    $APP_NAME"
echo "Dir:    $REPORTS_DIR"
echo "=================================================="

upload_file() {
  local file="$1"
  local parser="$2"

  if [[ ! -f "$file" ]]; then
    echo "Skipping $file (file not found)"
    return 0
  fi

  echo "Uploading: $file (parser: $parser)..."
  local auth_header=()
  if [[ -n "$TOKEN" ]]; then
    auth_header=(-H "Authorization: Bearer $TOKEN")
  fi

  curl -k -s -w "\nHTTP_STATUS:%{http_code}\n" \
    "${auth_header[@]}" \
    -F "file=@$file" \
    -F "parser=$parser" \
    -F "app=$APP_NAME" \
    "$SERVER/ingest/v1/reports" || true
}

upload_sbom() {
  local file="$1"

  if [[ ! -f "$file" ]]; then
    echo "Skipping $file (file not found)"
    return 0
  fi

  echo "Uploading SBOM: $file..."
  local auth_header=()
  if [[ -n "$TOKEN" ]]; then
    auth_header=(-H "Authorization: Bearer $TOKEN")
  fi

  curl -k -s -w "\nHTTP_STATUS:%{http_code}\n" \
    "${auth_header[@]}" \
    -F "file=@$file" \
    -F "app=$APP_NAME" \
    "$SERVER/api/v1/sbom/upload" || true
}

mkdir -p "$REPORTS_DIR"

# 1. Semgrep SAST
upload_file "$REPORTS_DIR/semgrep.sarif" "semgrep"

# 2. Gitleaks Secrets
upload_file "$REPORTS_DIR/gitleaks.sarif" "gitleaks"

# 3. TruffleHog Secrets
upload_file "$REPORTS_DIR/trufflehog.json" "trufflehog"

# 4. Trivy FS / Dependencies
upload_file "$REPORTS_DIR/trivy-fs.sarif" "trivy"

# 5. Trivy Config / IaC
upload_file "$REPORTS_DIR/trivy-config.sarif" "trivy"

# 6. Checkov IaC
upload_file "$REPORTS_DIR/checkov.sarif" "checkov"

# 7. Grype Vulnerabilities
upload_file "$REPORTS_DIR/grype.sarif" "grype"

# 8. Trivy Container Image
upload_file "$REPORTS_DIR/trivy-image.sarif" "trivy"

# 9. OpenVEX Document
upload_file "$REPORTS_DIR/openvex.json" "openvex"

# 10. CycloneDX & SPDX SBOM
upload_sbom "$REPORTS_DIR/sbom.cyclonedx.json"
upload_sbom "$REPORTS_DIR/sbom.spdx.json"

echo "All Rampart uploads executed!"
