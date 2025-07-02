import app from "./app.js";
import { startReminderJob } from "./scheduler/reminderScheduler.js";
import { dbConnection } from "./database/dbConnection.js";

dbConnection();
startReminderJob();
app.listen(process.env.PORT, () => {
  console.log(`Server listening at port ${process.env.PORT}`);
});