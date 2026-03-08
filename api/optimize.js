export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Error' });

    try {
        const { text, mode } = req.body;
        if (!text || text.length < 5) return res.status(400).json({ error: 'Texto insuficiente' });

        let input = text.trim();
        let sentences = input.split(/[.!?]+/); // Dividimos el mensaje en oraciones
        let output = "";

        // 1. TRANSFORMADOR DE TONO (No depende de palabras específicas)
        // Añadimos variabilidad en la apertura según el modo
        const openers = {
            directo: ["Mira, la cosa es que ", "Seamos claros: ", "La realidad es que "],
            curioso: ["Me pregunto si ", "¿Has pensado que tal vez ", "¿No te parece que "],
            whatsapp: ["Oye, ", "Escucha, ", "Te cuento: "]
        };

        const currentOpeners = openers[mode] || openers.directo;
        output = currentOpeners[Math.floor(Math.random() * currentOpeners.length)];

        // 2. PROCESADOR DE CUERPO (Limpieza de "Grasa Corporativa")
        // Aquí mantenemos los reemplazos, pero solo como apoyo
        let body = input;
        const dictionary = {
            "específicamente": "más que nada",
            "adicionalmente": "además",
            "proporcionar": "dar",
            "en resumen": "al final",
            "está matando": "te arruina"
        };

        Object.keys(dictionary).forEach(key => {
            body = body.replace(new RegExp(key, "gi"), dictionary[key]);
        });

        // 3. REESTRUCTURACIÓN DINÁMICA
        // Si el texto es largo, lo hacemos más directo (quitamos "paja")
        if (body.length > 100) {
            body = body.replace(/ que /g, " que, la verdad, ");
        }

        output += body.charAt(0).toLowerCase() + body.slice(1);

        // 4. CIERRE HUMANO (Evita el "Efecto Espejo")
        if (mode === 'whatsapp') {
            output = output.toLowerCase().replace(/\./g, "") + "... dime qué te parece";
        } else if (mode === 'curioso') {
            output += " Piénsalo un poco, creo que tiene sentido.";
        }

        return res.status(200).json({ humanizedText: output.trim() });

    } catch (error) {
        return res.status(500).json({ error: "Fallo en el núcleo" });
    }
}
