#!/usr/bin/env bash
# Copyright 2026 hrzlgnm
# SPDX-License-Identifier: MIT
#
# Generate the PKGBUILD into ~/lint and run the namcap/source checks on it.
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
# Idempotent: the PKGBUILD is regenerated with overwrite on every run.

set -euo pipefail

: "${GENERATE_SCRIPT:?GENERATE_SCRIPT must be set}"
: "${RELEASE_VERSION:?RELEASE_VERSION must be set}"
: "${NEEDS_EXE:?NEEDS_EXE must be set}"

repo_root="$PWD"
mkdir -p "${HOME}/lint"
if [[ "$NEEDS_EXE" == "true" ]]; then
    : "${SHA256_DEB:?SHA256_DEB must be set for binary packages}"
    : "${SHA256_EXE:?SHA256_EXE must be set for binary packages}"
    "$GENERATE_SCRIPT" "$RELEASE_VERSION" "$SHA256_DEB" "$SHA256_EXE" >"${HOME}/lint/PKGBUILD"
else
    : "${SHA256:?SHA256 must be set for source packages}"
    "$GENERATE_SCRIPT" "$RELEASE_VERSION" "$SHA256" >"${HOME}/lint/PKGBUILD"
fi
cd "${HOME}/lint" || exit 1
"$repo_root/packaging/aur/makepkg-lint.sh"
