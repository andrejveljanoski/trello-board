import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

const auth = getAuth();

// Login Modal
const loginModal = document.getElementById("login-modal");
const closeLoginModal = document.getElementById("close-login-modal");
const loginForm = document.getElementById("login-form");

closeLoginModal.onclick = () => {
  loginModal.style.display = "none";
};

loginForm.onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginModal.style.display = "none";
  } catch (error) {
    console.error(error);
  }
};

// Register Modal
const registerModal = document.getElementById("register-modal");
const closeRegisterModal = document.getElementById("close-register-modal");
const registerForm = document.getElementById("register-form");

closeRegisterModal.onclick = () => {
  registerModal.style.display = "none";
};

registerForm.onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    registerModal.style.display = "none";
  } catch (error) {
    console.error(error);
  }
};

const dontHaveAnAcountLink = document.getElementById("register-link");
dontHaveAnAcountLink.onclick = () => {
  loginModal.style.display = "none";
  registerModal.style.display = "block";
};

const alreadyHaveAnAcountLink = document.getElementById("login-link");
alreadyHaveAnAcountLink.onclick = () => {
  registerModal.style.display = "none";
  loginModal.style.display = "block";
};

export const checkAuth = async () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const emailAndLogoutButtonContainer = document.createElement("div");
      emailAndLogoutButtonContainer.className =
        "email-and-logout-button-container";
      const userEmail = document.createElement("h4");
      userEmail.textContent = user.email;
      userEmail.className = "user-email";
      emailAndLogoutButtonContainer.appendChild(userEmail);
      const logoutButton = document.createElement("button");
      logoutButton.textContent = "Logout";
      logoutButton.className = "logout-button";
      logoutButton.onclick = async () => {
        await signOut(auth);
      };
      emailAndLogoutButtonContainer.appendChild(logoutButton);
      document.body.appendChild(emailAndLogoutButtonContainer);
    } else {
      loginModal.style.display = "block";
      const emailAndLogoutButtonContainer = document.getElementsByClassName(
        "email-and-logout-button-container"
      );
      if (emailAndLogoutButtonContainer.length > 0) {
        emailAndLogoutButtonContainer[0].remove();
      }
    }
  });
};
