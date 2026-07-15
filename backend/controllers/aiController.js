import Product from "../models/Product.js";
import {
  generateResponse,
  clearConversation,
} from "../services/geminiService.js";
import {
  semanticSearch,
  isAvailable as isVectorStoreAvailable,
} from "../services/vectorStore.js";
import crypto from "crypto";

// Cache ChromaDB availability status (re-check every 60s)
let vectorStoreAvailable = null;
let lastAvailabilityCheck = 0;
const AVAILABILITY_CHECK_INTERVAL = 60_000;

async function checkVectorStore() {
  const now = Date.now();
  if (
    vectorStoreAvailable !== null &&
    now - lastAvailabilityCheck < AVAILABILITY_CHECK_INTERVAL
  ) {
    return vectorStoreAvailable;
  }

  vectorStoreAvailable = await isVectorStoreAvailable();
  lastAvailabilityCheck = now;

  if (!vectorStoreAvailable) {
    console.warn(
      "⚠️  ChromaDB unavailable — falling back to MongoDB keyword search"
    );
  }

  return vectorStoreAvailable;
}

/**
 * @desc    Chat with AI shopping assistant
 * @route   POST /api/ai/chat
 * @access  Public
 */
export const chat = async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    // Validation
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        message: "Message is required and must be a non-empty string",
      });
    }

    if (message.trim().length > 500) {
      return res.status(400).json({
        message: "Message cannot exceed 500 characters",
      });
    }

    const trimmedMessage = message.trim();

    // Use provided conversationId or generate a new one
    const activeConversationId = conversationId || crypto.randomUUID();

    // Retrieve products via semantic search (ChromaDB) or fallback (MongoDB)
    const retrievalStart = Date.now();
    let products = [];
    let retrievalMethod = "none";

    const useVectorStore = await checkVectorStore();

    if (useVectorStore) {
      // ── Semantic Retrieval via ChromaDB ──
      try {
        // Build optional metadata filter for price constraints
        const priceFilter = extractPriceFilter(trimmedMessage);
        const whereFilter = buildWhereFilter(priceFilter);

        const results = await semanticSearch(trimmedMessage, 10, whereFilter);

        if (results.ids.length > 0) {
          // Fetch full product documents from MongoDB by the IDs returned from ChromaDB
          const productIds = results.ids;
          const distances = results.distances;

          products = await Product.find({
            _id: { $in: productIds },
            stock: { $gt: 0 },
          })
            .select(
              "name description price brand category material color stock images rating numReviews"
            )
            .lean();

          // Attach similarity scores and sort by distance (lower = more similar)
          const distanceMap = {};
          productIds.forEach((id, i) => {
            distanceMap[id] = distances[i];
          });

          products = products
            .map((p) => ({
              ...p,
              _similarity: 1 - (distanceMap[p._id.toString()] || 1),
            }))
            .sort((a, b) => b._similarity - a._similarity);

          retrievalMethod = "semantic";
        }
      } catch (vectorError) {
        console.error("Vector search error:", vectorError.message);
        // Fall through to MongoDB fallback
      }
    }

    // ── Fallback: MongoDB keyword search ──
    if (products.length === 0) {
      try {
        const query = buildProductQuery(trimmedMessage);
        products = await Product.find(query)
          .select(
            "name description price brand category material color stock images rating numReviews"
          )
          .sort({ rating: -1, numReviews: -1 })
          .limit(20)
          .lean();

        if (products.length > 0) {
          retrievalMethod = "keyword";
        }
      } catch (dbError) {
        console.error("Product query error:", dbError);
      }
    }

    const retrievalTime = Date.now() - retrievalStart;

    // Generate AI response with retrieved product context
    const generationStart = Date.now();
    const aiResponse = await generateResponse(
      trimmedMessage,
      products,
      activeConversationId
    );
    const generationTime = Date.now() - generationStart;

    // Resolve product IDs to full product objects
    let recommendedProducts = [];
    if (aiResponse.productIds && aiResponse.productIds.length > 0) {
      recommendedProducts = products.filter((p) =>
        aiResponse.productIds.includes(p._id.toString())
      );
    }

    // Remove internal fields before sending to client
    recommendedProducts = recommendedProducts.map(
      ({ _similarity, ...product }) => product
    );

    res.json({
      success: true,
      message: aiResponse.message,
      products: recommendedProducts,
      conversationId: activeConversationId,
      _debug: {
        retrievalMethod,
        retrievalTimeMs: retrievalTime,
        generationTimeMs: generationTime,
        totalTimeMs: retrievalTime + generationTime,
        candidateProducts: products.length,
        recommendedProducts: recommendedProducts.length,
      },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({
      message: error.message || "Failed to process your request",
    });
  }
};

/**
 * @desc    Clear conversation history
 * @route   DELETE /api/ai/chat/:conversationId
 * @access  Public
 */
export const clearChat = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({
        message: "Conversation ID is required",
      });
    }

    clearConversation(conversationId);

    res.json({
      success: true,
      message: "Conversation cleared",
    });
  } catch (error) {
    console.error("Clear chat error:", error);
    res.status(500).json({
      message: "Failed to clear conversation",
    });
  }
};

/**
 * Extract price constraints from user message (for ChromaDB where-filter).
 * Returns { min, max } or null.
 */
function extractPriceFilter(message) {
  const lowerMsg = message.toLowerCase();

  // "under X" / "below X"
  const underMatch = lowerMsg.match(
    /(?:under|below|less than|upto|up to|within|max|maximum)\s*₹?\s*([\d,]+)/
  );
  if (underMatch) {
    return { max: Number(underMatch[1].replace(/,/g, "")) };
  }

  // "X to Y" range
  const rangeMatch = lowerMsg.match(
    /₹?\s*([\d,]+)\s*(?:to|-|–)\s*₹?\s*([\d,]+)/
  );
  if (rangeMatch) {
    return {
      min: Number(rangeMatch[1].replace(/,/g, "")),
      max: Number(rangeMatch[2].replace(/,/g, "")),
    };
  }

  // "above X" / "over X"
  const aboveMatch = lowerMsg.match(
    /(?:above|over|more than|min|minimum|starting|from)\s*₹?\s*([\d,]+)/
  );
  if (aboveMatch) {
    return { min: Number(aboveMatch[1].replace(/,/g, "")) };
  }

  // Qualitative keywords
  if (/\b(cheap|affordable|budget|inexpensive|economical)\b/.test(lowerMsg)) {
    return { max: 5000 };
  }
  if (
    /\b(expensive|luxury|premium|high[ -]?end|designer)\b/.test(lowerMsg)
  ) {
    return { min: 15000 };
  }

  return null;
}

/**
 * Build a ChromaDB metadata where-filter from extracted price constraints.
 */
function buildWhereFilter(priceFilter) {
  if (!priceFilter) return null;

  const conditions = [];

  // Always filter for in-stock products
  conditions.push({ stock: { $gt: 0 } });

  if (priceFilter.min !== undefined && priceFilter.max !== undefined) {
    conditions.push({ price: { $gte: priceFilter.min } });
    conditions.push({ price: { $lte: priceFilter.max } });
  } else if (priceFilter.max !== undefined) {
    conditions.push({ price: { $lte: priceFilter.max } });
  } else if (priceFilter.min !== undefined) {
    conditions.push({ price: { $gte: priceFilter.min } });
  }

  if (conditions.length === 1) return conditions[0];
  return { $and: conditions };
}

/**
 * Fallback: Build a MongoDB query from the user message.
 * Used when ChromaDB is unavailable.
 */
function buildProductQuery(message) {
  const query = {};
  const lowerMsg = message.toLowerCase();

  // Category detection
  const categoryMap = {
    handbag: "Handbag",
    "hand bag": "Handbag",
    "shoulder bag": "Shoulder Bag",
    shoulder: "Shoulder Bag",
    crossbody: "Crossbody",
    "cross body": "Crossbody",
    "sling bag": "Crossbody",
    sling: "Crossbody",
    tote: "Tote",
    clutch: "Clutch",
    clutches: "Clutch",
  };

  for (const [keyword, category] of Object.entries(categoryMap)) {
    if (lowerMsg.includes(keyword)) {
      query.category = category;
      break;
    }
  }

  // Material detection
  const materialMap = {
    leather: "Leather",
    "vegan leather": "Vegan Leather",
    "faux leather": "Vegan Leather",
    canvas: "Canvas",
    suede: "Suede",
    nylon: "Nylon",
    "exotic leather": "Exotic Leather",
    exotic: "Exotic Leather",
    croc: "Exotic Leather",
    crocodile: "Exotic Leather",
    python: "Exotic Leather",
  };

  const sortedMaterials = Object.entries(materialMap).sort(
    (a, b) => b[0].length - a[0].length
  );
  for (const [keyword, material] of sortedMaterials) {
    if (lowerMsg.includes(keyword)) {
      query.material = material;
      break;
    }
  }

  // Color detection
  const colors = [
    "black", "brown", "tan", "beige", "white", "red", "blue",
    "navy", "green", "pink", "purple", "grey", "gray", "gold",
    "silver", "camel", "cognac", "burgundy", "cream", "maroon",
    "olive", "orange", "yellow",
  ];

  for (const color of colors) {
    if (lowerMsg.includes(color)) {
      query.color = { $regex: color, $options: "i" };
      break;
    }
  }

  // Price filters
  const priceFilter = extractPriceFilter(message);
  if (priceFilter) {
    query.price = {};
    if (priceFilter.min !== undefined) query.price.$gte = priceFilter.min;
    if (priceFilter.max !== undefined) query.price.$lte = priceFilter.max;
  }

  // Text search fallback
  if (Object.keys(query).length === 0) {
    query.$text = { $search: message };
  }

  query.stock = { $gt: 0 };
  return query;
}
