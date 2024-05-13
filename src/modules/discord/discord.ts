import axios from "axios";

class Discord {
  private requestAccessChannelWebhook =
    process.env.DISCORD_REQUEST_ACCESS_WEBHOOK;

  sendError = async (content: string) => {
    if (!this.requestAccessChannelWebhook)
      throw new Error("Request access channel webhook is not defined");

    await axios.post(
      this.requestAccessChannelWebhook,
      {
        username: "Click clarity Server",
        embeds: [
          {
            title: "Server Error",
            url:
              process.env.RAILWAY_SERVER_BROWSER_URL ?? "https://railway.app",
            description: `\`\`\`${content}\`\`\``,
            color: 16711680,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  };
}

export const discord = new Discord();
