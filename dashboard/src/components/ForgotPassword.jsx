import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/user/forgot-password`,
        { email }
      );
      
      toast.success("Email de réinitialisation envoyé !");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <form onSubmit={handleSubmit}>
        <h2>Récupération de compte</h2>
        
        <input
          type="email"
          placeholder="Votre email professionnel"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Envoi en cours..." : "Envoyer le code"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;