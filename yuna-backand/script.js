// ✅ فتح وغلق نافذة دخول الأدمن
function openAdminModal() {
  document.getElementById('admin-modal').style.display = 'flex';
}
function closeAdminModal() {
  document.getElementById('admin-modal').style.display = 'none';
}

// ✅ التحقق من كود الأدمن
async function validateAdminCode() {
  const code = document.getElementById('admin-code-input').value.trim();
  const errorMsg = document.getElementById('admin-error-msg');

  if (!code) {
    errorMsg.textContent = "يرجى إدخال الكود.";
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      window.location.href = 'admin.html';
    } else {
      errorMsg.textContent = result.message || '❌ رمز غير صحيح';
    }
  } catch (e) {
    console.error("خطأ:", e);
    errorMsg.textContent = '⚠️ خطأ في الاتصال بالخادم';
  }
}

// ✅ عرض عدد المنتجات في السلة
const productListEl = document.getElementById('product-list');
const cartCountEl = document.getElementById('cart-count');

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = JSON.parse(localStorage.getItem('products')) || [];

function sanitize(str) {
  return str.replace(/[&<>"']/g, match => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[match]);
}

function updateCartCount() {
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  cartCountEl.textContent = totalQuantity;
}
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

// ✅ عرض المنتجات
function renderProducts() {
  productListEl.innerHTML = '';
  if (products.length === 0) {
    productListEl.innerHTML = `<p>لا توجد منتجات حالياً.</p>`;
    return;
  }

  products.forEach((product) => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';

    const safeName = sanitize(product.name);
    const safePrice = sanitize(product.price.toString());
    const safeImage = sanitize(product.image);

    productCard.innerHTML = `
      <img src="${safeImage}" alt="${safeName}" class="product-image" style="cursor: pointer;" />
      <h3 class="product-name" style="cursor: pointer;">${safeName}</h3>
      <p>${safePrice} درهم</p>
      <button class="add-to-cart-btn" onclick="addToCart(${product.id})">إضافة إلى السلة</button>
    `;

    productCard.querySelector('.product-image').addEventListener('click', () => openProductModal(product));
    productCard.querySelector('.product-name').addEventListener('click', () => openProductModal(product));

    productListEl.appendChild(productCard);
  });
}

function addToCart(productId) {
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  saveCart();
  showToast('✅ تمت إضافة المنتج للسلة');
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px;
    background: #2ecc71; color: white;
    padding: 10px 20px; border-radius: 8px;
    font-weight: bold; z-index: 9999;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    transition: opacity 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 1500);
}

function openProductModal(product) {
  const modal = document.createElement('div');
  modal.className = 'product-modal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex; justify-content: center;
    align-items: center; z-index: 10000; padding: 15px;
  `;
  const safeImage = sanitize(product.image);
  const safeName = sanitize(product.name);
  const safeDescription = sanitize(product.description);
  const safePrice = sanitize(String(product.price));

  modal.innerHTML = `
    <div class="modal-content" style="background: white; border-radius: 20px; max-width: 500px; width: 90%; padding: 30px 20px; text-align: center; box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2); position: relative;">
      <button class="close-btn" style="position: absolute; top: 10px; left: 10px; font-size: 24px; background: none; border: none; color: #555; cursor: pointer;">&times;</button>
      <img src="${safeImage}" alt="${safeName}" style="width: 100%; max-width: 250px; height: 250px; object-fit: cover; border-radius: 15px;" />
      <h2 style="margin-top: 20px;">${safeName}</h2>
      <p style="margin-top: 10px; color: #666;">${safeDescription}</p>
      <p style="margin: 20px 0; font-weight: bold; color: #27ae60;">${safePrice} درهم</p>
      <button class="buy-button" style="background: #00b894; color: #fff; border: none; padding: 15px 25px; border-radius: 50px; cursor: pointer;">🛒 أضف إلى السلة الآن</button>
    </div>
  `;
  modal.querySelector('.close-btn').addEventListener('click', () => document.body.removeChild(modal));
  modal.querySelector('.buy-button').addEventListener('click', () => {
    addToCart(product.id);
    document.body.removeChild(modal);
  });
  modal.addEventListener('click', e => { if (e.target === modal) document.body.removeChild(modal); });
  document.body.appendChild(modal);
}

// ✅ عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCartCount();

  // البحث
  document.getElementById("searchToggle").addEventListener("click", () => {
    const searchInput = document.getElementById("searchInput");
    searchInput.style.display = searchInput.style.display === "none" ? "inline-block" : "none";
    if (searchInput.style.display !== "none") searchInput.focus();
  });

  document.getElementById("searchInput").addEventListener("input", function () {
    const query = this.value.toLowerCase();
    const allCards = document.querySelectorAll(".product-card");
    allCards.forEach(card => {
      const name = card.querySelector(".product-name").textContent.toLowerCase();
      card.style.display = name.includes(query) ? "block" : "none";
    });
  });
});
