import { formatCurrency } from "./utils.js";
import { addToCart } from "./shop.js";

function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

function getProductById(id) {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  return products.find((product) => product.id.toString() === id);
}

function renderProductDetail(product) {
  const productContainer = document.getElementById("product-container");
  if (!productContainer) return;

  productContainer.innerHTML = `
    <div class="product-detail-content">
      <img src="${product.image}" alt="${
    product.name
  }" class="product-detail-image">
      <div class="product-detail-info">
        <h2 class="product-detail-name">${product.name}</h2>
        <p class="product-detail-price">${formatCurrency(product.price)}</p>
        <p class="product-detail-stock">Còn lại: ${product.stock}</p>
        <p class="product-detail-description">${
          product.description || "Không có mô tả"
        }</p>
        <button class="add-to-cart-btn" data-product-id="${product.id}" ${
    product.stock === 0 ? "disabled" : ""
  }>
          ${product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
        </button>
      </div>
    </div>
  `;

  const addToCartBtn = productContainer.querySelector(".add-to-cart-btn");
  addToCartBtn.addEventListener("click", () => addToCart(product.id));
}

export function initProductDetail() {
  const productId = getProductIdFromUrl();
  if (!productId) {
    console.error("Không tìm thấy ID sản phẩm");
    return;
  }

  const product = getProductById(productId);
  if (!product) {
    console.error("Không tìm thấy sản phẩm");
    return;
  }

  renderProductDetail(product);
}
