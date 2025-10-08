#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"
ONTOLOGY_FILE="$ROOT_DIR/one/Ontology.md"
STATE_FILE="$ROOT_DIR/.claude/inference_score.json"

if [[ ! -f "$ONTOLOGY_FILE" ]]; then
  echo "[post] Missing one/Ontology.md. Aborting." >&2
  exit 1
fi

if [[ -f "$STATE_FILE" ]]; then
  SCORE=$(awk -F '[: ,}]' '/score/ {print $3}' "$STATE_FILE" 2>/dev/null | head -n1 || echo 0)
else
  SCORE=0
fi

# Quick sanity: ensure canonical sections exist
required=("Canonical Source of Truth" "Event Retention & Archival" "Extensibility: User-Safe Additions" "Glossary" "Tag Governance" "Changelog")
for section in "${required[@]}"; do
  if ! grep -q "$section" "$ONTOLOGY_FILE"; then
    echo "[post][warn] Missing section: $section" >&2
  fi
done

echo "[post] Build aligned with ontology. Current inference score: $SCORE"
exit 0

