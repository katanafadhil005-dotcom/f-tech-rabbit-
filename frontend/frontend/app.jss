// ============================================
// F TECH RABBIT — Frontend Logic
// ============================================
const API = 'http://localhost:3000/api';

let cart = JSON.parse(localStorage.getItem('ftech_cart')) || [];

// ---- On page load ----
document.addEventListener('DOMContentLoaded', () => {
  loadFarmInfo();
  loadProducts();
  renderCart();
});

// ---- 1. Farm info banner ----
async function loadFarmInfo() {
  const res = await fetch(`${API}/farm`);
  const farm = await res.json();
  document.getElementById('tagline').textContent = farm.tagline;
}

// ---- 2. Products ----
async function loadProducts() {
  const res = await fetch(`${API}/products`);
  const products = await res.json();
  const list = document.getElementById('product-list');

  list.innerHTML = products.map(p => `
    <div class="card">
      <img src="${p.image}" alt="${p.name}">
      <div class="card-body">
        <span class="category">${p.category}</span>
        <h3>${p.name}</h3>
        <p class="desc">${p.description}</p>
        <p class="price">KES ${p.price.toLocaleString()}</p>
        <button class="add-btn" onclick="addToCart(${p.id}, '${p.name}', ${p.price})">
          Add to Cart
        </button>
      </div>
    </div>
  `).join('');
}

// ---- 3. Cart ----
function addToCart(id, name, price) {
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty++;
  else cart.push({ id, name, price, qty: 1 });

  saveCart();
  renderCart();
  showToast(`${name} added to cart 🐇`);
}

function saveCart() {
  localStorage.setItem('ftech_cart', JSON.stringify(cart));
}

function renderCart() {
  const itemsEl = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const countEl = document.getElementById('cart-count');

  if (cart.length === 0) {
    itemsEl.innerHTML = '<li><em>Cart is empty</em></li>';
    totalEl.textContent = '0';
    countEl.textContent = '0';
    return;
  }

  let total = 0, count = 0;
  itemsEl.innerHTML = cart.map(item => {
    total += item.price * item.qty;
    count += item.qty;
    return `<li><span>${item.name} × ${item.qty}</span><span>KES ${(item.price*item.qty).toLocaleString()}</span></li>`;
  }).join('');

  totalEl.textContent = total.toLocaleString();
  countEl.textContent = count;
}

// ---- 4. Checkout ----
document.getElementById('checkout-btn').addEventListener('click', async () => {
  const name  = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  const statusEl = document.getElementById('order-status');

  if (cart.length === 0) { statusEl.textContent = "Cart is empty!"; return; }
  if (!name || !phone) { statusEl.textContent = "Please enter name and phone."; return; }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  try {
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName: name, phone, items: cart, total })
    });
    const data = await res.json();

    if (res.ok) {
      statusEl.textContent = `✅ ${data.message} (Order #${data.orderId})`;
      cart = [];
      saveCart();
      renderCart();
      document.getElementById('customer-name').value = '';
      document.getElementById('customer-phone').value = '';
    } else {
      statusEl.textContent = `⚠️ ${data.error}`;
    }
  } catch (err) {
    statusEl.textContent = "⚠️ Could not reach server.";
  }
});

// ---- 5. UI helpers ----
document.getElementById('cart-btn').addEventListener('click', () => {
  document.getElementById('cart-panel').classList.toggle('hidden');
});

function showToast(msg) {
  const toast = document.createElement('div');
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: 'fixed', bottom: '20px', left: '50%',
    transform: 'translateX(-50%)', background: '#2e7d32',
    color: 'white', padding: '10px 20px', borderRadius: '30px',
    fontSize: '0.9rem', zIndex: 999
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}