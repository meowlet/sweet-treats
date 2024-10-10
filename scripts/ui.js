// Import necessary functions from other modules
import { isLoggedIn, getCurrentUser, logout } from "./auth.js";

// Define navigation items
const navItems = {
  loggedOut: [
    { href: "/index.html", text: "Trang chủ" },
    { href: "/pages/shop.html", text: "Cửa hàng" },
    { href: "/pages/sign-in.html", text: "Đăng nhập" },
    { href: "/pages/sign-up.html", text: "Đăng ký" },
  ],
  loggedIn: [
    { href: "/index.html", text: "Trang chủ" },
    { href: "/pages/shop.html", text: "Cửa hàng" },
    { href: "/pages/cart.html", text: "Giỏ hàng" },
    { href: "#", text: "Chào, {username}", class: "welcome-message" },
  ],
};

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

  const items = isLoggedIn() ? navItems.loggedIn : navItems.loggedOut;
  const currentUser = getCurrentUser();

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
