export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Error' });
    const { text, mode } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.status(500).json({ error: "Llave no detectada en la cabina." });

    const instructions = {
        directo: "Reescribe esto de forma cálida y profesional, sin sonar agresivo.",
        curioso: "Transforma esto en una pregunta que genere curiosidad.",
        whatsapp: "Usa un tono de chat cercano, relajado y sin puntos finales."
    };

    const prompt = `${instructions[mode] || instructions.directo}\n\nTEXTO: "${text}"\n\nResponde SOLO con el resultado humanizado.`;

    try {
        // LA VUELTA DEFINITIVA: v1beta + gemini-1.5-flash (El nombre que NO falla)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0].content) {
            const humanized = data.candidates[0].content.parts[0].text.trim();
            return res.status(200).json({ humanizedText: humanized });
        }

        // Si Google vuelve a llorar, que nos diga exactamente qué le duele
        return res.status(500).json({ 
            error: data.error ? data.error.message : "El satélite está sordo.",
            debug: data 
        });

    } catch (e) {
        return res.status(500).json({ error: "Cortocircuito en la conexión." });
    }
}
