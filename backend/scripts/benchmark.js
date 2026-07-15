/**
 * Benchmark: Semantic Search vs Keyword Search
 * Tests the AI chat endpoint with example queries and reports timing data.
 */

const queries = [
  "office bags for executives",
  "luxury gifts for women",
  "minimalist black handbags",
  "Show me leather crossbody bags under 15000",
  "something elegant for a party",
];

const API_URL = "http://localhost:5000/api/ai/chat";

async function benchmark() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║     Valentique — Semantic Search Benchmark           ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  const results = [];

  for (const query of queries) {
    console.log(`🔍 Query: "${query}"`);

    const start = Date.now();

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();
      const totalMs = Date.now() - start;

      const debug = data._debug || {};
      const productNames = (data.products || []).map((p) => p.name).slice(0, 3);

      console.log(`   Method:      ${debug.retrievalMethod || "unknown"}`);
      console.log(`   Retrieval:   ${debug.retrievalTimeMs || "?"}ms`);
      console.log(`   Generation:  ${debug.generationTimeMs || "?"}ms`);
      console.log(`   Total:       ${debug.totalTimeMs || totalMs}ms`);
      console.log(`   Candidates:  ${debug.candidateProducts || 0}`);
      console.log(`   Recommended: ${debug.recommendedProducts || 0}`);
      if (productNames.length > 0) {
        console.log(`   Top results: ${productNames.join(", ")}`);
      }
      console.log("");

      results.push({
        query,
        method: debug.retrievalMethod,
        retrievalMs: debug.retrievalTimeMs,
        generationMs: debug.generationTimeMs,
        totalMs: debug.totalTimeMs || totalMs,
        candidates: debug.candidateProducts,
        recommended: debug.recommendedProducts,
      });
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}\n`);
    }

    // Wait between queries to avoid rate limits
    await new Promise((r) => setTimeout(r, 2000));
  }

  // Summary table
  console.log("╔══════════════════════════════════════════════════════════════════╗");
  console.log("║                     BENCHMARK SUMMARY                          ║");
  console.log("╠══════════════════════════════════════════════════════════════════╣");
  console.log("║ Query                              │ Method   │ Retr │ Gen  │ Tot  ║");
  console.log("╠══════════════════════════════════════════════════════════════════╣");

  for (const r of results) {
    const q = r.query.substring(0, 35).padEnd(35);
    const m = (r.method || "?").padEnd(9);
    const ret = String(r.retrievalMs || "?").padStart(4);
    const gen = String(r.generationMs || "?").padStart(4);
    const tot = String(r.totalMs || "?").padStart(5);
    console.log(`║ ${q}│ ${m}│ ${ret} │ ${gen} │${tot} ║`);
  }

  console.log("╚══════════════════════════════════════════════════════════════════╝");

  const semanticResults = results.filter((r) => r.method === "semantic");
  if (semanticResults.length > 0) {
    const avgRetrieval = Math.round(
      semanticResults.reduce((sum, r) => sum + r.retrievalMs, 0) / semanticResults.length
    );
    const avgTotal = Math.round(
      semanticResults.reduce((sum, r) => sum + r.totalMs, 0) / semanticResults.length
    );
    console.log(`\n📊 Semantic Search Avg Retrieval: ${avgRetrieval}ms`);
    console.log(`📊 Semantic Search Avg Total:     ${avgTotal}ms`);
  }
}

benchmark().catch(console.error);
