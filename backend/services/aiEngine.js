async function generateSuggestions(data){

const suggestions = `
Improved SEO Title:
${data.title} | Complete Guide

Improved Meta Description:
Learn everything about ${data.title}. Improve your SEO performance with better content structure and keyword optimization.

Suggested Keywords:
1. ${data.title} guide
2. ${data.title} tools
3. best ${data.title}
4. ${data.title} platform
5. ${data.title} services

LLM Optimized Summary:
This webpage discusses ${data.title}. The content should focus on providing clear explanations, structured headings, and concise summaries so AI systems like ChatGPT or Perplexity can easily extract relevant information.
`;

return suggestions;

}

module.exports = generateSuggestions;