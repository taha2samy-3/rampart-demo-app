# Rampart ASPM Demo App (`rampart-demo-app`)

[![Security Scans](https://github.com/taha2samy-3/rampart-demo-app/actions/workflows/security.yml/badge.svg)](https://github.com/taha2samy-3/rampart-demo-app/actions/workflows/security.yml)

An enterprise Node.js & TypeScript microservice demonstrating complete Application Security Posture Management (ASPM) pipeline integration with [Rampart](https://github.com/taha2samy-3/Rampart).

---

## 🛡️ Supported Scanners & Formats in CI

This repository exercises multi-category AppSec tooling configured in `.github/workflows/security.yml`:

| Category | Scanner | Output Format | Description |
| :--- | :--- | :--- | :--- |
| **SAST** | **Semgrep** | SARIF (`semgrep.sarif`) | Static code analysis scanning for SQL injection, path traversal, and unsafe patterns. |
| **Secrets** | **Gitleaks** | SARIF (`gitleaks.sarif`) | Scans code and git commit history for credentials and tokens. |
| **Secrets** | **TruffleHog** | JSON (`trufflehog.json`) | High-entropy secret scanning engine. |
| **SCA** | **Trivy (FS)** | SARIF (`trivy-fs.sarif`) | Scans `package.json` and lockfiles for known CVEs. |
| **IaC / Misconfig**| **Trivy (Config)**| SARIF (`trivy-config.sarif`) | Scans Dockerfile and Kubernetes manifests for misconfigurations. |
| **IaC / Misconfig**| **Checkov** | SARIF (`checkov.sarif`) | Policy-as-code deep scanning for Kubernetes manifests and Dockerfile. |
| **SBOM** | **Syft** | CycloneDX & SPDX (`sbom.*.json`) | Generates standard CycloneDX and SPDX Software Bill of Materials. |
| **Vulnerabilities**| **Grype** | SARIF (`grype.sarif`) | Correlates Syft SBOM against vulnerability feeds. |
| **Container** | **Trivy (Image)** | SARIF (`trivy-image.sarif`) | Builds and scans the multi-stage production container image. |
| **VEX** | **OpenVEX** | OpenVEX JSON (`openvex.json`) | Normative Vulnerability Exploitability eXchange statements. |

---

## 🚀 How to Ingest Reports into Rampart ASPM

All generated scan reports are automatically packaged by GitHub Actions into the **`rampart-security-reports`** artifact bundle.

### 1. Using the Rampart CLI
```bash
# Upload SARIF reports
rampart upload semgrep.sarif --parser semgrep --app rampart-demo-app --server https://rampart.dev.k8s.trypair.ai --token <YOUR_TOKEN>
rampart upload trivy-fs.sarif --parser trivy --app rampart-demo-app --server https://rampart.dev.k8s.trypair.ai --token <YOUR_TOKEN>
rampart upload gitleaks.sarif --parser gitleaks --app rampart-demo-app --server https://rampart.dev.k8s.trypair.ai --token <YOUR_TOKEN>
rampart upload checkov.sarif --parser checkov --app rampart-demo-app --server https://rampart.dev.k8s.trypair.ai --token <YOUR_TOKEN>
rampart upload trufflehog.json --parser trufflehog --app rampart-demo-app --server https://rampart.dev.k8s.trypair.ai --token <YOUR_TOKEN>

# Upload OpenVEX
rampart upload openvex.json --parser openvex --app rampart-demo-app --server https://rampart.dev.k8s.trypair.ai --token <YOUR_TOKEN>

# Upload SBOM
rampart sbom upload sbom.cyclonedx.json --app rampart-demo-app --server https://rampart.dev.k8s.trypair.ai --token <YOUR_TOKEN>
```

### 2. Using the Automated Script
```bash
export RAMPART_SERVER="https://rampart.dev.k8s.trypair.ai"
export RAMPART_TOKEN="<YOUR_TOKEN>"
./scripts/upload-to-rampart.sh ./all-reports
```

### 3. Direct HTTP API Upload
```bash
curl -k -X POST https://rampart.dev.k8s.trypair.ai/ingest/v1/reports \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -F "file=@all-reports/semgrep.sarif" \
  -F "parser=semgrep" \
  -F "app=rampart-demo-app"
```

---

## 📦 Local Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run locally
npm start

# Run with Docker
docker build -t rampart-demo-app .
docker run -p 3000:3000 rampart-demo-app
```
