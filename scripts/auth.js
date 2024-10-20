// Import necessary functions from other modules
import { showMessage } from "./ui.js";
import {
  validateEmail,
  validateUsername,
  validatePassword,
  validateConfirmPassword,
} from "./utils.js";

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
    // Set current user
    localStorage.setItem("currentUser", JSON.stringify({ userId: user.id }));

    showMessage("Đăng nhập thành công!", "success");

    // Add delay before redirecting
    setTimeout(() => {
      window.location.href = "/index.html";
    }, 2000); // Delay for 2 seconds
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
  } else if (!validateUsername(username)) {
    showFieldError(
      "username",
      "Username phải có từ 3 đến 16 ký tự, chỉ chứa chữ cái viết thường, số và dấu gạch dưới"
    );
    hasError = true;
  }
  if (!email) {
    showFieldError("email", "Vui lòng nhập email");
    hasError = true;
  } else if (!validateEmail(email)) {
    showFieldError("email", "Email không hợp lệ");
    hasError = true;
  }
  if (!password) {
    showFieldError("password", "Vui lòng nhập mật khẩu");
    hasError = true;
  } else if (!validatePassword(password)) {
    showFieldError(
      "password",
      "Mật khẩu phải từ 8 ký tự trở lên, chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường, một số và một ký tự đặc biệt"
    );
    hasError = true;
  }
  if (!confirmPassword) {
    showFieldError("confirmPassword", "Vui lòng xác nhận mật khẩu");
    hasError = true;
  } else if (!validateConfirmPassword(password, confirmPassword)) {
    showFieldError("confirmPassword", "Mật khẩu không khớp");
    hasError = true;
  }
  if (hasError) return;

  // Check if email or username already exists
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  if (users.some((u) => u.email === email)) {
    showFieldError("email", "Email đã được sử dụng");
    return;
  }
  if (users.some((u) => u.username === username)) {
    showFieldError("username", "Tên đăng nhập đã được sử dụng");
    return;
  }

  // Generate new userId
  const userId = users.length;

  // Add new user
  users.push({ id: userId, username, email, password });
  localStorage.setItem("users", JSON.stringify(users));

  showMessage("Đăng ký thành công! Vui lòng đăng nhập.", "success");
  setTimeout(() => {
    window.location.href = "sign-in.html";
  }, 2000);
}

// Get current user information
export function getCurrentUser() {
  const currentUserData = JSON.parse(localStorage.getItem("currentUser"));

  // Kiểm tra xem currentUserData có tồn tại và có thuộc tính userId không
  if (!currentUserData || !("userId" in currentUserData)) {
    console.error(
      "Dữ liệu người dùng hiện tại không hợp lệ trong localStorage"
    );
    return null;
  }

  const currentUserId = currentUserData.userId;

  // Query user from local storage
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find((u) => u.id === currentUserId);

  if (!user) {
    console.error("Không tìm thấy người dùng trong localStorage");
    return null;
  }

  return user;
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
  if (getCurrentUser()) {
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
