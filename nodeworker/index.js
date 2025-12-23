import axios from "axios";
import * as cheerio from "cheerio";
import OpenAI from "openai";
import "dotenv/config";

const BACKEND = process.env.BACKEND_API_URL;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


  //  STEP 1: Fetch Latest Article
async function fetchLatestArticle() {
  const res = await axios.get(`${BACKEND}/api/articles`);
  const articles = res.data?.data || [];

  if (articles.length === 0) {
    console.log("No articles found. Using mock article.");
    return {
      title: "How AI Chatbots Improve Customer Support",
      content: "AI chatbots are transforming customer support by improving response time and reducing costs."
    };
  }

  return articles[0];
}

/* -----------------------------
   STEP 4: Google Search (Serper)
-------------------------------- */
async function googleSearch(query) {
  const res = await axios.post(
    "https://google.serper.dev/search",
    { q: query },
    {
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.organic
    .filter(r => !r.link.includes("beyondchats.com"))
    .slice(0, 2);
}

/* -----------------------------
   STEP 5: Scrape Article Content
-------------------------------- */
async function scrapeArticle(url) {
  const html = await axios.get(url);
  const $ = cheerio.load(html.data);

  let content = $("article").text();
  if (!content) content = $("main").text();
  if (!content) content = $("body").text();

  return content.trim().slice(0, 4000);
}

/* -----------------------------
   STEP 6: Rewrite Using LLM
-------------------------------- */
async function rewriteArticle(original, ref1, ref2) {
  const prompt = `
Rewrite the following article to improve structure, clarity,
and formatting. Use the tone and structure inspired by the two
reference articles, but do not copy content.

Original Article:
${original}

Reference Article 1:
${ref1}

Reference Article 2:
${ref2}

Return the output in markdown format.
`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return res.choices[0].message.content;
}

/* -----------------------------
   STEP 7: Publish Updated Article
-------------------------------- */
async function publishUpdatedArticle(original, updated, references) {
  await axios.post(`${BACKEND}/api/articles`, {
    title: original.title + " (Updated)",
    content: `${updated}\n\n## References\n${references.join("\n")}`,
    is_updated: true,
  });

  console.log("Updated article published successfully");
}

/* -----------------------------
   MAIN EXECUTION FLOW
-------------------------------- */
(async () => {
  const article = await fetchLatestArticle();
  console.log("Processing:", article.title);

  const searchResults = await googleSearch(article.title);
  console.log("Found reference articles");

  const refContents = [];
  const refLinks = [];

  for (const r of searchResults) {
    const text = await scrapeArticle(r.link);
    refContents.push(text);
    refLinks.push(`- ${r.link}`);
  }

  const updatedContent = await rewriteArticle(
    article.content,
    refContents[0],
    refContents[1]
  );

  await publishUpdatedArticle(article, updatedContent, refLinks);
})();
