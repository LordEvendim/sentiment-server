import "#config/dotenv";

import { logger } from "#modules/logger";

import { createServer } from "./server";

const server = createServer();

const port = process.env.PORT || 3001;

try {
  server.listen(port, () => {
    logger.info(`Server: started on port: ${port}`);
    logger.info(`Server: started in environment: ${process.env.NODE_ENV}`);
  });
} catch (error) {
  logger.error("Server crashed");
  logger.error(error);
}
