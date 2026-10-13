const products = [
  { id: "iphone-15-pro", name: "iPhone 15 Pro, 256GB", brand: "Apple", category: "Apple", price: 14999000, oldPrice: 16999000, rating: 4.9, reviews: 128, tag: "−12%", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=650&q=82" },
  { id: "samsung-s24", name: "Galaxy S24 Ultra, 256GB", brand: "Samsung", category: "Samsung", price: 13999000, oldPrice: 15499000, rating: 4.8, reviews: 96, tag: "−10%", image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=650&q=82" },
  { id: "xiaomi-14", name: "Xiaomi 14, 512GB", brand: "Xiaomi", category: "Xiaomi", price: 8999000, oldPrice: 9999000, rating: 4.7, reviews: 73, tag: "−10%", image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=650&q=82" },
  { id: "iphone-15", name: "iPhone 15, 128GB", brand: "Apple", category: "Apple", price: 10999000, oldPrice: 11999000, rating: 4.8, reviews: 214, tag: "−8%", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=650&q=82&sat=-30" },
  { id: "samsung-a55", name: "Galaxy A55, 256GB", brand: "Samsung", category: "Samsung", price: 4999000, oldPrice: 5599000, rating: 4.6, reviews: 81, tag: "−11%", image: "https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=650&q=82" },
  { id: "redmi-note-13", name: "Redmi Note 13 Pro, 256GB", brand: "Xiaomi", category: "Xiaomi", price: 3699000, oldPrice: null, rating: 4.7, reviews: 156, tag: "Yangi", image: "https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=650&q=82&hue=18" },
  { id: "google-pixel-8", name: "Pixel 8, 128GB", brand: "Google", category: "Boshqa", price: 7499000, oldPrice: 8299000, rating: 4.8, reviews: 54, tag: "−10%", image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=650&q=82&hue=190" },
  { id: "iphone-14", name: "iPhone 14, 128GB", brand: "Apple", category: "Apple", price: 8999000, oldPrice: 9999000, rating: 4.7, reviews: 302, tag: "−10%", image: "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?auto=format&fit=crop&w=650&q=82" }
];

const formatter = new Intl.NumberFormat("uz-UZ");
const grid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#search-input");
const sortSelect = document.querySelector("#sort-select");
const resultsLine = document.querySelector("#results-line");
const emptyState = document.querySelector("#empty-state");
const cartDrawer = document.querySelector("#cart-drawer");
const overlay = document.querySelector("#overlay");
const cartItemsElement = document.querySelector("#cart-items");
const toastElement = document.querySelector("#toast");

let activeCategory = "Barchasi";
let searchTerm = "";
let cart = loadCart();
let favorites = new Set();
let toastTimer;

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("mobilbozor-cart") || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter((item) =>
      item && products.some((product) => product.id === item.id) &&
      Number.isInteger(item.quantity) && item.quantity > 0
    );
  } catch (error) {
    console.error("Savatchani yuklab bo‘lmadi:", error);
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem("mobilbozor-cart", JSON.stringify(cart));
  } catch (error) {
    console.error("Savatchani saqlab bo‘lmadi:", error);
    showToast("Savatchani saqlashda xatolik yuz berdi.");
  }
}

function formatPrice(price) {
  return `${formatter.format(price)} so‘m`;
}

function visibleProducts() {
  const normalizedTerm = searchTerm.trim().toLocaleLowerCase("uz");
  let result = products.filter((product) => {
    const matchesCategory = activeCategory === "Barchasi" ||
      (activeCategory === "Chegirmalar" ? product.oldPrice !== null : product.category === activeCategory);
    const matchesSearch = !normalizedTerm ||
      `${product.name} ${product.brand}`.toLocaleLowerCase("uz").includes(normalizedTerm);
    return matchesCategory && matchesSearch;
  });

  if (sortSelect.value === "price-asc") result.sort((a, b) => a.price - b.price);
  if (sortSelect.value === "price-desc") result.sort((a, b) => b.price - a.price);
  if (sortSelect.value === "rating") result.sort((a, b) => b.rating - a.rating);
  if (sortSelect.value === "popular") result.sort((a, b) => b.reviews - a.reviews);
  return result;
}

function renderProducts() {
  const visible = visibleProducts();
  grid.innerHTML = visible.map((product) => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.brand} ${product.name}" loading="lazy">
        <span class="product-tag ${product.tag === "Yangi" ? "new" : ""}">${product.tag}</span>
        <button class="favorite-button ${favorites.has(product.id) ? "is-favorite" : ""}" data-favorite="${product.id}" type="button" aria-label="${favorites.has(product.id) ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo‘shish"}">♡</button>
      </div>
      <div class="product-info">
        <div class="product-brand">${product.brand}</div>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-rating"><span>★</span> ${product.rating} <span style="color:#aaaab4">(${product.reviews})</span></div>
        <div class="product-bottom">
          <div class="product-price"><strong>${formatPrice(product.price)}</strong>${product.oldPrice ? `<del>${formatPrice(product.oldPrice)}</del>` : ""}</div>
          <button class="add-button" data-add="${product.id}" type="button" aria-label="${product.name}ni savatchaga qo‘shish">+</button>
        </div>
      </div>
    </article>
  `).join("");
  emptyState.hidden = visible.length > 0;
  grid.hidden = visible.length === 0;
  resultsLine.textContent = visible.length ? `${visible.length} ta telefon topildi` : "";
}

function updateCart() {
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const total = cart.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  document.querySelector("#cart-count").textContent = itemCount;
  document.querySelector("#drawer-count").textContent = `(${itemCount})`;
  document.querySelector("#cart-total").textContent = formatPrice(total);
  document.querySelector("#cart-footer").hidden = cart.length === 0;
  document.querySelector("#cart-empty").classList.toggle("visible", cart.length === 0);
  cartItemsElement.innerHTML = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    if (!product) return "";
    return `
      <article class="cart-item">
        <img src="${product.image}" alt="" loading="lazy">
        <div>
          <h3 class="cart-item-name">${product.name}</h3>
          <span class="cart-item-price">${formatPrice(product.price)}</span>
          <div class="quantity-control">
            <button data-quantity="${product.id}" data-change="-1" type="button" aria-label="Soni kamaytirish">−</button>
            <span>${item.quantity}</span>
            <button data-quantity="${product.id}" data-change="1" type="button" aria-label="Soni oshirish">+</button>
          </div>
        </div>
        <button class="remove-item" data-remove="${product.id}" type="button" aria-label="Mahsulotni o‘chirish">×</button>
      </article>`;
  }).join("");
}

function addToCart(id) {
  const item = cart.find((entry) => entry.id === id);
  if (item) item.quantity += 1;
  else cart.push({ id, quantity: 1 });
  saveCart();
  updateCart();
  const product = products.find((entry) => entry.id === id);
  showToast(`${product.name} savatchaga qo‘shildi`);
}

function showToast(message) {
  toastElement.textContent = message;
  toastElement.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastElement.classList.remove("visible"), 2800);
}

function setCartOpen(open) {
  cartDrawer.classList.toggle("open", open);
  cartDrawer.setAttribute("aria-hidden", String(!open));
  overlay.hidden = !open;
  document.body.classList.toggle("cart-open", open);
  if (open) {
    requestAnimationFrame(() => overlay.classList.add("visible"));
    document.querySelector("#close-cart").focus();
  } else {
    overlay.classList.remove("visible");
    document.querySelector("#open-cart").focus();
  }
}

function setCategory(category) {
  activeCategory = category;
  document.querySelectorAll(".filter-chip").forEach((button) => {
    button.classList.toggle("selected", button.dataset.category === category);
  });
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", category === "Barchasi"
      ? !link.dataset.navCategory
      : link.dataset.navCategory === category);
  });
  renderProducts();
}

document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  searchTerm = searchInput.value;
  renderProducts();
  document.querySelector("#catalog").scrollIntoView({ behavior: "smooth" });
});
searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value;
  renderProducts();
});
sortSelect.addEventListener("change", renderProducts);
document.querySelectorAll(".filter-chip").forEach((button) => {
  button.addEventListener("click", () => setCategory(button.dataset.category));
});
document.querySelectorAll("[data-nav-category]").forEach((link) => {
  link.addEventListener("click", () => {
    const category = link.dataset.navCategory;
    setCategory(category);
    if (category === "Chegirmalar") {
      document.querySelectorAll(".filter-chip").forEach((button) => button.classList.remove("selected"));
    }
  });
});
grid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  if (addButton) addToCart(addButton.dataset.add);
  const favoriteButton = event.target.closest("[data-favorite]");
  if (favoriteButton) {
    const id = favoriteButton.dataset.favorite;
    if (favorites.has(id)) favorites.delete(id);
    else favorites.add(id);
    renderProducts();
  }
});
cartItemsElement.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) {
    const item = cart.find((entry) => entry.id === quantityButton.dataset.quantity);
    if (item) {
      item.quantity += Number(quantityButton.dataset.change);
      if (item.quantity <= 0) cart = cart.filter((entry) => entry !== item);
    }
  } else if (removeButton) {
    cart = cart.filter((item) => item.id !== removeButton.dataset.remove);
  } else return;
  saveCart();
  updateCart();
});
document.querySelector("#open-cart").addEventListener("click", () => setCartOpen(true));
document.querySelector("#close-cart").addEventListener("click", () => setCartOpen(false));
overlay.addEventListener("click", () => setCartOpen(false));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer.classList.contains("open")) setCartOpen(false);
});
document.querySelector("#reset-filters").addEventListener("click", () => {
  searchInput.value = "";
  searchTerm = "";
  setCategory("Barchasi");
});
document.querySelector("#checkout-button").addEventListener("click", () => {
  showToast("Buyurtmani rasmiylashtirish hozircha demo rejimida mavjud emas.");
});
document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  showToast("Obuna funksiyasi hozircha demo rejimida.");
  event.currentTarget.reset();
});

renderProducts();
updateCart();
