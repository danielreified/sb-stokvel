# Changelog

## [0.2.1](https://github.com/danielreified/sb-stokvel/compare/stokvel-app-v0.2.0...stokvel-app-v0.2.1) (2026-05-09)


### Features

* **app:** port remaining panels + RouteErrorPanel + idle-lock ([d0b5e0a](https://github.com/danielreified/sb-stokvel/commit/d0b5e0a0d7e6244aeeb6c84c2b35f7d45167ffe6))
* **app:** scaffold Vite PWA shell ([d088fea](https://github.com/danielreified/sb-stokvel/commit/d088fead6469497b56a12ba2db1cc656c736210f))
* **app:** SW update prompt, version guard + ForcedUpdateGate ([c662b33](https://github.com/danielreified/sb-stokvel/commit/c662b3371455c78951dadfec179137aae4c866c9))
* **auth:** login form + signOut ([60f743d](https://github.com/danielreified/sb-stokvel/commit/60f743db8c5f9d4fba56ce4774fd1a1ecec24cc1))
* bottom nav, contributions routing fix ([c5d78e8](https://github.com/danielreified/sb-stokvel/commit/c5d78e86465853879c24cc67e265e3c31627a5d3))
* **contributions:** history list with typed search params ([a55e532](https://github.com/danielreified/sb-stokvel/commit/a55e532fec87cdf0642417d32a147448b0ee4527))
* **contributions:** make contribution form (Network Only) ([cde1070](https://github.com/danielreified/sb-stokvel/commit/cde107085cb398dad83a90249476380543daa4df))
* **crypto:** PIN-wrapped session key + glass-overlay lock ([1dabbe1](https://github.com/danielreified/sb-stokvel/commit/1dabbe1f6c62112f764976b8658609507f094180))
* **dashboard:** port to storybook design ([3f5f3b6](https://github.com/danielreified/sb-stokvel/commit/3f5f3b66f074820541618ebaaf3c6e2c389a3652))
* **dashboard:** stokvel overview with balance, target, member count ([7487512](https://github.com/danielreified/sb-stokvel/commit/748751265dc8c9394bff2fe60f69cc6b1eda9d6c))
* **dev:** add React Query + Router devtools (DEV-only, lazy-loaded) ([4c37de8](https://github.com/danielreified/sb-stokvel/commit/4c37de8939482aa524370adcf75adca2548d42b3))
* **i18n:** English / isiZulu / Afrikaans, plus refactor pass ([7ae78fc](https://github.com/danielreified/sb-stokvel/commit/7ae78fc79170b0e476fe6103ec888bb7904e6cf5))
* **members:** members list with phone + joined date ([b149431](https://github.com/danielreified/sb-stokvel/commit/b1494318e4eb0441762a8a65cb5a18a07466661d))
* **persistence:** per-record encrypted IDB cache + cold-start unwrap ([35ac54d](https://github.com/danielreified/sb-stokvel/commit/35ac54db9b13f4ed1bbaeff89c04739644c8cba0))
* port marketing chrome + AppWindow to real app ([07d354c](https://github.com/danielreified/sb-stokvel/commit/07d354c307f09b85569ddd4dd2148ad1213277cb))
* **profile:** profile page, install prompt banner, offline indicator ([feb53dd](https://github.com/danielreified/sb-stokvel/commit/feb53dddfcf1fbb421cdbc041cb95a0327015a2c))
* **pwa:** cross-subdomain api wiring + deploy script ([021bc1b](https://github.com/danielreified/sb-stokvel/commit/021bc1bd4c9398ff167200d3c82ffb61ff49d373))
* **pwa:** enable service worker and manifest in dev mode ([2a2bb26](https://github.com/danielreified/sb-stokvel/commit/2a2bb26ff4d92c07455e6ee7c277d644e8c79cdb))
* **pwa:** install button on login page ([6bdd6e8](https://github.com/danielreified/sb-stokvel/commit/6bdd6e81532442038d3aa0a13fb10a1ec1e80672))
* **pwa:** polished install card on login page ([74cc86c](https://github.com/danielreified/sb-stokvel/commit/74cc86cce28a9464c755c9dc0c53627d8e6dc317))
* **router:** wire TanStack Router with auth context ([9b4a957](https://github.com/danielreified/sb-stokvel/commit/9b4a9572a2ae93603e523469870bccffeca61921))
* **test:** playwright e2e across chrome + safari × desktop + mobile ([a6bdd24](https://github.com/danielreified/sb-stokvel/commit/a6bdd249806d9cc8d727423321c2c8f80b52433b))


### Bug Fixes

* auth redirect loop, login navigation, contributions cache bug ([325315a](https://github.com/danielreified/sb-stokvel/commit/325315aea86c4032ef5c9193df79dbd99c3e4fd5))
* **pwa:** button always visible + capture beforeinstallprompt at module load ([46e5683](https://github.com/danielreified/sb-stokvel/commit/46e56833472d25c258388c5a6e9a02952119e3b0))
* **pwa:** fill the viewport when rendered as standalone ([9c6b744](https://github.com/danielreified/sb-stokvel/commit/9c6b744d3b4f531d098b6e9c3183b65fa9bc6164))
* **pwa:** online status + working install button ([9ae88bd](https://github.com/danielreified/sb-stokvel/commit/9ae88bdc5be94174f09ad92fc002d7356044029b))
* **security:** exclude me query from dehydration, add to sensitive keys ([7c42400](https://github.com/danielreified/sb-stokvel/commit/7c42400e8a4af58c83fa7bda9afb7159cf175646))
* **security:** preflight short-circuit + external SW register script ([ed79c0a](https://github.com/danielreified/sb-stokvel/commit/ed79c0a92e211575a68c65a4adcb64ac32249223))
* **ui:** add shadcn CSS variables and Tailwind color mappings ([195c99e](https://github.com/danielreified/sb-stokvel/commit/195c99eacc05c9dc0b4b52d70cd021909d6eefff))
