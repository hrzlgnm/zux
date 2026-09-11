#!/usr/bin/env bash
# Copyright 2026 hrzlgnm
# SPDX-License-Identifier: MIT
#
# Fail unless the AUR SSH deploy key secret is configured.
#
# Env:
#   AUR_DEPLOY_KEY  SSH private key for the aur.archlinux.org service user
#
# Idempotent: read-only check.

set -euo pipefail

if [[ -z "${AUR_DEPLOY_KEY:-}" ]]; then
    echo "Error: AUR_DEPLOY_KEY secret is not set. Please configure the AUR SSH deploy key in repository settings." >&2
    exit 1
fi
