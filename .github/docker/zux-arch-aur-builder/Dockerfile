# Copyright 2026 hrzlgnm
# SPDX-License-Identifier: MIT

FROM archlinux:base-devel@sha256:61f7de2dd88cc4ba1fe36c24cfe1a503c3936984492d6405eeab013ce6ac68c5
RUN pacman -Syu --noconfirm \
    && pacman -S --noconfirm --needed \
    appmenu-gtk-module \
    cargo \
    cargo-auditable \
    cargo-edit \
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
