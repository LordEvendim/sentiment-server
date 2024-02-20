import { VertexAI } from "@google-cloud/vertexai";

class Gemini {
  vertexAI: VertexAI;
  generativeModel: ReturnType<VertexAI["getGenerativeModel"]>;

  constructor() {
    this.vertexAI = new VertexAI({
      project: process.env.VERTEX_PROCESS_ID ?? "",
      location: process.env.VERTEX_LOCATION ?? "us-central1",
    });
    this.generativeModel = this.vertexAI.getGenerativeModel({
      model: process.env.VERTEX_GENERATIVE_MODEL ?? "gemini-1.0-pro",
    });
  }

  getTestResponse = async () => {
    const input = "How can I learn more about generative AI?";

    let result = "";
    const chat = this.generativeModel.startChat({});

    const response = await chat.sendMessageStream(input);

    for await (const item of response.stream) {
      if (!item.candidates) continue;

      result += item.candidates[0].content.parts[0].text;
    }

    console.log("Test Response from VertexAI");
    console.log(result);

    return result;
  };

  getTextResponse = async (input: string) => {
    const response = await this.generativeModel.generateContent(input);

    let result = "";

    for (const part of response.response.candidates[0].content.parts) {
      result += part;
    }

    console.log("Response from VertexAI");
    console.log(result);

    return result;
  };
}

export const gemini = new Gemini();
