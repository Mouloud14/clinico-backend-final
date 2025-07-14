import React, { useContext, useState } from "react";
import { TiHome } from "react-icons/ti";
import { RiLogoutBoxFill } from "react-icons/ri";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoPersonAddSharp } from "react-icons/io5";
import { IoPersonSharp } from "react-icons/io5";
import { FaFilePrescription } from "react-icons/fa6";
import { AiFillCalendar } from "react-icons/ai";
import { FiSettings } from "react-icons/fi";
import { FaNotesMedical } from "react-icons/fa"
import { FaPills } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [show, setShow] = useState(false);
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/user/admin/logout`, {
        withCredentials: true,
      });
      toast.success(res.data.message);
      setIsAuthenticated(false);
      setShow(false);
      // Ajouter la redirection ici
      navigateTo("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur de déconnexion");
    }
  };

  // Fonction pour fermer la Sidebar et naviguer
  const handleMenuItemClick = (action) => {
    action(); // Exécuter l'action (navigation ou autre)
    setShow(false); // Fermer la Sidebar
  };

  const menuItems = [
    { icon: <TiHome />, label: "Accueil", action: () => navigateTo("/") },
    { icon: <IoPersonAddSharp />, label: "Ajouter un Patient", action: () => navigateTo("/Patient/addnew") },
    { icon: <IoPersonSharp />, label: "Patients inscrits", action: () => navigateTo("/patients") },
    { icon: <FaFilePrescription />, label: "Ordonnance", action: () => navigateTo("/prescription-options") },
    { icon: <AiFillCalendar />, label: "RDV", action: () => navigateTo("/calendar") },
    { icon: <FaNotesMedical />, label: "Examen du jour", action: () => navigateTo("/blocnote") },
    { icon: <FaPills />, label: "Ajouter Médicament", action: () => navigateTo("/add-medicament") },

    { 
      icon: <FiSettings />, 
      label: "Réinitialiser le mot de passe", 
      action: () => navigateTo("/change-password") 
    },
    { icon: <RiLogoutBoxFill />, label: "Déconnexion", action: handleLogout },
  ];

  return (
    <>
      <nav className={`sidebar ${show ? "show" : ""}`} style={!isAuthenticated ? { display: "none" } : {}}>
        <div className="links">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="menu-item"
              onClick={() => handleMenuItemClick(item.action)} // Fermer la Sidebar après le clic
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </nav>
      <div className="wrapper" style={!isAuthenticated ? { display: "none" } : {}}>
        <GiHamburgerMenu className="hamburger" onClick={() => setShow(!show)} />
      </div>
    </>
  );
};

export default Sidebar;
