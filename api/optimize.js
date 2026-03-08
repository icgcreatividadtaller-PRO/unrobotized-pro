export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Error' });
    const { text, mode } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.status(500).json({ error: "Falta la llave neural en Vercel." });

    const instructions = {
        directo: "Reescribe este mensaje para que sea cálido y profesional. Quita la agresividad pero mantén el impacto de ventas.",
        curioso: "Transforma esto en una pregunta intrigante que despierte curiosidad y empatía genuina.",
        whatsapp: "Usa un tono de chat cercano y relajado, sin puntos finales y con minúsculas casuales."
    };

    const prompt = `${instructions[mode] || instructions.directo}\n\nMENSAJE: "${text}"\n\nResponde SOLO con el nuevo texto humanizado.`;

    try {
        // CAMBIO DEFINITIVO: Modelo gemini-1.5-flash en la versión v1
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            const resultText = data.candidates[0].content.parts[0].text.trim();
            return res.status(200).json({ humanizedText: resultText });
        }
        
        // Captura de errores específicos de Google
        return res.status(500).json({ 
            error: data.error ? data.error.message : "El satélite no pudo procesar el texto.",
            diagnostico: data
        });
    } catch (e) {
        return res.status(500).json({ error: "Fallo de conexión con el satélite neural." });
    }
}
