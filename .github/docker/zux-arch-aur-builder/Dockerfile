# Copyright 2026 hrzlgnm
# SPDX-License-Identifier: MIT

FROM archlinux:base-devel@sha256:70d777aaeb45befc04150df137c4d7c1b5042be442b4c904c38c6f6880bb7844
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
