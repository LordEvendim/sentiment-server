import "#config/dotenv";

import { PORT } from "#config/network";
import { logger } from "#modules/logger";

import { createServer } from "./server";

const server = createServer();

try {
  server.listen(PORT, (): void => {
    logger.info(`Server: started on port: ${PORT}`);
    logger.info(`Server: started in environment: ${process.env.NODE_ENV}`);
  });
} catch (error) {
  logger.error("Server crashed");
  logger.error(error);
}
