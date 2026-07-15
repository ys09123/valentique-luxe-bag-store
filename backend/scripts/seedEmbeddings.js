/**
 * Seed Embeddings Script
 *
 * Generates Gemini embeddings for all products in MongoDB
 * and upserts them into ChromaDB for semantic search.
 *
 * Usage:
 *   node scripts/seedEmbeddings.js             # Seed all products
 *   node scripts/seedEmbeddings.js --reset      # Clear collection and re-seed
 *
 * Prerequisites:
 *   1. MongoDB must be accessible (MONGO_URI in .env)
 *   2. ChromaDB must be running (default: http://localhost:8000)
 *   3. GEMINI_API_KEY must be set in .env
 *
 * Start ChromaDB:
 *   docker run -d -p 8000:8000 --name chromadb chromadb/chroma
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import { buildProductText, embedBatch } from "../services/embeddingService.js";
import {
  upsertProducts,
  getCount,
  resetCollection,
  isAvailable,
} from "../services/vectorStore.js";

dotenv.config();

const BATCH_SIZE = 10; // Products per batch (keeps Gemini rate-limit-safe)

async function seed() {
  const startTime = Date.now();
  const args = process.argv.slice(2);
  const shouldReset = args.includes("--reset");

  console.log("╔══════════════════════════════════════════════╗");
  console.log("║   Valentique — Product Embedding Seeder      ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  // 1. Connect to MongoDB
  console.log("📦 Connecting to MongoDB...");
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("   ✅ MongoDB connected\n");
  } catch (err) {
    console.error("   ❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }

  // 2. Check ChromaDB
  console.log("🔍 Checking ChromaDB...");
  const chromaReady = await isAvailable();
  if (!chromaReady) {
    console.error("   ❌ ChromaDB is not running.");
    console.error("   Start it with: docker run -d -p 8000:8000 --name chromadb chromadb/chroma\n");
    process.exit(1);
  }
  console.log("   ✅ ChromaDB is ready\n");

  // 3. Optionally reset collection
  if (shouldReset) {
    console.log("🗑️  Resetting collection...");
    await resetCollection();
    console.log("   ✅ Collection cleared\n");
  }

  // 4. Fetch all products
  console.log("📦 Fetching products from MongoDB...");
  const products = await Product.find({}).lean();
  console.log(`   Found ${products.length} products\n`);

  if (products.length === 0) {
    console.log("⚠️  No products to embed. Exiting.");
    await mongoose.disconnect();
    process.exit(0);
  }

  // 5. Process in batches
  let totalEmbedded = 0;
  let totalBatches = Math.ceil(products.length / BATCH_SIZE);
  const embeddingTimes = [];

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    console.log(
      `⚡ Batch ${batchNum}/${totalBatches} — Embedding ${batch.length} products...`
    );

    // Build texts
    const texts = batch.map((p) => buildProductText(p));

    // Generate embeddings
    const embedStart = Date.now();
    const embeddings = await embedBatch(texts, 150); // 150ms delay between API calls
    const embedDuration = Date.now() - embedStart;
    embeddingTimes.push(embedDuration);

    console.log(`   📐 Embeddings generated in ${embedDuration}ms`);

    // Upsert into ChromaDB
    const upsertStart = Date.now();
    await upsertProducts(batch, embeddings);
    const upsertDuration = Date.now() - upsertStart;

    console.log(`   💾 Upserted into ChromaDB in ${upsertDuration}ms`);

    totalEmbedded += batch.length;
    console.log(
      `   ✅ Progress: ${totalEmbedded}/${products.length} products\n`
    );
  }

  // 6. Verify
  const finalCount = await getCount();
  const totalTime = Date.now() - startTime;
  const avgEmbedTime =
    embeddingTimes.reduce((a, b) => a + b, 0) / embeddingTimes.length;

  console.log("╔══════════════════════════════════════════════╗");
  console.log("║              SEEDING COMPLETE                ║");
  console.log("╠══════════════════════════════════════════════╣");
  console.log(`║  Products embedded:  ${String(totalEmbedded).padEnd(24)}║`);
  console.log(`║  ChromaDB documents: ${String(finalCount).padEnd(24)}║`);
  console.log(`║  Total time:         ${String(totalTime + "ms").padEnd(24)}║`);
  console.log(`║  Avg batch embed:    ${String(Math.round(avgEmbedTime) + "ms").padEnd(24)}║`);
  console.log(`║  Avg per product:    ${String(Math.round(totalTime / totalEmbedded) + "ms").padEnd(24)}║`);
  console.log("╚══════════════════════════════════════════════╝");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("\n💥 Fatal error:", err);
  process.exit(1);
});
