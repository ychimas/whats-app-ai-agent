import OpenAI from "openai"
import { GoogleGenerativeAI } from "@google/generative-ai"
import Groq from "groq-sdk"

export async function generateAIResponse(message: string, context: string, apiKey: string, provider: "openai" | "gemini" | "groq"): Promise<string> {
    try {
        if (!apiKey) return "Error: API Key no configurada."

        if (provider === "openai") {
            const openai = new OpenAI({ apiKey })
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini", // Cost-effective model
                messages: [
                    { role: "system", content: context || "Eres un asistente útil." },
                    { role: "user", content: message }
                ],
            })
            return response.choices[0]?.message?.content || "No pude generar una respuesta."
        }
        
        if (provider === "gemini") {
            const genAI = new GoogleGenerativeAI(apiKey)
            const model = genAI.getGenerativeModel({ model: "gemini-pro" })
            
            // Gemini doesn't have a direct "system" role in the simple API, 
            // so we prepend the context to the prompt or use the chat history if needed.
            // For a single turn response, prepending context is reliable.
            const prompt = `${context ? `Instrucciones del sistema: ${context}\n\n` : ""}Usuario: ${message}`
            
            const result = await model.generateContent(prompt)
            const response = await result.response
            return response.text()
        }

        if (provider === "groq") {
            const groq = new Groq({ apiKey })
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: context || "Eres un asistente útil." },
                    { role: "user", content: message }
                ],
                model: "llama3-8b-8192", // High performance open model
            })
            return chatCompletion.choices[0]?.message?.content || "No pude generar una respuesta."
        }

        return "Proveedor no soportado aún."

    } catch (error) {
        console.error("AI Generation Error:", error)
        return "Lo siento, tuve un error procesando tu mensaje con la IA."
    }
}
