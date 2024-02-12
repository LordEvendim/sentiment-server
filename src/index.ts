import "#config/dotenv";

import { PORT } from "#config/network";

import { createServer } from "./server";

const server = createServer();

try {
  server.listen(PORT, (): void => {
    console.log(`Server started on port: ${PORT}`);
  });
} catch (error) {
  console.log("Server crashed with error");
  console.log(error);
}
