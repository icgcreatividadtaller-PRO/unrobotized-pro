export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Error' });
    const { text, mode } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.status(500).json({ error: "Llave no detectada." });

    const instructions = {
        directo: "Reescribe este mensaje para que sea cálido y profesional, eliminando la frialdad.",
        curioso: "Transforma esto en una pregunta que genere curiosidad y empatía.",
        whatsapp: "Usa un tono de chat cercano, relajado y con minúsculas casuales."
    };

    const prompt = `${instructions[mode] || instructions.directo}\n\nTEXTO: "${text}"\n\nResponde SOLO con el resultado humanizado.`;

    // LA VUELTA: Lista de modelos ligeros y rápidos de TU lista permitida
    const modelosPriority = [
        "gemini-2.0-flash-lite", // El más rápido y vacío
        "gemini-1.5-flash-8b",   // El "chiquito" que aguanta todo
        "gemini-flash-latest"    // El estándar (Plan C)
    ];

    for (const model of modelosPriority) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 200 } // Optimizado para velocidad
                }),
                signal: AbortSignal.timeout(8000) // Si en 8 seg no responde, saltamos al siguiente
            });

            const data = await response.json();

            if (data.candidates && data.candidates[0].content) {
                return res.status(200).json({ 
                    humanizedText: data.candidates[0].content.parts[0].text.trim(),
                    via: model // Para que sepamos por qué callejón entró
                });
            }
            
            // Si el error es "High Demand" (503/429), el bucle sigue al siguiente modelo
            console.log(`Modelo ${model} ocupado, buscando ruta alterna...`);

        } catch (e) {
            console.error(`Ruta ${model} bloqueada, desviando...`);
        }
    }

    return res.status(500).json({ error: "Tráfico neural intenso. Intenta en 10 segundos." });
}
