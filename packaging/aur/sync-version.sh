#!/usr/bin/env bash
# Copyright 2026 hrzlgnm
# SPDX-License-Identifier: MIT
#
# Sync the release version into Cargo.toml and tauri.conf.json.
# Must run from the repository root.
#
# Env:
#   RELEASE_VERSION  release version without leading v, e.g. 1.2.3
#
# Idempotent: setting an already-set version is a no-op. The JSON update
# goes through a temp file plus atomic rename so a failed run leaves no
# stray tmp.json behind.

set -euo pipefail

: "${RELEASE_VERSION:?RELEASE_VERSION must be set}"

tmp=$(mktemp src-tauri/.tauri.conf.XXXXXX)
trap 'rm -f "$tmp"' EXIT
jq --arg version "$RELEASE_VERSION" '.version = $version' src-tauri/tauri.conf.json >"$tmp"
mv "$tmp" src-tauri/tauri.conf.json
sed -i "s/^version = .*/version = \"$RELEASE_VERSION\"/" src-tauri/Cargo.toml
