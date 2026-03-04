import { Redis } from 'ioredis';
import OpenAI from 'openai';

// Inicialización de herramientas
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const redis = new Redis(process.env.REDIS_URL); // Usa tu URL de una sola línea

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 1. Identificación de la "matrícula" (IP)
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const limit = 3;

  try {
    // 2. Consulta a la base de datos
    const count = await redis.get(`usage:${ip}`) || 0;
    const currentCount = parseInt(count);

    // 3. Bloqueo táctico (Caja Registradora)
    if (currentCount >= limit) {
      return res.status(403).json({ 
        error: "LIMIT_REACHED", 
        message: "Acceso de cortesía completado." 
      });
    }

    const { message, tone } = req.body;
    
    // Prompts recalibrados: Cortos y Agresivos
    const prompts = {
      directo: "Eres un cerrador de ventas. Escribe un mensaje corto, agresivo y directo al grano. Máximo 200 caracteres.",
      curioso: "Experto en psicología. Genera curiosidad extrema con una pregunta final potente.",
      whatsapp: "Tono casual de WhatsApp. Usa minúsculas y 2 emojis (🚀, 🎯). Que parezca humano."
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: prompts[tone] || prompts.directo },
        { role: "user", content: `Humaniza este mensaje: "${message}"` }
      ],
      temperature: 0.8,
    });

    const optimizedResult = completion.choices[0].message.content;

    // 4. Registrar uso y darle 24h de validez
    await redis.set(`usage:${ip}`, currentCount + 1, 'EX', 86400);

    return res.json({ optimized: optimizedResult });

  } catch (error) {
    console.error("Error táctico:", error);
    return res.status(500).json({ error: "SISTEMA: Error de enlace con el satélite." });
  }
}
