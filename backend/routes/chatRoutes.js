const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const client = new OpenAI({
apiKey: process.env.OPENAI_API_KEY
});

router.post("/chat", async(req,res)=>{

const {message} = req.body;

const response = await client.chat.completions.create({
model:"gpt-4o-mini",
messages:[
{role:"system",content:"You are an SEO expert assistant."},
{role:"user",content:message}
]
});

res.json({
answer: response.choices[0].message.content
});

});

module.exports = router;