import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Activity, Key, Loader2, ArrowRight, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function History() {
  const [audits, setAudits] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [auditRes, keywordRes] = await Promise.all([
          axios.get('http://localhost:5000/api/audit/history', { headers }),
          axios.get('http://localhost:5000/api/keywords/history', { headers })
        ]);

        if (auditRes.data.success) setAudits(auditRes.data.data);
        if (keywordRes.data.success) setKeywords(keywordRes.data.data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Format data for Recharts (SEO Score trend)
  const chartData = [...audits].reverse().map(a => ({
    date: new Date(a.createdAt).toLocaleDateString(),
    score: a.seoScore
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={32} className="animate-spin text-sage" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto"
    >
      <div className="mb-12 mt-4">
        <h1 className="text-4xl font-black text-olivewood tracking-tight mb-4 flex items-center gap-3 drop-shadow-sm">
          <HistoryIcon className="text-sage" size={36} />
          History & Reports
        </h1>
        <p className="text-lg text-bark font-medium">
          Review your past SEO audits and keyword research sessions.
        </p>
      </div>

      {/* SEO SCORE TREND CHART */}
      {audits.length > 0 && (
        <div className="bg-white p-8 rounded-[2rem] border border-sand shadow-sm mb-10 h-[400px] relative overflow-hidden group">
          <h3 className="text-xl font-bold text-olivewood mb-6 flex items-center gap-2">
            <Activity size={22} className="text-sage" />
            SEO Score Trend
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#8B957B" 
                strokeWidth={4} 
                dot={{ fill: '#F2EFE9', stroke: '#8B957B', strokeWidth: 2, r: 6 }} 
                activeDot={{ fill: '#8B957B', stroke: '#F2EFE9', strokeWidth: 2, r: 8 }} 
              />
              <CartesianGrid stroke="#D6C9B3" strokeDasharray="5 5" vertical={false} />
              <XAxis dataKey="date" tick={{fontSize: 12, fill: '#645D51 '}} tickMargin={15} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{fontSize: 12, fill: '#645D51'}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#F2EFE9', borderRadius: '16px', border: '1px solid #D6C9B3', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#343831', fontWeight: 'bold' }}
                cursor={{ stroke: '#B5C19E', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* RECENT AUDITS LIST */}
        <div className="bg-white p-8 rounded-[2rem] border border-sand shadow-sm relative overflow-hidden">
          <h3 className="text-xl font-bold text-olivewood mb-6 flex items-center gap-2">
            <Activity size={22} className="text-sage" />
            Recent Audits
          </h3>
          {audits.length === 0 ? (
            <p className="text-sm text-bark font-medium italic bg-parchment p-4 rounded-xl border border-sand/50">No audits performed yet. Go to the Audit tab to run one!</p>
          ) : (
            <div className="space-y-4">
              {audits.slice(0, 5).map(audit => (
                <div key={audit._id} className="group flex items-center justify-between p-5 bg-parchment hover:bg-sand/30 border border-sand hover:border-sage/50 rounded-2xl transition-all duration-300 shadow-sm cursor-pointer">
                  <div className="overflow-hidden">
                    <p className="font-bold text-olivewood tracking-wide truncate">{audit.url}</p>
                    <p className="text-xs text-bark mt-1 font-medium">{new Date(audit.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-sm font-black shadow-sm flex items-center justify-center min-w-[3rem] ${
                    audit.seoScore >= 90 ? 'bg-sage/20 text-olivewood border border-sage/50' :
                    audit.seoScore >= 70 ? 'bg-sand text-olivewood border border-sand/80' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {audit.seoScore}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT KEYWORDS LIST */}
        <div className="bg-white p-8 rounded-[2rem] border border-sand shadow-sm relative overflow-hidden">
          <h3 className="text-xl font-bold text-olivewood mb-6 flex items-center gap-2">
            <Key size={22} className="text-sage" />
            Recent Keyword Searches
          </h3>
          {keywords.length === 0 ? (
            <p className="text-sm text-bark font-medium italic bg-parchment p-4 rounded-xl border border-sand/50">No keywords generated yet. Start ranking higher today!</p>
          ) : (
             <div className="space-y-4">
              {keywords.slice(0, 5).map(kw => (
                <div key={kw._id} className="p-5 bg-parchment border border-sand rounded-2xl shadow-sm hover:border-sage/50 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-bold text-olivewood tracking-wide capitalize">{kw.topic}</p>
                    <p className="text-xs font-medium text-bark bg-sand/50 px-2 py-1 rounded-md">{new Date(kw.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {kw.results?.slice(0, 3).map((r, i) => (
                      <span key={i} className="text-xs bg-white border border-sand px-2.5 py-1.5 rounded-lg text-olivewood font-semibold shadow-sm">
                        {r.keyword}
                      </span>
                    ))}
                    {kw.results?.length > 3 && (
                      <span className="text-xs text-sage font-bold px-1 flex items-center tracking-wide">
                        +{kw.results.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </motion.div>
  );
}

export default History;
