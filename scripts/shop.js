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
        <p class="product-description">${product.description}</p>
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
  window.location.href = "/pages/sign-in.html";
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

function addProductsToStorage() {
  const products = [
    {
      id: 1,
      name: "Bánh Chocolate",
      price: 350000,
      stock: 8,
      image: "https://picsum.photos/seed/chocolate-cake/300/200",
      category: "banh-kem",
      description:
        "Bánh kem chocolate mềm mịn với lớp kem tươi đậm đà, được phủ lớp socola Bỉ cao cấp. Thích hợp cho sinh nhật và các dịp đặc biệt.",
    },
    {
      id: 2,
      name: "Bánh quy Phô mai",
      price: 75000,
      stock: 0,
      image: "https://picsum.photos/seed/cheese-cookies/300/200",
      category: "banh-quy",
      description:
        "Bánh quy phô mai giòn tan với hương vị béo ngậy từ phô mai Cheddar thượng hạng, được nướng đến độ vàng hoàn hảo.",
    },
    {
      id: 3,
      name: "Kẹo dừa",
      price: 25000,
      stock: 0,
      image: "https://picsum.photos/seed/coconut-candy/300/200",
      category: "keo",
      description:
        "Kẹo dừa truyền thống được làm từ cơm dừa tươi nguyên chất, nước cốt dừa và đường mía, mang hương vị đậm đà của miền Tây Nam Bộ.",
    },
    {
      id: 4,
      name: "Bánh Tiramisu",
      price: 400000,
      stock: 7,
      image: "https://picsum.photos/seed/tiramisu/300/200",
      category: "banh-kem",
      description:
        "Bánh Tiramisu chuẩn vị Ý vi lớp bánh gato thấm cà phê espresso, lớp kem mascarpone mềm mịn và bột cacao đậm đà.",
    },
    {
      id: 5,
      name: "Socola đen",
      price: 120000,
      stock: 4,
      image: "https://picsum.photos/seed/dark-chocolate/300/200",
      category: "chocolate",
      description:
        "Socola đen nguyên chất với hàm lượng cacao 70%, vị đắng đặc trưng và hậu vị ngọt tinh tế, được nhập khẩu từ Bỉ.",
    },
    {
      id: 6,
      name: "Bánh quy bơ",
      price: 60000,
      stock: 16,
      image: "https://picsum.photos/seed/butter-cookies/300/200",
      category: "banh-quy",
      description:
        "Bánh quy bơ thơm nức được làm từ bơ Pháp cao cấp, tan chảy trong miệng với độ giòn vừa phải.",
    },
    {
      id: 7,
      name: "Kẹo chanh",
      price: 15000,
      stock: 40,
      image: "https://picsum.photos/seed/lemon-candy/300/200",
      category: "keo",
      description:
        "Kẹo chanh với vị chua ngọt tự nhiên, được chiết xuất từ chanh tươi, giúp giải khát và làm mát cổ họng.",
    },
    {
      id: 8,
      name: "Bánh Red Velvet",
      price: 380000,
      stock: 12,
      image: "https://picsum.photos/seed/red-velvet/300/200",
      category: "banh-kem",
      description:
        "Bánh Red Velvet với màu đỏ quyến rũ, vị chocolate nhẹ nhàng, kết hợp với lớp kem cheese cream béo ngậy.",
    },
    {
      id: 9,
      name: "Socola sữa",
      price: 100000,
      stock: 18,
      image: "https://picsum.photos/seed/milk-chocolate/300/200",
      category: "chocolate",
      description:
        "Socola sữa mềm mịn với hương vị ngọt ngào, được làm từ sữa tươi và bột cacao chất lượng cao.",
    },
    {
      id: 10,
      name: "Bánh quy yến mạch",
      price: 70000,
      stock: 22,
      image: "https://picsum.photos/seed/oatmeal-cookies/300/200",
      category: "banh-quy",
      description:
        "Bánh quy yến mạch giàu chất xơ, ít đường, thích hợp cho người ăn kiêng và người yêu thích lối sống lành mạnh.",
    },
    {
      id: 11,
      name: "Kẹo bạc hà",
      price: 20000,
      stock: 35,
      image: "https://picsum.photos/seed/mint-candy/300/200",
      category: "keo",
      description:
        "Kẹo bạc hà the mát với tinh dầu bạc hà tự nhiên, giúp thơm miệng và tỉnh táo suốt ngày dài.",
    },
    {
      id: 12,
      name: "Bánh Cheesecake",
      price: 420000,
      stock: 9,
      image: "https://picsum.photos/seed/cheesecake/300/200",
      category: "banh-kem",
      description:
        "Bánh Cheesecake New York với phần đế bánh giòn tan, lớp kem cheese mềm mịn và béo ngậy, được nướng chậm để đạt độ hoàn hảo.",
    },
    {
      id: 13,
      name: "Socola trắng",
      price: 110000,
      stock: 16,
      image: "https://picsum.photos/seed/white-chocolate/300/200",
      category: "chocolate",
      description:
        "Socola trắng béo ngậy được làm từ bơ cacao, sữa và đường, mang đến hương vị ngọt ngào đặc trưng.",
    },
    {
      id: 14,
      name: "Bánh quy hạnh nhân",
      price: 80000,
      stock: 20,
      image: "https://picsum.photos/seed/almond-cookies/300/200",
      category: "banh-quy",
      description:
        "Bánh quy hạnh nhân giòn rụm với những miếng hạnh nhân thơm bùi, được nướng vàng đều và có độ giòn hoàn hảo.",
    },
    {
      id: 15,
      name: "Kẹo gum",
      price: 18000,
      stock: 45,
      image: "https://picsum.photos/seed/gum/300/200",
      category: "keo",
      description:
        "Kẹo gum với nhiều hương vị tự nhiên, không đường, giúp thơm miệng và bảo vệ răng miệng hiệu quả.",
    },
    {
      id: 16,
      name: "Bánh Mousse",
      price: 360000,
      stock: 11,
      image: "https://picsum.photos/seed/mousse-cake/300/200",
      category: "banh-kem",
      description:
        "Bánh Mousse mềm mịn như mây với lớp bánh gato mỏng, kết hợp với mousse chocolate Pháp cao cấp.",
    },
  ];

  localStorage.setItem("products", JSON.stringify(products));
  console.log("Successfully inserted into localStorage.");
}

// Add this new function
function addDescriptionToggleListeners() {
  const toggleButtons = document.querySelectorAll(".toggle-description-btn");
  toggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const description = this.nextElementSibling;
      if (description.style.display === "none") {
        description.style.display = "block";
        this.textContent = "Ẩn mô tả";
      } else {
        description.style.display = "none";
        this.textContent = "Xem mô tả";
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", initShopPage);
