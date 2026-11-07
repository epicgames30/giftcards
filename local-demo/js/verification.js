'use strict';

// The configured provider currently injects a Google-style icon and Google
// policy links. Remove only that branding; retain its own controls and handlers.
const widget = document.querySelector('[data-captcha-enable="true"]');
function removeProviderBranding() {
  widget.querySelectorAll('.info-text').forEach(element => element.remove());
}
const brandingObserver = new MutationObserver(removeProviderBranding);
brandingObserver.observe(widget, { childList: true, subtree: true });
removeProviderBranding();

// Use documentation-only address ranges, so the display cannot identify a visitor.
// No IP lookup, product-form values, verification callbacks, or unlock responses.
const random = new Uint32Array(2);
crypto.getRandomValues(random);
const ranges = ['192.0.2', '198.51.100', '203.0.113'];
document.getElementById('illustrative-ip').textContent =
  `${ranges[random[0] % ranges.length]}.${1 + random[1] % 254}`;

const timestamp = new Date().toISOString();
const time = document.getElementById('illustrative-time');
time.dateTime = timestamp;
time.textContent = timestamp;
