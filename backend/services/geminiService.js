import { GoogleGenAI } from "@google/genai";

// In-memory conversation store (conversationId -> messages[])
const conversations = new Map();

// Conversation TTL: 30 minutes
const CONVERSATION_TTL = 30 * 60 * 1000;

/**
 * Initialize the Gemini client
 */
const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * System prompt that teaches Gemini about Valentique
 */
const SYSTEM_PROMPT = `You are Valentique's AI Shopping Assistant — a friendly, knowledgeable luxury bag concierge.

ABOUT VALENTIQUE:
- Premium luxury bag e-commerce store based in India
- Categories: Handbag, Shoulder Bag, Crossbody, Tote, Clutch
- Materials: Leather, Vegan Leather, Canvas, Suede, Nylon, Exotic Leather
- Price range: ₹1,000 to ₹50,000+ (Indian Rupees)
- All prices are in Indian Rupees (₹)

YOUR ROLE:
- Help customers find the perfect bag based on their needs, style preferences, budget, and occasion
- Provide product recommendations from the available catalog (provided as context)
- Answer questions about materials, care, styling tips, and bag features
- Be warm, conversational, and genuinely helpful — like a personal shopper at a luxury boutique
- If no products match the customer's request, suggest alternatives or ask clarifying questions

RESPONSE FORMAT:
You MUST respond with valid JSON in this exact format:
{
  "message": "Your conversational response here. Use markdown for formatting (bold, lists, etc). Keep it concise but helpful.",
  "productIds": ["id1", "id2", "id3"]
}

RULES:
- "productIds" should contain MongoDB _id strings of recommended products from the provided catalog
- Only include products that are genuinely relevant to the user's query
- Maximum 5 product recommendations per response
- If the query is general conversation (greetings, thanks, etc.) or not product-related, return an empty productIds array
- Never fabricate product details — only reference products from the provided catalog
- Format prices with ₹ symbol and comma separators (e.g., ₹17,499)
- Always respond in the same language the user writes in`;

/**
 * Build product context string from MongoDB products
 */
const buildProductContext = (products) => {
  if (!products || products.length === 0) {
    return "No products currently match this query in the catalog.";
  }

  return products
    .map(
      (p) =>
        `[ID: ${p._id}] ${p.name} | Brand: ${p.brand} | Category: ${p.category} | Material: ${p.material} | Color: ${p.color} | Price: ₹${p.price.toLocaleString("en-IN")} | Stock: ${p.stock > 0 ? `${p.stock} available` : "Out of stock"} | Rating: ${p.rating}/5 (${p.numReviews} reviews)`
    )
    .join("\n");
};

/**
 * Get or create a conversation history
 */
const getConversation = (conversationId) => {
  if (conversations.has(conversationId)) {
    const conv = conversations.get(conversationId);
    // Check if conversation has expired
    if (Date.now() - conv.lastAccessed > CONVERSATION_TTL) {
      conversations.delete(conversationId);
      return { messages: [], lastAccessed: Date.now() };
    }
    conv.lastAccessed = Date.now();
    return conv;
  }
  return { messages: [], lastAccessed: Date.now() };
};

/**
 * Periodically clean up expired conversations
 */
setInterval(() => {
  const now = Date.now();
  for (const [id, conv] of conversations) {
    if (now - conv.lastAccessed > CONVERSATION_TTL) {
      conversations.delete(id);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

/**
 * Generate AI response using Gemini
 * @param {string} userMessage - The user's message
 * @param {Array} products - Relevant products from MongoDB
 * @param {string} conversationId - Unique conversation identifier
 * @returns {Object} { message: string, productIds: string[] }
 */
export const generateResponse = async (
  userMessage,
  products,
  conversationId
) => {
  const client = getClient();

  // Get conversation history
  const conversation = getConversation(conversationId);

  // Build the product context for this turn
  const productContext = buildProductContext(products);

  // Build the user message with product context
  const contextualMessage = `AVAILABLE PRODUCTS IN CATALOG:
${productContext}

CUSTOMER MESSAGE:
${userMessage}`;

  // Build the full message history for Gemini
  const contents = [];

  // Add conversation history (last 10 turns to stay within token limits)
  const recentMessages = conversation.messages.slice(-10);
  for (const msg of recentMessages) {
    contents.push({
      role: msg.role,
      parts: [{ text: msg.text }],
    });
  }

  // Add the current user message
  contents.push({
    role: "user",
    parts: [{ text: contextualMessage }],
  });

  // Model fallback chain — each model has its own separate daily quota on the free tier
  const MODELS = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-2.0-flash"];

  for (let modelIdx = 0; modelIdx < MODELS.length; modelIdx++) {
    const modelName = MODELS[modelIdx];

    // Retry up to 2 times per model (with backoff for per-minute limits)
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(
          `🤖 Generating with ${modelName} (attempt ${attempt})...`
        );

        const response = await client.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.7,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
          },
        });

        const rawText = response.text?.trim() || "";

        // Parse the JSON response from Gemini
        let parsed;
        try {
          // Extract JSON from potential markdown code fences
          const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
          const jsonStr = jsonMatch ? jsonMatch[1].trim() : rawText;
          parsed = JSON.parse(jsonStr);
        } catch {
          // If Gemini didn't return valid JSON, wrap the raw text
          parsed = {
            message: rawText,
            productIds: [],
          };
        }

        // Validate the parsed response
        const result = {
          message:
            typeof parsed.message === "string"
              ? parsed.message
              : "I apologize, I had trouble processing that. Could you rephrase your question?",
          productIds: Array.isArray(parsed.productIds)
            ? parsed.productIds.filter((id) => typeof id === "string")
            : [],
        };

        // Save conversation history (store a simplified version of the user message)
        conversation.messages.push({
          role: "user",
          text: userMessage, // Store only the user message, not the product context
        });
        conversation.messages.push({
          role: "model",
          text: JSON.stringify(result),
        });
        conversation.lastAccessed = Date.now();
        conversations.set(conversationId, conversation);

        console.log(`✅ Response generated with ${modelName}`);
        return result;
      } catch (error) {
        const isDailyQuota =
          error.status === 429 &&
          error.message?.includes("PerDay");

        // If it's a daily quota issue, skip retries and move to next model immediately
        if (isDailyQuota) {
          console.warn(
            `⚠️  ${modelName} daily quota exhausted, trying next model...`
          );
          break; // Break inner retry loop, move to next model
        }

        // For per-minute rate limits, wait and retry on same model
        if (error.status === 429 && attempt < 2) {
          let waitMs = 30000; // Default 30s
          try {
            const retryMatch = error.message?.match(/retry in ([\d.]+)s/i);
            if (retryMatch) {
              waitMs =
                Math.ceil(parseFloat(retryMatch[1]) * 1000) + 1000;
            }
          } catch {
            // Use default
          }

          console.warn(
            `⚠️  ${modelName} rate-limited (per-minute), retrying in ${Math.round(waitMs / 1000)}s...`
          );
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          continue;
        }

        // Non-retryable error or final attempt on final model
        if (modelIdx === MODELS.length - 1) {
          console.error("Gemini API error:", error);

          if (error.status === 429) {
            throw new Error(
              "AI service is temporarily busy. Please try again in a few minutes."
            );
          }
          if (error.status === 403) {
            throw new Error(
              "AI service authentication failed. Please check API key."
            );
          }

          throw new Error(
            "Failed to generate AI response. Please try again."
          );
        }

        // Move to next model
        console.warn(
          `⚠️  ${modelName} failed, trying next model...`
        );
        break;
      }
    }
  }

  // If we get here, all models failed (most likely all daily quotas exhausted)
  throw new Error(
    "All AI models are temporarily unavailable. Please try again later."
  );
};

/**
 * Clear a conversation from memory
 */
export const clearConversation = (conversationId) => {
  conversations.delete(conversationId);
};
