import { formatCurrency } from "./utils.js";
import { CartStatus } from "./shop.js";

let cart = [];
let products = [];
let purchaseHistory = []; // Add this line to store purchase history

export function initCart() {
  loadCartAndProducts();
  loadPurchaseHistory(); // Add this line to load purchase history
  renderCart();
  if (document.getElementById("checkout-btn")) {
    document
      .getElementById("checkout-btn")
      .addEventListener("click", handleCheckout);
  }
}

function loadCartAndProducts() {
  cart = JSON.parse(localStorage.getItem("carts")) || [];
  products = JSON.parse(localStorage.getItem("products")) || [];
}

function loadPurchaseHistory() {
  purchaseHistory = JSON.parse(localStorage.getItem("purchaseHistory")) || [];
}

function renderCart() {
  const cartContainer = document.getElementById("cart-items");
  const checkoutBtn = document.getElementById("checkout-btn");
  if (!cartContainer || !checkoutBtn) return;

  cartContainer.innerHTML = "";
  let total = 0;
  let hasSelectedItems = false;

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Chưa có sản phẩm trong giỏ hàng</p>";
    checkoutBtn.disabled = true;
  } else {
    cart.forEach((item, index) => {
      const product = products.find((p) => p.id.toString() === item.productId);
      if (product) {
        const itemElement = createCartItemElement(item, product, index);
        cartContainer.appendChild(itemElement);
        if (item.selected) {
          total += product.price * item.quantity;
          hasSelectedItems = true;
        }
      }
    });

    checkoutBtn.disabled = !hasSelectedItems;
  }

  updateTotal(total);
  updateProductQuantities();
}

function createCartItemElement(item, product, index) {
  const itemElement = document.createElement("div");
  itemElement.className = "cart-item";
  itemElement.innerHTML = `
        <input type="checkbox" class="cart-item-checkbox" data-index="${index}" ${
    item.selected ? "checked" : ""
  }>
        <img src="${product.image}" alt="${product.name}">
        <div class="cart-item-details">
            <h3>${product.name}</h3>
            <p>Giá: ${formatCurrency(product.price)}</p>
            <div class="quantity-control">
                <button class="quantity-btn decrease" data-index="${index}">-</button>
                <input type="number" min="1" max="${product.stock}" value="${
    item.quantity
  }" data-index="${index}" class="quantity-input">
                <button class="quantity-btn increase" data-index="${index}">+</button>
            </div>
            <p>Tổng: ${formatCurrency(product.price * item.quantity)}</p>
        </div>
        <button class="remove-item-btn" data-index="${index}">Xóa</button>
    `;

  const quantityInput = itemElement.querySelector(".quantity-input");
  const decreaseBtn = itemElement.querySelector(".decrease");
  const increaseBtn = itemElement.querySelector(".increase");

  quantityInput.addEventListener("change", handleQuantityChange);
  decreaseBtn.addEventListener("click", handleDecrease);
  increaseBtn.addEventListener("click", handleIncrease);
  itemElement
    .querySelector(".cart-item-checkbox")
    .addEventListener("change", handleItemSelection);
  itemElement
    .querySelector(".remove-item-btn")
    .addEventListener("click", handleRemoveItem);

  return itemElement;
}

function handleQuantityChange(event) {
  const index = event.target.dataset.index;
  let newQuantity = parseInt(event.target.value);
  const product = products.find(
    (p) => p.id.toString() === cart[index].productId
  );

  // Xử lý các trường hợp không hợp lệ
  if (isNaN(newQuantity) || newQuantity < 1) {
    newQuantity = 1;
  } else if (newQuantity > product.stock) {
    newQuantity = product.stock;
  }

  // Cập nhật giá trị trong input
  event.target.value = newQuantity;

  // Cập nhật giỏ hàng
  cart[index].quantity = newQuantity;
  saveCartAndRender();
}

function handleItemSelection(event) {
  const index = event.target.dataset.index;
  cart[index].selected = event.target.checked;
  saveCartAndRender();
}

function handleRemoveItem(event) {
  const index = event.target.dataset.index;
  cart.splice(index, 1);
  saveCartAndRender();
}

function handleCheckout() {
  const selectedItems = cart.filter((item) => item.selected);

  if (selectedItems.length === 0) {
    alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
    return;
  }

  // Cập nhật số lượng sản phẩm
  selectedItems.forEach((item) => {
    const product = products.find((p) => p.id.toString() === item.productId);
    if (product) {
      product.stock -= item.quantity;
    }
  });

  // Add selected items to purchase history
  purchaseHistory.push({
    date: new Date().toISOString(),
    items: selectedItems,
  });

  // Remove selected items from cart
  cart = cart.filter((item) => !item.selected);

  // Save updated cart, products, and purchase history
  localStorage.setItem("carts", JSON.stringify(cart));
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("purchaseHistory", JSON.stringify(purchaseHistory));

  renderCart();
  alert("Thanh toán thành công!");
}

function updateTotal(total) {
  const totalElement = document.getElementById("cart-total");
  if (totalElement) {
    totalElement.textContent = formatCurrency(total);
  }
}

function saveCartAndRender() {
  localStorage.setItem("carts", JSON.stringify(cart));
  renderCart();
}

// Export các hàm cần thiết để sử dụng ở nơi khác nếu cần
export { loadCartAndProducts, renderCart, handleCheckout };

function handleDecrease(event) {
  const index = event.target.dataset.index;
  const input = event.target.nextElementSibling;
  let newQuantity = parseInt(input.value) - 1;
  if (newQuantity < 1) newQuantity = 1;
  input.value = newQuantity;
  handleQuantityChange({ target: input });
}

function handleIncrease(event) {
  const index = event.target.dataset.index;
  const input = event.target.previousElementSibling;
  const product = products.find(
    (p) => p.id.toString() === cart[index].productId
  );
  let newQuantity = parseInt(input.value) + 1;
  if (newQuantity > product.stock) newQuantity = product.stock;
  input.value = newQuantity;
  handleQuantityChange({ target: input });
}

function updateProductQuantities() {
  const productElements = document.querySelectorAll(".product");
  productElements.forEach((element) => {
    const productId = element.dataset.productId;
    const product = products.find((p) => p.id.toString() === productId);
    if (product) {
      const quantityElement = element.querySelector(".product-quantity");
      if (quantityElement) {
        quantityElement.textContent = `Còn lại: ${product.stock}`;
      }
    }
  });
}
