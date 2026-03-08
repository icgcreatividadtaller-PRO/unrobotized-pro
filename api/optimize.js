export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Error' });
    
    const { text, mode } = req.body;
    
    // INTENTO DE LECTURA FORZADA
    const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!API_KEY || API_KEY === "") {
        return res.status(500).json({ 
            error: "La llave sigue sin aparecer en el servidor.",
            diagnostico: "Revisa que en Vercel el nombre sea GEMINI_API_KEY y esté en Production."
        });
    }

    const instructions = {
        directo: "Actúa como un mentor profesional. Reescribe este mensaje para que sea cálido y directo.",
        curioso: "Transforma esto en una pregunta intrigante y empática.",
        whatsapp: "Usa un tono de chat muy cercano, relajado y con minúsculas casuales."
    };

    const prompt = `${instructions[mode] || instructions.directo}\n\nMENSAJE: "${text}"\n\nResponde solo con el texto humanizado.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ error: `Google Gemini dice: ${data.error.message}` });
        }

        if (data.candidates && data.candidates[0].content) {
            const humanizedText = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ humanizedText: humanizedText.trim() });
        }
        
        return res.status(500).json({ error: "Gemini recibió la llave pero no pudo procesar el texto." });

    } catch (error) {
        return res.status(500).json({ error: "Fallo de conexión con el satélite neural." });
    }
}
