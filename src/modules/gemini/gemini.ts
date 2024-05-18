import { VertexAI } from "@google-cloud/vertexai";

import { redisConnection } from "#db/redis";
import { logger } from "#modules/logger";

export const USED_TOKENS_KEY = "gemini:used-tokens";

class Gemini {
  vertexAI: VertexAI;
  generativeModel: ReturnType<VertexAI["getGenerativeModel"]>;
  dailyTokenLimit: number = 200_000;

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
    const result = await this.callGemini(input);

    return result;
  };

  getTextResponse = async (input: string) => {
    logger.debug(`Gemini: getting text response`);

    const result = await this.callGemini(input);

    return result;
  };

  updateUsedTokens = async (inputContent: string, outputContent: string) => {
    const usedCount = await this.countTokens(inputContent, outputContent);

    await redisConnection.connection.incrby(
      USED_TOKENS_KEY,
      usedCount.totalTokens
    );

    logger.info(usedCount);

    return usedCount.totalTokens;
  };

  countTokens = async (inputContent: string, outputContent: string) => {
    return await this.generativeModel.countTokens({
      contents: [{ parts: [{ text: inputContent }, { text: outputContent }] }],
    });
  };

  callGemini = async (input: string) => {
    await this.checkRateLimit();

    const response = await this.generativeModel.generateContent(input);

    let result = "";

    for (const part of response.response.candidates[0].content.parts) {
      result += part.text;
    }

    await this.updateUsedTokens(input, result);

    return result;
  };

  checkRateLimit = async () => {
    const used = await redisConnection.connection.get(USED_TOKENS_KEY);

    if (!used) return;

    const value = parseInt(used);

    if (!value || value > this.dailyTokenLimit) {
      logger.error("Gemini: daily rate limit reached");
      throw new Error("Gemini rate limit");
    }
  };
}

export const gemini = new Gemini();
