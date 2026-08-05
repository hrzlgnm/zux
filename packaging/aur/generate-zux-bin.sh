#!/usr/bin/env bash
# Copyright 2026 hrzlgnm
# SPDX-License-Identifier: MIT-0

version=$1
sha256sum_deb=$2
sha256sum_exe=$3

if [[ -z "$version" || -z "$sha256sum_deb" || -z "$sha256sum_exe" ]]; then
    echo "Usage: $0 <version> <sha256sum_deb> <sha256sum_exe>" >&2
    exit 1
fi

sha256sum_deb="${sha256sum_deb#sha256:}"
sha256sum_exe="${sha256sum_exe#sha256:}"

cat <<EOF
# Maintainer: Valentin Batz <valentin.batz+archlinux@posteo.de>

pkgname=zux-bin
pkgver=$version
pkgrel=1
pkgdesc="mDNS-SD Visualizer - A cross platform mDNS browsing visualizer written in Rust using tauri and svelte"
arch=('x86_64')
url="https://github.com/hrzlgnm/zux"
license=('MIT')
depends=('cairo' 'desktop-file-utils' 'gdk-pixbuf2' 'glib2' 'gtk3' 'hicolor-icon-theme' 'libsoup3' 'pango' 'webkit2gtk-4.1')
options=('!strip' '!emptydirs')
conflicts=('zux')
source_x86_64=("https://github.com/hrzlgnm/zux/releases/download/v\$pkgver/zux_\${pkgver}_amd64.deb" "https://github.com/hrzlgnm/zux/releases/download/v\$pkgver/zux_linux_x64")
sha256sums_x86_64=('$sha256sum_deb' '$sha256sum_exe')
package() {
    # The .deb contains the icons, .desktop file and other files installed to shared.
    tar -xz -f data.tar.gz -C "\${pkgdir}"
    # The .deb contains a binary that has auto updates enabled for the .deb.
    # We install a unbundled version of the binary to have auto updates disabled.
    install -Dm755 zux_linux_x64 "\${pkgdir}/usr/bin/zux"
}
EOF
