#!/usr/bin/env sh
# Point this repo at tracked hooks (strips Cursor co-author trailers).
set -e
cd "$(dirname "$0")/.."
git config core.hooksPath .githooks
chmod +x .githooks/prepare-commit-msg
echo "Git hooks path set to .githooks"
