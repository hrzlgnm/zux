# Copyright 2026 hrzlgnm
# SPDX-License-Identifier: MIT

FROM ubuntu:22.04@sha256:b000e69a50ff940390233025e7a337fb8469b509e2334fa4d018ac30f3e18cdb
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    curl \
    file \
    git \
    jq \
    librsvg2-dev \
    libwebkit2gtk-4.1-dev \
    patchelf \
    && rm -rf /var/lib/apt/lists/*

LABEL org.opencontainers.image.source="https://github.com/hrzlgnm/zux"
LABEL org.opencontainers.image.title="Zux Ubuntu Builder"
LABEL org.opencontainers.image.base.name="ubuntu:22.04"
