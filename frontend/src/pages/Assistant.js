import { useState } from "react";

function Assistant(){

const [question,setQuestion] = useState("");
const [messages,setMessages] = useState([]);

const askAI = () => {

if(!question) return;

let answer = "";

if(question.toLowerCase().includes("seo")){

answer = "SEO stands for Search Engine Optimization. It helps websites rank higher in search engines by improving content quality, keywords, and backlinks.";

}

else if(question.toLowerCase().includes("keyword")){

answer = "Keywords are the words users type into search engines. Good SEO uses relevant keywords naturally in titles, headings, and content.";

}

else if(question.toLowerCase().includes("backlink")){

answer = "Backlinks are links from other websites pointing to yours. High-quality backlinks improve search engine ranking.";

}

else{

answer = "Focus on improving content quality, keyword optimization, page speed, and backlinks to improve SEO.";

}

setMessages([...messages,{q:question,a:answer}]);

setQuestion("");

};

return(

<div>

<h1 style={{
fontSize:"28px",
fontWeight:"bold",
marginBottom:"20px"
}}>
AI SEO Assistant
</h1>

<div style={{
display:"flex",
gap:"10px",
marginBottom:"20px"
}}>

<input
placeholder="Ask about SEO..."
value={question}
onChange={(e)=>setQuestion(e.target.value)}
style={{
padding:"12px",
width:"350px",
borderRadius:"8px",
border:"1px solid #ccc"
}}
/>

<button
onClick={askAI}
style={{
background:"#8C916C",
color:"white",
padding:"12px 24px",
border:"none",
borderRadius:"8px",
cursor:"pointer"
}}
>
Ask
</button>

</div>

<div>

{messages.map((msg,index)=>(
<div key={index} style={{
background:"white",
padding:"20px",
borderRadius:"10px",
marginBottom:"15px",
boxShadow:"0 4px 10px rgba(0,0,0,0.1)"
}}>

<p><strong>You:</strong> {msg.q}</p>

<p><strong>AI:</strong> {msg.a}</p>

</div>
))}

</div>

</div>

)

}

export default Assistant;