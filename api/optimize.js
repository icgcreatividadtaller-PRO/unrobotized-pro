export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Error' });

    try {
        const { text, mode } = req.body;
        if (!text) return res.status(400).json({ error: 'Vacío' });

        // 1. REEMPLAZOS AGRESIVOS (Humanización de Laguna Labs)
        let result = text
            .replace(/en resumen/gi, "al final del día")
            .replace(/específicamente/gi, "sobre todo")
            .replace(/no es la más indicada/gi, "no te ayuda nada")
            .replace(/está matando tus ventas/gi, "te está hundiendo las ventas")
            .replace(/de mejor calidad/gi, "que se vea mejor")
            .replace(/adicionalmente/gi, "por otro lado")
            .replace(/proporcionar/gi, "darte")
            .replace(/fundamental/gi, "clave")
            .replace(/actualmente/gi, "hoy mismo")
            .replace(/con el fin de/gi, "para")
            .replace(/implementar/gi, "lanzar")
            .replace(/notificar/gi, "avisar");

        // 2. CAMBIOS SEGÚN EL BOTÓN (MODO)
        if (mode === 'whatsapp') {
            result = "Oye, " + result.toLowerCase().replace(/\./g, "") + "... avisame que te parece";
        } else if (mode === 'curioso') {
            result = "¿Te has fijado que " + result.charAt(0).toLowerCase() + result.slice(1) + "? Piénsalo.";
        } else {
            // MODO DIRECTO: Asegura que el mensaje empiece con fuerza
            if (!result.startsWith("Mira,")) result = "Mira, " + result;
        }

        // 3. SEGURO DE VIDA: Si por alguna razón el texto sigue igual, forzamos un cambio humano
        if (result.trim() === text.trim()) {
            result = "La verdad es que " + text.charAt(0).toLowerCase() + text.slice(1);
        }

        return res.status(200).json({ humanizedText: result.trim() });

    } catch (error) {
        return res.status(500).json({ error: "Fallo" });
    }
}
