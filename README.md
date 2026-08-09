![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/hrzlgnm/zux/total)
[![GitHub Downloads (all assets, latest release)](https://img.shields.io/github/downloads/hrzlgnm/zux/latest/total)](https://github.com/hrzlgnm/zux/releases/latest)
[![GitHub Release](https://img.shields.io/github/v/release/hrzlgnm/zux)](https://github.com/hrzlgnm/zux/releases/latest)
[![GitHub Release Date](https://img.shields.io/github/release-date/hrzlgnm/zux)](https://github.com/hrzlgnm/zux/releases/latest)
[![AUR Version](https://img.shields.io/aur/version/zux)](https://aur.archlinux.org/packages/zux)
[![AUR Version](https://img.shields.io/aur/version/zux-bin)](https://aur.archlinux.org/packages/zux-bin)
[![WinGet Version](https://img.shields.io/winget/v/hrzlgnm.zux)](https://winget.run/hrzlgnm.zux)
[![License: MIT](https://img.shields.io/github/license/hrzlgnm/zux)](https://github.com/hrzlgnm/zux/blob/main/LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/hrzlgnm/zux/ci.yml)](https://github.com/hrzlgnm/zux/actions)

# zux

zux is an **mDNS-SD visualizer** with force-directed graph visualization. It automatically
discovers all services advertised on your local network via multicast DNS service
discovery, then renders them as an interactive force-directed graph so you can see at a
glance which services, instances, hosts and addresses are present and how they relate to
one another.

For a list-based mDNS browser for the desktop, check out
[mDNS-Browser](https://github.com/hrzlgnm/mdns-browser). If you prefer to browse mDNS
services from a terminal, take a look at
[mDNS-TUI-Browser](https://github.com/hrzlgnm/mdns-tui-browser).

## Features

- **Automatic discovery** of every mDNS service type advertised on the network
- **Force-directed graph** built on [vis-network](https://visjs.org/), with multiple
  physics solvers (`forceAtlas2Based`, `barnesHut`, `repulsion`, `hierarchicalRepulsion`)
- **Typed nodes** distinguished by shape and color:
  - Service types (diamond)
  - Service instances (circle)
  - Hosts (square)
  - IP addresses (triangle)
- **Live statistics** showing the number of types, instances, hosts, addresses and links
- **Offline detection**: instances and their hosts grey out when a service stops being
  advertised and come back online once it is seen again
- **Detail panel** for any node showing the service type, subtype, hostname, port,
  addresses with their interfaces, TXT records and clickable URLs for HTTP(S) services
- **Filtering** of nodes by query, and toggling of whole groups via the legend
- **Physics controls** to tune the layout live
- **SVG export** of the current graph
- **Auto-update** on Windows, macOS and Linux (deb/rpm), plus manual update on Android
- **Cross-platform**: Windows (MSI/NSIS), macOS (universal DMG), Linux (deb/rpm) and
  Android (APK)

<!--toc:start-->

- [zux Overview](#zux)
    - [Features](#features)
    - [Command line options](#command-line-options)
        - [keep-all-ips](#keep-all-ips)
        - [log-level](#log-level)
        - [log-to-file](#log-to-file)
    - [Where to find the executables?](#where-to-find-the-executables)
        - [GitHub Releases](#github-releases)
        - [WinGet installation](#winget-installation)
        - [Arch Linux (AUR)](#arch-linux-aur)
        - [Homebrew (macOS)](#homebrew-macos)
        - [Android](#android)
    - [Building](#building)
        - [Building for Android](#building-for-android)
    - [Attested build artifacts](#attested-build-artifacts)
    - [Acknowledgments](#acknowledgments)

<!--toc:end-->

## Command line options

```console
Usage: zux [OPTIONS]

Options:
      --keep-all-ips           Keep all IP addresses including non-link-local IPv6
      --log-level <LOG_LEVEL>  Log level (trace, debug, info, warn, error) [default: info]
      --log-to-file            Log to file in the OS-specific log directory
  -h, --help                   Print help
  -V, --version                Print version
```

### keep-all-ips

By default, only IPv4 addresses and link-local IPv6 addresses are shown in the graph.
If enabled, all IP addresses are kept, including non-link-local IPv6 addresses.

### log-level

Sets the minimum log level. Possible values are `trace`, `debug`, `info`, `warn` and
`error`. The default is `info`.

### log-to-file

If enabled, a log file will be created in a platform-specific location:

- Windows: `%LOCALAPPDATA%\com.github.hrzlgnm.zux\logs`
- Linux: `$XDG_DATA_HOME/com.github.hrzlgnm.zux/logs` or `$HOME/.local/share/com.github.hrzlgnm.zux/logs`
- macOS: `~/Library/Logs/com.github.hrzlgnm.zux`

The log file will be named `zux.log` and will contain log messages with a log-level having
at least the level specified by the `log-level` option.

## Where to find the executables?

### GitHub Releases

You can download the latest version of the application from the
[GitHub Release page](https://github.com/hrzlgnm/zux/releases/latest)

### WinGet installation

To install on Windows via WinGet, run the following command:

```console
winget install hrzlgnm.zux
```

### Arch Linux (AUR)

To install on Arch Linux using the AUR, you can use an AUR helper like yay or paru.

The `zux` package builds the application from source, while `zux-bin` installs the
prebuilt binary.

With `yay`:

```console
yay -S zux
```

Alternatively using the -bin package:

```console
yay -S zux-bin
```

With `paru`:

```console
paru -S zux
```

Alternatively using the -bin package:

```console
paru -S zux-bin
```

### Homebrew (macOS)

To install on macOS using Homebrew, you can use the custom tap:

```console
brew install --cask hrzlgnm/tap/zux
```

Or add the tap first:

```console
brew tap hrzlgnm/tap
brew install --cask zux
```

### Android

Prebuilt APKs are attached to each [GitHub Release](https://github.com/hrzlgnm/zux/releases/latest).
The app checks for updates at startup and will open the release page so you can download
the latest APK. To build the APK yourself, see [Building for Android](#building-for-android).

## Building

### Prerequisites

Before you begin, make sure you meet the necessary prerequisites. You can find more
details in the official [Tauri Guide](https://tauri.app/start/prerequisites/).

- [Rust](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) (the project pins
  `pnpm@11.20.0`)
- Platform-specific system libraries, e.g. WebKitGTK on Linux

### Run in development

```console
pnpm install
pnpm run tauri dev
```

The frontend can also be run standalone in a web browser with demo data:

```console
pnpm run dev
```

### Build a release bundle

```console
pnpm install
pnpm run tauri build
```

The bundles are created in `src-tauri/target/release/bundle/`.

### Building for Android

Building for Android requires a few additional prerequisites on top of the ones above. You
can find more details on setting those up in the official
[Tauri Guide — Android prerequisites](https://tauri.app/start/prerequisites/#android):

- [Java](https://developer.android.com/build/jdks) (JDK 17)
- The [Android SDK](https://developer.android.com/studio) and NDK
- The Rust Android targets:

```console
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

Generate the Android project, generate the app icons from the icon source, and build the
APK:

```console
pnpm install
pnpm run tauri android init
pnpm run tauri icon src-tauri/icons/icon.png
pnpm run tauri android build
```

The unsigned APK is written to
`src-tauri/gen/android/app/build/outputs/apk/universal/release/`. It needs to be signed
before it can be installed.

To run the app in development on an emulator or a connected device:

```console
pnpm run tauri android dev
```

## Attested build artifacts

The release binaries and bundles are attested with GitHub Artifact Attestations, and a
software bill of materials (SBOM) is generated for each release. The attestations for the
binaries are available [here](https://github.com/hrzlgnm/zux/attestations). For more
information and details on how to verify those, see
[Verifying artifact attestations with the GitHub CLI](https://docs.github.com/en/actions/security-for-github-actions/using-artifact-attestations/using-artifact-attestations-to-establish-provenance-for-builds#verifying-artifact-attestations-with-the-github-cli)

Since release v0.7.1

## Acknowledgments

This app uses the fantastic [mdns-sd library](https://github.com/keepsimple1/mdns-sd) to
handle all mDNS functionality, and [vis-network](https://visjs.org/) for the
force-directed graph. If you find this app helpful, consider giving them a star on GitHub!
