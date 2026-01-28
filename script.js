// Replace this with your WhatsApp number in international format (no +, no dashes).
// Example: for +1 555-123-4567 use "15551234567"
const WHATSAPP_NUMBER = "7338115444";

const servicesData = [
  { id: 's1', title: 'Wash & Fold (per kg)', price: '₹79/kg', notes: 'Gentle wash, folded' },
  { id: 's2', title: 'Dry Cleaning (per item)', price: '₹139/item', notes: 'Delicate care' },
  { id: 's3', title: 'Ironing (per item)', price: '₹25/item', notes: 'Steam press' },
  { id: 's4', title: 'Stain Removal', price: '₹80/item', notes: 'Tough stain treatment' },
  { id: 's5', title: 'Bedsheet Service', price: '300/set', notes: 'Deep clean' },
  { id: 's6', title: 'Express Service', price: 'Extra 50%', notes: '24-hour turnaround' },
  { id: 's7', title: 'Dry Clean Silk Sarees', price: '268/item', notes: 'Deep clean' },
];

const CART_STORAGE_KEY = 'vibrantlaundry_cart';
const state = {
  cart: []
};

/* DOM refs */
const servicesContainer = document.getElementById('services-container');
const cartBtn = document.getElementById('cart-btn');
const cartCount = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const cartList = document.getElementById('cart-list');
const closeCartBtn = document.getElementById('close-cart');
const clearCartBtn = document.getElementById('clear-cart');
const sendWhatsAppBtn = document.getElementById('send-whatsapp');
const heroWhatsApp = document.getElementById('hero-whatsapp');
const contactPhone = document.getElementById('contact-phone');
const yearSpan = document.getElementById('year');
const nav = document.querySelector('.nav');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = Array.from(document.querySelectorAll('.nav a'));
const floatingWasher = document.querySelector('.floating-washer');
const navCloseOnOutside = (e) => {
  if (!nav || !menuToggle) return;
  if (!nav.classList.contains('open')) return;
  const clickedInsideMenu = nav.contains(e.target) || menuToggle.contains(e.target);
  if (!clickedInsideMenu) {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
};
const navSectionLinks = navLinks.filter(link => {
  const href = link.getAttribute('href');
  return href && href.startsWith('#');
});
const sectionTargets = navSectionLinks
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}
if (contactPhone) {
  contactPhone.textContent = WHATSAPP_NUMBER === "REPLACE_WITH_PHONE_NUMBER" ? "Replace with business number" : `+${WHATSAPP_NUMBER}`;
}

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return;
    const ids = JSON.parse(raw);
    if (!Array.isArray(ids)) return;
    state.cart = ids
      .map(id => servicesData.find(s => s.id === id))
      .filter(Boolean);
  } catch {
    state.cart = [];
  }
}

function saveCart() {
  const ids = state.cart.map(item => item.id);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(ids));
}

/* Render services */
function renderServices() {
  if (!servicesContainer) return;
  servicesContainer.innerHTML = '';
  servicesData.forEach(s => {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
      <div class="service-meta">
        <div class="service-title">${s.title}</div>
        <div class="service-price">${s.price} • <span class="muted">${s.notes}</span></div>
      </div>
      <div class="service-actions">
        <button class="btn btn-accent" data-add="${s.id}">Add</button>
      </div>
    `;
    servicesContainer.appendChild(card);
  });

  servicesContainer.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-add');
      addToCart(id);
    });
  });
}

/* Cart logic */
function addToCart(id) {
  const svc = servicesData.find(s => s.id === id);
  if (!svc) return;
  state.cart.push(svc);
  updateCartUI();
  saveCart();
  openCart();
}

function removeFromCart(index) {
  state.cart.splice(index, 1);
  updateCartUI();
  saveCart();
}

function clearCart() {
  state.cart = [];
  updateCartUI();
  saveCart();
}

function updateCartUI() {
  if (!cartCount || !cartList) return;
  cartCount.textContent = state.cart.length;
  cartList.innerHTML = '';
  if (state.cart.length === 0) {
    cartList.innerHTML = '<p class="empty muted">No services added yet.</p>';
    return;
  }

  state.cart.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div>
        <div style="font-weight:600">${item.title}</div>
        <div class="muted" style="font-size:0.95rem">${item.price}</div>
      </div>
      <div>
        <button class="remove muted" data-remove="${idx}" title="Remove">✕</button>
      </div>
    `;
    cartList.appendChild(el);
  });

  cartList.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = Number(e.currentTarget.getAttribute('data-remove'));
      removeFromCart(idx);
    });
  });
}

/* Modal open/close */
function openCart() {
  if (!cartModal) return;
  cartModal.setAttribute('aria-hidden', 'false');
}
function closeCart() {
  if (!cartModal) return;
  cartModal.setAttribute('aria-hidden', 'true');
}

/* Build WhatsApp message & open */
function sendToWhatsApp() {
  if (WHATSAPP_NUMBER === "REPLACE_WITH_PHONE_NUMBER") {
    alert('Please set your WhatsApp number in script.js (WHATSAPP_NUMBER) before sending.');
    return;
  }
  if (state.cart.length === 0) {
    alert('No services selected. Add services before sending.');
    return;
  }

  const lines = [];
  lines.push('New order for Vibrant Laundry and Dry Cleaning');
  lines.push('');
  lines.push('Items:');
  state.cart.forEach((it, i) => {
    lines.push(`${i+1}. ${it.title} — ${it.price}`);
  });
  lines.push('');
  lines.push('Pickup address:'); // user can fill in
  lines.push('Preferred time:');
  lines.push('');
  lines.push('Please confirm pickup & price.');
  const message = encodeURIComponent(lines.join('\n'));
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  window.open(url, '_blank');
}

/* wire up */
loadCart();
renderServices();
updateCartUI();

if (cartBtn) cartBtn.addEventListener('click', openCart);
if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
if (clearCartBtn) {
  clearCartBtn.addEventListener('click', () => {
    if (confirm('Clear all selected services?')) clearCart();
  });
}
if (sendWhatsAppBtn) sendWhatsAppBtn.addEventListener('click', sendToWhatsApp);
if (heroWhatsApp) {
  heroWhatsApp.addEventListener('click', () => {
    // quick contact if user hasn't selected services
    if (WHATSAPP_NUMBER === "REPLACE_WITH_PHONE_NUMBER") {
      alert('Please set your WhatsApp number in script.js (WHATSAPP_NUMBER).');
      return;
    }
    const txt = encodeURIComponent('Hello Vibrant Laundry! I would like to enquire about your services.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${txt}`, '_blank');
  });
}

/* close when clicking outside panel */
if (cartModal) {
  cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) closeCart();
  });
}

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('open')) {
        nav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('click', navCloseOnOutside);
}

function updateFloatingWasher() {
  if (!floatingWasher) return;
  const shouldShow = window.scrollY > 120;
  floatingWasher.classList.toggle('show', shouldShow);
}

updateFloatingWasher();
window.addEventListener('scroll', updateFloatingWasher, { passive: true });

/* highlight current section in nav */
function updateActiveNav() {
  if (sectionTargets.length === 0 || navSectionLinks.length === 0) return;
  let activeIndex = 0;
  sectionTargets.forEach((section, idx) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 120 && rect.bottom > 120) {
      activeIndex = idx;
    }
  });
  navSectionLinks.forEach((link, idx) => {
    link.classList.toggle('active', idx === activeIndex);
  });
}

updateActiveNav();
window.addEventListener('scroll', updateActiveNav, { passive: true });
window.addEventListener('resize', updateActiveNav);