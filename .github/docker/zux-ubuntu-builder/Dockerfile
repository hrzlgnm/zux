# Copyright 2026 hrzlgnm
# SPDX-License-Identifier: MIT

FROM ubuntu:22.04@sha256:9abcaffc92a5279fff3a6a41635c0800ea33e528425fb389658806476e7defde
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
