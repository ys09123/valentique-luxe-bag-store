import { ChromaClient } from "chromadb";
import { embedText, buildProductText } from "./embeddingService.js";

const COLLECTION_NAME = "valentique_products";

// Singleton ChromaDB client
let chromaClient = null;
let collection = null;
let initPromise = null;

/**
 * Initialize ChromaDB client and get/create the product collection.
 * Uses Gemini embeddings (provided externally), not Chroma's default embedder.
 */
async function initChroma() {
  if (collection) return collection;

  // Prevent multiple simultaneous initializations
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const chromaUrl = process.env.CHROMA_URL || "http://localhost:8000";

    try {
      // Parse URL into host/port for the new ChromaDB client API
      const url = new URL(chromaUrl);
      chromaClient = new ChromaClient({
        host: url.hostname,
        port: parseInt(url.port) || 8000,
        ssl: url.protocol === "https:",
      });

      // Heartbeat check
      await chromaClient.heartbeat();
      console.log(`✅ ChromaDB connected at ${chromaUrl}`);

      // Get or create collection (no default embedding function — we supply our own via Gemini)
      collection = await chromaClient.getOrCreateCollection({
        name: COLLECTION_NAME,
        metadata: {
          description: "Valentique product embeddings via Gemini gemini-embedding-001",
          "hnsw:space": "cosine",
        },
        embeddingFunction: null,
      });

      const count = await collection.count();
      console.log(`📊 ChromaDB collection "${COLLECTION_NAME}" has ${count} documents`);

      return collection;
    } catch (error) {
      console.error("❌ ChromaDB connection failed:", error.message);
      console.error("   Make sure ChromaDB is running: docker run -p 8000:8000 chromadb/chroma");
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

/**
 * Check if ChromaDB is available and connected
 */
export async function isAvailable() {
  try {
    await initChroma();
    return true;
  } catch {
    return false;
  }
}

/**
 * Upsert a single product into the vector store.
 *
 * @param {Object} product - Mongoose product document (lean)
 * @param {number[]} embedding - Pre-computed embedding vector
 */
export async function upsertProduct(product, embedding) {
  const col = await initChroma();

  const id = product._id.toString();
  const text = buildProductText(product);

  await col.upsert({
    ids: [id],
    embeddings: [embedding],
    documents: [text],
    metadatas: [
      {
        name: product.name,
        brand: product.brand,
        category: product.category,
        material: product.material,
        color: product.color,
        price: product.price,
        stock: product.stock,
        rating: product.rating || 0,
      },
    ],
  });
}

/**
 * Upsert multiple products in batch.
 *
 * @param {Object[]} products - Array of product documents
 * @param {number[][]} embeddings - Array of embedding vectors
 */
export async function upsertProducts(products, embeddings) {
  const col = await initChroma();

  const ids = products.map((p) => p._id.toString());
  const documents = products.map((p) => buildProductText(p));
  const metadatas = products.map((p) => ({
    name: p.name,
    brand: p.brand,
    category: p.category,
    material: p.material,
    color: p.color,
    price: p.price,
    stock: p.stock,
    rating: p.rating || 0,
  }));

  await col.upsert({
    ids,
    embeddings,
    documents,
    metadatas,
  });
}

/**
 * Semantic search: embed the query and find the top-k most similar products.
 *
 * @param {string} query - User's natural language query
 * @param {number} topK - Number of results to return (default 10)
 * @param {Object} whereFilter - Optional ChromaDB metadata filter
 * @returns {Object} { ids, distances, metadatas, documents }
 */
export async function semanticSearch(query, topK = 10, whereFilter = null) {
  const col = await initChroma();

  // Embed the user query
  const queryEmbedding = await embedText(query);

  const searchParams = {
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
  };

  // Apply metadata filters (e.g., stock > 0, price range)
  if (whereFilter) {
    searchParams.where = whereFilter;
  }

  const results = await col.query(searchParams);

  return {
    ids: results.ids?.[0] || [],
    distances: results.distances?.[0] || [],
    metadatas: results.metadatas?.[0] || [],
    documents: results.documents?.[0] || [],
  };
}

/**
 * Remove a product from the vector store
 */
export async function removeProduct(productId) {
  const col = await initChroma();
  await col.delete({ ids: [productId.toString()] });
}

/**
 * Get the total document count in the collection
 */
export async function getCount() {
  const col = await initChroma();
  return col.count();
}

/**
 * Clear the entire collection and recreate it
 */
export async function resetCollection() {
  try {
    await chromaClient.deleteCollection({ name: COLLECTION_NAME });
  } catch {
    // Collection might not exist
  }

  collection = null;
  initPromise = null;

  await initChroma();
}
