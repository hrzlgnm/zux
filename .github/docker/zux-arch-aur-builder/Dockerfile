# Copyright 2026 hrzlgnm
# SPDX-License-Identifier: MIT

FROM archlinux:base-devel@sha256:624bdc7fc6615155d67bc34cf7146c0c9fd0e3c92943977da63a630e4ca49c30
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
    libappindicator-gtk3 \
    librsvg \
    libsoup3 \
    namcap \
    nodejs \
    openssh \
    patchelf \
    pnpm \
    rust \
    rust-wasm \
    sudo \
    trunk \
    webkit2gtk-4.1 \
    wget \
    && useradd -m -G wheel -s /bin/bash runner \
    && echo '%wheel ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers \
    && pacman -Scc --noconfirm

LABEL org.opencontainers.image.source="https://github.com/hrzlgnm/zux"
LABEL org.opencontainers.image.title="Zux Arch AUR Builder"
LABEL org.opencontainers.image.base.name="archlinux:base-devel"
