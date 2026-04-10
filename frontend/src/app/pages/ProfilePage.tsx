import { useState, useEffect } from "react";
import {
  UserPlus,
  UserCheck,
  Lock,
  Trophy,
  Camera,
  Target,
  Star,
  Calendar,
  Leaf,
  BarChart2,
  CheckCircle,
  AlertTriangle,
  Globe,
  Shield,
  Users,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const isOwnProfile = false; // Toggle to simulate own vs others' profile

const radarData = [
  { subject: "Accuracy", A: 91 },
  { subject: "Volume", A: 78 },
  { subject: "E-Waste", A: 65 },
  { subject: "Organic", A: 88 },
  { subject: "Recyclable", A: 94 },
  { subject: "Hazardous", A: 72 },
];

const activityData = [
  { month: "Nov", points: 340 },
  { month: "Dec", points: 580 },
  { month: "Jan", points: 420 },
  { month: "Feb", points: 720 },
  { month: "Mar", points: 890 },
  { month: "Apr", points: 960 },
];

const badges = [
  { emoji: "🌱", label: "First Submit", desc: "Made your first submission" },
  { emoji: "🔥", label: "7-Day Streak", desc: "7 consecutive days active" },
  { emoji: "♻️", label: "Recycling Pro", desc: "100+ recyclable items" },
  { emoji: "💯", label: "Perfect Week", desc: "100% accuracy in a week" },
  { emoji: "⚡", label: "Speed Runner", desc: "10 submissions in one day" },
  { emoji: "🎯", label: "Sharpshooter", desc: "50 high-confidence submissions" },
];

const recentActivity = [
  {
    emoji: "♻️",
    item: "PET Plastic Bottle",
    cat: "Recyclable",
    catColor: "blue",
    conf: 0.94,
    pts: 15,
    ok: true,
    time: "2h ago",
  },
  {
    emoji: "🌱",
    item: "Banana Peel",
    cat: "Organic",
    catColor: "green",
    conf: 0.97,
    pts: 10,
    ok: true,
    time: "5h ago",
  },
  {
    emoji: "💻",
    item: "Old Smartphone",
    cat: "E-Waste",
    catColor: "purple",
    conf: 0.61,
    pts: 0,
    ok: false,
    time: "8h ago",
  },
  {
    emoji: "⚠️",
    item: "Paint Can",
    cat: "Hazardous",
    catColor: "red",
    conf: 0.88,
    pts: 20,
    ok: true,
    time: "1d ago",
  },
  {
    emoji: "♻️",
    item: "Cardboard Box",
    cat: "Recyclable",
    catColor: "blue",
    conf: 0.99,
    pts: 12,
    ok: true,
    time: "1d ago",
  },
];

const catColorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  purple: "bg-purple-100 text-purple-700",
  red: "bg-red-100 text-red-700",
};

export function ProfilePage() {
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"activity" | "stats" | "badges" | "clan">(
    "activity"
  );
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);

  const [myClanData, setMyClanData] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/user', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(res => res.json())
    .then(data => { if (data.id) setUser(data); })
    .catch(console.error);

    fetch('http://localhost:8000/api/dashboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(res => res.json())
    .then(data => {
        setStats(data.stats);
        setSubmissions(data.recent_submissions || []);
    })
    .catch(console.error);

    fetch('http://localhost:8000/api/leaderboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(res => res.json())
    .then(data => {
        setMyClanData(data.my_clan || []);
    })
    .catch(console.error);
  }, []);

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      {/* Profile header card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        {/* Cover */}
        <div className="h-36 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 relative">
          <div className="absolute inset-0 opacity-20">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            ></div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 mb-4 relative z-10">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex shrink-0 items-center justify-center text-white font-black text-2xl border-4 border-white shadow-lg">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-gray-900">
                    {user?.name || 'User'}
                  </h1>
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Trophy className="w-3 h-3" /> Rank #{stats?.community_rank || '?'}
                  </span>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Citizen'}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  @{user?.name ? user.name.toLowerCase().replace(/\s+/g, '') : 'user'} · Member since {user?.created_at ? new Date(user.created_at).getFullYear() : new Date().getFullYear()}
                </p>
              </div>
            </div>

            {!isOwnProfile && (
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isFollowing
                    ? "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600"
                    : "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-green-700"
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Follow
                  </>
                )}
              </button>
            )}
          </div>

          <p className="text-gray-600 text-sm mb-4 max-w-lg">
            Passionate about reducing urban waste misclassification. Recycling
            evangelist, composting advocate. Let's make every disposal decision
            count! 🌍
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Total Points", val: stats?.total_points?.toLocaleString() || "0", icon: Leaf, color: "text-emerald-600" },
              { label: "Submissions", val: stats?.classification_count?.toLocaleString() || "0", icon: Camera, color: "text-blue-600" },
              { label: "Accuracy", val: `${stats?.accuracy_rate || 0}%`, icon: Target, color: "text-violet-600" },
              { label: "Followers", val: "0", icon: UserPlus, color: "text-pink-600" },
              { label: "Following", val: "0", icon: UserCheck, color: "text-orange-600" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-xl p-3 text-center hover:bg-gray-100 transition-colors cursor-default"
              >
                <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
                <div className="font-bold text-gray-900 text-sm">{stat.val}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 bg-white rounded-xl border border-gray-100 p-1 shadow-sm w-fit">
        {(["activity", "stats", "badges", "clan"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? "bg-emerald-500 text-white shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Activity tab */}
      {activeTab === "activity" && (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-50">
                <h2 className="font-bold text-gray-900">Classification History</h2>
                <p className="text-xs text-gray-400">{stats?.classification_count || 0} total submissions</p>
              </div>
              <div className="divide-y divide-gray-50">
                {submissions.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                      <Camera className="w-10 h-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No submissions yet.</p>
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
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColorMap[col] || "bg-gray-100 text-gray-700"}`}
                            >
                              {categoryUpper}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <div className="h-1 w-16 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${score * 100}%`,
                                    backgroundColor: score >= 0.75 ? "#10b981" : "#f59e0b",
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
                                Evaluated
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Dispute
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
          </div>

          <div className="space-y-4">
            {/* Points over time */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h2 className="font-bold text-gray-900 text-sm mb-3">
                Points Over Time
              </h2>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "none", fontSize: "12px" }} />
                  <Line type="monotone" dataKey="points" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Quick stats */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h2 className="font-bold text-gray-900 text-sm mb-3">
                Category Breakdown
              </h2>
              {[
                { emoji: "♻️", cat: "Recyclable", count: 329, pct: 45, color: "bg-blue-500" },
                { emoji: "🌱", cat: "Organic", count: 205, pct: 28, color: "bg-green-500" },
                { emoji: "💻", cat: "E-Waste", count: 117, pct: 16, color: "bg-purple-500" },
                { emoji: "⚠️", cat: "Hazardous", count: 80, pct: 11, color: "bg-red-500" },
              ].map((c, i) => (
                <div key={i} className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">
                      {c.emoji} {c.cat}
                    </span>
                    <span className="text-gray-400">{c.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${c.color} rounded-full`}
                      style={{ width: `${c.pct}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats tab */}
      {activeTab === "stats" && (
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">Performance Radar</h2>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#6b7280" }} />
                <Radar name="EcoWarrior99" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">Key Metrics</h2>
              <div className="space-y-4">
                {[
                  { label: "Overall Accuracy", val: "96.7%", bar: 96.7, color: "bg-emerald-500" },
                  { label: "High Confidence Rate", val: "89.2%", bar: 89.2, color: "bg-blue-500" },
                  { label: "Dispute Win Rate", val: "78.5%", bar: 78.5, color: "bg-violet-500" },
                  { label: "Daily Active Rate", val: "94.3%", bar: 94.3, color: "bg-amber-500" },
                ].map((m, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-600">{m.label}</span>
                      <span className="font-bold text-gray-900">{m.val}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${m.color} rounded-full`}
                        style={{ width: `${m.bar}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 text-white">
              <h2 className="font-bold mb-3">Milestones</h2>
              <div className="space-y-2">
                {[
                  { label: "🏆 Top 10 Leaderboard", done: true },
                  { label: "📅 30-Day Streak", done: true },
                  { label: "🌍 1,000 Submissions", done: false, progress: 73 },
                  { label: "🤝 100 Followers", done: false, progress: 28 },
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-emerald-100">{m.label}</span>
                    {m.done ? (
                      <CheckCircle className="w-4 h-4 text-emerald-300" />
                    ) : (
                      <span className="text-emerald-200 text-xs">{m.progress}%</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Badges tab */}
      {activeTab === "badges" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Earned Badges</h2>
            <span className="text-sm text-gray-400">6 of 18 unlocked</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {badges.map((badge, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 hover:shadow-md transition-all cursor-default group"
              >
                <div className="text-4xl group-hover:scale-110 transition-transform">
                  {badge.emoji}
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900 text-sm">{badge.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{badge.desc}</p>
                </div>
              </div>
            ))}
            {/* Locked badges */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`locked-${i}`}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gray-50 border border-gray-200 opacity-40 cursor-not-allowed"
              >
                <div className="text-4xl">🔒</div>
                <div className="text-center">
                  <p className="font-bold text-gray-400 text-sm">Locked</p>
                  <p className="text-xs text-gray-300 mt-0.5">Keep earning!</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* My Clan tab */}
      {activeTab === "clan" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              Clan Roster
            </h2>
            <p className="text-xs text-gray-500 mt-1">See how you match up locally.</p>
          </div>
          <div className="divide-y divide-gray-50">
            {myClanData.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">You are not currently in a clan.</p>
              </div>
            ) : (
              myClanData.map((member) => (
                <div
                  key={member.rank}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${
                    member.isYou ? "bg-emerald-50/50" : ""
                  }`}
                >
                  <div className="w-8 flex-shrink-0 text-center">
                    <span className="text-sm font-bold text-gray-700">#{member.rank}</span>
                  </div>
                  
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${member.color || 'from-gray-400 to-gray-500'} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                    {member.avatar}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 mt-0.5">
                      <span className={`text-sm font-semibold truncate ${member.isYou ? "text-emerald-700" : "text-gray-900"}`}>
                        {member.name}
                      </span>
                      {member.isYou && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-600">{member.points.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">pts</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
