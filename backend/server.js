import app from "./app.js";
import cors from "cors";

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, 
  })
);
app.listen(process.env.PORT, () => {
  console.log(`Server listening at port ${process.env.PORT}`);
});