import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);
    
    try {
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/user/reset-password/${token}`,
        { password }
      );
      
      toast.success("Mot de passe réinitialisé avec succès !");
      // Redirection vers login
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <form onSubmit={handleSubmit}>
        <h2>Réinitialisation du mot de passe</h2>
        
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
        
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Traitement..." : "Réinitialiser"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;