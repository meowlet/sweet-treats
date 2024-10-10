// Import necessary functions from other modules
import { showMessage } from "./ui.js";
import { validateEmail } from "./utils.js";

// Initialize authentication related elements and events
export function initAuth() {
  const signInForm = document.getElementById("signInForm");
  const signUpForm = document.getElementById("signUpForm");

  if (signInForm) signInForm.addEventListener("submit", handleSignIn);
  if (signUpForm) signUpForm.addEventListener("submit", handleSignUp);

  checkLoginStatus();
}

// Add this new function
function showFieldError(fieldId, message) {
  const errorElement = document.getElementById(`${fieldId}Error`);
  if (errorElement) {
    errorElement.textContent = message;
  }
}

// Handle sign in form submission
function handleSignIn(e) {
  e.preventDefault();
  const emailOrUsername = document.getElementById("emailOrUsername").value;
  const password = document.getElementById("password").value;
  const rememberMe = document.getElementById("rememberMe").checked;

  // Reset previous errors
  showFieldError("emailOrUsername", "");
  showFieldError("password", "");

  // Validate input
  let hasError = false;
  if (!emailOrUsername) {
    showFieldError("emailOrUsername", "Vui lòng nhập email hoặc tên đăng nhập");
    hasError = true;
  }
  if (!password) {
    showFieldError("password", "Vui lòng nhập mật khẩu");
    hasError = true;
  }
  if (hasError) return;

  // Check login credentials
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(
    (u) =>
      (u.email === emailOrUsername || u.username === emailOrUsername) &&
      u.password === password
  );

  if (user) {
    showMessage("Đăng nhập thành công!", "success");
  } else {
    showMessage(
      "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.",
      "error"
    );
  }
}

// Handle sign up form submission
function handleSignUp(e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Reset previous errors
  showFieldError("username", "");
  showFieldError("email", "");
  showFieldError("password", "");
  showFieldError("confirmPassword", "");

  // Validate input
  let hasError = false;
  if (!username) {
    showFieldError("username", "Vui lòng nhập tên đăng nhập");
    hasError = true;
  }
  if (!email) {
    showFieldError("email", "Vui lòng nhập email");
    hasError = true;
  } else if (!validateEmail(email)) {
    showFieldError("email", "Vui lòng nhập một địa chỉ email hợp lệ");
    hasError = true;
  }
  if (!password) {
    showFieldError("password", "Vui lòng nhập mật khẩu");
    hasError = true;
  }
  if (!confirmPassword) {
    showFieldError("confirmPassword", "Vui lòng xác nhận mật khẩu");
    hasError = true;
  } else if (password !== confirmPassword) {
    showFieldError("confirmPassword", "Mật khẩu không khớp");
    hasError = true;
  }
  if (hasError) return;

  // Check if email already exists
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  if (users.some((u) => u.email === email)) {
    showFieldError("email", "Email đã được sử dụng");
    return;
  }

  // Add new user
  users.push({ username, email, password });
  localStorage.setItem("users", JSON.stringify(users));

  showMessage("Registration successful! Please sign in.", "success");
  setTimeout(() => {
    window.location.href = "sign-in.html";
  }, 2000);
}

// Check if user is logged in
export function isLoggedIn() {
  return localStorage.getItem("isLoggedIn") === "true";
}

// Get current user information
export function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

// Log out the current user
export function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("rememberMe");
  window.location.href = "index.html";
}

// Check login status and update UI accordingly
function checkLoginStatus() {
  if (isLoggedIn()) {
    // Update UI for logged in user
    const currentUser = getCurrentUser();
    document
      .querySelectorAll(".user-name")
      .forEach((el) => (el.textContent = currentUser.username));
    document
      .querySelectorAll(".login-required")
      .forEach((el) => (el.style.display = "block"));
    document
      .querySelectorAll(".logout-required")
      .forEach((el) => (el.style.display = "none"));
  } else {
    // Update UI for logged out user
    document
      .querySelectorAll(".login-required")
      .forEach((el) => (el.style.display = "none"));
    document
      .querySelectorAll(".logout-required")
      .forEach((el) => (el.style.display = "block"));
  }
}
