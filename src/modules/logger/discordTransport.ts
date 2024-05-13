import Transport from "winston-transport";

import { discord } from "#modules/discord/discord";

interface LoggerOptions {
  level: string;
}

//
// Inherit from `winston-transport` so you can take advantage
// of the base functionality and `.exceptions.handle()`.
//
export class DiscordTransport extends Transport {
  constructor(options: LoggerOptions) {
    super(options);

    //
    // Consume any custom options here. e.g.:
    // - Connection information for databases
    // - Authentication information for APIs (e.g. loggly, papertrail,
    //   logentries, etc.).
    //
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(
    info: {
      level: string;
      message: string;
      timestamp: string;
    },
    callback: () => void
  ) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    if (callback) callback();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (this.levels[this.level] >= this.levels[info.level])
      discord.sendError(info.message);
  }
}
