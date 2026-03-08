export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Error' });
    const { text, mode } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.status(500).json({ error: "Llave no detectada en Vercel." });

    const instructions = {
        directo: "Reescribe este mensaje para que sea cálido y profesional, eliminando la frialdad sin perder impacto.",
        curioso: "Transforma esto en una pregunta intrigante que despierte curiosidad y empatía.",
        whatsapp: "Usa un tono de chat cercano, relajado y con minúsculas casuales."
    };

    const prompt = `${instructions[mode] || instructions.directo}\n\nTEXTO ORIGINAL: "${text}"\n\nResponde SOLO con el resultado humanizado.`;

    try {
        // LA VUELTA GANADORA: Usamos el nombre que Google te autorizó
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0].content) {
            const resultText = data.candidates[0].content.parts[0].text.trim();
            return res.status(200).json({ humanizedText: resultText });
        }

        return res.status(500).json({ 
            error: data.error ? data.error.message : "El satélite no devolvió señal.",
            diagnostico: data 
        });

    } catch (e) {
        return res.status(500).json({ error: "Fallo de conexión neural." });
    }
}
