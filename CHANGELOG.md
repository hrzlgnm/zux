# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.17.0](https://github.com/hrzlgnm/zux/compare/v1.16.0...v1.17.0) (2026-09-15)


### Features

* account for safe-area insets in mobile layout ([#68](https://github.com/hrzlgnm/zux/issues/68)) ([c90576e](https://github.com/hrzlgnm/zux/commit/c90576eefaaf4491538b58d0aeef0abe1093e1c2))
* add automatic AUR updater ([#40](https://github.com/hrzlgnm/zux/issues/40)) ([b4a028c](https://github.com/hrzlgnm/zux/commit/b4a028cb0928359aac02c6e1c1d5e0ad8c42114a))
* add automatic winget update on release publish ([#100](https://github.com/hrzlgnm/zux/issues/100)) ([005bc02](https://github.com/hrzlgnm/zux/commit/005bc0232804191600511be142a17a994ed2c21f))
* add homebrew-reusable.yml workflow for updating homebrew tap ([#73](https://github.com/hrzlgnm/zux/issues/73)) ([501d3e9](https://github.com/hrzlgnm/zux/commit/501d3e903f9152089add0db3313ec18a98d194b3))
* add LICENSE and install it with packages ([#66](https://github.com/hrzlgnm/zux/issues/66)) ([42378e8](https://github.com/hrzlgnm/zux/commit/42378e80348484c3683f8cddcd8acc22e32707a8))
* add NVIDIA quirk CLI options ([#175](https://github.com/hrzlgnm/zux/issues/175)) ([c2a9b09](https://github.com/hrzlgnm/zux/commit/c2a9b09e74fb57716329f6b0c8a0ce98f1eb3914))
* add release asset attestation matching mdns-browser pattern ([#72](https://github.com/hrzlgnm/zux/issues/72)) ([d630cfb](https://github.com/hrzlgnm/zux/commit/d630cfb94f92ed3fef122ff82d933ee5ef35f89a))
* add rust cache to clippy and tests jobs ([#107](https://github.com/hrzlgnm/zux/issues/107)) ([6c7a145](https://github.com/hrzlgnm/zux/commit/6c7a1454bae115378c3a0b46dc1f829099d699a9))
* add theming support with 8 theme presets ([#227](https://github.com/hrzlgnm/zux/issues/227)) ([6d57a09](https://github.com/hrzlgnm/zux/commit/6d57a09043a009e8dd6b16e8641f096f535e3a7a))
* add updater check on startup w/ capability permission ([#38](https://github.com/hrzlgnm/zux/issues/38)) ([f1782b0](https://github.com/hrzlgnm/zux/commit/f1782b003693eb708403a31fbaebcc439e7a03a3))
* bundle Inter for consistent cross-platform typography ([#162](https://github.com/hrzlgnm/zux/issues/162)) ([9cd24cf](https://github.com/hrzlgnm/zux/commit/9cd24cf530f1cbb50e6ada202de88c5f815930c8))
* **ci:** generate draft release body with git-cliff ([#137](https://github.com/hrzlgnm/zux/issues/137)) ([a13f602](https://github.com/hrzlgnm/zux/commit/a13f602120dc4b2279515403bd0ed10a6236eb64))
* create main window programmatically for Wayland decoration handling ([#172](https://github.com/hrzlgnm/zux/issues/172)) ([89a2103](https://github.com/hrzlgnm/zux/commit/89a2103b75939faea0a7635b999deee394a60fa3))
* disable autocapitalization for text inputs ([#275](https://github.com/hrzlgnm/zux/issues/275)) ([21ac91f](https://github.com/hrzlgnm/zux/commit/21ac91f2ca950a651d4af7be73c952fefaa4d392))
* **docker:** add zux-arch-aur-builder image and use reusable docker workflow ([#288](https://github.com/hrzlgnm/zux/issues/288)) ([c5ad513](https://github.com/hrzlgnm/zux/commit/c5ad51340ea978d7578617f1b399b862b42a939f))
* enable devtools in release builds ([#206](https://github.com/hrzlgnm/zux/issues/206)) ([a63bfc2](https://github.com/hrzlgnm/zux/commit/a63bfc257499f91589c9d0b6318e01125930d972))
* enable macOS app bundle type for auto updates ([#30](https://github.com/hrzlgnm/zux/issues/30)) ([8ab723a](https://github.com/hrzlgnm/zux/commit/8ab723ab8b0b606bc1e469c1c6c07bf57608a6b6))
* Enable non-link-local IPv6 by default on Android ([#265](https://github.com/hrzlgnm/zux/issues/265)) ([3d0a7dc](https://github.com/hrzlgnm/zux/commit/3d0a7dcb42ace40fec8e9b3eb124dcdc268e5554))
* exclude disabled nodes from physics simulation ([#45](https://github.com/hrzlgnm/zux/issues/45)) ([fc33940](https://github.com/hrzlgnm/zux/commit/fc3394064b0a37667dbcfb14906c502b35ebfd7f))
* export graph view as SVG ([#55](https://github.com/hrzlgnm/zux/issues/55)) ([2708918](https://github.com/hrzlgnm/zux/commit/2708918d2c4ae82d73ffd14910324968ae2c7122))
* gzip the SBOM workflow artifacts on publish ([#201](https://github.com/hrzlgnm/zux/issues/201)) ([8ca33c2](https://github.com/hrzlgnm/zux/commit/8ca33c297c1670bb6e009fa3210c0939e742b6b9))
* make legend checkboxes to toggle node group visibility ([#29](https://github.com/hrzlgnm/zux/issues/29)) ([8eba1aa](https://github.com/hrzlgnm/zux/commit/8eba1aa72e5001c27ac91ded27e15f2e76c4a578))
* make release builds auditable via cargo-auditable wrapper ([#368](https://github.com/hrzlgnm/zux/issues/368)) ([bcc5ee9](https://github.com/hrzlgnm/zux/commit/bcc5ee9e8a1c8493cc30deb9e2e56146a041e7ea))
* manage releases with release-please ([#335](https://github.com/hrzlgnm/zux/issues/335)) ([c5a122b](https://github.com/hrzlgnm/zux/commit/c5a122bae2bf3077b541685ead295ceba84e1b96))
* **mobile:** open release page when an update is available ([#89](https://github.com/hrzlgnm/zux/issues/89)) ([962347d](https://github.com/hrzlgnm/zux/commit/962347d3b8d4f38691b6a93923ba9768a7a4c3bd))
* only check for updates when bundled (non-dev) ([#39](https://github.com/hrzlgnm/zux/issues/39)) ([e7ead2e](https://github.com/hrzlgnm/zux/commit/e7ead2e393e82f346af08185b9f191d998fdba61))
* persist physics config across restarts ([#211](https://github.com/hrzlgnm/zux/issues/211)) ([94b715a](https://github.com/hrzlgnm/zux/commit/94b715a63a539d279865b663c7e69cd635a827b0))
* rename --keep-all-ips to --include-non-link-local-ipv6 ([#130](https://github.com/hrzlgnm/zux/issues/130)) ([c19a838](https://github.com/hrzlgnm/zux/commit/c19a83815c5b86bfe79cf362aa85381034f8724a))
* responsive mobile layout ([#48](https://github.com/hrzlgnm/zux/issues/48)) ([ca074f1](https://github.com/hrzlgnm/zux/commit/ca074f17c613d5e599d1ba8e91a89ce5913bcf51))
* run release-please with GITHUB_TOKEN and auto-approved Release PRs ([#343](https://github.com/hrzlgnm/zux/issues/343)) ([2c51276](https://github.com/hrzlgnm/zux/commit/2c51276aa417874a025aa00e1daac31a6973ebb7))
* seed fake nodes in vite preview mode ([#54](https://github.com/hrzlgnm/zux/issues/54)) ([bb04f61](https://github.com/hrzlgnm/zux/commit/bb04f61800567e79ec9cc2eceed7bc4158e8a884))
* ship CHANGELOG.md in deb and rpm packages ([#192](https://github.com/hrzlgnm/zux/issues/192)) ([54d7755](https://github.com/hrzlgnm/zux/commit/54d77551c1bdcba0b671c8b4e8ccbc359c1260e6))
* show app version in sidebar ([#88](https://github.com/hrzlgnm/zux/issues/88)) ([630a57f](https://github.com/hrzlgnm/zux/commit/630a57f02fe291568c3e9bfd825d5c18f4eac855))
* shutdown daemon before recreate in reset, deduplicate config ([#36](https://github.com/hrzlgnm/zux/issues/36)) ([f3b44e5](https://github.com/hrzlgnm/zux/commit/f3b44e5ae20c86b127f4a7321a02a22d91fe00a0))
* sign Windows bundles and ad-hoc sign macOS app in releases ([#133](https://github.com/hrzlgnm/zux/issues/133)) ([679ffec](https://github.com/hrzlgnm/zux/commit/679ffec6fa376106e6df08241bfa180b6b1ff62d))
* **theme:** add dracula, nord, tokyo-night and gruvbox presets ([#233](https://github.com/hrzlgnm/zux/issues/233)) ([fb80894](https://github.com/hrzlgnm/zux/commit/fb808940b96959d67bc02e0cc58023c24b74b86f))
* **theme:** system theme, css var map and window sync ([#232](https://github.com/hrzlgnm/zux/issues/232)) ([7702842](https://github.com/hrzlgnm/zux/commit/770284233f9dce9580edf739c4ddcb5aa1ff9af1))
* trigger snap release after a release is published ([#202](https://github.com/hrzlgnm/zux/issues/202)) ([a6e8e2d](https://github.com/hrzlgnm/zux/commit/a6e8e2d2f30c8bbbf3a8de3ed4bf4d8740134442))
* type the mdns event payload as a discriminated union ([#151](https://github.com/hrzlgnm/zux/issues/151)) ([e07e47f](https://github.com/hrzlgnm/zux/commit/e07e47f571e1d2759cb7f72767de9a47269ebe85))
* update Android SDK and NDK versions to match mdns-browser ([#86](https://github.com/hrzlgnm/zux/issues/86)) ([bdc587f](https://github.com/hrzlgnm/zux/commit/bdc587fe5545945802a099451c3bb6386bf87a17))
* update icon ([#85](https://github.com/hrzlgnm/zux/issues/85)) ([0488dfe](https://github.com/hrzlgnm/zux/commit/0488dfe74c60f4796cbae42d9ce8515d7cee4a59))
* Use GitHub API checksums for release assets ([#101](https://github.com/hrzlgnm/zux/issues/101)) ([e46bc50](https://github.com/hrzlgnm/zux/commit/e46bc50044b18a70caf6254aff668567480da8a2))
* use overlay drawer for sidebar on mobile ([#259](https://github.com/hrzlgnm/zux/issues/259)) ([513cc94](https://github.com/hrzlgnm/zux/commit/513cc9455bf14394d679441b406bcbcc41b77aa5))
* use shared release-preconditions action ([#331](https://github.com/hrzlgnm/zux/issues/331)) ([6aa6b81](https://github.com/hrzlgnm/zux/commit/6aa6b811dab13e814ef6d5fc473b6e5eaec2fd3e))
* use the android-update JS bindings ([#302](https://github.com/hrzlgnm/zux/issues/302)) ([8299f9a](https://github.com/hrzlgnm/zux/commit/8299f9af2f37141355be6843f5505495b60588b3))


### Bug Fixes

* add .msi installer to winget update ([#105](https://github.com/hrzlgnm/zux/issues/105)) ([3bef61a](https://github.com/hrzlgnm/zux/commit/3bef61aeeb34100f00fd7bd3fe982d86b58c529e))
* add contents:write permission to release workflow ([#16](https://github.com/hrzlgnm/zux/issues/16)) ([4541229](https://github.com/hrzlgnm/zux/commit/4541229d3068b466d2f71e72af577dd7e5aa42e9))
* add missing build dependencies for AUR source build ([#41](https://github.com/hrzlgnm/zux/issues/41)) ([b300378](https://github.com/hrzlgnm/zux/commit/b3003787348670432af4d5bdc6811e375d1bb91e))
* add more missing build dependencies for AUR source build ([#42](https://github.com/hrzlgnm/zux/issues/42)) ([3162665](https://github.com/hrzlgnm/zux/commit/3162665e90870706a8a30fa623f9840692fe2073))
* align SPDX identifiers with MIT LICENSE ([#221](https://github.com/hrzlgnm/zux/issues/221)) ([6bdb7dd](https://github.com/hrzlgnm/zux/commit/6bdb7dd54199ba8b9264c8ae42837422a4b6c561))
* **aur:** add cargo-edit to zux makedepends ([#180](https://github.com/hrzlgnm/zux/issues/180)) ([065ced2](https://github.com/hrzlgnm/zux/commit/065ced25bac0908777881a4e7e481b0dc9a1dc9a))
* **aur:** allow republishing via workflow dispatch tag input ([#312](https://github.com/hrzlgnm/zux/issues/312)) ([c50d523](https://github.com/hrzlgnm/zux/commit/c50d523ef5701c7d07a1fa6fd7bb8d7840220f1d))
* **aur:** require verified host keys before writing known_hosts ([#310](https://github.com/hrzlgnm/zux/issues/310)) ([87718b5](https://github.com/hrzlgnm/zux/commit/87718b555f3ee7c1c23ce6573921d9f346769073))
* **aur:** retry downloads on transient failures ([#286](https://github.com/hrzlgnm/zux/issues/286)) ([c3900ae](https://github.com/hrzlgnm/zux/commit/c3900ae6f49d3346e682ef34bed257ccf36b9d4e))
* **ci:** add retry to download steps in other workflows ([#287](https://github.com/hrzlgnm/zux/issues/287)) ([0bf3fce](https://github.com/hrzlgnm/zux/commit/0bf3fce6432f0d069d42e875059c8be1df3155d9))
* **ci:** cache git-cliff and document release tool cache sync ([#139](https://github.com/hrzlgnm/zux/issues/139)) ([923c5a5](https://github.com/hrzlgnm/zux/commit/923c5a53b57c2ff380e2d688670a0687e294dec6))
* **ci:** clean ~/aur before clone so retries start fresh ([#292](https://github.com/hrzlgnm/zux/issues/292)) ([a327eec](https://github.com/hrzlgnm/zux/commit/a327eec1ce4d07e5573369686e6f51ca06fb2065))
* **ci:** disable grype DB cache on release to match pnpm/sccache ([#248](https://github.com/hrzlgnm/zux/issues/248)) ([79edebb](https://github.com/hrzlgnm/zux/commit/79edebb0eca37ecb4a06389af757d9b72cc73728))
* **ci:** disable pnpm store cache on release to match sccache ([#247](https://github.com/hrzlgnm/zux/issues/247)) ([11a4080](https://github.com/hrzlgnm/zux/commit/11a40800a75c56b57f4f8525490d07d233719a69))
* **ci:** ensure draft release exists as separate job ([#61](https://github.com/hrzlgnm/zux/issues/61)) ([ba24398](https://github.com/hrzlgnm/zux/commit/ba243981ed10df37fe21d943e39bfd35d745bd44))
* **ci:** ensure release workflow keeps the release as draft ([#53](https://github.com/hrzlgnm/zux/issues/53)) ([583efb9](https://github.com/hrzlgnm/zux/commit/583efb9bc2d94518095f7017205fd1050ee1c5c0))
* **ci:** force tag creation for release-please drafts ([#342](https://github.com/hrzlgnm/zux/issues/342)) ([6bb7fde](https://github.com/hrzlgnm/zux/commit/6bb7fde20bb60f875f047c0b849496b13a82be5a))
* **ci:** ignore short SHAs in release-please changelog for typos ([#339](https://github.com/hrzlgnm/zux/issues/339)) ([232948f](https://github.com/hrzlgnm/zux/commit/232948f143b358ec7e073b07c87cfe9b6894a81f))
* **ci:** relock Cargo.lock on Release PR, drop build-time version sync ([#351](https://github.com/hrzlgnm/zux/issues/351)) ([d839219](https://github.com/hrzlgnm/zux/commit/d8392196f11b19ba4362f8ce602726d60dac6dd4))
* **ci:** replace softprops/action-gh-release with gh release upload in android job ([#59](https://github.com/hrzlgnm/zux/issues/59)) ([7a1e86c](https://github.com/hrzlgnm/zux/commit/7a1e86cda546b36ed9da9a0b3624e9a878a767ae))
* **ci:** restore checkout credentials in update-changelog workflow ([#334](https://github.com/hrzlgnm/zux/issues/334)) ([d182a93](https://github.com/hrzlgnm/zux/commit/d182a939d78672047c7084c05d0f1344e324fe3f))
* **ci:** run pnpm jobs after prettier to avoid cache warnings ([#306](https://github.com/hrzlgnm/zux/issues/306)) ([280ef86](https://github.com/hrzlgnm/zux/commit/280ef867190e2927f3c76e81c1f073c486f45897))
* **ci:** run release-please with a PAT instead of GITHUB_TOKEN ([#341](https://github.com/hrzlgnm/zux/issues/341)) ([1964646](https://github.com/hrzlgnm/zux/commit/1964646776774846af5fa127f2a52db6939ed8e4))
* **ci:** set include-component-in-tag false for release-please ([#340](https://github.com/hrzlgnm/zux/issues/340)) ([fa14916](https://github.com/hrzlgnm/zux/commit/fa14916a9beda22f73145c53dca226b4a9b0c74b))
* **ci:** share rust cache and only save on main to cut ~65% size ([#249](https://github.com/hrzlgnm/zux/issues/249)) ([0787513](https://github.com/hrzlgnm/zux/commit/07875137993d229a7f259147d9f91dc4cb25eee1))
* **ci:** sign Cargo.lock sync commit via Contents API ([#353](https://github.com/hrzlgnm/zux/issues/353)) ([0b7be3d](https://github.com/hrzlgnm/zux/commit/0b7be3dd5dac14484b9cdabdb19cf2d34564db5b))
* **ci:** stream Contents API body from file in Cargo.lock sync ([#354](https://github.com/hrzlgnm/zux/issues/354)) ([17f9dfb](https://github.com/hrzlgnm/zux/commit/17f9dfbacbd3de8146d9638ce7b837fc66a46a85))
* **ci:** use correct sha1 for cargo-install action ([#138](https://github.com/hrzlgnm/zux/issues/138)) ([8a2cb8a](https://github.com/hrzlgnm/zux/commit/8a2cb8aecbf6c11b141df5b4aafc27dce070fbcc))
* **ci:** verify AUR SSH host key against published fingerprints ([#291](https://github.com/hrzlgnm/zux/issues/291)) ([741993c](https://github.com/hrzlgnm/zux/commit/741993c13cb2b6e74a8b3f514960a2871c2fceb8))
* correct AUR Tauri build commands ([#119](https://github.com/hrzlgnm/zux/issues/119)) ([2510ac7](https://github.com/hrzlgnm/zux/commit/2510ac7b8fcc731e8cd8c49fff1f34083cce77d3))
* **deps:** update rust crate clap to v4.6.7 ([#366](https://github.com/hrzlgnm/zux/issues/366)) ([e06fcbd](https://github.com/hrzlgnm/zux/commit/e06fcbd2f5bfe65e483201abf3bcf583a19f2466))
* **deps:** update rust crate mdns-sd to 0.21 ([#158](https://github.com/hrzlgnm/zux/issues/158)) ([0f67e89](https://github.com/hrzlgnm/zux/commit/0f67e892d5524d3bc1acb83e9d084408b0ffcba5))
* **deps:** update rust crate tauri-plugin-android-update to 0.2 ([#304](https://github.com/hrzlgnm/zux/issues/304)) ([f389256](https://github.com/hrzlgnm/zux/commit/f3892560d0ae8ebb19bfcaea865b684750d456d9))
* **deps:** update rust crate webkit2gtk-nvidia-quirk to v2 ([#174](https://github.com/hrzlgnm/zux/issues/174)) ([d3524cc](https://github.com/hrzlgnm/zux/commit/d3524cce6b6f31a44ce26e8f52f6ff229e63e440))
* **deps:** update rust crate webkit2gtk-nvidia-quirk to v2.1.2 ([c648131](https://github.com/hrzlgnm/zux/commit/c648131d61a2fdbc20390cb114d24f07c84598cb))
* disable auto-update check on mobile dev builds ([#260](https://github.com/hrzlgnm/zux/issues/260)) ([7b7af85](https://github.com/hrzlgnm/zux/commit/7b7af858f7ebbf27c6d8b09acc16b36835f95add))
* disable coderabbit request changes workflow ([#188](https://github.com/hrzlgnm/zux/issues/188)) ([bf27d6f](https://github.com/hrzlgnm/zux/commit/bf27d6f39d2723921b35845fccaaeaf4e34f8236))
* drop dead grype DB warm and broken cache-tools concurrency ([#215](https://github.com/hrzlgnm/zux/issues/215)) ([cd8da14](https://github.com/hrzlgnm/zux/commit/cd8da14c7b12317c40423715aeafe65cf622bc97))
* drop obsolete --label ignore from changelog PR ([#195](https://github.com/hrzlgnm/zux/issues/195)) ([51fb51a](https://github.com/hrzlgnm/zux/commit/51fb51aa28a0ed718714799ff5930fe4f509f808))
* drop removed legacy tools package from Android SDK setup ([#369](https://github.com/hrzlgnm/zux/issues/369)) ([f223755](https://github.com/hrzlgnm/zux/commit/f223755fe57ffd4d844b6424a94efb8a6b020b0e))
* eliminate benign cache-collision CI annotations ([#214](https://github.com/hrzlgnm/zux/issues/214)) ([0d9065d](https://github.com/hrzlgnm/zux/commit/0d9065d211dc5d3279b217e26940df00daaae7d0))
* fail release when a draft already exists ([#317](https://github.com/hrzlgnm/zux/issues/317)) ([4a1a8a6](https://github.com/hrzlgnm/zux/commit/4a1a8a63184c353d6a5d154d0264ebbd8ef86258))
* gate desktop-only plugins out of mobile builds ([#47](https://github.com/hrzlgnm/zux/issues/47)) ([a3f41bf](https://github.com/hrzlgnm/zux/commit/a3f41bf2e00039c8fd41392ed6b1eb6f911c8479))
* harden AUR release scripts and workflow checkouts ([#316](https://github.com/hrzlgnm/zux/issues/316)) ([de03a99](https://github.com/hrzlgnm/zux/commit/de03a990485664cb4deec590f557b0d6264fbc7f))
* install AUR package license from source ([#120](https://github.com/hrzlgnm/zux/issues/120)) ([a8746b2](https://github.com/hrzlgnm/zux/commit/a8746b213d171d8db8e4dcaa9686e721b3c0a624))
* keep event forwarder alive on lag, raise channel capacity ([#46](https://github.com/hrzlgnm/zux/issues/46)) ([fdfd025](https://github.com/hrzlgnm/zux/commit/fdfd025c11455f1695d4d3352a81ef6aa25b9a20))
* key each blocks so list updates reconcile correctly ([#149](https://github.com/hrzlgnm/zux/issues/149)) ([1ae05b5](https://github.com/hrzlgnm/zux/commit/1ae05b5e83f72c28852f6f96933365ce47d8e2f5))
* match exported SVG node borders to canvas rendering ([#56](https://github.com/hrzlgnm/zux/issues/56)) ([a9a59fb](https://github.com/hrzlgnm/zux/commit/a9a59fbc92d3bc27e6dd73be0b6e33cdb990e21d))
* **mobile:** prevent update prompts for older releases ([#99](https://github.com/hrzlgnm/zux/issues/99)) ([55e0f82](https://github.com/hrzlgnm/zux/commit/55e0f82f92752453563e82fd8bb74319195c264b))
* normalize mDNS service URLs ([#179](https://github.com/hrzlgnm/zux/issues/179)) ([a5e3077](https://github.com/hrzlgnm/zux/commit/a5e30775db7df4d409f6680c3260f77fe178c7d9))
* omit = for empty txt records, expand filter to address nodes, remove dead css ([#32](https://github.com/hrzlgnm/zux/issues/32)) ([3d5fc20](https://github.com/hrzlgnm/zux/commit/3d5fc20936ddf2dbc376e08c1a817fdd5d3fd05d))
* only run stabilization on initial layout, not on slider changes ([#17](https://github.com/hrzlgnm/zux/issues/17)) ([b265537](https://github.com/hrzlgnm/zux/commit/b26553763e3b2f35396824e91a1e319bc9b9d0af))
* order CI jobs after validation ([#305](https://github.com/hrzlgnm/zux/issues/305)) ([8d1aa83](https://github.com/hrzlgnm/zux/commit/8d1aa83ab20e1558c97c86438cc494cb36413d56))
* pkgbuild generation for AUR source build ([#43](https://github.com/hrzlgnm/zux/issues/43)) ([2db359d](https://github.com/hrzlgnm/zux/commit/2db359d950cac90d9f3764ce16b8cbd161732122))
* **pnpm:** exclude Tauri packages from minimumReleaseAge ([#246](https://github.com/hrzlgnm/zux/issues/246)) ([cd7285b](https://github.com/hrzlgnm/zux/commit/cd7285b6ddeca9b6715002a2f72d23a87f1b5bb9))
* reduce frontend log noise, stop logging incoming tauri events ([#213](https://github.com/hrzlgnm/zux/issues/213)) ([417c6a8](https://github.com/hrzlgnm/zux/commit/417c6a82c00f2114759f231a26278c60fc41012a))
* remove stale address nodes and update host/instance addresses ([#87](https://github.com/hrzlgnm/zux/issues/87)) ([717deb0](https://github.com/hrzlgnm/zux/commit/717deb054e6a2efc5db295c5467b5391d1a298ee))
* remove useless rust cache step in winget workflow ([#106](https://github.com/hrzlgnm/zux/issues/106)) ([cb3dd03](https://github.com/hrzlgnm/zux/commit/cb3dd036ee6384893c6311d2f98c8aaf24a32b67))
* **renovate:** align Tauri npm and Cargo updates ([#244](https://github.com/hrzlgnm/zux/issues/244)) ([28638ff](https://github.com/hrzlgnm/zux/commit/28638ff92242d5a4cac79064151f84f1eaa97f75))
* report failures when exporting the graph as SVG ([#147](https://github.com/hrzlgnm/zux/issues/147)) ([097da87](https://github.com/hrzlgnm/zux/commit/097da876abbe40ee193c3b959e326ba89920e1d3))
* report failures when opening a service URL ([#146](https://github.com/hrzlgnm/zux/issues/146)) ([aaa1557](https://github.com/hrzlgnm/zux/commit/aaa15570a351385b2bb9d142f829307b1105251e))
* restore release please manifest ([#373](https://github.com/hrzlgnm/zux/issues/373)) ([5fa197d](https://github.com/hrzlgnm/zux/commit/5fa197de8acf7973066550812c0fda1c5df51b88))
* run auditable cargo PATH step under bash on Windows ([#370](https://github.com/hrzlgnm/zux/issues/370)) ([85a2b60](https://github.com/hrzlgnm/zux/commit/85a2b602d1af6c71382051f8f5e8c9b5e793a038))
* run the update check once on mount instead of in an effect ([#148](https://github.com/hrzlgnm/zux/issues/148)) ([438ef35](https://github.com/hrzlgnm/zux/commit/438ef35d2a524884c620933f3ef29736df19274f))
* show update dialog when update is available ([#44](https://github.com/hrzlgnm/zux/issues/44)) ([c380066](https://github.com/hrzlgnm/zux/commit/c380066705274cdb99297af3a679b665a7503c86))
* stop filter expansion at the service-type boundary ([#177](https://github.com/hrzlgnm/zux/issues/177)) ([#178](https://github.com/hrzlgnm/zux/issues/178)) ([118a1c0](https://github.com/hrzlgnm/zux/commit/118a1c0837ffabc3fdca6a7500f29ec2acd6e2e7))
* strip sha256: prefix from cask checksum in homebrew-tap update ([#102](https://github.com/hrzlgnm/zux/issues/102)) ([bd3b3b1](https://github.com/hrzlgnm/zux/commit/bd3b3b196c7c6836693cfee07ccf64c58de86668))
* tear down the mdns event listener when the page unmounts ([#145](https://github.com/hrzlgnm/zux/issues/145)) ([d178fe0](https://github.com/hrzlgnm/zux/commit/d178fe0fd323225903b415044006051fe2eec09c))
* use vis-network internals instead of broken DataSet API for SVG export ([#205](https://github.com/hrzlgnm/zux/issues/205)) ([2db93c5](https://github.com/hrzlgnm/zux/commit/2db93c505926b30d6d3b6d6f51534dec948ebdda))

## [1.16.0](https://github.com/hrzlgnm/zux/compare/v1.15.1...v1.16.0) (2026-09-14)


### Features

* make release builds auditable via cargo-auditable wrapper ([#368](https://github.com/hrzlgnm/zux/issues/368)) ([bcc5ee9](https://github.com/hrzlgnm/zux/commit/bcc5ee9e8a1c8493cc30deb9e2e56146a041e7ea))


### Bug Fixes

* **deps:** update rust crate clap to v4.6.7 ([#366](https://github.com/hrzlgnm/zux/issues/366)) ([e06fcbd](https://github.com/hrzlgnm/zux/commit/e06fcbd2f5bfe65e483201abf3bcf583a19f2466))
* drop removed legacy tools package from Android SDK setup ([#369](https://github.com/hrzlgnm/zux/issues/369)) ([f223755](https://github.com/hrzlgnm/zux/commit/f223755fe57ffd4d844b6424a94efb8a6b020b0e))
* restore release please manifest ([#373](https://github.com/hrzlgnm/zux/issues/373)) ([5fa197d](https://github.com/hrzlgnm/zux/commit/5fa197de8acf7973066550812c0fda1c5df51b88))
* run auditable cargo PATH step under bash on Windows ([#370](https://github.com/hrzlgnm/zux/issues/370)) ([85a2b60](https://github.com/hrzlgnm/zux/commit/85a2b602d1af6c71382051f8f5e8c9b5e793a038))

## [1.16.0](https://github.com/hrzlgnm/zux/compare/v1.15.1...v1.16.0) (2026-09-14)


### Features

* make release builds auditable via cargo-auditable wrapper ([#368](https://github.com/hrzlgnm/zux/issues/368)) ([bcc5ee9](https://github.com/hrzlgnm/zux/commit/bcc5ee9e8a1c8493cc30deb9e2e56146a041e7ea))


### Bug Fixes

* **deps:** update rust crate clap to v4.6.7 ([#366](https://github.com/hrzlgnm/zux/issues/366)) ([e06fcbd](https://github.com/hrzlgnm/zux/commit/e06fcbd2f5bfe65e483201abf3bcf583a19f2466))
* drop removed legacy tools package from Android SDK setup ([#369](https://github.com/hrzlgnm/zux/issues/369)) ([f223755](https://github.com/hrzlgnm/zux/commit/f223755fe57ffd4d844b6424a94efb8a6b020b0e))
* restore release please manifest ([#373](https://github.com/hrzlgnm/zux/issues/373)) ([5fa197d](https://github.com/hrzlgnm/zux/commit/5fa197de8acf7973066550812c0fda1c5df51b88))
* run auditable cargo PATH step under bash on Windows ([#370](https://github.com/hrzlgnm/zux/issues/370)) ([85a2b60](https://github.com/hrzlgnm/zux/commit/85a2b602d1af6c71382051f8f5e8c9b5e793a038))

## [1.16.0](https://github.com/hrzlgnm/zux/compare/v1.15.1...v1.16.0) (2026-09-14)


### Features

* make release builds auditable via cargo-auditable wrapper ([#368](https://github.com/hrzlgnm/zux/issues/368)) ([bcc5ee9](https://github.com/hrzlgnm/zux/commit/bcc5ee9e8a1c8493cc30deb9e2e56146a041e7ea))


### Bug Fixes

* **deps:** update rust crate clap to v4.6.7 ([#366](https://github.com/hrzlgnm/zux/issues/366)) ([e06fcbd](https://github.com/hrzlgnm/zux/commit/e06fcbd2f5bfe65e483201abf3bcf583a19f2466))
* drop removed legacy tools package from Android SDK setup ([#369](https://github.com/hrzlgnm/zux/issues/369)) ([f223755](https://github.com/hrzlgnm/zux/commit/f223755fe57ffd4d844b6424a94efb8a6b020b0e))

## [1.15.1](https://github.com/hrzlgnm/zux/compare/v1.15.0...v1.15.1) (2026-09-13)


### Bug Fixes

* **deps:** update rust crate webkit2gtk-nvidia-quirk to v2.1.2 ([c648131](https://github.com/hrzlgnm/zux/commit/c648131d61a2fdbc20390cb114d24f07c84598cb))

## [1.15.0](https://github.com/hrzlgnm/zux/compare/v1.14.0...v1.15.0) (2026-09-13)


### Features

* manage releases with release-please ([#335](https://github.com/hrzlgnm/zux/issues/335)) ([c5a122b](https://github.com/hrzlgnm/zux/commit/c5a122bae2bf3077b541685ead295ceba84e1b96))
* run release-please with GITHUB_TOKEN and auto-approved Release PRs ([#343](https://github.com/hrzlgnm/zux/issues/343)) ([2c51276](https://github.com/hrzlgnm/zux/commit/2c51276aa417874a025aa00e1daac31a6973ebb7))


### Bug Fixes

* **ci:** force tag creation for release-please drafts ([#342](https://github.com/hrzlgnm/zux/issues/342)) ([6bb7fde](https://github.com/hrzlgnm/zux/commit/6bb7fde20bb60f875f047c0b849496b13a82be5a))
* **ci:** ignore short SHAs in release-please changelog for typos ([#339](https://github.com/hrzlgnm/zux/issues/339)) ([232948f](https://github.com/hrzlgnm/zux/commit/232948f143b358ec7e073b07c87cfe9b6894a81f))
* **ci:** relock Cargo.lock on Release PR, drop build-time version sync ([#351](https://github.com/hrzlgnm/zux/issues/351)) ([d839219](https://github.com/hrzlgnm/zux/commit/d8392196f11b19ba4362f8ce602726d60dac6dd4))
* **ci:** restore checkout credentials in update-changelog workflow ([#334](https://github.com/hrzlgnm/zux/issues/334)) ([d182a93](https://github.com/hrzlgnm/zux/commit/d182a939d78672047c7084c05d0f1344e324fe3f))
* **ci:** run release-please with a PAT instead of GITHUB_TOKEN ([#341](https://github.com/hrzlgnm/zux/issues/341)) ([1964646](https://github.com/hrzlgnm/zux/commit/1964646776774846af5fa127f2a52db6939ed8e4))
* **ci:** set include-component-in-tag false for release-please ([#340](https://github.com/hrzlgnm/zux/issues/340)) ([fa14916](https://github.com/hrzlgnm/zux/commit/fa14916a9beda22f73145c53dca226b4a9b0c74b))
* **ci:** sign Cargo.lock sync commit via Contents API ([#353](https://github.com/hrzlgnm/zux/issues/353)) ([0b7be3d](https://github.com/hrzlgnm/zux/commit/0b7be3dd5dac14484b9cdabdb19cf2d34564db5b))
* **ci:** stream Contents API body from file in Cargo.lock sync ([#354](https://github.com/hrzlgnm/zux/issues/354)) ([17f9dfb](https://github.com/hrzlgnm/zux/commit/17f9dfbacbd3de8146d9638ce7b837fc66a46a85))

## [Unreleased] [compare](https://github.com/hrzlgnm/zux/compare/v1.13.0...HEAD)

### Dependencies

- *(deps)* Update dependency cargo-nextest to v0.9.144 ([#311](https://github.com/hrzlgnm/zux/pull/311))

### Fixed

- *(aur)* Require verified host keys before writing known_hosts ([#310](https://github.com/hrzlgnm/zux/pull/310))

- *(aur)* Allow republishing via workflow dispatch tag input ([#312](https://github.com/hrzlgnm/zux/pull/312))

### Maintenance

- *(ci)* Pin sccache binary and drop idle sccache from clippy ([#308](https://github.com/hrzlgnm/zux/pull/308))

- *(ci)* Let renovate track the pinned sccache binary ([#309](https://github.com/hrzlgnm/zux/pull/309))

## [1.13.0] - 2026-09-10 [compare](https://github.com/hrzlgnm/zux/compare/v1.12.4...v1.13.0)

### Added

- *(docker)* Add zux-arch-aur-builder image and use reusable docker workflow ([#288](https://github.com/hrzlgnm/zux/pull/288))

- Use the android-update JS bindings ([#302](https://github.com/hrzlgnm/zux/pull/302))

### Dependencies

- *(deps)* Update docker/setup-buildx-action action to v4 ([#289](https://github.com/hrzlgnm/zux/pull/289))

- *(deps)* Update hrzlgnm/actions action to v2.8.3 ([#290](https://github.com/hrzlgnm/zux/pull/290))

- *(deps)* Update hrzlgnm/actions action to v2.8.4 ([#293](https://github.com/hrzlgnm/zux/pull/293))

- *(deps)* Update archlinux:base-devel docker digest to 61f7de2 ([#295](https://github.com/hrzlgnm/zux/pull/295))

- *(deps)* Update hrzlgnm/actions action to v2.9.0 ([#296](https://github.com/hrzlgnm/zux/pull/296))

- *(deps)* Update ghcr.io/hrzlgnm/zux-arch-aur-builder:v1 docker digest to 6627095 ([#298](https://github.com/hrzlgnm/zux/pull/298))

- *(deps)* Update actions/setup-java digest to de7274f ([#299](https://github.com/hrzlgnm/zux/pull/299))

- *(deps)* Update dependency typescript-eslint to v8.70.0 ([#303](https://github.com/hrzlgnm/zux/pull/303))

- *(deps)* Update rust crate tauri-plugin-android-update to 0.2 ([#304](https://github.com/hrzlgnm/zux/pull/304))

### Fixed

- *(aur)* Retry downloads on transient failures ([#286](https://github.com/hrzlgnm/zux/pull/286))

- Order CI jobs after validation ([#305](https://github.com/hrzlgnm/zux/pull/305))

### Maintenance

- *(ci)* Add retry to download steps in other workflows ([#287](https://github.com/hrzlgnm/zux/pull/287))

- *(ci)* Clean ~/aur before clone so retries start fresh ([#292](https://github.com/hrzlgnm/zux/pull/292))

- *(ci)* Verify AUR SSH host key against published fingerprints ([#291](https://github.com/hrzlgnm/zux/pull/291))

- *(ci)* Use shared retry action from hrzlgnm/actions ([#294](https://github.com/hrzlgnm/zux/pull/294))

- *(ci)* Ensure grouping so main pushes are built sequentially ([#300](https://github.com/hrzlgnm/zux/pull/300))

- *(ci)* Run pnpm jobs after prettier to avoid cache warnings ([#306](https://github.com/hrzlgnm/zux/pull/306))

## [1.12.4] - 2026-09-08 [compare](https://github.com/hrzlgnm/zux/compare/v1.12.3...v1.12.4)

### Dependencies

- *(deps)* Update pnpm to v12.3.2 ([#276](https://github.com/hrzlgnm/zux/pull/276))

- *(deps)* Lock file maintenance ([#277](https://github.com/hrzlgnm/zux/pull/277))

- *(deps)* Update pnpm to v12.3.3 ([#279](https://github.com/hrzlgnm/zux/pull/279))

- *(deps)* Update pnpm to v12.3.4 ([#280](https://github.com/hrzlgnm/zux/pull/280))

- *(deps)* Update dependency eslint to v10.10.0 ([#281](https://github.com/hrzlgnm/zux/pull/281))

- *(deps)* Update dependency @playwright/test to v1.63.0 ([#282](https://github.com/hrzlgnm/zux/pull/282))

- *(deps)* Update rust crate mdns-sd to v0.21.3 ([#284](https://github.com/hrzlgnm/zux/pull/284))

- *(deps)* Lock file maintenance ([#285](https://github.com/hrzlgnm/zux/pull/285))

## [1.12.3] - 2026-09-06 [compare](https://github.com/hrzlgnm/zux/compare/v1.12.2...v1.12.3)

### Added

- Disable autocapitalization for text inputs ([#275](https://github.com/hrzlgnm/zux/pull/275))

### Dependencies

- *(deps)* Update pnpm to v12.3.1 ([#273](https://github.com/hrzlgnm/zux/pull/273))

## [1.12.2] - 2026-09-05 [compare](https://github.com/hrzlgnm/zux/compare/v1.12.1...v1.12.2)

### Dependencies

- *(deps)* Update dependency globals to v17.12.0 ([#269](https://github.com/hrzlgnm/zux/pull/269))

- *(deps)* Update pnpm to v12 ([#271](https://github.com/hrzlgnm/zux/pull/271))

- *(deps)* Update rust crate mdns-sd to v0.21.2 ([#272](https://github.com/hrzlgnm/zux/pull/272))

## [1.12.1] - 2026-09-03 [compare](https://github.com/hrzlgnm/zux/compare/v1.12.0...v1.12.1)

### Added

- Enable non-link-local IPv6 by default on Android ([#265](https://github.com/hrzlgnm/zux/pull/265))

### Changed

- Join doc and docs into docs ([#261](https://github.com/hrzlgnm/zux/pull/261))

- Make two-axis code review a mandatory gate ([#262](https://github.com/hrzlgnm/zux/pull/262))

### Dependencies

- *(deps)* Update dependency typescript-eslint to v8.69.0 ([#267](https://github.com/hrzlgnm/zux/pull/267))

- *(deps)* Update dtolnay/rust-toolchain digest to 6bed076 ([#266](https://github.com/hrzlgnm/zux/pull/266))

## [1.12.0] - 2026-09-02 [compare](https://github.com/hrzlgnm/zux/compare/v1.11.3...v1.12.0)

### Added

- Use overlay drawer for sidebar on mobile ([#259](https://github.com/hrzlgnm/zux/pull/259))

### Changed

- Document snap installation via zux-viz ([#256](https://github.com/hrzlgnm/zux/pull/256))

### Dependencies

- *(deps)* Update dependency git-cliff to v2.14.1 ([#254](https://github.com/hrzlgnm/zux/pull/254))

- *(deps)* Update pnpm to v11.25.0 ([#255](https://github.com/hrzlgnm/zux/pull/255))

- *(deps)* Update hrzlgnm/actions action to v2.8.2 ([#258](https://github.com/hrzlgnm/zux/pull/258))

### Fixed

- Disable auto-update check on mobile dev builds ([#260](https://github.com/hrzlgnm/zux/pull/260))

## [1.11.3] - 2026-09-01 [compare](https://github.com/hrzlgnm/zux/compare/v1.11.2...v1.11.3)

### Changed

- Ensure tests are finished before running cache tools ([#250](https://github.com/hrzlgnm/zux/pull/250))

### Dependencies

- *(deps)* Update archlinux:base-devel docker digest to 84cd9ef ([#251](https://github.com/hrzlgnm/zux/pull/251))

- *(deps)* Update dependency svelte to v5.57.0 ([#252](https://github.com/hrzlgnm/zux/pull/252))

### Maintenance

- *(ci)* Disable pnpm store cache on release to match sccache ([#247](https://github.com/hrzlgnm/zux/pull/247))

- *(ci)* Disable grype DB cache on release to match pnpm/sccache ([#248](https://github.com/hrzlgnm/zux/pull/248))

- *(ci)* Share rust cache and only save on main to cut ~65% size ([#249](https://github.com/hrzlgnm/zux/pull/249))

## [1.11.2] - 2026-08-31 [compare](https://github.com/hrzlgnm/zux/compare/v1.11.1...v1.11.2)

### Changed

- Skip update unreleased changelog when drafting a release ([#243](https://github.com/hrzlgnm/zux/pull/243))

### Dependencies

- *(deps)* Update rust crate tauri-plugin-log to v2.9.1 ([#240](https://github.com/hrzlgnm/zux/pull/240))

- *(deps)* Update rust crate tauri-plugin-dialog to v2.7.3 ([#239](https://github.com/hrzlgnm/zux/pull/239))

- *(deps)* Update rust crate tauri-plugin-updater to v2.11.0 ([#242](https://github.com/hrzlgnm/zux/pull/242))

- *(deps)* Update rust crate tauri-plugin-opener to v2.5.5 ([#241](https://github.com/hrzlgnm/zux/pull/241))

- *(deps)* Update tauri monorepo ([#245](https://github.com/hrzlgnm/zux/pull/245))

### Fixed

- *(renovate)* Align Tauri npm and Cargo updates ([#244](https://github.com/hrzlgnm/zux/pull/244))

- *(pnpm)* Exclude Tauri packages from minimumReleaseAge ([#246](https://github.com/hrzlgnm/zux/pull/246))

## [1.11.1] - 2026-08-31 [compare](https://github.com/hrzlgnm/zux/compare/v1.11.0...v1.11.1)

### Dependencies

- *(deps)* Lock file maintenance ([#236](https://github.com/hrzlgnm/zux/pull/236))

- *(deps)* Update rust crate mdns-sd to v0.21.1 ([#238](https://github.com/hrzlgnm/zux/pull/238))

## [1.11.0] - 2026-08-29 [compare](https://github.com/hrzlgnm/zux/compare/v1.10.0...v1.11.0)

### Added

- *(theme)* System theme, css var map and window sync ([#232](https://github.com/hrzlgnm/zux/pull/232))

- *(theme)* Add dracula, nord, tokyo-night and gruvbox presets ([#233](https://github.com/hrzlgnm/zux/pull/233))

### Dependencies

- *(deps)* Update anchore/scan-action action to v7.4.2 ([#228](https://github.com/hrzlgnm/zux/pull/228))

- *(deps)* Update pnpm/setup action to v2.1.0 ([#230](https://github.com/hrzlgnm/zux/pull/230))

- *(deps)* Update hrzlgnm/actions action to v2.8.1 ([#229](https://github.com/hrzlgnm/zux/pull/229))

## [1.10.0] - 2026-08-28 [compare](https://github.com/hrzlgnm/zux/compare/v1.9.2...v1.10.0)

### Added

- Add theming support with 8 theme presets ([#227](https://github.com/hrzlgnm/zux/pull/227))

### Dependencies

- *(deps)* Update anchore/scan-action action to v7.4.1 ([#222](https://github.com/hrzlgnm/zux/pull/222))

- *(deps)* Update hrzlgnm/actions action to v2.7.0 ([#223](https://github.com/hrzlgnm/zux/pull/223))

- *(deps)* Update mikepenz/action-junit-report digest to a9170d5 ([#225](https://github.com/hrzlgnm/zux/pull/225))

- *(deps)* Update hrzlgnm/actions action to v2.8.0 ([#226](https://github.com/hrzlgnm/zux/pull/226))

## [1.9.2] - 2026-08-27 [compare](https://github.com/hrzlgnm/zux/compare/v1.9.1...v1.9.2)

### Changed

- Streamline agent conventions ([#216](https://github.com/hrzlgnm/zux/pull/216))

### Dependencies

- *(deps)* Update pnpm to v11.24.0 ([#218](https://github.com/hrzlgnm/zux/pull/218))

- *(deps)* Update dependency typescript-eslint to v8.68.0 ([#220](https://github.com/hrzlgnm/zux/pull/220))

- *(deps)* Update dependency eslint to v10.9.1 ([#219](https://github.com/hrzlgnm/zux/pull/219))

### Fixed

- Eliminate benign cache-collision CI annotations ([#214](https://github.com/hrzlgnm/zux/pull/214))

- Drop dead grype DB warm and broken cache-tools concurrency ([#215](https://github.com/hrzlgnm/zux/pull/215))

- Align SPDX identifiers with MIT LICENSE ([#221](https://github.com/hrzlgnm/zux/pull/221))

## [1.9.1] - 2026-08-26 [compare](https://github.com/hrzlgnm/zux/compare/v1.9.0...v1.9.1)

### Fixed

- Reduce frontend log noise, stop logging incoming tauri events ([#213](https://github.com/hrzlgnm/zux/pull/213))

## [1.9.0] - 2026-08-26 [compare](https://github.com/hrzlgnm/zux/compare/v1.8.0...v1.9.0)

### Added

- Persist physics config across restarts ([#211](https://github.com/hrzlgnm/zux/pull/211))

### Changed

- Add playwright e2e for SVG export ([#207](https://github.com/hrzlgnm/zux/pull/207))

### Dependencies

- *(deps)* Update pnpm to v11.23.0 ([#208](https://github.com/hrzlgnm/zux/pull/208))

- *(deps)* Update actions/upload-artifact digest to ea165f8 ([#209](https://github.com/hrzlgnm/zux/pull/209))

- *(deps)* Update actions/upload-artifact action to v7 ([#210](https://github.com/hrzlgnm/zux/pull/210))

## [1.8.0] - 2026-08-26 [compare](https://github.com/hrzlgnm/zux/compare/v1.7.1...v1.8.0)

### Added

- Gzip the SBOM workflow artifacts on publish ([#201](https://github.com/hrzlgnm/zux/pull/201))

- Trigger snap release after a release is published ([#202](https://github.com/hrzlgnm/zux/pull/202))

- Enable devtools in release builds ([#206](https://github.com/hrzlgnm/zux/pull/206))

### Fixed

- Use vis-network internals instead of broken DataSet API for SVG export ([#205](https://github.com/hrzlgnm/zux/pull/205))

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
