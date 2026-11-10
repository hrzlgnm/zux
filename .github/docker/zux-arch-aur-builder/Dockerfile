# Copyright 2026 hrzlgnm
# SPDX-License-Identifier: MIT

FROM archlinux:base-devel@sha256:fa2d4ce3310ddd90a4208e5168be8ad367da5129af1245f38fd2d803bcbe3239
RUN pacman -Syu --noconfirm \
    && pacman -S --noconfirm --needed \
    appmenu-gtk-module \
    cargo \
    cargo-auditable \
    coreutils \
    desktop-file-utils \
    gdk-pixbuf2 \
    git \
    glib2 \
    github-cli \
    gtk3 \
    jq \
    librsvg \
    libsoup3 \
    namcap \
    nodejs \
    openssh \
    patchelf \
    pnpm \
    rust \
    sudo \
    webkit2gtk-4.1 \
    && useradd -m -G wheel -s /bin/bash runner \
    && echo '%wheel ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers \
    && pacman -Scc --noconfirm

LABEL org.opencontainers.image.source="https://github.com/hrzlgnm/zux"
LABEL org.opencontainers.image.title="Zux Arch AUR Builder"
LABEL org.opencontainers.image.base.name="archlinux:base-devel"
