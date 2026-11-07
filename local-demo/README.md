# Independent gift card frontend demo

The product page runs without a backend or installation. Use HTTP/HTTPS to test navigation and the externally hosted verification widget.

For HTTP preview, run `npm start` from this folder, then open http://127.0.0.1:4173. Stop with Ctrl+C.

This independent recreation is not affiliated with Roblox or CashStar. Checkout, payments, gift card management, delivery, printing, and issuance are unavailable. Product form entries are not submitted, saved, or passed to the verification page. The third-party offer widget makes its own network requests and may process connection information.

## Project

- `index.html`: semantic, accessible local page.
- `css/styles.css`: recovered layout dimensions, colors, responsive rules, and local component styling.
- `js/app.js`: product controls and relative Buy Now navigation.
- `verification/index.html`: white third-party offer verification page.
- `css/verification.css`, `js/verification.js`: isolated verification styling, illustrative metadata, and removal of the provider's injected Google-style branding.
- `assets/images/`: byte-identical copies of all five supplied PNGs.
- `docs/`: source inventory, original stylesheet reference, and reconstruction notes.

The six price choices and $25 default match the saved page. Custom amounts use demo-only $10–$500 limits. Quantity is 1–100. Physical and print tabs reuse the supplied artwork because alternate delivery-specific artwork was not downloaded.

The source font stylesheet references Builder Sans font files that were not included. The product page uses Helvetica/Arial, the source's fallback. Its content security policy blocks connections and form submissions. The separate verification document does not inherit that policy, allowing the requested external provider script and its dependencies to load normally.

## GitHub Pages

Publish the **contents of `local-demo/`** as the root of the Pages artifact. No build step is required. Both `/` and `/repository-name/` hosting work: Buy Now resolves `verification/` relative to the product document, and verification assets use `../css/` and `../js/`. The verification page also opens directly at `verification/` or `verification/index.html`.

## Provider integration

The verification page contains exactly one `<div data-captcha-enable="true"></div>` and loads `https://apptrck.net/cp/js/ymm2y` exactly once, immediately before `</body>`. The supplied widget rendered locally during verification. There is no custom checkbox, simulated verification result, unlock callback, checkout, or gift-card issuance.

The current provider script injects a Google-style icon and Google policy links. The local verification script removes only that branding block from the provider container; it preserves the provider controls and event handlers. The page explicitly identifies third-party promotional offers and disclaims Roblox/Google security-check requirements.

The displayed IP is randomly selected from documentation-only address ranges, without a lookup. The URL is an illustrative `example.com` value, and the timestamp is generated locally.

Live offer completion and production domain eligibility were not tested. The provider configuration currently calls `og_converted()` on completion; this project deliberately does not supply an unlock or success callback. Configure any required production domain and post-completion action in the provider account. No domain-registration requirement was observed merely loading the widget locally.

Run `npm run check` for JavaScript syntax checks.
