import { VertexAI } from "@google-cloud/vertexai";

import { logger } from "#modules/logger";

class Gemini {
  vertexAI: VertexAI;
  generativeModel: ReturnType<VertexAI["getGenerativeModel"]>;

  constructor() {
    this.vertexAI = new VertexAI({
      project: process.env.VERTEX_PROJECT_ID ?? "",
      location: process.env.VERTEX_LOCATION ?? "us-central1",
    });
    this.generativeModel = this.vertexAI.getGenerativeModel({
      model: process.env.VERTEX_GENERATIVE_MODEL ?? "gemini-1.0-pro",
    });
  }

  getSampleResponse = async () => {
    const input = "How can I learn more about generative AI?";
    const response = await this.generativeModel.generateContent(input);

    let result = "";

    for (const part of response.response.candidates[0].content.parts) {
      result += part.text;
    }

    return result;
  };

  getTextResponse = async (input: string) => {
    logger.debug(`Gemini: getting text response`);
    const response = await this.generativeModel.generateContent(input);

    let result = "";

    for (const part of response.response.candidates[0].content.parts) {
      result += part.text;
    }

    return result;
  };
}

export const gemini = new Gemini();
