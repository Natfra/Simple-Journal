// services/geminiService.ts
/**
 * Servicio para interactuar con la API de Gemini para generar contenido de texto.
 * Utiliza el modelo gemini-2.5-flash-preview-09-2025 con conexión a Google Search.
 */

// ✅ FORMA CORRECTA: Leer desde process.env (NO desde Constants.expoConfig)
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

// Validación de la API Key
if (!API_KEY) {
  console.error("❌ ADVERTENCIA: La clave de la API de Gemini no se ha cargado.");
  console.error("📝 Verifica que existe el archivo .env con EXPO_PUBLIC_GEMINI_API_KEY");
} else {
  console.log("✅ API Key de Gemini cargada correctamente");
  console.log("🔑 Primeros caracteres:", API_KEY.substring(0, 10) + "...");
}

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;
const MAX_RETRIES = 3;

export interface GeminiResponse {
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
): Promise<GeminiResponse> {
  
  // Validar que la API key esté configurada
  if (!API_KEY) {
    throw new Error(
      "La clave de API de Gemini no está configurada. " +
      "Asegúrate de tener un archivo .env con EXPO_PUBLIC_GEMINI_API_KEY"
    );
  }

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    // Usamos Google Search para grounding si es necesario (información actualizada)
    tools: useSearchGrounding ? [{ google_search: {} }] : undefined,
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000,
    },
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s

    if (attempt > 0) {
      console.log(`🔄 Reintento ${attempt + 1}/${MAX_RETRIES} después de ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Verificar si la respuesta HTTP fue exitosa
      if (!response.ok) {
        const errorBody = await response.text();
        
        // Manejo de errores específicos
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "API Key inválida o sin permisos. Verifica tu EXPO_PUBLIC_GEMINI_API_KEY"
          );
        }
        if (response.status === 429) {
          throw new Error("Límite de API excedido. Espera un momento e intenta de nuevo.");
        }
        if (response.status === 400) {
          console.error("Error 400 - Body:", errorBody);
          throw new Error("Solicitud mal formada. Verifica el prompt.");
        }
        
        throw new Error(`Error HTTP ${response.status}: ${errorBody}`);
      }

      const result = await response.json();
      const candidate = result.candidates?.[0];

      if (candidate && candidate.content?.parts?.[0]?.text) {
        // 1. Extraer el texto generado
        const text = candidate.content.parts[0].text;
        let sources: { uri: string; title: string }[] = [];

        // 2. Extraer fuentes si se usó grounding
        const groundingMetadata = candidate.groundingMetadata;
        if (groundingMetadata?.groundingAttributions) {
          sources = groundingMetadata.groundingAttributions
            .map((attribution: any) => ({
              uri: attribution.web?.uri || "",
              title: attribution.web?.title || "",
            }))
            .filter((source: any) => source.uri && source.title);
        }

        console.log("✅ Contenido generado exitosamente por Gemini");
        return { text, sources };
      } else {
        throw new Error("Respuesta de la API incompleta o sin contenido.");
      }
    } catch (error: any) {
      console.error(`❌ Error en intento ${attempt + 1}:`, error.message);
      lastError = error;

      // Si es un error de autenticación, no reintentar
      if (error.message.includes("API Key inválida") || error.message.includes("sin permisos")) {
        throw error;
      }
    }
  }

  // Si todos los reintentos fallaron
  throw new Error(
    `Fallo al generar contenido después de ${MAX_RETRIES} intentos. ` +
    `Último error: ${lastError?.message || "Desconocido"}`
  );
}