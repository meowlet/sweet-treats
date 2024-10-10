// Import necessary functions from other modules
import { showMessage } from "./ui.js";
import { getCurrentUser } from "./auth.js";
import { getProducts, updateProductStock } from "./shop.js";
import { formatCurrency } from "./utils.js";

let cart = {};

// Initialize cart
export function initCart() {
  loadCartFromStorage();
  renderCart();
}

// Add a product to the cart
export function addToCart(productId) {
  const product = getProducts().find((p) => p.id === productId);
  if (product && product.stock > 0) {
    if (cart[productId]) {
      cart[productId].quantity++;
    } else {
      cart[productId] = { ...product, quantity: 1 };
    }
    updateProductStock(productId, product.stock - 1);
    saveCartToStorage();
    renderCart();
    showMessage("Product added to cart", "success");
  } else {
    showMessage("Product is out of stock", "error");
  }
}

// Remove a product from the cart
export function removeFromCart(productId) {
  if (cart[productId]) {
    const product = getProducts().find((p) => p.id === productId);
    updateProductStock(productId, product.stock + cart[productId].quantity);
    delete cart[productId];
    saveCartToStorage();
    renderCart();
    showMessage("Product removed from cart", "success");
  }
}

// Update the quantity of a product in the cart
export function updateCartQuantity(productId, quantity) {
  const product = getProducts().find((p) => p.id === productId);
  const currentQuantity = cart[productId] ? cart[productId].quantity : 0;
  const quantityDiff = quantity - currentQuantity;

  if (product.stock >= quantityDiff) {
    cart[productId].quantity = quantity;
    updateProductStock(productId, product.stock - quantityDiff);
    saveCartToStorage();
    renderCart();
    showMessage("Cart updated", "success");
  } else {
    showMessage("Not enough stock", "error");
  }
}

// Render the cart
function renderCart() {
  const cartContainer = document.getElementById("cart-items");
  if (!cartContainer) return;

  cartContainer.innerHTML = "";
  let total = 0;

  Object.values(cart).forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.className = "cart-item";
    itemElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h3>${item.name}</h3>
        <p>Price: ${formatCurrency(item.price)}</p>
        <p>Quantity: ${item.quantity}</p>
        <button onclick="removeFromCart(${item.id})">Remove</button>
      </div>
    `;
    cartContainer.appendChild(itemElement);
    total += item.price * item.quantity;
  });

  const totalElement = document.getElementById("cart-total");
  if (totalElement) {
    totalElement.textContent = formatCurrency(total);
  }
}

// Load cart from local storage
function loadCartFromStorage() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    const allCarts = JSON.parse(localStorage.getItem("carts")) || {};
    cart = allCarts[currentUser.username] || {};
  }
}

// Save cart to local storage
function saveCartToStorage() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    const allCarts = JSON.parse(localStorage.getItem("carts")) || {};
    allCarts[currentUser.username] = cart;
    localStorage.setItem("carts", JSON.stringify(allCarts));
  }
}
