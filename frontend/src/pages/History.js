import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Activity, Key, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function scoreBadge(score) {
  if (score >= 90) return 'bg-lime text-ink border-lime';
  if (score >= 70) return 'bg-white/10 text-paper border-white/20';
  return 'bg-red-500/10 text-red-300 border-red-400/40';
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
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-lime" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-5xl"
    >
      <div className="mb-8">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-lime">03 / History</p>
        <h1 className="font-display font-wide text-4xl font-black tracking-tight sm:text-6xl">History</h1>
        <p className="mt-3 text-base leading-relaxed text-smoke sm:text-lg">
          Your past audits and keyword searches, in one place.
        </p>
      </div>

      {audits.length > 0 && (
        <div className="mb-4 h-[360px] border border-white/12 bg-coal p-6 sm:p-7">
          <h3 className="mb-5 flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-paper">
            <Activity size={20} className="text-lime" />
            Score over time
          </h3>
          <ResponsiveContainer width="100%" height="82%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
              <Line
                type="monotone"
                dataKey="score"
                stroke="#D7FF3E"
                strokeWidth={3}
                dot={{ fill: '#0A0A0B', stroke: '#D7FF3E', strokeWidth: 2, r: 5 }}
                activeDot={{ fill: '#D7FF3E', stroke: '#0A0A0B', strokeWidth: 2, r: 7 }}
              />
              <CartesianGrid stroke="#232326" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#A3A39B' }} tickMargin={12} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#A3A39B' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#17171A', borderRadius: '0px', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
                itemStyle={{ color: '#F2F0EA', fontWeight: '600' }}
                cursor={{ stroke: '#D7FF3E', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="border border-white/12 bg-coal p-6">
          <h3 className="mb-5 flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-paper">
            <Activity size={20} className="text-lime" />
            Recent audits
          </h3>
          {audits.length === 0 ? (
            <p className="border border-white/10 bg-panel p-4 text-sm text-smoke">
              Nothing here yet. Run an audit and it will show up here.
            </p>
          ) : (
            <div className="space-y-3">
              {audits.slice(0, 5).map(audit => (
                <div key={audit._id} className="flex items-center justify-between gap-3 border border-white/10 bg-panel p-4">
                  <div className="overflow-hidden">
                    <p className="truncate font-semibold text-paper">{audit.url}</p>
                    <p className="mt-0.5 text-xs text-smoke">{new Date(audit.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`shrink-0 border px-3 py-1 text-sm font-bold ${scoreBadge(audit.seoScore)}`}>
                    {audit.seoScore}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-white/12 bg-coal p-6">
          <h3 className="mb-5 flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-paper">
            <Key size={20} className="text-lime" />
            Recent keyword searches
          </h3>
          {keywords.length === 0 ? (
            <p className="border border-white/10 bg-panel p-4 text-sm text-smoke">
              Nothing here yet. Try a topic in Keyword Research.
            </p>
          ) : (
            <div className="space-y-3">
              {keywords.slice(0, 5).map(kw => (
                <div key={kw._id} className="border border-white/10 bg-panel p-4">
                  <div className="mb-2.5 flex items-center justify-between gap-3">
                    <p className="truncate font-semibold capitalize text-paper">{kw.topic}</p>
                    <p className="shrink-0 text-xs text-smoke">{new Date(kw.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {kw.results?.slice(0, 3).map((r, i) => (
                      <span key={i} className="border border-white/12 bg-coal px-2.5 py-1 text-xs font-medium text-paper">
                        {r.keyword}
                      </span>
                    ))}
                    {kw.results?.length > 3 && (
                      <span className="flex items-center px-1 text-xs font-semibold text-lime">
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
