export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Error' });
    const { text, mode } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.status(500).json({ error: "Falta la llave neural en Vercel." });

    const instructions = {
        directo: "Actúa como un mentor. Reescribe esto para que sea cálido y profesional, quitando la agresividad.",
        curioso: "Transforma esto en una pregunta que genere curiosidad y empatía.",
        whatsapp: "Usa un tono de chat cercano, sin puntos y con minúsculas casuales."
    };

    const prompt = `${instructions[mode] || instructions.directo}\n\nMENSAJE: "${text}"\n\nResponde SOLO con el texto humanizado.`;

    try {
        // LA VUELTA: Usamos la versión estable v1 con el alias 'latest'
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            return res.status(200).json({ humanizedText: data.candidates[0].content.parts[0].text.trim() });
        }
        
        // Si Google se pone bruto, capturamos el mensaje exacto
        return res.status(500).json({ 
            error: data.error ? data.error.message : "El satélite no respondió.",
            details: data 
        });
    } catch (e) {
        return res.status(500).json({ error: "Fallo de conexión con el satélite." });
    }
}
