// Import necessary functions from other modules
import { getCurrentUser } from "./auth.js";

// Define navigation items
const navItems = {
  loggedOut: [
    { href: "/index.html", text: "Trang chủ" },
    { href: "/pages/shop.html", text: "Cửa hàng" },
    { href: "/pages/about.html", text: "Giới thiệu" },
    { href: "/pages/sign-in.html", text: "Đăng nhập" },
    { href: "/pages/sign-up.html", text: "Đăng ký" },
  ],
  loggedIn: [
    { href: "/index.html", text: "Trang chủ" },
    { href: "/pages/shop.html", text: "Cửa hàng" },
    { href: "/pages/about.html", text: "Giới thiệu" },
    { href: "/pages/cart.html", text: "Giỏ hàng", id: "cart-link" },
    {
      href: "/pages/me.html",
      text: "Chào, {username}",
      class: "welcome-message",
    },
  ],
};

// Banner rotation
const bannerContainer = document.querySelector(".banner-container");
const bannerImages = document.querySelectorAll(".banner-image");
let currentIndex = 0;
const totalImages = bannerImages.length;

function rotateBanner() {
  currentIndex = (currentIndex + 1) % totalImages;
  const offset = currentIndex * 25; // Mỗi ảnh chiếm 25% chiều rộng
  bannerContainer.style.transform = `translateX(-${offset}%)`;
}

// Khởi tạo banner rotation
function initBannerRotation() {
  if (bannerContainer && bannerImages.length > 0) {
    setInterval(rotateBanner, 3000);
  }
}

// Initialize UI elements
export function initUI() {
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", toggleMenu);
  }

  updateNavMenu();
}

// Toggle mobile menu
function toggleMenu() {
  const navMenu = document.querySelector(".nav-menu");
  const menuToggle = document.querySelector(".menu-toggle i");
  navMenu.classList.toggle("active");

  // Toggle between hamburger and close icon with animation
  menuToggle.classList.toggle("fa-bars");
  menuToggle.classList.toggle("fa-times");

  // Add slide animation for menu items
  const menuItems = navMenu.querySelectorAll("li");
  menuItems.forEach((item, index) => {
    if (navMenu.classList.contains("active")) {
      item.style.animation = `slideIn 0.3s ease forwards ${index * 0.1}s`;
    } else {
      item.style.animation = "";
    }
  });
}

// Update navigation menu based on login status
export function updateNavMenu() {
  const navMenu = document.querySelector(".nav-menu");
  if (!navMenu) return;

  // Add href for app-bar-title
  const appBarTitle = document.querySelector(".app-bar-title");
  if (appBarTitle) {
    // Tạo một phần tử a mới
    const linkElement = document.createElement("a");
    linkElement.href = "/index.html";

    // Di chuyển nội dung của h1 vào phần tử a
    linkElement.innerHTML = appBarTitle.innerHTML;

    // Xóa nội dung cũ của h1 và thêm phần tử a vào
    appBarTitle.innerHTML = "";
    appBarTitle.appendChild(linkElement);
  }

  const currentUser = getCurrentUser();
  const items = currentUser ? navItems.loggedIn : navItems.loggedOut;

  navMenu.innerHTML = items
    .map((item) => {
      let text = item.text;
      if (item.class === "welcome-message" && currentUser) {
        text = text.replace("{username}", currentUser.username);
      }
      return `<li>
      <a href="${item.href}" 
         ${item.onClick ? `onclick="${item.onClick}"` : ""}
         ${item.class ? `class="${item.class}"` : "class='nav-link'"}>
         ${item.id ? `<span id="${item.id}"></span>` : ""}  
        ${text}
      </a>
    </li>`;
    })
    .join("");
}

// Show message to user
export function showMessage(message, type = "info") {
  // select message element
  const messageElement = document.querySelector("#message");
  messageElement.style.display = "block";
  messageElement.className = `message message-${type}`;
  messageElement.textContent = message;

  setTimeout(() => {
    messageElement.textContent = "";
    messageElement.style.display = "none";
  }, 3000);
}

// Gọi hàm này khi trang web được tải
document.addEventListener("DOMContentLoaded", initBannerRotation);
