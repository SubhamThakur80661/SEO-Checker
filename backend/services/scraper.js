const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeWebsite(url){
  try {
    // Basic user agent to avoid primitive bot blocking
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000 
    });

    const $ = cheerio.load(data);

    const title = $("title").text().trim();
    const metaDescription = $('meta[name="description"]').attr("content") || "";
    const canonical = $('link[rel="canonical"]').attr("href") || null;
    const robots = $('meta[name="robots"]').attr("content") || null;

    const h1 = [];
    $("h1").each((i,el)=>{
        h1.push($(el).text().trim());
    });

    const h2Count = $("h2").length;

    // Check images lacking alt tags
    let imagesWithoutAlt = 0;
    $("img").each((i, el) => {
      if (!$(el).attr("alt")) imagesWithoutAlt++;
    });

    // Basic text extraction for word count
    const text = $("body").text().replace(/\s+/g, ' ').trim();
    const wordCount = text.split(/\s+/).length;

    return {
        title,
        metaDescription,
        canonical,
        robots,
        h1,
        h1Count: h1.length,
        h2Count,
        imagesWithoutAlt,
        wordCount
    };
  } catch (error) {
    console.error("Scraper Error:", error.message);
    throw new Error("Unable to scrape the provided URL. Make sure it is valid and publicly accessible.");
  }
}

module.exports = scrapeWebsite;