import cors, { CorsOptions } from "cors";

const corsDevelopment: CorsOptions = {
  optionsSuccessStatus: 200,
  credentials: true,
  origin: ["http://localhost:5173"], // do not change to "*". It will prevent cookies from saving
};
const corsProduction: CorsOptions = {
  optionsSuccessStatus: 200,
  credentials: true,
  origin: ["https://[url]"],
};

export default cors(
  process.env.SERVER_ENV === "prod" ? corsProduction : corsDevelopment
);
