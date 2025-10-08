#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="docs"
DST_DIR="one"

if [[ ! -d "$SRC_DIR" ]]; then
  echo "Source directory '$SRC_DIR' not found" >&2
  exit 1
fi

mkdir -p "$DST_DIR"

COPIED=0
SKIPPED=0

# Copy all files from docs/ to one/ preserving tree, skipping existing
while IFS= read -r -d '' file; do
  rel="${file#${SRC_DIR}/}"
  dest="$DST_DIR/$rel"
  if [[ -e "$dest" ]]; then
    ((SKIPPED++))
    continue
  fi
  mkdir -p "$(dirname "$dest")"
  cp "$file" "$dest"
  echo "Copied: $rel"
  ((COPIED++))
done < <(find "$SRC_DIR" -type f -print0)

echo "Sync complete. Copied=$COPIED, Skipped(existing)=$SKIPPED"

