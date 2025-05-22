import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../App.css"; // Assurez-vous que le CSS est bien appliqué

const AddNewPatient = () => {
  const [formData, setFormData] = useState({
    patientNumber: "",
    firstName: "",
    lastName: "",
    address: "",
    dob: "",
    weight: "",
    height: "",
    gender: "",
    bloodGroup: "",
    chronicDiseases: "",
    pastSurgeries: "",
    medicalFiles: [],
    phoneNumber: "", // Nouveau champ
    email:"",
    nextAppointment: "",
    profileImage: null, // Nouveau champ
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, medicalFiles: [...e.target.files] });
  };

  const handleProfileImageChange = (e) => {
    setFormData({ ...formData, profileImage: e.target.files[0] });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    

    // Validation du numéro de téléphone
    const phoneNumber = formData.phoneNumber;
    const phoneRegex = /^(05|06|07)\d{8}$/; // Regex pour les numéros algériens
    if (!phoneRegex.test(phoneNumber)) {
      toast.error("Le numéro de téléphone doit commencer par 05, 06 ou 07 et contenir 10 chiffres.");
      return;
    }

    // Validation de l'email
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Veuillez entrer une adresse email valide.");
      return;
    }

    const data = new FormData();
    for (const key in formData) {
      if (key === "medicalFiles") {
        for (const file of formData[key]) {
          data.append("medicalFiles", file);
        }
      } else {
        data.append(key, formData[key]);
      }
    }

    try {
      const response = await axios.post("http://localhost:4000/api/v1/patient/addnew", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      toast.success("Patient added successfully");
      console.log(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      console.error(error);
    }
  };

  return (
    <div className="form-component">
      <h2>Add New Patient</h2>
      <form onSubmit={handleSubmit} className="add-patient-form">
        <input type="text" name="patientNumber" placeholder="Patient Number" onChange={handleChange} required />
        <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} required />
        <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} required />
        <input type="text" name="address" placeholder="Address" onChange={handleChange} required />
        <div className="form-group">
  <label htmlFor="dob">Date de naissance :</label>
  <input
    type="date"
    id="dob"
    name="dob"
    onChange={handleChange}
    required
  />
</div>

        <input type="number" name="weight" placeholder="Weight (kg)" onChange={handleChange} required />
        <input type="number" name="height" placeholder="Height (cm)" onChange={handleChange} required />
        <select name="bloodGroup" onChange={handleChange} required>
          <option value="">Select Blood Group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>
        
<div className="form-group">
  
  <select 
    name="gender" 
    onChange={handleChange} 
    required
    className="gender-select"
  >
    <option value="">Sélectionner le sexe</option>
    <option value="Male">Masculin</option>
    <option value="Female">Féminin</option>
    
  </select>
</div>
        <textarea name="chronicDiseases" placeholder="antécédents médicaux" onChange={handleChange} />
        <textarea name="pastSurgeries" placeholder="antécédents chirurgicaux" onChange={handleChange} />
        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <div className="form-group">
  <label htmlFor="nextAppointment">Date d'inscription :</label>
  <input
    type="datetime-local"
    id="nextAppointment"
    name="nextAppointment"
    onChange={handleChange}
  />
</div>
<label>Ajouter un fichier médical :</label>
        <input type="file" name="medicalFiles" multiple onChange={handleFileChange} />
        <div className="form-group">
  
  <label>Photo d'identité :</label>
  <input
    type="file"
    name="profileImage"
    accept="image/*"
    onChange={handleProfileImageChange}
    required
  />
</div>
        <button type="submit">Add Patient</button>
      </form>
    </div>
  );
};

export default AddNewPatient;