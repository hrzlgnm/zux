# Copyright 2026 hrzlgnm
# SPDX-License-Identifier: MIT-0

FROM archlinux:base-devel@sha256:65f340cde2e201dbbe3e80f62c98c22983cabf5fb56c35ce4e6f9b09c82371db
RUN pacman -Syu --noconfirm \
    && pacman -S --noconfirm --needed \
    git \
    jq \
    namcap \
    npm \
    openssh \
    patchelf \
    sudo \
    webkit2gtk-4.1 \
    librsvg \
    && useradd -m -G wheel -s /bin/bash runner \
    && echo '%wheel ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers \
    && pacman -Scc --noconfirm

LABEL org.opencontainers.image.source="https://github.com/hrzlgnm/zux"
LABEL org.opencontainers.image.title="zux Arch AUR Builder"
LABEL org.opencontainers.image.base.name="archlinux:base-devel"
