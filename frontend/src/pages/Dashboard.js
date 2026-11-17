import { motion } from "framer-motion";
import { FileText, Search, ListChecks, ArrowRight, Zap, ShieldCheck, LineChart } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [auditCount, setAuditCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/audit/history`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.data.success) setAuditCount(res.data.data.length);
      } catch {
        // Backend down or unreachable — the count just stays at 0.
      }
    };
    fetchCount();
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="max-w-6xl mx-auto pb-8">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-10"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-olivewood tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-lg text-bark mt-2 max-w-2xl">
          Run an audit, look up keywords, or check what you have done before.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
      >
        <div className="bg-white border border-sand/60 rounded-2xl shadow-card p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-bark">Credits left</p>
            <p className="text-3xl font-bold text-olivewood mt-1">{user?.credits ?? '—'}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sage/15 flex items-center justify-center text-moss">
            <Zap size={21} />
          </div>
        </div>
        <div className="bg-white border border-sand/60 rounded-2xl shadow-card p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-bark">Audits run</p>
            <p className="text-3xl font-bold text-olivewood mt-1">{auditCount}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-olive/20 flex items-center justify-center text-moss">
            <LineChart size={21} />
          </div>
        </div>
        <div className="bg-white border border-sand/60 rounded-2xl shadow-card p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-bark">Account</p>
            <p className="text-xl font-bold text-olivewood mt-2 flex items-center gap-2">
              <ShieldCheck size={19} className="text-moss" /> Active
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Link to="/audit" className="md:row-span-2 group">
          <div className="h-full bg-olivewood text-parchment p-7 rounded-2xl shadow-card hover:shadow-lift transition-shadow flex flex-col justify-between min-h-[280px]">
            <div>
              <div className="w-12 h-12 rounded-xl bg-parchment/10 ring-1 ring-parchment/15 flex items-center justify-center mb-6">
                <FileText size={22} className="text-olive" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-2">SEO audit</h3>
              <p className="text-parchment/75 leading-relaxed max-w-sm">
                Paste a URL and get a plain report on the page's title, description, and the
                basics search engines check.
              </p>
            </div>
            <span className="mt-8 inline-flex items-center gap-2 font-semibold text-olive group-hover:gap-3 transition-all">
              Run an audit <ArrowRight size={18} />
            </span>
          </div>
        </Link>

        <Link to="/keywords" className="group">
          <div className="h-full bg-white border border-sand/60 p-7 rounded-2xl shadow-card hover:shadow-lift hover:-translate-y-0.5 transition-all">
            <div className="w-12 h-12 rounded-xl bg-parchment ring-1 ring-sand/60 flex items-center justify-center mb-5">
              <Search size={22} className="text-moss" />
            </div>
            <h3 className="text-xl font-bold text-olivewood mb-2">Keyword research</h3>
            <p className="text-bark leading-relaxed">
              Type a topic and get keyword ideas for your next post or page.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 font-semibold text-moss group-hover:gap-3 transition-all">
              Find keywords <ArrowRight size={17} />
            </span>
          </div>
        </Link>

        <Link to="/audit" className="group">
          <div className="h-full bg-white border border-sand/60 p-7 rounded-2xl shadow-card hover:shadow-lift hover:-translate-y-0.5 transition-all">
            <div className="w-12 h-12 rounded-xl bg-parchment ring-1 ring-sand/60 flex items-center justify-center mb-5">
              <ListChecks size={22} className="text-moss" />
            </div>
            <h3 className="text-xl font-bold text-olivewood mb-2">What to fix next</h3>
            <p className="text-bark leading-relaxed">
              Every audit ends with a short list of fixes, in plain language.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 font-semibold text-moss group-hover:gap-3 transition-all">
              Start with an audit <ArrowRight size={17} />
            </span>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}

export default Dashboard;
