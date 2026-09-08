#!/usr/bin/env bash
# Copyright 2024-2025 hrzlgnm
# SPDX-License-Identifier: MIT

set -e

# Run namcap and capture output + exit status
echo ">>> Running namcap..."
namcap_output=$(namcap PKGBUILD 2>&1) || true
namcap_status=$?

echo "$namcap_output"

if [[ $namcap_status -ne 0 ]]; then
    echo ">>> Namcap crashed (exit code $namcap_status). Aborting."
    exit $namcap_status
fi

if echo "$namcap_output" | grep -E -q " W: | E: "; then
    echo ">>> Namcap warnings/errors detected. Aborting."
    exit 1
fi

echo ">>> Namcap clean."

echo ">>> Verifying sources with makepkg..."
for attempt in 1 2 3 4 5; do
    if makepkg --verifysource -o; then
        break
    fi
    echo "::warning::makepkg --verifysource attempt $attempt/5 failed, retrying..."
    if [ "$attempt" -eq 5 ]; then
        echo "::error::makepkg --verifysource failed after 5 attempts"
        exit 1
    fi
    sleep $((attempt * 5))
done
