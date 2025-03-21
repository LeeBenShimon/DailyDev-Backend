import { Request, Response, NextFunction } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

class AiController {
  async askGemini(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json({ error: "Missing prompt" });
      return;
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = result.response;

      res.status(200).json({ answer: response.text() });
    } catch (error) {
      console.error("Gemini error:", error);
      next(error); 
    }
  }
}


export const aiController = new AiController();
