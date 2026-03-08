export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Error' });
    const { text, mode } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.status(500).json({ error: "Falta la llave en Vercel." });

    const instructions = {
        directo: "Reescribe este mensaje para que sea cálido y profesional, eliminando la frialdad.",
        curioso: "Transforma esto en una pregunta intrigante que despierte curiosidad.",
        whatsapp: "Usa un tono de chat cercano, relajado y con minúsculas casuales."
    };

    const prompt = `${instructions[mode] || instructions.directo}\n\nMENSAJE: "${text}"\n\nResponde SOLO con el texto humanizado.`;

    try {
        // LA VUELTA DOMINICANA: Usamos el modelo 2026 (gemini-3-flash) en la versión estable v1
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-3-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: [{ 
                    parts: [{ text: prompt }] 
                }] 
            })
        });
        
        const data = await response.json();
        
        // Si Google devuelve éxito con el modelo nuevo
        if (data.candidates && data.candidates[0].content) {
            const resultText = data.candidates[0].content.parts[0].text.trim();
            return res.status(200).json({ humanizedText: resultText });
        }
        
        // Si falla, te mando el mensaje crudo de Google para saber qué "maña" tiene
        return res.status(500).json({ 
            error: data.error ? data.error.message : "Fallo en el salto neural.",
            diagnostico: data 
        });

    } catch (e) {
        return res.status(500).json({ error: "No hay señal con el satélite." });
    }
}
