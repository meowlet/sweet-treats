// Import necessary functions from other modules
import { formatCurrency } from "./utils.js";
import { getCurrentUser } from "./auth.js";

let products = [];
let currentPage = 1;
const itemsPerPage = 6; // Thay đổi từ 8 thành 6

export const CartStatus = {
  PENDING: "pending",
  COMPLETED: "completed",
};

// Initialize products
export function initProducts() {
  loadProductsFromStorage();
  renderProducts();
}

// Load products from local storage
function loadProductsFromStorage() {
  products = JSON.parse(localStorage.getItem("products")) || [];
  if (products.length === 0) {
    // If no products in storage, initialize with some sample data
    products = [];
    saveProductsToStorage();
  }
}

// Save products to local storage
function saveProductsToStorage() {
  localStorage.setItem("products", JSON.stringify(products));
}

// Render products on the page
function renderProducts(filteredProducts = products) {
  const productContainer = document.getElementById("product-list");
  if (!productContainer) return;

  productContainer.innerHTML = "";

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  paginatedProducts.forEach((product) => {
    const productElement = document.createElement("div");
    productElement.className = "product-item";
    productElement.innerHTML = `
      <a href="/pages/product-detail.html?id=${product.id}">
        <img src="${product.image}" alt="${product.name}">
      </a>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${formatCurrency(product.price)}</p>
        <p class="product-stock">Còn lại: ${product.stock}</p>
        <button class="add-to-cart-btn" data-product-id="${product.id}" ${
      product.stock === 0 ? "disabled" : ""
    }>
          ${product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
        </button>
      </div>
    `;
    productContainer.appendChild(productElement);
  });

  renderPagination(filteredProducts.length);
  addToCartListeners();
}

// Add event listeners to "Add to Cart" buttons
function addToCartListeners() {
  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", handleAddToCart);
  });
}

// Add to cart
export function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  const user = getCurrentUser();
  console.log(user);
  if (user) {
    if (product) {
      product.stock--;
      saveProductsToStorage();
    }

    const carts = JSON.parse(localStorage.getItem("carts")) || [];
    const cartItem = carts.find((item) => item.productId === productId);
    if (cartItem) {
      cartItem.quantity++;
    } else {
      carts.push({
        productId,
        userId: user.id,
        quantity: 1,
        status: CartStatus.PENDING,
      });
    }
    localStorage.setItem("carts", JSON.stringify(carts));

    // Update cart count in nav
    updateCartCount();
  } else {
    showLoginPopup();
  }
}

// Add this new function
function updateCartCount() {
  const carts = JSON.parse(localStorage.getItem("carts")) || [];
  const user = getCurrentUser();
  const userCartItems = carts.filter(
    (item) => item.userId === user.id && item.status === CartStatus.PENDING
  );

  const cartNavItem = document.querySelector("#cart-link");
  if (cartNavItem) {
    // Chỉ cập nhật số lượng, không thêm lại chữ "Giỏ hàng"
    cartNavItem.textContent = `(${userCartItems.length})`;
  }
}

// Handle "Add to Cart" button click
function handleAddToCart(event) {
  const productId = event.target.getAttribute("data-product-id");
  addToCart(productId);
}

// Check if user is logged in
function checkUserLoggedIn() {
  return getCurrentUser() !== null;
}

// Show login popup
function showLoginPopup() {
  alert("Vui lòng đăng nhập trước khi mua hàng");
  window.location.href = "login.html";
}

// Search products
function searchProducts(query) {
  return products.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );
}

// Filter products by category
function filterProductsByCategory(category, productList = products) {
  if (!category) return productList;
  return productList.filter((product) => product.category === category);
}

// Filter products by price range
function filterProductsByPrice(minPrice, maxPrice, productList = products) {
  return productList.filter((product) => {
    if (maxPrice === undefined || maxPrice === null) {
      return product.price >= minPrice;
    }
    return product.price >= minPrice && product.price <= maxPrice;
  });
}

// Sort products
function sortProducts(sortOption, productList = products) {
  let sortedProducts = [...productList];
  switch (sortOption) {
    case "name-asc":
      sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "price-asc":
      sortedProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sortedProducts.sort((a, b) => b.price - a.price);
      break;
  }
  return sortedProducts;
}

// Apply filters and sorting
function applyFiltersAndSort() {
  const searchQuery = document.getElementById("search-input").value;
  const category = document.getElementById("category-filter").value;
  const priceRange = document.getElementById("price-filter").value;
  const sortOption = document.getElementById("sort-option").value;

  console.log("Price Range:", priceRange); // Thêm dòng này để kiểm tra

  let filteredProducts = searchProducts(searchQuery);
  filteredProducts = filterProductsByCategory(category, filteredProducts);

  if (priceRange && priceRange !== "all") {
    let [minPrice, maxPrice] = priceRange.split("-").map(Number);
    if (isNaN(maxPrice)) {
      maxPrice = Infinity;
    }
    console.log("Min Price:", minPrice, "Max Price:", maxPrice); // Thêm dòng này để kiểm tra
    filteredProducts = filterProductsByPrice(
      minPrice,
      maxPrice,
      filteredProducts
    );
  }

  filteredProducts = sortProducts(sortOption, filteredProducts);
  console.log("Filtered Products:", filteredProducts); // Thêm dòng này để kiểm tra
  renderProducts(filteredProducts);
}

// Render pagination
function renderPagination(totalItems) {
  const paginationContainer = document.getElementById("pagination");
  if (!paginationContainer) return;

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  paginationContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.classList.toggle("active", i === currentPage);
    button.addEventListener("click", () => changePage(i));
    paginationContainer.appendChild(button);
  }
}

// Change page
function changePage(page) {
  currentPage = page;
  applyFiltersAndSort();
}

// Initialize shop page
function initShopPage() {
  initProducts();
  updateCartCount(); // Add this line to update cart count on page load

  // Add event listeners for search, filters, and sorting
  document.getElementById("search-input").addEventListener("input", () => {
    currentPage = 1; // Reset về trang 1 khi tìm kiếm
    applyFiltersAndSort();
  });
  document.getElementById("category-filter").addEventListener("change", () => {
    currentPage = 1; // Reset về trang 1 khi thay đổi danh mục
    applyFiltersAndSort();
  });
  document.getElementById("price-filter").addEventListener("change", () => {
    currentPage = 1; // Reset về trang 1 khi thay đổi khoảng giá
    applyFiltersAndSort();
  });
  document
    .getElementById("sort-option")
    .addEventListener("change", applyFiltersAndSort);

  // Add event listener for clear filters button
  document
    .getElementById("clear-filters")
    .addEventListener("click", clearFilters);
}

// Function to clear all filters
function clearFilters() {
  document.getElementById("search-input").value = "";
  document.getElementById("category-filter").value = "";
  document.getElementById("price-filter").value = "";
  document.getElementById("sort-option").value = "name-asc"; // Reset to default sorting

  currentPage = 1; // Reset to first page
  applyFiltersAndSort(); // Re-render products
}

document.addEventListener("DOMContentLoaded", initShopPage);
