import "dotenv/config";
import { app } from "./http/app.js";

const port = Number(process.env.PORT ?? 9002);
app.listen(port, () => console.log(`Candidate service listening on http://localhost:${port}`));
