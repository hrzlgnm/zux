# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] [compare](https://github.com/hrzlgnm/zux/compare/v1.7.1...HEAD)

### Added

- Gzip the SBOM workflow artifacts on publish ([#201](https://github.com/hrzlgnm/zux/pull/201))

- Trigger snap release after a release is published ([#202](https://github.com/hrzlgnm/zux/pull/202))

## [1.7.1] - 2026-08-25 [compare](https://github.com/hrzlgnm/zux/compare/v1.7.0...v1.7.1)

### Changed

- Require two-axis code review before completion ([#197](https://github.com/hrzlgnm/zux/pull/197))

- Point README to webkit2gtk-nvidia-quirk tracing docs ([#200](https://github.com/hrzlgnm/zux/pull/200))

### Dependencies

- *(deps)* Update rust crate webkit2gtk-nvidia-quirk to v2.1.0 ([#198](https://github.com/hrzlgnm/zux/pull/198))

- *(deps)* Lock file maintenance ([#199](https://github.com/hrzlgnm/zux/pull/199))

## [1.7.0] - 2026-08-25 [compare](https://github.com/hrzlgnm/zux/compare/v1.6.6...v1.7.0)

### Added

- Ship CHANGELOG.md in deb and rpm packages ([#192](https://github.com/hrzlgnm/zux/pull/192))

### Changed

- Add zux man page ([#194](https://github.com/hrzlgnm/zux/pull/194))

### Dependencies

- *(deps)* Update dependency svelte to v5.56.10 ([#186](https://github.com/hrzlgnm/zux/pull/186))

- *(deps)* Lock file maintenance ([#187](https://github.com/hrzlgnm/zux/pull/187))

- *(deps)* Update dependency eslint to v10.9.0 ([#190](https://github.com/hrzlgnm/zux/pull/190))

- *(deps)* Update archlinux:base-devel docker digest to 68bfc3b ([#189](https://github.com/hrzlgnm/zux/pull/189))

- *(deps)* Update actions/setup-java action to v6 ([#193](https://github.com/hrzlgnm/zux/pull/193))

### Fixed

- Disable coderabbit request changes workflow ([#188](https://github.com/hrzlgnm/zux/pull/188))

- Drop obsolete --label ignore from changelog PR ([#195](https://github.com/hrzlgnm/zux/pull/195))

## [1.6.6] - 2026-08-23 [compare](https://github.com/hrzlgnm/zux/compare/v1.6.5...v1.6.6)

### Dependencies

- *(deps)* Update dependency @sveltejs/kit to v2.70.3 ([#182](https://github.com/hrzlgnm/zux/pull/182))

- *(deps)* Update rust crate log to v0.4.34 ([#183](https://github.com/hrzlgnm/zux/pull/183))

- *(deps)* Update dependency vis-network to v10.1.2 ([#184](https://github.com/hrzlgnm/zux/pull/184))

- *(deps)* Update dependency vite to v8.2.2 ([#185](https://github.com/hrzlgnm/zux/pull/185))

## [1.6.5] - 2026-08-20 [compare](https://github.com/hrzlgnm/zux/compare/v1.6.4...v1.6.5)

### Changed

- Migrate mobile updater to tauri-plugin-android-update ([#181](https://github.com/hrzlgnm/zux/pull/181))

## [1.6.4] - 2026-08-20 [compare](https://github.com/hrzlgnm/zux/compare/v1.6.3...v1.6.4)

### Fixed

- *(aur)* Add cargo-edit to zux makedepends ([#180](https://github.com/hrzlgnm/zux/pull/180))

## [1.6.3] - 2026-08-19 [compare](https://github.com/hrzlgnm/zux/compare/v1.6.2...v1.6.3)

### Fixed

- Normalize mDNS service URLs ([#179](https://github.com/hrzlgnm/zux/pull/179))

## [1.6.2] - 2026-08-19 [compare](https://github.com/hrzlgnm/zux/compare/v1.6.0...v1.6.2)

### Fixed

- Stop filter expansion at the service-type boundary ([#177](https://github.com/hrzlgnm/zux/pull/177)) ([#178](https://github.com/hrzlgnm/zux/pull/178))

## [1.6.0] - 2026-08-18 [compare](https://github.com/hrzlgnm/zux/compare/v1.5.0...v1.6.0)

### Added

- Add NVIDIA quirk CLI options ([#175](https://github.com/hrzlgnm/zux/pull/175))

### Dependencies

- *(deps)* Update pnpm to v11.22.0 ([#173](https://github.com/hrzlgnm/zux/pull/173))

- *(deps)* Update rust crate webkit2gtk-nvidia-quirk to v2 ([#174](https://github.com/hrzlgnm/zux/pull/174))

## [1.5.0] - 2026-08-17 [compare](https://github.com/hrzlgnm/zux/compare/v1.4.1...v1.5.0)

### Added

- Create main window programmatically for Wayland decoration handling ([#172](https://github.com/hrzlgnm/zux/pull/172))

### Changed

- Use Tauri app icon as browser favicon ([#165](https://github.com/hrzlgnm/zux/pull/165))

### Dependencies

- *(deps)* Update dependency svelte to v5.56.9 ([#166](https://github.com/hrzlgnm/zux/pull/166))

- *(deps)* Update dependency eslint-plugin-svelte to v3.23.0 ([#167](https://github.com/hrzlgnm/zux/pull/167))

- *(deps)* Update dependency svelte-check to v4.7.6 ([#168](https://github.com/hrzlgnm/zux/pull/168))

- *(deps)* Lock file maintenance ([#169](https://github.com/hrzlgnm/zux/pull/169))

- *(deps)* Update archlinux:base-devel docker digest to 714acd1 ([#170](https://github.com/hrzlgnm/zux/pull/170))

- *(deps)* Update rust crate webkit2gtk-nvidia-quirk to v1.4.3 ([#171](https://github.com/hrzlgnm/zux/pull/171))

## [1.4.1] - 2026-08-15 [compare](https://github.com/hrzlgnm/zux/compare/v1.4.0...v1.4.1)

### Added

- Bundle Inter for consistent cross-platform typography ([#162](https://github.com/hrzlgnm/zux/pull/162))

### Dependencies

- *(deps)* Update dependency globals to v17.10.0 ([#161](https://github.com/hrzlgnm/zux/pull/161))

- *(deps)* Update dependency globals to v17.11.0 ([#163](https://github.com/hrzlgnm/zux/pull/163))

- *(deps)* Update rust crate webkit2gtk-nvidia-quirk to v1.4.2 ([#164](https://github.com/hrzlgnm/zux/pull/164))

## [1.4.0] - 2026-08-13 [compare](https://github.com/hrzlgnm/zux/compare/v1.3.0...v1.4.0)

### Dependencies

- *(deps)* Update rust crate mdns-sd to 0.21 ([#158](https://github.com/hrzlgnm/zux/pull/158))

- *(deps)* Update pnpm to v11.21.0 ([#159](https://github.com/hrzlgnm/zux/pull/159))

- *(deps)* Update hrzlgnm/actions action to v2.6.0 ([#160](https://github.com/hrzlgnm/zux/pull/160))

## [1.3.0] - 2026-08-11 [compare](https://github.com/hrzlgnm/zux/compare/v1.2.0...v1.3.0)

### Added

- Type the mdns event payload as a discriminated union ([#151](https://github.com/hrzlgnm/zux/pull/151))

### Changed

- Document commit granularity, fixups, and comment style ([#140](https://github.com/hrzlgnm/zux/pull/140))

- Add prettier for frontend formatting ([#142](https://github.com/hrzlgnm/zux/pull/142))

- Apply prettier to frontend sources ([#143](https://github.com/hrzlgnm/zux/pull/143))

- Use SvelteSet and SvelteMap for graph visibility filtering ([#150](https://github.com/hrzlgnm/zux/pull/150))

- Add eslint for the frontend ([#152](https://github.com/hrzlgnm/zux/pull/152))

- Type the graph view against vis-network types ([#153](https://github.com/hrzlgnm/zux/pull/153))

- Use placeholder for model in AGENTS.md ([#157](https://github.com/hrzlgnm/zux/pull/157))

### Fixed

- Tear down the mdns event listener when the page unmounts ([#145](https://github.com/hrzlgnm/zux/pull/145))

- Report failures when opening a service URL ([#146](https://github.com/hrzlgnm/zux/pull/146))

- Report failures when exporting the graph as SVG ([#147](https://github.com/hrzlgnm/zux/pull/147))

- Run the update check once on mount instead of in an effect ([#148](https://github.com/hrzlgnm/zux/pull/148))

- Key each blocks so list updates reconcile correctly ([#149](https://github.com/hrzlgnm/zux/pull/149))

### Maintenance

- *(ci)* Generate draft release body with git-cliff ([#137](https://github.com/hrzlgnm/zux/pull/137))

- *(ci)* Use correct sha1 for cargo-install action ([#138](https://github.com/hrzlgnm/zux/pull/138))

- *(ci)* Cache git-cliff and document release tool cache sync ([#139](https://github.com/hrzlgnm/zux/pull/139))

- *(ci)* Check frontend formatting on pull requests ([#144](https://github.com/hrzlgnm/zux/pull/144))

- Run eslint on frontend changes ([#154](https://github.com/hrzlgnm/zux/pull/154))

- Avoid running rust tests and clippy on frontend-only changes ([#156](https://github.com/hrzlgnm/zux/pull/156))

## [1.2.0] - 2026-08-11 [compare](https://github.com/hrzlgnm/zux/compare/v1.1.3...v1.2.0)

### Added

- Sign Windows bundles and ad-hoc sign macOS app in releases ([#133](https://github.com/hrzlgnm/zux/pull/133))

### Changed

- Document immutable releases ([#131](https://github.com/hrzlgnm/zux/pull/131))

- Adjust immutable releases wording ([#132](https://github.com/hrzlgnm/zux/pull/132))

### Dependencies

- *(deps)* Update archlinux:base-devel docker digest to ee205c2 ([#134](https://github.com/hrzlgnm/zux/pull/134))

- *(deps)* Update dependency @sveltejs/vite-plugin-svelte to v7.3.0 ([#135](https://github.com/hrzlgnm/zux/pull/135))

## [1.1.3] - 2026-08-10 [compare](https://github.com/hrzlgnm/zux/compare/v1.1.2...v1.1.3)

### Added

- Rename --keep-all-ips to --include-non-link-local-ipv6 ([#130](https://github.com/hrzlgnm/zux/pull/130))

### Changed

- Expand README and cross-link sibling projects ([#124](https://github.com/hrzlgnm/zux/pull/124))

- Add application screenshot to README ([#125](https://github.com/hrzlgnm/zux/pull/125))

- Add FlatPark install instructions and badge ([#126](https://github.com/hrzlgnm/zux/pull/126))

- Remove import ordering requirements for agents ([#127](https://github.com/hrzlgnm/zux/pull/127))

### Dependencies

- *(deps)* Update rust crate webkit2gtk-nvidia-quirk to v1.4.1 ([#123](https://github.com/hrzlgnm/zux/pull/123))

- *(deps)* Update pnpm/setup action to v2.0.2 ([#128](https://github.com/hrzlgnm/zux/pull/128))

- *(deps)* Lock file maintenance ([#129](https://github.com/hrzlgnm/zux/pull/129))

- *(deps)* Update dependency svelte-check to v4.7.5 ([#109](https://github.com/hrzlgnm/zux/pull/109))

## [1.1.2] - 2026-08-08 [compare](https://github.com/hrzlgnm/zux/compare/v1.1.1...v1.1.2)

### Changed

- Replace tauri-plugin-http with a direct reqwest dependency ([#121](https://github.com/hrzlgnm/zux/pull/121))

## [1.1.1] - 2026-08-08 [compare](https://github.com/hrzlgnm/zux/compare/v1.1.0...v1.1.1)

### Changed

- Tweak discovery batching so the ui behaves more smooth ([#118](https://github.com/hrzlgnm/zux/pull/118))

### Fixed

- Correct AUR Tauri build commands ([#119](https://github.com/hrzlgnm/zux/pull/119))

- Install AUR package license from source ([#120](https://github.com/hrzlgnm/zux/pull/120))

## [1.0.3] - 2026-08-07 [compare](https://github.com/hrzlgnm/zux/compare/v1.0.2...v1.0.3)

### Added

- Add automatic winget update on release publish ([#100](https://github.com/hrzlgnm/zux/pull/100))

- Add rust cache to clippy and tests jobs ([#107](https://github.com/hrzlgnm/zux/pull/107))

### Changed

- Switch from npm to pnpm ([#108](https://github.com/hrzlgnm/zux/pull/108))

- Don't duplicate license file in bundling ([#113](https://github.com/hrzlgnm/zux/pull/113))

- *(bundle)* Use higher compression rate for rpm bundle ([#114](https://github.com/hrzlgnm/zux/pull/114))

- Remove redundant sbom release upload ([#115](https://github.com/hrzlgnm/zux/pull/115))

### Dependencies

- *(deps)* Update rust crate clap to v4.6.6 ([#103](https://github.com/hrzlgnm/zux/pull/103))

- *(deps)* Update swatinem/rust-cache digest to 6323deb ([#104](https://github.com/hrzlgnm/zux/pull/104))

- *(deps)* Update dependency vite to v8.2.1 ([#111](https://github.com/hrzlgnm/zux/pull/111))

- *(deps)* Lock file maintenance ([#112](https://github.com/hrzlgnm/zux/pull/112))

### Fixed

- Strip sha256: prefix from cask checksum in homebrew-tap update ([#102](https://github.com/hrzlgnm/zux/pull/102))

- Add .msi installer to winget update ([#105](https://github.com/hrzlgnm/zux/pull/105))

- Remove useless rust cache step in winget workflow ([#106](https://github.com/hrzlgnm/zux/pull/106))

## [1.0.2] - 2026-08-05 [compare](https://github.com/hrzlgnm/zux/compare/v1.0.1...v1.0.2)

### Added

- Use GitHub API checksums for release assets ([#101](https://github.com/hrzlgnm/zux/pull/101))

## [1.0.1] - 2026-08-05 [compare](https://github.com/hrzlgnm/zux/compare/v1.0.0...v1.0.1)

### Changed

- Add badges to readme ([#93](https://github.com/hrzlgnm/zux/pull/93))

### Dependencies

- *(deps)* Update actions/attest digest to 1e69f48 ([#94](https://github.com/hrzlgnm/zux/pull/94))

- *(deps)* Update dtolnay/rust-toolchain digest to 4360b52 ([#97](https://github.com/hrzlgnm/zux/pull/97))

- *(deps)* Update dorny/paths-filter action to v4.0.3 ([#98](https://github.com/hrzlgnm/zux/pull/98))

### Fixed

- *(mobile)* Prevent update prompts for older releases ([#99](https://github.com/hrzlgnm/zux/pull/99))

## [1.0.0] - 2026-08-04 [compare](https://github.com/hrzlgnm/zux/compare/v0.9.0...v1.0.0)

### Added

- *(mobile)* Open release page when an update is available ([#89](https://github.com/hrzlgnm/zux/pull/89))

### Dependencies

- *(deps)* Lock file maintenance ([#90](https://github.com/hrzlgnm/zux/pull/90))

### Maintenance

- Cache clippy compilation with sccache ([#91](https://github.com/hrzlgnm/zux/pull/91))

- Warm grype db cache on main ([#92](https://github.com/hrzlgnm/zux/pull/92))

## [0.9.0] - 2026-08-04 [compare](https://github.com/hrzlgnm/zux/compare/v0.8.1...v0.9.0)

### Added

- Show app version in sidebar ([#88](https://github.com/hrzlgnm/zux/pull/88))

## [0.8.1] - 2026-08-04 [compare](https://github.com/hrzlgnm/zux/compare/v0.8.0...v0.8.1)

### Fixed

- Remove stale address nodes and update host/instance addresses ([#87](https://github.com/hrzlgnm/zux/pull/87))

## [0.8.0] - 2026-08-03 [compare](https://github.com/hrzlgnm/zux/compare/v0.7.3...v0.8.0)

### Added

- Update icon ([#85](https://github.com/hrzlgnm/zux/pull/85))

- Update Android SDK and NDK versions to match mdns-browser ([#86](https://github.com/hrzlgnm/zux/pull/86))

### Dependencies

- *(deps)* Lock file maintenance ([#82](https://github.com/hrzlgnm/zux/pull/82))

- *(deps)* Update hrzlgnm/actions action to v2.5.5 ([#84](https://github.com/hrzlgnm/zux/pull/84))

- *(deps)* Update archlinux:base-devel docker digest to c1829f3 ([#83](https://github.com/hrzlgnm/zux/pull/83))

## [0.7.3] - 2026-08-02 [compare](https://github.com/hrzlgnm/zux/compare/v0.7.2...v0.7.3)

### Changed

- Add nvidia webkit2gtk quirk handing ([#80](https://github.com/hrzlgnm/zux/pull/80))

## [0.7.2] - 2026-08-02 [compare](https://github.com/hrzlgnm/zux/compare/v0.7.1...v0.7.2)

### Changed

- Build for macos universal target ([#78](https://github.com/hrzlgnm/zux/pull/78))

## [0.7.1] - 2026-08-02 [compare](https://github.com/hrzlgnm/zux/compare/v0.7.0...v0.7.1)

### Added

- Add release asset attestation matching mdns-browser pattern ([#72](https://github.com/hrzlgnm/zux/pull/72))

- Add homebrew-reusable.yml workflow for updating homebrew tap ([#73](https://github.com/hrzlgnm/zux/pull/73))

### Changed

- Remove unused vsc*de settings ([#71](https://github.com/hrzlgnm/zux/pull/71))

- Fix anchore/scan-action sha1 ([#74](https://github.com/hrzlgnm/zux/pull/74))

- Ignore GHSA-wrw7-89jp-8q8g ([#75](https://github.com/hrzlgnm/zux/pull/75))

- Fix attestation subject-path ([#76](https://github.com/hrzlgnm/zux/pull/76))

### Dependencies

- *(deps)* Update dependency vite to v8.2.0 ([#9](https://github.com/hrzlgnm/zux/pull/9))

## [0.7.0] - 2026-08-01 [compare](https://github.com/hrzlgnm/zux/compare/v0.6.3...v0.7.0)

### Added

- Account for safe-area insets in mobile layout ([#68](https://github.com/hrzlgnm/zux/pull/68))

## [0.6.3] - 2026-08-01 [compare](https://github.com/hrzlgnm/zux/compare/v0.6.2...v0.6.3)

### Added

- Add LICENSE and install it with packages ([#66](https://github.com/hrzlgnm/zux/pull/66))

### Changed

- *(aur)* Clarify why we install a separate unbundled binary ([#67](https://github.com/hrzlgnm/zux/pull/67))

## [0.6.2] - 2026-07-31 [compare](https://github.com/hrzlgnm/zux/compare/v0.6.1...v0.6.2)

### Changed

- Defer daemon creation to reset() ([#62](https://github.com/hrzlgnm/zux/pull/62))

- Make browse tasks async ([#63](https://github.com/hrzlgnm/zux/pull/63))

### Dependencies

- *(deps)* Update actions/setup-java digest to b6effb0 ([#64](https://github.com/hrzlgnm/zux/pull/64))

- *(deps)* Update rust crate clap to v4.6.5 ([#65](https://github.com/hrzlgnm/zux/pull/65))

## [0.6.1] - 2026-07-31 [compare](https://github.com/hrzlgnm/zux/compare/v0.6.0...v0.6.1)

### Maintenance

- *(ci)* Add emoji-prefixed names to workflow jobs ([#60](https://github.com/hrzlgnm/zux/pull/60))

- *(ci)* Ensure draft release exists as separate job ([#61](https://github.com/hrzlgnm/zux/pull/61))

## [0.6.0] - 2026-07-31 [compare](https://github.com/hrzlgnm/zux/compare/v0.5.1...v0.6.0)

### Added

- Seed fake nodes in vite preview mode ([#54](https://github.com/hrzlgnm/zux/pull/54))

- Export graph view as SVG ([#55](https://github.com/hrzlgnm/zux/pull/55))

### Fixed

- Match exported SVG node borders to canvas rendering ([#56](https://github.com/hrzlgnm/zux/pull/56))

### Maintenance

- *(ci)* Add emoji prefixes to workflow step names ([#57](https://github.com/hrzlgnm/zux/pull/57))

- *(ci)* Omit android release key identifier as secret ([#58](https://github.com/hrzlgnm/zux/pull/58))

- *(ci)* Replace softprops/action-gh-release with gh release upload in android job ([#59](https://github.com/hrzlgnm/zux/pull/59))

## [0.5.1] - 2026-07-31 [compare](https://github.com/hrzlgnm/zux/compare/v0.4.1...v0.5.1)

### Added

- Responsive mobile layout ([#48](https://github.com/hrzlgnm/zux/pull/48))

### Dependencies

- *(deps)* Update dependency ubuntu to v24 ([#50](https://github.com/hrzlgnm/zux/pull/50))

### Fixed

- Gate desktop-only plugins out of mobile builds ([#47](https://github.com/hrzlgnm/zux/pull/47))

### Maintenance

- Add android APK release job ([#49](https://github.com/hrzlgnm/zux/pull/49))

- Run all release jobs in parallel ([#51](https://github.com/hrzlgnm/zux/pull/51))

- Cache cargo tools on main ([#52](https://github.com/hrzlgnm/zux/pull/52))

- *(ci)* Ensure release workflow keeps the release as draft ([#53](https://github.com/hrzlgnm/zux/pull/53))

## [0.4.1] - 2026-07-31 [compare](https://github.com/hrzlgnm/zux/compare/v0.4.0...v0.4.1)

### Fixed

- Keep event forwarder alive on lag, raise channel capacity ([#46](https://github.com/hrzlgnm/zux/pull/46))

## [0.4.0] - 2026-07-31 [compare](https://github.com/hrzlgnm/zux/compare/v0.3.6...v0.4.0)

### Added

- Exclude disabled nodes from physics simulation ([#45](https://github.com/hrzlgnm/zux/pull/45))

## [0.3.6] - 2026-07-31 [compare](https://github.com/hrzlgnm/zux/compare/v0.3.5...v0.3.6)

### Fixed

- Show update dialog when update is available ([#44](https://github.com/hrzlgnm/zux/pull/44))

## [0.3.5] - 2026-07-30 [compare](https://github.com/hrzlgnm/zux/compare/v0.3.4...v0.3.5)

### Fixed

- Pkgbuild generation for AUR source build ([#43](https://github.com/hrzlgnm/zux/pull/43))

## [0.3.4] - 2026-07-30 [compare](https://github.com/hrzlgnm/zux/compare/v0.3.3...v0.3.4)

### Fixed

- Add more missing build dependencies for AUR source build ([#42](https://github.com/hrzlgnm/zux/pull/42))

## [0.3.3] - 2026-07-30 [compare](https://github.com/hrzlgnm/zux/compare/v0.3.2...v0.3.3)

### Fixed

- Add missing build dependencies for AUR source build ([#41](https://github.com/hrzlgnm/zux/pull/41))

## [0.3.2] - 2026-07-30 [compare](https://github.com/hrzlgnm/zux/compare/v0.3.1...v0.3.2)

### Added

- Add automatic AUR updater ([#40](https://github.com/hrzlgnm/zux/pull/40))

## [0.3.1] - 2026-07-30 [compare](https://github.com/hrzlgnm/zux/compare/v0.3.0...v0.3.1)

### Added

- Add updater check on startup w/ capability permission ([#38](https://github.com/hrzlgnm/zux/pull/38))

- Only check for updates when bundled (non-dev) ([#39](https://github.com/hrzlgnm/zux/pull/39))

## [0.3.0] - 2026-07-30 [compare](https://github.com/hrzlgnm/zux/compare/v0.2.0...v0.3.0)

### Added

- Shutdown daemon before recreate in reset, deduplicate config ([#36](https://github.com/hrzlgnm/zux/pull/36))

### Changed

- Use visualizer instead of browser more thoroughly ([#37](https://github.com/hrzlgnm/zux/pull/37))

## [0.2.0] - 2026-07-30 [compare](https://github.com/hrzlgnm/zux/compare/v0.1.1...v0.2.0)

### Changed

- Populate AGENTS.md with project conventions ([#34](https://github.com/hrzlgnm/zux/pull/34))

### Fixed

- Omit = for empty txt records, expand filter to address nodes, remove dead css ([#32](https://github.com/hrzlgnm/zux/pull/32))

### Maintenance

- Add dorny/path-filters change detection ([#35](https://github.com/hrzlgnm/zux/pull/35))

## [0.1.1] - 2026-07-30 [compare](https://github.com/hrzlgnm/zux/compare/v0.1.0...v0.1.1)

### Added

- Make legend checkboxes to toggle node group visibility ([#29](https://github.com/hrzlgnm/zux/pull/29))

- Enable macOS app bundle type for auto updates ([#30](https://github.com/hrzlgnm/zux/pull/30))

### Dependencies

- *(deps)* Pin dependencies ([#26](https://github.com/hrzlgnm/zux/pull/26))

- *(deps)* Lock file maintenance ([#27](https://github.com/hrzlgnm/zux/pull/27))

## [0.1.0] - 2026-07-29

### Changed

- Change info log messages to debug ([#21](https://github.com/hrzlgnm/zux/pull/21))

### Dependencies

- *(deps)* Update svelte/vite/typescript dependencies ([#15](https://github.com/hrzlgnm/zux/pull/15))

### Fixed

- Add contents:write permission to release workflow ([#16](https://github.com/hrzlgnm/zux/pull/16))

- Only run stabilization on initial layout, not on slider changes ([#17](https://github.com/hrzlgnm/zux/pull/17))


