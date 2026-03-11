import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Search, Loader2, Link as LinkIcon, FileText, Sparkles, TrendingUp } from "lucide-react";

function Audit(){

  const [url,setUrl] = useState("");
  const [result,setResult] = useState(null);
  const [loading,setLoading] = useState(false);

  const analyze = async () => {
    if(!url) return;
    
    try{
      setLoading(true);
      setResult(null); // Clear previous errors or results

      let submitUrl = url;
      if (!/^https?:\/\//i.test(url)) {
          submitUrl = 'https://' + url;
      }
      
      const token = localStorage.getItem("token");
      
      const res = await axios.post(
        "http://localhost:5000/api/audit",
        {url: submitUrl},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      if (res.data.success) {
        setResult(res.data);
      } else {
        setResult({ error: res.data.error || "Audit failed" });
      }

    }catch(err){
      console.error(err);
      setResult({ error: err.response?.data?.error || "Failed to reach the server. Make sure the backend is running." });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-sage bg-sage/10 ring-sage/30 border-sage/50";
    if (score >= 70) return "text-olivewood bg-sand/50 ring-sand border-sand/80";
    return "text-red-700 bg-red-50 ring-red-200 border-red-200";
  }

  return(
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-olivewood mb-4 flex items-center justify-center gap-3">
          <TrendingUp className="text-sage" size={36}/>
          SEO Audit
        </h1>
        <p className="text-lg text-bark font-medium max-w-2xl mx-auto">
          Enter a website URL to instantly analyze its on-page SEO performance.
        </p>
      </div>

      {/* INPUT SECTION */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-sand flex items-center gap-2 mb-8 mx-auto focus-within:ring-4 focus-within:ring-sage/10 focus-within:border-sage transition-all max-w-3xl">
        <div className="pl-4 text-sage">
          <LinkIcon size={20} />
        </div>
        <input
          placeholder="example.com"
          value={url}
          onChange={(e)=>setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && analyze()}
          className="flex-1 bg-transparent border-none outline-none py-3 px-2 text-olivewood placeholder:text-bark/60 font-medium tracking-wide"
        />
        <button
          onClick={analyze}
          disabled={loading || !url}
          className="bg-sage hover:bg-olivewood disabled:bg-sand disabled:text-bark border border-transparent text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {/* RESULTS AND ERRORS */}
      {result && result.error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-3 max-w-3xl mx-auto font-medium shadow-sm mb-8">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          {result.error}
        </div>
      )}

      {result && !result.error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* SEO SCORE */}
          <div className="bg-white p-6 rounded-3xl border border-sand shadow-sm flex flex-col items-center justify-center text-center">
            <h3 className="text-bark font-bold tracking-wider uppercase text-sm mb-4">Overall Score</h3>
            <div className={`w-32 h-32 rounded-full flex items-center justify-center ring-8 mb-2 border ${getScoreColor(result.seo.score)}`}>
              <span className="text-5xl font-extrabold tracking-tighter">
                {result.seo.score}
              </span>
            </div>
            <p className="text-sm font-medium text-bark mt-2">Out of 100</p>
          </div>

          <div className="md:col-span-2 flex flex-col gap-6">
            {/* META DATA */}
            <div className="bg-white p-6 rounded-3xl border border-sand shadow-sm">
              <h3 className="flex items-center gap-2 text-xl font-bold text-olivewood mb-6">
                <FileText className="text-sage" size={22}/>
                Meta Information
              </h3>
              
              <div className="mb-5 bg-parchment p-4 rounded-2xl border border-sand/50">
                <span className="text-xs font-bold tracking-wider text-sage uppercase drop-shadow-sm">Title Tag</span>
                <p className="text-olivewood font-bold mt-1 text-lg leading-snug">{result.site.title}</p>
              </div>
              
              <div className="bg-parchment p-4 rounded-2xl border border-sand/50">
                <span className="text-xs font-bold tracking-wider text-sage uppercase drop-shadow-sm">Meta Description</span>
                <p className="text-bark font-medium mt-1 leading-relaxed">{result.site.metaDescription}</p>
              </div>
            </div>

            {/* AI SUGGESTIONS */}
            <div className="bg-gradient-to-br from-olive to-sage p-1 rounded-3xl shadow-sm">
              <div className="bg-white rounded-[22px] p-8 h-full">
                <h3 className="flex items-center gap-2 text-xl font-bold text-olivewood mb-6">
                  <Sparkles className="text-sage" size={22}/>
                  AI Recommendations
                </h3>
                <ul className="space-y-4">
                  {result.aiSuggestions.split('\n').filter(s => s.trim().length > 0).map((suggestion, idx) => (
                    <li key={idx} className="flex gap-4 text-olivewood font-medium">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-sage shrink-0 shadow-sm"></div>
                      <span className="leading-relaxed">{suggestion.replace(/^\d+\.\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default Audit;