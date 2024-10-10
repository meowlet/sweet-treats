// Import necessary modules
import { initAuth } from "./auth.js";
// import { initCart } from "./cart.js";
import { initProducts } from "./shop.js";
import { initUI } from "./ui.js";

// Initialize all modules when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  initAuth();
  // initCart();
  initProducts();
  initUI();
});
