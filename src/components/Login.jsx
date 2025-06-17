import React, { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";
import axios from "axios";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const navigateTo = useNavigate();

// Dans Login.jsx
const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(
      "http://localhost:4000/api/v1/user/login", // L'URL de votre backend local
      { email, password },
      {
        withCredentials: true,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("LOGIN FRONTEND LOG: Réponse Axios (succès):", response); // <<< AJOUTÉ
    console.log("LOGIN FRONTEND LOG: Message du backend:", response.data.message); // <<< AJOUTÉ

    toast.success(response.data.message);
    setIsAuthenticated(true);
    navigateTo("/");
    console.log("LOGIN FRONTEND LOG: isAuthenticated set to TRUE, navigating to /"); // <<< AJOUTÉ
    setEmail("");
    setPassword("");

  } catch (error) {
    console.error("LOGIN FRONTEND LOG: Erreur Axios (échec):", error); // <<< AJOUTÉ
    if (error.response && error.response.data && error.response.data.message) {
      toast.error(error.response.data.message);
      console.error("LOGIN FRONTEND LOG: Message erreur backend:", error.response.data.message); // <<< AJOUTÉ
    } else {
      toast.error("Erreur de connexion. Veuillez réessayer.");
    }
    console.error("LOGIN FRONTEND LOG: Erreur complète:", error); // Log l'erreur complète pour le débogage
  }
};

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="login-container">
      <div className="login-left-panel">
        <div className="login-brand">
          <img src="/en blanc.png" alt="HK Clinique Logo" className="login-logo" />
         <div className="login-welcome">
  <h1 className="login-title">Bienvenue sur Medoclic</h1> {/* <<< MODIFIEZ CE TEXTE */}
  <p className="login-subtitle">Votre portail sécurisé de gestion de clinique</p> {/* <<< MODIFIEZ CE TEXTE */}
</div>
        </div>
       
        <div className="login-decorative">
          <div className="login-circle circle-1"></div>
          <div className="login-circle circle-2"></div>
          <div className="login-circle circle-3"></div>
        </div>
      </div>

      <div className="login-right-panel">
        <form className="login-form" onSubmit={handleLogin}>
          <h2 className="form-title">Connexion Administrateur</h2> {/* <<< MODIFIEZ CE TEXTE */}
  <p className="form-subtitle">Accédez à vos ressources cliniques sécurisées</p> {/* <<< MODIFIEZ CE TEXTE */}
         
          <div className="form-group">
            <input
              type="email"
              placeholder="Adresse mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
            <svg className="form-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
            <svg className="form-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <circle cx="12" cy="16" r="1"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
         
          <button type="submit" className="login-button">
            <span className="button-text">Se connecter</span>
            <svg className="button-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14"/>
              <path d="M12 5l7 7-7 7"/>
            </svg>
          </button>
        </form>

        <div className="security-notice">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>Secure connection protected by SSL encryption</span>
        </div>
      </div>
    </div>
  );
};

export default Login; 