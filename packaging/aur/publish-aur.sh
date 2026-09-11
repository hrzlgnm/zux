#!/usr/bin/env bash
# Copyright 2026 hrzlgnm
# SPDX-License-Identifier: MIT
#
# Regenerate ~/aur/PKGBUILD, verify it builds, and push the update.
# Must run from the repository root (GENERATE_SCRIPT is repo-relative).
#
# Env:
#   GENERATE_SCRIPT  generator script, e.g. ./packaging/aur/generate-zux-bin.sh
#   RELEASE_VERSION  release version without leading v, e.g. 1.2.3
#   SHA256      tarball checksum (source package)
#   SHA256_DEB  .deb checksum (binary package)
#   SHA256_EXE  unbundled binary checksum (binary package)
#   NEEDS_EXE   "true" for zux-bin, anything else for zux
#
# Idempotent: regeneration overwrites; a retry that finds the checkout
# already in sync with origin exits before building, a retry after a
# committed-but-unpushed run skips the second commit and just pushes.

set -euo pipefail

: "${GENERATE_SCRIPT:?GENERATE_SCRIPT must be set}"
: "${RELEASE_VERSION:?RELEASE_VERSION must be set}"
: "${NEEDS_EXE:?NEEDS_EXE must be set}"

repo_root="$PWD"
script="${GENERATE_SCRIPT#./}"
if [[ "$NEEDS_EXE" == "true" ]]; then
    : "${SHA256_DEB:?SHA256_DEB must be set for binary packages}"
    : "${SHA256_EXE:?SHA256_EXE must be set for binary packages}"
    "$repo_root/$script" "$RELEASE_VERSION" "$SHA256_DEB" "$SHA256_EXE" >"${HOME}/aur/PKGBUILD"
else
    : "${SHA256:?SHA256 must be set for source packages}"
    "$repo_root/$script" "$RELEASE_VERSION" "$SHA256" >"${HOME}/aur/PKGBUILD"
fi
cd "${HOME}/aur" || exit 1
if [[ -z "$(git status --porcelain -- PKGBUILD .SRCINFO)" ]]; then
    if git rev-parse --verify --quiet origin/master >/dev/null && [[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/master)" ]]; then
        echo 'No changes'
        exit 0
    fi
else
    makepkg --printsrcinfo >.SRCINFO
    makepkg
    makepkg --install --noconfirm
    git config user.name 'hrzlgnm'
    git config user.email 'hrzlgnm@users.noreply.github.com'
    git add PKGBUILD .SRCINFO
    if ! git diff --cached --quiet; then
        git commit -m "New upstream release $RELEASE_VERSION"
    fi
fi
git push origin master
