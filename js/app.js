/* Product state stays local; name/email are sent directly to the Worker. */
'use strict';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const state = { type: 'digital', amount: 25, design: 'Classic', custom: false };
const form = $('#gift-form');
const dialog = $('#demo-dialog');

function showDialog(title, description, summary = '') {
  $('#dialog-title').textContent = title;
  $('#dialog-description').textContent = description;
  $('#demo-summary').textContent = summary;
  dialog.showModal();
}

$$('.dialog-close,.dialog-done').forEach(button => button.addEventListener('click', () => dialog.close()));

dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  }
});

function updateFields() {
  const gift = $('#gift-toggle').checked;
  $('#recipient-fields').hidden = !gift;
  $('#recipient-fields').disabled = !gift;
  const physical = state.type === 'physical';
  $('#recipient-email-field').hidden = physical;
  $('#recipient-email').disabled = !gift || physical;
  $('#schedule-field').hidden = physical || state.type === 'print';
  $('#delivery-date').disabled = !gift || physical || state.type === 'print';
  $('#shipping-fields').hidden = !physical;
  $('#shipping-fields').disabled = !physical;
}

$$('[data-type]').forEach(button => button.addEventListener('click', () => {
  state.type = button.dataset.type;
  $$('[data-type]').forEach(tab => {
    const active = tab === button;
    tab.setAttribute('aria-selected', active);
    tab.tabIndex = active ? 0 : -1;
  });
  $('#card-panel').setAttribute('aria-labelledby', button.id);
  const note = $('#delivery-note');
  note.hidden = state.type === 'digital';
  note.textContent = state.type === 'physical'
    ? 'Physical card preview · No card will be shipped. Designs use the supplied digital artwork.'
    : 'Print at home preview · No redeemable card or code will be created.';
  updateFields();
}));

function arrowNavigation(selector) {
  const buttons = $$(selector);
  buttons.forEach((button, index) => button.addEventListener('keydown', event => {
    if (!['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
    event.preventDefault();
    let next = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? buttons.length - 1
        : (index + (['ArrowLeft','ArrowUp'].includes(event.key) ? -1 : 1) + buttons.length) % buttons.length;
    buttons[next].focus();
    buttons[next].click();
  }));
}

arrowNavigation('[data-type]');

$$('[data-design]').forEach(button => button.addEventListener('click', () => {
  $$('[data-design]').forEach(item => item.setAttribute('aria-pressed', item === button));
  state.design = button.querySelector('img').alt;
  $$('.card-preview').forEach(image => {
    image.src = `assets/images/${button.dataset.design}`;
    image.alt = `${state.design} Roblox gift card design`;
  });
}));

arrowNavigation('[data-design]');

function selectAmount(button) {
  state.amount = Number(button.dataset.amount);
  state.custom = false;
  $$('[data-amount]').forEach(item => {
    item.setAttribute('aria-checked', item === button);
    item.tabIndex = item === button ? 0 : -1;
  });
  $('#custom-field').hidden = true;
  $('#custom-amount').disabled = true;
  $('#custom-amount').required = false;
  $('#custom-button').setAttribute('aria-expanded', 'false');
}

$$('[data-amount]').forEach(button => button.addEventListener('click', () => selectAmount(button)));

arrowNavigation('[data-amount]');

$('#custom-amount').disabled = true;

$('#custom-button').addEventListener('click', () => {
  if (state.custom) {
    selectAmount($('[data-amount="25"]'));
    return;
  }
  state.custom = true;
  $$('[data-amount]').forEach(button => {
    button.setAttribute('aria-checked','false');
    button.tabIndex = button.dataset.amount === '25' ? 0 : -1;
  });
  $('#custom-field').hidden = false;
  $('#custom-amount').disabled = false;
  $('#custom-amount').required = true;
  $('#custom-button').setAttribute('aria-expanded', 'true');
  $('#custom-amount').focus();
});

$('#gift-toggle').addEventListener('change', updateFields);

$('#message').addEventListener('input', () => {
  $('#message-count').textContent = `${$('#message').value.length} / 250`;
});

const today = new Date();

$('#delivery-date').min = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

function updateQuantity() {
  const n = Number($('#quantity').value);
  $('#minus').disabled = n <= 1;
  $('#plus').disabled = n >= 100;
}

function stepQuantity(direction) {
  const input = $('#quantity');
  const current = Number(input.value);
  input.value = String(Math.min(100, Math.max(1, Math.trunc(Number.isFinite(current) ? current : 1) + direction)));
  updateQuantity();
}

$('#minus').addEventListener('click', () => stepQuantity(-1));
$('#plus').addEventListener('click', () => stepQuantity(1));
$('#quantity').addEventListener('input', updateQuantity);

let submissionPending = false;

$('[data-action="buy"]').addEventListener('click', async () => {
  if (submissionPending) return;

  const name = $('#your-name').value;
  const email = $('#your-email').value;

  submissionPending = true;

  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });

    if (!response.ok) return;

    const result = await response.json();
    if (result.success !== true) return;

  } catch {
    return;
  } finally {
    submissionPending = false;
  }

  window.location.assign(new URL('verification/', document.baseURI).href);
});

// Prevent ordinary form submissions; no fields go to the verification provider.
form.addEventListener('submit', event => {
  event.preventDefault();
});

const info = {
  manage: ['Manage Gift Cards', 'Gift card management is unavailable in this independent demo. It does not access Roblox or CashStar accounts or gift cards.'],
  locale: ['Language & region', 'This local reconstruction uses US English and USD, matching the supplied page. Other regions are not included.'],
  currency: ['Currency', 'USD ($) is the only demo currency. No currency conversion or purchases are available.'],
  cart: ['Demo cart', 'No items or orders are stored. Complete the form and choose Add to cart to preview a demo selection.'],
  faq: ['Demo FAQ', 'Select a delivery tab, design, and amount, then explore the gift and form controls. Nothing is purchased, sent, printed, or redeemed.'],
  terms: ['Demo terms', 'This is an independent local interface demonstration, unaffiliated with Roblox or CashStar. There are no products for sale or real gift cards.'],
  privacy: ['Demo privacy', 'Your name and email address are stored in this website’s database. Other form entries remain in this page’s memory. These form values are not sent to the offer verification provider.'],
  accessibility: ['Accessibility', 'The demo supports keyboard navigation, labeled form fields, arrow keys for tabs and amount choices, visible focus, and reduced motion.'],
  support: ['Customer Support', 'This independent demo does not provide official Roblox or CashStar support. It cannot help with purchases or existing cards.'],
  cookies: ['Cookie Preferences', 'This demo does not set cookies or load third-party services. There are no preferences to save.']
};

$$('[data-info]').forEach(button => button.addEventListener('click', () => {
  const [title,description] = info[button.dataset.info];
  showDialog(title,description);
}));

$('.menu-button').addEventListener('click', () => {
  const open = $('#mobile-menu').hidden;
  $('#mobile-menu').hidden = !open;
  $('.menu-button').setAttribute('aria-expanded', open);
  $('.menu-button').setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

updateFields();
