import cors, { CorsOptions } from "cors";

const corsDevelopment: CorsOptions = {
  optionsSuccessStatus: 200,
  credentials: true,
  origin: ["http://localhost:5173", "https://localhost:5173"], // do not change to "*". It will prevent cookies from saving
};
const corsProduction: CorsOptions = {
  optionsSuccessStatus: 200,
  credentials: true,
  origin: "https://app.clickclarity.ai",
  // origin: ["https://app.clickclarity.ai", "https://clickclarity.ai"],
};

export default cors(
  process.env.NODE_ENV === "prod" ? corsProduction : corsDevelopment
);
