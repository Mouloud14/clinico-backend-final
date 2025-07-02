// backend/scheduler/reminderScheduler.js
import cron from 'node-cron';
import Patient from '../models/Patient.model.js';
import User from '../models/userSchema.js';
import { sendEmail } from '../utils/sendEmail.js'; // Assurez-vous du bon chemin
import ErrorHandler from '../middlewares/error.js'; // Ou votre classe ErrorHandler

// <<< SEULE ET UNIQUE DÉCLARATION DE LA FONCTION >>>
export const startReminderJob = () => {
    // Cette tâche s'exécutera tous les jours à 22h00 (10 PM)
    cron.schedule('38 0 * * *', async () => { // OU L'HEURE DE VOTRE TEST
        console.log('SCHEDULER LOG: Démarrage de la tâche de rappel des rendez-vous...');
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const startOfTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0, 0);
        const endOfTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59, 999);

        try {
            const patientsToNotify = await Patient.find({
                'appointments.date': {
                    $gte: startOfTomorrow,
                    $lt: endOfTomorrow,
                },
                'appointments.emailReminderSent': false,
                email: { $exists: true, $ne: null, $ne: '' }
            }).select('firstName lastName email appointments.date appointments.emailReminderSent')
            .populate('doctor', 'firstName lastName');  
            

            if (patientsToNotify.length === 0) {
                console.log('SCHEDULER LOG: Aucun rendez-vous pour demain ou rappels déjà envoyés.');
                return;
            }

            for (const patient of patientsToNotify) {
                const apptTomorrow = patient.appointments.find(appt => {
                    const apptDate = new Date(appt.date);
                    return apptDate >= startOfTomorrow && apptDate < endOfTomorrow && !appt.emailReminderSent;
                });

                if (apptTomorrow) {
                    const rdvTime = apptTomorrow.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                    const rdvDate = apptTomorrow.date.toLocaleDateString('fr-FR');

                    // Pour obtenir le nom du médecin qui gère ce patient pour l'email
                    // const doctor = await User.findById(patient.doctor).select('firstName lastName'); // Nécessite d'importer User

                    const emailSubject = `Rappel: Votre rendez-vous médical le ${rdvDate}`;
                    const doctorName = patient.doctor ? `Dr. ${patient.doctor.firstName} ${patient.doctor.lastName}` : 'votre médecin';

                    const emailMessage = `Bonjour ${patient.firstName} ${patient.lastName},\n\n` +
                    `Ceci est un rappel pour votre rendez-vous avec ${doctorName} demain, le ${rdvDate} à ${rdvTime}.\n\n` +
                    `Merci de vous présenter à l'heure.\n\n` +
                    `Cordialement,\nVotre cabinet médical.`;

                    await sendEmail({
                        email: patient.email,
                        subject: emailSubject,
                        message: emailMessage,
                    });

                    await Patient.updateOne(
                        { '_id': patient._id, 'appointments._id': apptTomorrow._id },
                        { '$set': {
                            'appointments.$.emailReminderSent': true,
                            'appointments.$.emailReminderSentAt': new Date()
                        }}
                    );
                    console.log(`SCHEDULER LOG: Rappel email envoyé à ${patient.email} pour RDV le ${rdvDate} à ${rdvTime}`);
                }
            }
            console.log('SCHEDULER LOG: Tâche de rappel des rendez-vous terminée.');

        } catch (error) {
            console.error('SCHEDULER LOG: Erreur lors de l\'exécution de la tâche de rappel:', error);
        }
    }, {
        scheduled: true,
        timezone: "Africa/Algiers" // OU le fuseau horaire de votre serveur ou cabinet
    });
};