#!/usr/bin/env bash
# Copyright 2026 hrzlgnm
# SPDX-License-Identifier: MIT
#
# Fail unless VERSION is strictly higher than the pkgver recorded in the
# ~/aur checkout. A missing PKGBUILD (new package) passes.
#
# Env:
#   VERSION  release version without leading v, e.g. 1.2.3
#
# Idempotent: read-only check.

set -euo pipefail

: "${VERSION:?VERSION must be set}"

cd "${HOME}/aur" || exit 1
if [[ -f PKGBUILD ]]; then
    current_version=$(grep -Po '^pkgver=\K.*' PKGBUILD)
    if [[ -z "$current_version" ]]; then
        echo 'Could not determine current version from PKGBUILD. Exiting.' >&2
        exit 1
    fi
    if [[ "$(printf '%s\n%s' "$current_version" "$VERSION" | sort -V | head -n1)" != "$current_version" ]] || [[ "$current_version" == "$VERSION" ]]; then
        echo "New version ($VERSION) is not higher than the current version ($current_version). Exiting." >&2
        exit 1
    fi
fi
