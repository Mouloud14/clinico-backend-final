import mongoose from "mongoose";

export const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "MERN_STACK_HOSPITAL_MANAGEMENT_SYSTEM",
    })
    .then(() => {
      console.log("Connected to database!");
    })
    .catch((err) => {
      // <<< AJOUTEZ OU MODIFIEZ CES LIGNES DE LOG >>>
      console.error("ERREUR CRITIQUE DE CONNEXION DB:", err.message);
      console.error("Détails de l'erreur :", err); // Ceci affichera l'objet erreur complet
      console.error("URI de connexion utilisée:", process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 30) + '...' : 'URI non définie'); // Affiche le début de l'URI (sans le mot de passe)
      // <<< FIN DES LIGNES AJOUTÉES >>>
    });
};