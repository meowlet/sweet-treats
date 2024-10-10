// Import necessary functions from other modules
import { formatCurrency } from "./utils.js";

let products = [];
let currentPage = 1;
const itemsPerPage = 6; // Thay đổi từ 8 thành 6

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
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${formatCurrency(product.price)}</p>
        <p class="product-stock">Còn lại: ${product.stock}</p>
        <button class="add-to-cart-btn" ${
          product.stock === 0 ? "disabled" : ""
        }>
          ${product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
        </button>
      </div>
    `;
    productContainer.appendChild(productElement);
  });

  renderPagination(filteredProducts.length);
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
}

// Call initShopPage when the DOM is loaded
document.addEventListener("DOMContentLoaded", initShopPage);
