import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingCart, Users, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Executive = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/kpi`);
        setData(res.data);
      } catch (error) {
        console.error("Error fetching KPI data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Executive Dashboard</h1>
          <p className="text-muted">Your business, at a glance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Revenue", value: `₹${data?.total_revenue?.toLocaleString() || 0}`, icon: TrendingUp, color: "text-primary" },
          { title: "Daily Active Users", value: "495", icon: Users, color: "text-secondary" },
          { title: "Orders", value: "18", icon: ShoppingCart, color: "text-success" },
          { title: "Conversion Rate", value: "2.78%", icon: Activity, color: "text-danger" },
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-muted font-medium">{kpi.title}</h3>
              <kpi.icon className={kpi.color} size={20} />
            </div>
            <p className="text-3xl font-bold text-white">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-panel p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Revenue Trend (7-Day)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.trend || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
              <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} tickFormatter={(value) => `₹${value}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e1e2f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#6366f1" 
                strokeWidth={3} 
                dot={{r: 4, fill: '#6366f1', strokeWidth: 0}} 
                activeDot={{r: 6}} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default Executive;
