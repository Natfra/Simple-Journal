/**
 * Servicio para interactuar con la API de Gemini para generar contenido de texto.
 * Utiliza el modelo gemini-2.5-flash-preview-09-2025 con conexión a Google Search.
 */

// Importamos el módulo 'expo-constants' para acceder a las variables de entorno.
import Constants from 'expo-constants';

// Leemos la clave de API desde el archivo .env, que debe estar definida como EXPO_PUBLIC_GEMINI_API_KEY.
// El entorno Canvas o la configuración de Expo se encargará de inyectar el valor.
const API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_GEMINI_API_KEY || ""; 

// Si la clave no se encuentra, se mostrará un error para alertar al desarrollador.
if (!API_KEY) {
    console.error("ADVERTENCIA: La clave de la API de Gemini no se ha cargado. Verifica tu archivo .env.");
}

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;
const MAX_RETRIES = 3;

interface GemeniResponse {
    text: string;
    sources: { uri: string; title: string }[];
}

/**
 * Función para realizar llamadas a la API de Gemini con reintentos (exponential backoff).
 * @param prompt La pregunta o instrucción del usuario.
 * @param systemInstruction Instrucción para guiar el comportamiento del modelo (opcional).
 * @param useSearchGrounding Si es true, usa Google Search para información actualizada.
 * @returns Un objeto con el texto generado y las fuentes (si se usó grounding).
 */
export async function generateGeminiContent(
    prompt: string,
    systemInstruction: string = "Actúa como un asistente creativo y conciso de un diario personal. Genera una respuesta útil, motivadora, o un resumen de la entrada solicitada.",
    useSearchGrounding: boolean = false
): Promise<GemeniResponse> {
    
    // Si la clave de API no está, lanzamos un error inmediatamente para no hacer la llamada.
    if (!API_KEY) {
        throw new Error("La clave de API de Gemini no está configurada. Revisa el archivo .env.");
    }

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        // Usamos Google Search para grounding si es necesario (información actualizada)
        tools: useSearchGrounding ? [{ "google_search": {} }] : undefined,
        systemInstruction: {
            parts: [{ text: systemInstruction }]
        },
        config: {
            // Aseguramos que la respuesta sea relevante y oportuna
            temperature: 0.6, 
        }
    };

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s

        if (attempt > 0) {
            console.log(`Reintento ${attempt + 1}/${MAX_RETRIES} después de ${delay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Verificar si la respuesta HTTP fue exitosa
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Error HTTP ${response.status}: ${errorBody}`);
            }

            const result = await response.json();
            const candidate = result.candidates?.[0];

            if (candidate && candidate.content?.parts?.[0]?.text) {
                // 1. Extraer el texto generado
                const text = candidate.content.parts[0].text;
                let sources = [];

                // 2. Extraer fuentes si se usó grounding
                const groundingMetadata = candidate.groundingMetadata;
                if (groundingMetadata && groundingMetadata.groundingAttributions) {
                    sources = groundingMetadata.groundingAttributions
                        .map((attribution: any) => ({
                            uri: attribution.web?.uri,
                            title: attribution.web?.title,
                        }))
                        .filter(source => source.uri && source.title);
                }

                return { text, sources };

            } else {
                throw new Error("Respuesta de la API incompleta o sin contenido.");
            }

        } catch (error: any) {
            console.error(`Error en intento ${attempt + 1}:`, error.message);
            lastError = error;
        }
    }

    // Si todos los reintentos fallaron
    throw new Error(`Fallo al generar contenido después de ${MAX_RETRIES} intentos. Último error: ${lastError?.message || "Desconocido"}`);
}