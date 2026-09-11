#!/usr/bin/env bash
# Copyright 2026 hrzlgnm
# SPDX-License-Identifier: MIT
#
# Clone the AUR package repository to ~/aur.
#
# Env:
#   PKGNAME  AUR package name, e.g. zux or zux-bin
#
# Idempotent: any previous checkout is discarded before cloning.

set -euo pipefail

: "${PKGNAME:?PKGNAME must be set}"
rm -rf "${HOME}/aur"
git clone --depth=1 "ssh://aur@aur.archlinux.org/${PKGNAME}.git" "${HOME}/aur"
