# Copyright 2026 hrzlgnm
# SPDX-License-Identifier: MIT

FROM ubuntu:22.04@sha256:076e7bf82319619f28dd0aa9c02ab34b055ad37100395b4f49a2ffba04fb5e11
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    curl \
    file \
    git \
    gh \
    jq \
    libappindicator3-dev \
    librsvg2-dev \
    libssl-dev \
    libwebkit2gtk-4.1-dev \
    patchelf \
    unzip \
    wget \
    && rm -rf /var/lib/apt/lists/*

LABEL org.opencontainers.image.source="https://github.com/hrzlgnm/zux"
LABEL org.opencontainers.image.title="Zux Ubuntu Builder"
LABEL org.opencontainers.image.base.name="ubuntu:22.04"
