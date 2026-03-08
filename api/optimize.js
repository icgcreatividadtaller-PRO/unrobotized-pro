export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Error' });

    const { text, mode } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY; // Tu llave secreta en Vercel

    // Configuración del "carácter" de la IA según el modo
    const instructions = {
        directo: "Actúa como un mentor empático y profesional. Reescribe este mensaje para que sea cálido, motivador y directo, eliminando la frialdad robótica sin perder la autoridad.",
        curioso: "Reescribe este mensaje como una pregunta intrigante. Usa un tono que despierte curiosidad y empatía, invitando a la reflexión profunda.",
        whatsapp: "Transforma esto en un mensaje de chat real: usa un tono muy relajado, omite formalismos innecesarios, usa minúsculas casuales y añade un toque de cercanía humana."
    };

    const prompt = `${instructions[mode] || instructions.directo}\n\nMENSAJE ORIGINAL: "${text}"\n\nREGLA CRÍTICA: Devuelve SOLO el mensaje humanizado, sin introducciones como 'aquí tienes' ni comillas. Mantén una longitud similar o ligeramente menor al original.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        const humanizedText = data.candidates[0].content.parts[0].text;

        return res.status(200).json({ humanizedText: humanizedText.trim() });

    } catch (error) {
        console.error("Error Neural Engine:", error);
        return res.status(500).json({ error: "Fallo en la conexión con el satélite neural." });
    }
}
