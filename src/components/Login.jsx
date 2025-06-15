import React, { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";
import axios from "axios";
// >>> IMPORTANT : Pas d'import "./Login.css"; ici puisque vous utilisez app.css

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Supprimez l'état confirmPassword si vous ne l'utilisez pas dans ce nouveau design
  // const [confirmPassword, setConfirmPassword] = useState(""); 

  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page par défaut

    try {
      const response = await axios.post(
        "https://clinico-backend-final.onrender.com/api/v1/user/login", // L'URL de votre backend déployé
        { email, password }, // Le corps de la requête avec email et mot de passe
        {
          withCredentials: true, // Pour envoyer les cookies d'authentification
          headers: { "Content-Type": "application/json" }, // Spécifie le type de contenu
        }
      );

      // En cas de succès :
      toast.success(response.data.message); // Affiche le message de succès du backend
      setIsAuthenticated(true); // Met à jour l'état d'authentification dans le contexte
      navigateTo("/"); // Redirige vers le tableau de bord
      setEmail(""); // Réinitialise le champ email
      setPassword(""); // Réinitialise le champ mot de passe

    } catch (error) {
      // En cas d'erreur :
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message); // Affiche le message d'erreur du backend
      } else {
        toast.error("Erreur de connexion. Veuillez réessayer."); // Message générique si pas de message du backend
      }
      console.error("Erreur de connexion:", error); // Log l'erreur complète pour le débogage
    }
  };

  // Si l'utilisateur est déjà authentifié, redirige vers le tableau de bord
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-section">
          {/* Le chemin vers votre LOGO MEDOCLIC. Il doit être dans le dossier 'public' de votre projet frontend */}
          <img src="/medoclic-logo.png" alt="Logo Medoclic" className="medoclic-logo" />
          <h1 className="app-title">Medoclic</h1> {/* Le nom de votre application */}
        </div>
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email" // Type email pour une meilleure validation du navigateur
              id="email"
              placeholder="nom.prenom@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required // Le champ est obligatoire
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              placeholder="Min. 8 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required // Le champ est obligatoire
            />
          </div>
          <button type="submit" className="login-button">
            Se connecter
          </button>
        </form>
        <p className="access-info">Accès réservé aux professionnels de santé</p>
      </div>
    </div>
  );
};

export default Login;