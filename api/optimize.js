export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Error' });
    const { text, mode } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.status(500).json({ error: "Llave no detectada en Vercel." });

    const instructions = {
        directo: "Reescribe esto de forma cálida y profesional, eliminando la frialdad.",
        curioso: "Transforma esto en una pregunta que genere curiosidad.",
        whatsapp: "Usa un tono de chat cercano, relajado y sin puntos finales."
    };

    const prompt = `${instructions[mode] || instructions.directo}\n\nTEXTO: "${text}"\n\nResponde SOLO con el resultado humanizado.`;

    // LA VUELTA DOMINICANA: Lista de modelos para probar en orden de potencia
    const modelos = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.0-pro"
    ];

    for (const modelName of modelos) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();

            // Si este modelo funcionó, mandamos la respuesta y cortamos el ciclo
            if (data.candidates && data.candidates[0].content) {
                const resultText = data.candidates[0].content.parts[0].text.trim();
                return res.status(200).json({ 
                    humanizedText: resultText,
                    modelo_usado: modelName 
                });
            }
            
            // Si el error es específicamente "not found", el bucle sigue al siguiente modelo
            console.log(`Modelo ${modelName} falló, intentando el siguiente...`);

        } catch (e) {
            console.error(`Error de red con ${modelName}`);
        }
    }

    // Si llegamos aquí, es que ninguno de los tres modelos quiso cooperar
    return res.status(500).json({ 
        error: "Google rechazó todos los modelos disponibles.",
        diagnostico: "Revisa si la API Key tiene restricciones de facturación o región en Google AI Studio."
    });
}
