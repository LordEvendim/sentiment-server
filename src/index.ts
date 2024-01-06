import "#config/dotenv";

import { PORT } from "#config/network";
import { server } from "./server";

const app = server();

try {
  app.listen(PORT, (): void => {
    console.log(`Server started on port: ${PORT}`);
  });
} catch (error) {
  console.log("Server crashed with error");
  console.log(error);
}
