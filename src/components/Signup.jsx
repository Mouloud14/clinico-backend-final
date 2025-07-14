
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [cabinetAddress, setCabinetAddress] = useState("");
  const [cabinetPhone, setCabinetPhone] = useState("");
  const [ordreNumber, setOrdreNumber] = useState("");
  const [specialite, setSpecialite] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/user/admin/addnew`,
        {
          firstName,
          lastName,
          email,
          cabinetAddress,
          cabinetPhone,
          ordreNumber,
          specialite,
          password,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      toast.success(response.data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <h2>Créer un compte médecin</h2>
        <form onSubmit={handleSignup}>
          <div className="form-row">
            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Adresse du cabinet</label>
            <input
              type="text"
              value={cabinetAddress}
              onChange={(e) => setCabinetAddress(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Téléphone du cabinet</label>
              <input
                type="text"
                value={cabinetPhone}
                onChange={(e) => setCabinetPhone(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Numéro d'ordre</label>
              <input
                type="text"
                value={ordreNumber}
                onChange={(e) => setOrdreNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Spécialité</label>
            <input
              type="text"
              value={specialite}
              onChange={(e) => setSpecialite(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="signup-button">
            {isLoading ? "Création en cours..." : "S'inscrire"}
          </button>
        </form>

        <div className="login-link">
          <p>Déjà inscrit? <Link to="/login">Connectez-vous</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
