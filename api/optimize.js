export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Error' });

    try {
        const { text, mode } = req.body;
        if (!text) return res.status(400).json({ error: 'Vacío' });

        // MOTOR DE CALIDEZ LAGUNA LABS (Restaurado)
        let result = text
            // Cambiamos Frialdad por Calidez Motivadora
            .replace(/estimado cliente/gi, "¡Hola! Qué bueno saludarte")
            .replace(/por medio de la presente/gi, "Te escribo porque")
            .replace(/le escribo para/gi, "quiero contarte que")
            .replace(/notificarle/gi, "darte una gran noticia")
            .replace(/poseemos/gi, "tenemos para ti")
            .replace(/específicamente/gi, "especialmente")
            .replace(/proporcionar/gi, "darte")
            .replace(/fundamental/gi, "clave")
            .replace(/implementar/gi, "empezar con")
            .replace(/actualmente/gi, "hoy mismo")
            .replace(/determinar/gi, "asegurar")
            .replace(/está matando/gi, "está frenando")
            .replace(/de mejor calidad/gi, "de otro nivel")
            .replace(/no es la más indicada/gi, "no es la que te mereces");

        // Ajuste por Modo (Sin añadir "paja" extra)
        if (mode === 'whatsapp') {
            result = "¡Oye! " + result.replace(/!/g, "") + " 🚀";
        } else if (mode === 'curioso') {
            result = "¿Sabías que " + result.charAt(0).toLowerCase() + result.slice(1) + "?";
        } else {
            // MODO DIRECTO: Mantiene la fuerza y calidez
            if (!result.includes("¡")) result = "¡Mira! " + result;
        }

        return res.status(200).json({ 
            humanizedText: result.trim() 
        });

    } catch (error) {
        return res.status(500).json({ error: "Fallo" });
    }
}
