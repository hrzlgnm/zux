# Copyright 2026 hrzlgnm
# SPDX-License-Identifier: MIT

FROM ubuntu:22.04@sha256:252bffe20cd96f4eca79e59b95ac87d05021ab22fcf57f621f9e244645c4eac7
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
