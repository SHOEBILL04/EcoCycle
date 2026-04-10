import { Link } from "react-router";
import {
  Camera,
  Trophy,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Leaf,
  Star,
  ArrowUpRight,
  Flame,
  Target,
  Activity,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const pointsData = [
  { date: "Apr 4", points: 120 },
  { date: "Apr 5", points: 280 },
  { date: "Apr 6", points: 195 },
  { date: "Apr 7", points: 390 },
  { date: "Apr 8", points: 320 },
  { date: "Apr 9", points: 480 },
  { date: "Apr 10", points: 560 },
];

const categoryData = [
  { name: "Recyclable", value: 45, color: "#3b82f6" },
  { name: "Organic", value: 28, color: "#22c55e" },
  { name: "E-Waste", value: 16, color: "#8b5cf6" },
  { name: "Hazardous", value: 11, color: "#ef4444" },
];

const recentSubmissions = [
  {
    id: "SUB-4821",
    item: "PET Plastic Bottle",
    category: "Recyclable",
    confidence: 0.94,
    points: 15,
    status: "approved",
    time: "2 hours ago",
    emoji: "♻️",
    color: "blue",
  },
  {
    id: "SUB-4820",
    item: "Banana Peel",
    category: "Organic",
    confidence: 0.97,
    points: 10,
    status: "approved",
    time: "5 hours ago",
    emoji: "🌱",
    color: "green",
  },
  {
    id: "SUB-4819",
    item: "Old Smartphone",
    category: "E-Waste",
    confidence: 0.61,
    points: 0,
    status: "dispute",
    time: "8 hours ago",
    emoji: "💻",
    color: "purple",
  },
  {
    id: "SUB-4818",
    item: "Paint Can",
    category: "Hazardous",
    confidence: 0.88,
    points: 20,
    status: "approved",
    time: "1 day ago",
    emoji: "⚠️",
    color: "red",
  },
  {
    id: "SUB-4817",
    item: "Cardboard Box",
    category: "Recyclable",
    confidence: 0.99,
    points: 12,
    status: "approved",
    time: "1 day ago",
    emoji: "♻️",
    color: "blue",
  },
];


const badges = [
  { emoji: "🌱", label: "First Submit", earned: true },
  { emoji: "🔥", label: "7-Day Streak", earned: true },
  { emoji: "♻️", label: "Recycling Pro", earned: true },
  { emoji: "💯", label: "Perfect Week", earned: true },
  { emoji: "🏆", label: "Top 100", earned: false },
  { emoji: "⚡", label: "Speed Classifier", earned: false },
];

const categoryColorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  purple: "bg-purple-100 text-purple-700",
  red: "bg-red-100 text-red-700",
};

import { useState, useEffect } from "react";

export function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [clanAlerts, setClanAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/dashboard', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    })
    .then(res => res.json())
    .then(data => {
        setStats(data.stats);
        setSubmissions(data.recent_submissions);
        if (data.clan_alerts) {
            setClanAlerts(data.clan_alerts);
        }
    })
    .catch(console.error);
  }, []);

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Clan Alerts */}
      {clanAlerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {clanAlerts.map((alert: any) => (
            <div key={alert.id} className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-red-900 font-bold text-sm">⚠ Clan Alert: Violations Detected</p>
                  <p className="text-red-700 text-xs mt-0.5">
                    Member <strong>{alert.name}</strong> has been flagged {alert.flags} times for severe submission violations.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, Alex! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Here's your eco-impact summary for today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold text-orange-700">12 day streak!</span>
          </div>
          <Link
            to="/app/submit"
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-emerald-500/25 text-sm"
          >
            <Camera className="w-4 h-4" />
            Submit Waste
          </Link>
        </div>
      </div>

      {/* Daily challenge banner */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Daily Challenge Active</p>
            <p className="text-purple-200 text-xs">Classify 3 e-waste items for +50 bonus pts</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-white text-sm font-bold">1/3 done</p>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-6 h-1.5 rounded-full ${i === 1 ? "bg-yellow-400" : "bg-white/20"}`}
                ></div>
              ))}
            </div>
          </div>
          <Link
            to="/app/submit"
            className="bg-white text-purple-700 font-bold text-xs px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
          >
            Start →
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            title: "Total Points",
            value: stats ? stats.total_points.toLocaleString() : "...",
            change: "Lifetime overall",
            icon: Leaf,
            bg: "from-emerald-500 to-green-600",
          },
          {
            title: "Submissions",
            value: stats ? stats.classification_count.toLocaleString() : "...",
            change: "Total images analyzed",
            icon: Camera,
            bg: "from-blue-500 to-blue-600",
          },
          {
            title: "Accuracy Rate",
            value: stats ? `${stats.accuracy_rate}%` : "...",
            change: "Successful classifications",
            icon: Target,
            bg: "from-violet-500 to-purple-600",
          },
          {
            title: "Global Rank",
            value: stats && stats.classification_count > 0 ? `#${stats.community_rank.toLocaleString()}` : "Unranked",
            change: "Leaderboard position",
            icon: Trophy,
            bg: "from-amber-500 to-orange-500",
          },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.bg} flex items-center justify-center`}
              >
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {card.value}
            </div>
            <div className="text-xs text-gray-500">{card.title}</div>
            <div className="text-xs text-emerald-600 font-medium mt-1">
              {card.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Points chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900">Points Earned</h2>
              <p className="text-xs text-gray-400">Last 7 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
              +34% this week
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={pointsData}>
              <defs>
                <linearGradient id="pointsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="points"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#pointsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Categories</h2>
            <Activity className="w-4 h-4 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  ></div>
                  <span className="text-gray-600 text-xs">{cat.name}</span>
                </div>
                <span className="text-gray-900 font-semibold text-xs">
                  {cat.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent submissions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <div>
              <h2 className="font-bold text-gray-900">Recent Submissions</h2>
              <p className="text-xs text-gray-400">Your latest waste classifications</p>
            </div>
            <Link
              to="/app/profile"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {submissions.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                  <Camera className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No submissions yet.</p>
                  <p className="text-xs mt-1">Classify your first image to get started!</p>
              </div>
            ) : (
                submissions.map((sub: any) => {
                    const isDispute = sub.status === 'PENDING' || sub.status === 'FLAGGED';
                    const categoryUpper = sub.category ? sub.category.charAt(0).toUpperCase() + sub.category.slice(1) : 'Unknown';
                    const emoji = sub.category === 'organic' ? '🌱' : sub.category === 'e-waste' ? '💻' : sub.category === 'hazardous' ? '⚠️' : '♻️';
                    const col = sub.category === 'organic' ? 'green' : sub.category === 'e-waste' ? 'purple' : sub.category === 'hazardous' ? 'red' : 'blue';
                    const score = parseFloat(sub.confidence_score) || 0;
                    
                    return (
                      <div
                        key={sub.id}
                        className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                          {emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-gray-900 text-sm truncate">
                              {sub.subcategory || categoryUpper}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColorMap[col]}`}
                            >
                              {categoryUpper}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400">ID #{sub.id}</span>
                            <div className="flex items-center gap-1">
                              <div className="h-1 w-16 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${score * 100}%`,
                                    backgroundColor:
                                      score >= 0.75 ? "#10b981" : "#f59e0b",
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-400">
                                {Math.round(score * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            {!isDispute ? (
                              <span className="text-sm font-bold text-emerald-600">
                                Authenticated
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Review
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                })
            )}
          </div>
        </div>

        {/* Badges & sidebar */}
        <div className="space-y-4">
          {/* Badges */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Badges</h2>
              <Star className="w-4 h-4 text-amber-400" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {badges.map((badge, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center ${
                    badge.earned
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-gray-50 border-gray-100 opacity-40"
                  }`}
                >
                  <span className="text-xl">{badge.emoji}</span>
                  <span className="text-xs text-gray-600 leading-tight">
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 text-white">
            <h2 className="font-bold mb-4">This Week</h2>
            <div className="space-y-3">
              {[
                { label: "Submissions", val: "14", icon: Camera },
                { label: "Points Earned", val: "960", icon: Leaf },
                { label: "Disputes Won", val: "2", icon: CheckCircle },
                { label: "Streak Days", val: "12", icon: Flame },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-100">
                    <item.icon className="w-3.5 h-3.5" />
                    <span className="text-xs">{item.label}</span>
                  </div>
                  <span className="text-white font-bold text-sm">{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard preview */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900">Nearby on Leaderboard</h2>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div className="space-y-2">
              {[
                { rank: 125, name: "EcoStar", pts: 2910, diff: -70 },
                { rank: 127, name: "Alex Johnson", pts: 2840, isYou: true },
                { rank: 128, name: "GreenPath", pts: 2780, diff: +60 },
              ].map((u, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 p-2 rounded-xl text-sm ${u.isYou ? "bg-emerald-50 border border-emerald-200" : ""}`}
                >
                  <span className="w-8 text-xs text-gray-400 font-bold">
                    #{u.rank}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span
                    className={`flex-1 text-xs ${u.isYou ? "font-bold text-emerald-700" : "text-gray-600"}`}
                  >
                    {u.name} {u.isYou && "(You)"}
                  </span>
                  <span className="text-xs font-bold text-gray-900">
                    {u.pts.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Link
                to="/app/leaderboard"
                id="dashboard-global-leaderboard-link"
                className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
              >
                🌍 Global
              </Link>
              <Link
                to="/app/leaderboard"
                id="dashboard-clan-leaderboard-link"
                state={{ tab: "clan" }}
                className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-xl transition-colors"
              >
                🛡️ Clans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
