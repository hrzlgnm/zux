#!/usr/bin/env bash
# Copyright 2026 hrzlgnm
# SPDX-License-Identifier: MIT
#
# Resolve release artifact SHA256 checksums and expose them as step outputs.
#
# Env:
#   URL            tarball URL (source package)
#   URL_DEB        .deb asset URL, informational (binary package)
#   URL_EXE        unbundled binary asset URL, informational (binary package)
#   NEEDS_EXE      "true" for zux-bin (checksums via GitHub API digest),
#                  anything else for zux (checksum over the Tarball URL)
#   TAG_NAME       release tag, e.g. v1.2.3
#   GH_TOKEN       token for `gh` (injected by the workflow)
#   GITHUB_OUTPUT  file receiving step outputs (injected by Actions)
#
# Idempotent: outputs are recomputed from scratch on every run; a retry
# appends identical lines and Actions uses the last value for each key.

set -euo pipefail

: "${NEEDS_EXE:?NEEDS_EXE must be set}"
: "${GITHUB_OUTPUT:?GITHUB_OUTPUT must be set}"

if [[ "$NEEDS_EXE" == "true" ]]; then
    : "${TAG_NAME:?TAG_NAME must be set for binary packages}"
    deb_name="zux_${TAG_NAME#v}_amd64.deb"
    exe_name="zux_linux_x64"
    assets=$(gh release view "$TAG_NAME" --repo hrzlgnm/zux --json assets --jq '.assets | map(select(.name | test("\\.sha256$") | not))')
    sum_deb=$(jq -r --arg name "$deb_name" '.[] | select(.name == $name) | .digest' <<<"$assets")
    sum_exe=$(jq -r --arg name "$exe_name" '.[] | select(.name == $name) | .digest' <<<"$assets")
    if [[ -z "$sum_deb" || -z "$sum_exe" ]]; then
        echo "Error: Failed to get checksums from GitHub API for release $TAG_NAME" >&2
        exit 1
    fi
    if [[ ! "$sum_deb" =~ ^(sha256:)?[0-9a-fA-F]{64}$ || ! "$sum_exe" =~ ^(sha256:)?[0-9a-fA-F]{64}$ ]]; then
        echo "Error: Invalid checksums from GitHub API for release $TAG_NAME" >&2
        exit 1
    fi
    echo "sha256_deb=$sum_deb" >>"$GITHUB_OUTPUT"
    echo "sha256_exe=$sum_exe" >>"$GITHUB_OUTPUT"
else
    : "${URL:?URL must be set for source packages}"
    sum=$(curl -LfsS --retry 5 --retry-delay 5 --retry-all-errors --connect-timeout 15 "$URL" | sha256sum | cut -f1 -d ' ')
    echo "sha256=$sum" >>"$GITHUB_OUTPUT"
fi
