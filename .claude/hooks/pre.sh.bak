#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"
ONTOLOGY_FILE="$ROOT_DIR/one/Ontology.md"
STATE_FILE="$ROOT_DIR/.claude/inference_score.json"
SCORE_LOG="$ROOT_DIR/one/INFERENCE_SCORE.md"

if [[ ! -f "$ONTOLOGY_FILE" ]]; then
  echo "[pre] Missing one/Ontology.md. Aborting." >&2
  exit 1
fi

# Ensure jq-like simple JSON handling via awk if missing
hash_value() {
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" | awk '{print $1}'
  elif command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  else
    # Fallback: md5 (less ideal but available on macOS)
    md5 "$1" | awk '{print $4}'
  fi
}

mkdir -p "$ROOT_DIR/.claude"

CURRENT_HASH=$(hash_value "$ONTOLOGY_FILE")
CURRENT_TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

if [[ -f "$STATE_FILE" ]]; then
  LAST_HASH=$(awk -F '"' '/last_hash/ {print $4}' "$STATE_FILE" 2>/dev/null || true)
  SCORE=$(awk -F '[: ,}]' '/score/ {print $3}' "$STATE_FILE" 2>/dev/null | head -n1 || echo 0)
else
  LAST_HASH=""
  SCORE=0
fi

if [[ "$CURRENT_HASH" != "$LAST_HASH" ]]; then
  SCORE=$((SCORE + 1))
  echo "{\"score\": $SCORE, \"last_hash\": \"$CURRENT_HASH\", \"updated_at\": \"$CURRENT_TS\"}" > "$STATE_FILE"
  mkdir -p "$(dirname "$SCORE_LOG")"
  if [[ ! -f "$SCORE_LOG" ]]; then
    echo "# Ontology Inference Score" > "$SCORE_LOG"
    echo "Counts how many times AI changed the ontology (pre-hook detected)." >> "$SCORE_LOG"
    echo "" >> "$SCORE_LOG"
  fi
  echo "- $CURRENT_TS: score=$SCORE (hash=$CURRENT_HASH)" >> "$SCORE_LOG"
  echo "[pre] Ontology changed. Inference score incremented to $SCORE."
else
  echo "[pre] Ontology unchanged. Score stays at $SCORE."
fi

# Verify terminology: prefer 'thing' in ontology
if grep -qE '\bEntity Types\b|\bEntity lifecycle\b' "$ONTOLOGY_FILE"; then
  echo "[pre][warn] Found legacy 'Entity' phrasing in Ontology.md. Please replace with 'Thing'." >&2
fi

exit 0

