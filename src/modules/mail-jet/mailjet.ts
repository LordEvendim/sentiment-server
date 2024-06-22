import MailJetClient from "node-mailjet";

type Senders = "support";

const emails: Record<Senders, EmailDetails> = {
  support: {
    email: "support@clickclarity.ai",
    name: "Click clarity ai",
  },
};

interface EmailDetails {
  email: string;
  name: string;
}

class MailJet {
  mailJetClient;

  constructor() {
    this.mailJetClient = MailJetClient.apiConnect(
      process.env.MAILJET_API!,
      process.env.MAILJET_SECRET!
    );
  }

  send = async (
    sender: Senders,
    reciever: EmailDetails,
    subject: string,
    text: string,
    template: string
  ) => {
    await this.mailJetClient.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: emails[sender].email,
            Name: emails[sender].name,
          },
          To: [
            {
              Email: reciever.email,
              Name: reciever.name,
            },
          ],
          Subject: subject,
          TextPart: text,
          HTMLPart: template,
        },
      ],
    });
  };
}

export const mailJet = new MailJet();
