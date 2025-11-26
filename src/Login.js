import React, { useState } from "react";
import "./Login.css";
import { getTranslation } from "./translations";
import taskzzLogo from "./logo-img/taskzz-logo.svg";

const API_BASE_URL = "https://2502.ict-expert.ch/api";

// Inscription côté API (utilisé quand on clique sur "Sign up")
async function apiSignup(email, password) {
  const res = await fetch(`${API_BASE_URL}/signup.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Signup error");
  return data;
}

// Connexion classique
async function apiLogin(email, password) {
  const res = await fetch(`${API_BASE_URL}/login.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Login error");
  return data;
}

// Écran d'authentification : gère connexion/inscription
function Login({ onLogin, lang, onToggleLang }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [error, setError] = useState("");

  const t = (key) => getTranslation(lang, key);

  // Le même formulaire sert aux deux modes
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = isSignupMode
        ? await apiSignup(email, password)
        : await apiLogin(email, password);

      onLogin(data.token, email);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-screen">
      {/* Bascule rapide pour changer de langue avant de se connecter */}
      <button
        type="button"
        className="lang-toggle"
        onClick={onToggleLang}
      >
        {lang === "en" ? "FR" : "EN"}
      </button>
      <div className="auth-card">
        {/* Logo */}
        <img src={taskzzLogo} alt="Taskzz" className="auth-logo" />
        {error && <p className="auth-error">{error}</p>}

        {/* Formulaire email + mot de passe */}
        <form onSubmit={handleAuthSubmit}>
          <input
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={isSignupMode ? "new-password" : "current-password"}
          />
          <button type="submit">
            {isSignupMode ? t("signup") : t("login")}
          </button>
        </form>

        {/* Bouton pour inverser Login/Signup */}
        <button
          type="button"
          className="auth-toggle"
          onClick={() => setIsSignupMode((prev) => !prev)}
        >
          {isSignupMode
            ? t("alreadyHaveAccount")
            : t("noAccountYet")}
        </button>
      </div>
    </div>
  );
}

export default Login;
