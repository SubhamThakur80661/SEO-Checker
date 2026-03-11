import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Sparkles, KeyRound, Loader2, Search } from "lucide-react";

function Keywords(){

  const [topic,setTopic] = useState("");
  const [keywords,setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const generateKeywords = async () => {
    if(!topic) return;
    
    setLoading(true);
    setError(null);
    setKeywords([]);
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/keywords`,
        { topic },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      
      if (res.data.success) {
        setKeywords(res.data.data.map(item => item.keyword));
      } else {
        setError(res.data.error || "Failed to generate keywords");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to reach the server.");
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return(
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-12 mt-4 text-center">
        <h1 className="text-4xl font-black tracking-tight text-olivewood mb-4 flex items-center justify-center gap-3 drop-shadow-sm">
          <KeyRound className="text-sage" size={36} />
          Keyword Research
        </h1>
        <p className="text-lg text-bark font-medium max-w-2xl mx-auto">
          Discover high-intent semantic keywords to power your content strategy and rank higher.
        </p>
      </div>

      <div className="relative group max-w-2xl mx-auto mb-12">
        <div className="relative bg-white p-2 rounded-2xl shadow-sm border border-sand flex items-center gap-2 focus-within:border-sage focus-within:ring-4 focus-within:ring-sage/10 transition-all">
          <div className="pl-4 text-sage">
            <KeyRound size={22} />
          </div>
          <input
            placeholder="Enter a topic (e.g. email marketing)"
            value={topic}
            onChange={(e)=>setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateKeywords()}
            className="flex-1 bg-transparent border-none outline-none py-3 px-2 text-olivewood placeholder:text-bark/60 font-medium tracking-wide"
          />
          <button
            onClick={generateKeywords}
            disabled={loading || !topic}
            className="bg-sage hover:bg-olivewood disabled:bg-sand disabled:text-bark border border-transparent text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            Generate 
          </button>
        </div>
      </div>

      {/* ERRORS */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-3 mb-8 max-w-2xl mx-auto shadow-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
          {error}
        </div>
      )}

      {keywords.length > 0 && (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="bg-white border border-sand rounded-[2rem] p-8 shadow-sm max-w-3xl mx-auto relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-xl font-bold text-olivewood flex items-center gap-2">
              <Sparkles size={20} className="text-sage" />
              Potential Opportunities
            </h3>
            <span className="bg-sand/30 border border-sand text-olivewood text-xs font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider">{keywords.length} found</span>
          </div>
          
          <div className="flex flex-wrap gap-3 relative z-10">
            {keywords.map((k,i)=>(
              <motion.div 
                variants={item} 
                key={i} 
                className="bg-parchment hover:bg-sage/10 border border-sand hover:border-sage text-olivewood transition-all duration-300 px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Search size={14} className="text-sage transition-colors" />
                {k}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

    </motion.div>
  )
}

export default Keywords;