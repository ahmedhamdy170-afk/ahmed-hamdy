#!/usr/bin/env bash
# Re-renders everything in out/ from source. Needs node, playwright (Chromium) and ffmpeg.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
node render_audio.js
node export_captions.js
node render.js 16x9 out/master_16x9.mp4 --audio out/audio.wav &
node render.js 9x16 out/cut_9x16.mp4 --audio out/audio.wav &
node render.js 1x1 out/cut_1x1.mp4 --audio out/audio.wav &
node render.js 16x9 out/reduced_motion_16x9.mp4 --rm --audio out/audio.wav &
wait
