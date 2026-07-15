import { GoogleGenAI } from "@google/genai";

// Singleton client
let client = null;

const getClient = () => {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
};

/**
 * Build a rich text representation of a product for embedding.
 * This text captures all semantically meaningful attributes so the
 * vector encodes style, occasion, material, color, price tier, etc.
 */
export function buildProductText(product) {
  const priceTier =
    product.price >= 20000
      ? "premium luxury high-end expensive"
      : product.price >= 10000
        ? "mid-range moderate"
        : "affordable budget-friendly economical";

  const lines = [
    product.name,
    product.description,
    `Brand: ${product.brand}`,
    `Category: ${product.category}`,
    `Material: ${product.material}`,
    `Color: ${product.color}`,
    `Price: ₹${product.price.toLocaleString("en-IN")} (${priceTier})`,
  ];

  if (product.rating > 0) {
    lines.push(
      `Rating: ${product.rating}/5 with ${product.numReviews} reviews`
    );
  }

  return lines.join(". ");
}

/**
 * Generate an embedding for a single text string using Gemini.
 * Includes retry logic for transient network errors.
 *
 * @param {string} text - The text to embed
 * @param {number} maxRetries - Max retry attempts (default 3)
 * @returns {number[]} The embedding vector
 */
export async function embedText(text, maxRetries = 3) {
  const ai = getClient();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: text,
      });

      return response.embeddings[0].values;
    } catch (error) {
      const isRetryable =
        error.code === "ECONNRESET" ||
        error.message?.includes("terminated") ||
        error.status === 429 ||
        error.status === 503;

      if (isRetryable && attempt < maxRetries) {
        const backoff = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.warn(
          `   ⚠️  Embed attempt ${attempt} failed (${error.code || error.status || "unknown"}), retrying in ${backoff}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, backoff));
        continue;
      }
      throw error;
    }
  }
}

/**
 * Batch-embed multiple texts. Processes them one at a time to
 * respect Gemini rate limits. Adds a delay between calls.
 *
 * @param {string[]} texts - Array of texts to embed
 * @param {number} delayMs - Delay between calls in ms (default 500)
 * @returns {number[][]} Array of embedding vectors
 */
export async function embedBatch(texts, delayMs = 500) {
  const embeddings = [];

  for (let i = 0; i < texts.length; i++) {
    const embedding = await embedText(texts[i]);
    embeddings.push(embedding);

    // Delay between calls to respect rate limits
    if (i < texts.length - 1 && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return embeddings;
}
