import dotenv from "dotenv";
import path from "path";

// Load .env from project root. This file should be imported once at app entrypoint.
const envPath = path.join(process.cwd(), ".env");
dotenv.config({ path: envPath });

export default process.env;
