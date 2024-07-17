import { VertexAI } from "@google-cloud/vertexai";

import { redisConnection } from "#db/redis";
import { logger } from "#modules/logger";

export const USED_TOKENS_KEY = "gemini:used-tokens";

type GenerativeModel = ReturnType<VertexAI["getGenerativeModel"]>;

class Gemini {
  vertexAI: VertexAI;
  generativeModel: GenerativeModel;
  flashModel: GenerativeModel;
  dailyTokenLimit: number = 200_000;

  constructor() {
    this.vertexAI = new VertexAI({
      project: process.env.VERTEX_PROJECT_ID ?? "",
      location: process.env.VERTEX_LOCATION ?? "us-central1",
    });
    this.generativeModel = this.vertexAI.getGenerativeModel({
      model: "gemini-1.0-pro",
    });
    this.flashModel = this.vertexAI.getGenerativeModel({
      model: "gemini-1.5-flash-001",
    });
  }

  getSampleFlashResponse = async () => {
    const input = "How can I learn more about generative AI?";
    const result = await this.callModel(input, this.flashModel);

    return result;
  };

  getFlashTextResponse = async (input: string) => {
    logger.debug(`Gemini: getting flash text response`);

    const result = await this.callModel(input, this.flashModel);

    return result;
  };

  getSampleResponse = async () => {
    const input = "How can I learn more about generative AI?";
    const result = await this.callModel(input, this.generativeModel);

    return result;
  };

  getTextResponse = async (input: string) => {
    logger.debug(`Gemini: getting text response`);

    const result = await this.callModel(input, this.generativeModel);

    return result;
  };

  updateUsedTokens = async (inputContent: string, outputContent: string) => {
    const usedCount = await this.countTokens(inputContent, outputContent);

    await redisConnection.connection.incrby(
      USED_TOKENS_KEY,
      usedCount.totalTokens
    );

    logger.info("Gemini: used tokens -> " + usedCount.totalTokens);

    return usedCount.totalTokens;
  };

  countTokens = async (inputContent: string, outputContent: string) => {
    return await this.generativeModel.countTokens({
      contents: [{ parts: [{ text: inputContent }, { text: outputContent }] }],
    });
  };

  callModel = async (input: string, model: GenerativeModel) => {
    await this.checkRateLimit();

    const response = await model.generateContent(input);

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

    if (isNaN(value) || value > this.dailyTokenLimit) {
      logger.error("Gemini: daily rate limit reached");
      throw new Error("Gemini rate limit");
    }
  };
}

export const gemini = new Gemini();
