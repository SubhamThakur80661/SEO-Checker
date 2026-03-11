import { motion } from "framer-motion";
import { LineChart, Search, FileText, Zap, Bot, ArrowRight, ShieldCheck } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

function Dashboard() {
  const { user } = useContext(AuthContext);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const features = [
    {
      title: "Comprehensive SEO Audit",
      desc: "Analyze any website's technical health, meta tags, and content structure instantly.",
      icon: <FileText className="text-sage" size={32} strokeWidth={2} />,
      link: "/audit",
      bg: "bg-white border-sage/15"
    },
    {
      title: "Discover High-Intent Keywords",
      desc: "Find long-tail, semantic keywords that are proven to drive targeted organic traffic.",
      icon: <Search className="text-sage" size={32} strokeWidth={2} />,
      link: "/keywords",
      bg: "bg-white border-sage/15"
    },
    {
      title: "AI Action Plan",
      desc: "Receive step-by-step instructions from our AI on how to outrank your competitors.",
      icon: <Bot className="text-sage" size={32} strokeWidth={2} />,
      link: "/audit",
      bg: "bg-white border-sage/15"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-14 relative"
      >
        <div className="absolute top-0 right-10 -m-12 w-64 h-64 bg-sage/5 rounded-full blur-3xl pointer-events-none"></div>
        <h1 className="text-5xl font-black text-olivewood tracking-tight mb-4 flex items-center gap-3">
          Welcome back, {user?.name?.split(' ')[0] || 'Marketer'}
        </h1>
        <p className="text-xl text-bark max-w-2xl font-medium leading-relaxed">
          Your command center for organic growth. Run an audit, discover new keywords, and let AI build your strategy.
        </p>
      </motion.div>

      {/* QUICK STATS */}
      <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ delay: 0.1 }}
         className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14"
      >
        <div className="bg-sand/30 border border-bark/10 p-6 rounded-3xl shadow-sm flex items-center justify-between group hover:bg-sand/50 transition-colors">
          <div>
            <p className="text-bark font-bold text-sm uppercase tracking-wider mb-1">Available Credits</p>
            <p className="text-3xl font-black text-olivewood">{user?.credits}</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-sage/20 flex items-center justify-center text-sage">
            <Zap size={24} strokeWidth={2.5}/>
          </div>
        </div>
        <div className="bg-sand/30 border border-bark/10 p-6 rounded-3xl shadow-sm flex items-center justify-between group hover:bg-sand/50 transition-colors">
          <div>
            <p className="text-bark font-bold text-sm uppercase tracking-wider mb-1">Audits Run</p>
            <p className="text-3xl font-black text-olivewood">0</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-olive/30 flex items-center justify-center text-olivewood">
            <LineChart size={24} strokeWidth={2.5}/>
          </div>
        </div>
        <div className="bg-sand/30 border border-bark/10 p-6 rounded-3xl shadow-sm flex items-center justify-between group hover:bg-sand/50 transition-colors">
          <div>
            <p className="text-bark font-bold text-sm uppercase tracking-wider mb-1">Account Status</p>
            <p className="text-xl font-black text-olivewood flex items-center gap-2 mt-2">
              <ShieldCheck size={20} className="text-sage"/> Active
            </p>
          </div>
        </div>
      </motion.div>

      {/* FEATURE GRID */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-olivewood">Quick Actions</h2>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {features.map((feat, idx) => (
          <Link to={feat.link} key={idx}>
            <motion.div variants={item} className={`h-full ${feat.bg} p-8 rounded-[2rem] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group flex flex-col justify-between`}>
              <div>
                <div className="bg-parchment w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-sand">
                   {feat.icon}
                </div>
                <h3 className="text-2xl font-bold text-olivewood mb-3 leading-tight">{feat.title}</h3>
                <p className="text-bark leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </div>
              
              <div className="mt-8 flex items-center text-sage font-bold group-hover:gap-3 gap-2 transition-all">
                Get Started <ArrowRight size={18} strokeWidth={3} />
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>

    </div>
  );
}

export default Dashboard;