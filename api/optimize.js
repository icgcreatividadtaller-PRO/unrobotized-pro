import { Redis } from 'ioredis';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Conexión usando la URL única que tienes en Vercel
const redis = new Redis(process.env.REDIS_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 1. Detectar la IP del usuario
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const limit = 3;

  try {
    // 2. Consultar el contador en Redis
    const count = await redis.get(`usage:${ip}`) || 0;
    const currentCount = parseInt(count);

    // 3. Bloqueo si supera el límite de 3
    if (currentCount >= limit) {
      return res.status(403).json({ 
        error: "LIMIT_REACHED", 
        message: "Acceso de cortesía completado." 
      });
    }

    const { message, tone } = req.body;
    
    // Prompts tácticos de UnRobotized PRO
    const prompts = {
      directo: "Eres un cerrador de ventas. Mensaje corto, agresivo, sin rellenos. Máximo 200 caracteres.",
      curioso: "Psicología persuasiva. Genera curiosidad extrema con una pregunta final.",
      whatsapp: "Socio en chat casual. Usa minúsculas y 1 o 2 emojis (🚀, 🎯)."
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: prompts[tone] || prompts.directo },
        { role: "user", content: `Humaniza este mensaje: "${message}"` }
      ],
      temperature: 0.8,
    });

    const result = completion.choices[0].message.content;

    // 4. Aumentar el contador y ponerle fecha de expiración (24 horas)
    await redis.set(`usage:${ip}`, currentCount + 1, 'EX', 86400);

    return res.json({ optimized: result });

  } catch (error) {
    console.error("Error táctico:", error);
    return res.status(500).json({ error: "Error de sincronización con el satélite." });
  }
}
