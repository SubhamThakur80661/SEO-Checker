import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Activity, Key, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function scoreBadge(score) {
  if (score >= 90) return 'bg-sage/20 text-moss border-sage/40';
  if (score >= 70) return 'bg-sand/60 text-olivewood border-sand';
  return 'bg-red-50 text-red-700 border-red-200';
}

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
          axios.get(`${API_URL}/api/audit/history`, { headers }),
          axios.get(`${API_URL}/api/keywords/history`, { headers })
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

  const chartData = [...audits].reverse().map(a => ({
    date: new Date(a.createdAt).toLocaleDateString(),
    score: a.seoScore
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-sage" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-olivewood tracking-tight">History</h1>
        <p className="text-lg text-bark mt-2">
          Your past audits and keyword searches, in one place.
        </p>
      </div>

      {audits.length > 0 && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-sand/60 shadow-card mb-4 h-[360px]">
          <h3 className="text-lg font-bold text-olivewood mb-5 flex items-center gap-2">
            <Activity size={20} className="text-moss" />
            Score over time
          </h3>
          <ResponsiveContainer width="100%" height="82%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
              <Line
                type="monotone"
                dataKey="score"
                stroke="#5F6B4C"
                strokeWidth={3}
                dot={{ fill: '#FBFAF7', stroke: '#5F6B4C', strokeWidth: 2, r: 5 }}
                activeDot={{ fill: '#5F6B4C', stroke: '#FBFAF7', strokeWidth: 2, r: 7 }}
              />
              <CartesianGrid stroke="#D6C9B3" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#645D51' }} tickMargin={12} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#645D51' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FBFAF7', borderRadius: '12px', border: '1px solid #D6C9B3', boxShadow: '0 4px 16px rgba(52,56,49,0.08)' }}
                itemStyle={{ color: '#343831', fontWeight: '600' }}
                cursor={{ stroke: '#B5C19E', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-sand/60 shadow-card">
          <h3 className="text-lg font-bold text-olivewood mb-5 flex items-center gap-2">
            <Activity size={20} className="text-moss" />
            Recent audits
          </h3>
          {audits.length === 0 ? (
            <p className="text-sm text-bark bg-paper p-4 rounded-xl border border-sand/50">
              Nothing here yet. Run an audit and it will show up here.
            </p>
          ) : (
            <div className="space-y-3">
              {audits.slice(0, 5).map(audit => (
                <div key={audit._id} className="flex items-center justify-between gap-3 p-4 bg-paper border border-sand/50 rounded-xl">
                  <div className="overflow-hidden">
                    <p className="font-semibold text-olivewood truncate">{audit.url}</p>
                    <p className="text-xs text-bark mt-0.5">{new Date(audit.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border shrink-0 ${scoreBadge(audit.seoScore)}`}>
                    {audit.seoScore}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-sand/60 shadow-card">
          <h3 className="text-lg font-bold text-olivewood mb-5 flex items-center gap-2">
            <Key size={20} className="text-moss" />
            Recent keyword searches
          </h3>
          {keywords.length === 0 ? (
            <p className="text-sm text-bark bg-paper p-4 rounded-xl border border-sand/50">
              Nothing here yet. Try a topic in Keyword Research.
            </p>
          ) : (
            <div className="space-y-3">
              {keywords.slice(0, 5).map(kw => (
                <div key={kw._id} className="p-4 bg-paper border border-sand/50 rounded-xl">
                  <div className="flex justify-between items-center gap-3 mb-2.5">
                    <p className="font-semibold text-olivewood capitalize truncate">{kw.topic}</p>
                    <p className="text-xs text-bark shrink-0">{new Date(kw.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {kw.results?.slice(0, 3).map((r, i) => (
                      <span key={i} className="text-xs bg-white border border-sand/70 px-2.5 py-1 rounded-lg text-olivewood font-medium">
                        {r.keyword}
                      </span>
                    ))}
                    {kw.results?.length > 3 && (
                      <span className="text-xs text-moss font-semibold px-1 flex items-center">
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
