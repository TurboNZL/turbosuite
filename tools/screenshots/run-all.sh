#!/usr/bin/env bash
# Captures every screenshot in both colour schemes. Assumes the apps are running as described in README.md.
# Usage: PLAYWRIGHT_MODULE=... PANTRY_TOKEN=... MUSIC_TOKEN=... [MEDIA=media CUTMEDIA=media OUT=raw] ./run-all.sh [dark|light ...]
set -euo pipefail
cd "$(dirname "$0")"
export OUT="${OUT:-raw}" MEDIA="${MEDIA:-media}" CUTMEDIA="${CUTMEDIA:-$MEDIA}"
mkdir -p "$OUT"
for mode in "${@:-dark light}"; do
  for m in $mode; do
    export MODE=$m
    node music.mjs "$MUSIC_TOKEN"
    node pantry.mjs "$PANTRY_TOKEN"
    node keep.mjs; node keep-note.mjs
    node cut.mjs
    node docs.mjs; node slides.mjs
    node budget.mjs
  done
done
node looks.mjs "$MUSIC_TOKEN"
