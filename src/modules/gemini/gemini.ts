import { GoogleGenerativeAI } from "@google/generative-ai";

class Gemini {
  genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
  }

  testResponse = async () => {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = "Write a story about a magic backpack.";

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log(text);
  };

  getTextResponse = async (input: string) => {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(input);

    const response = result.response;
    const text = response.text();

    return text;
  };
}

export const gemini = new Gemini();
