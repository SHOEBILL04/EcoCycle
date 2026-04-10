import { useState } from "react";
import {
  Crown,
  Users,
  Settings,
  Activity,
  Shield,
  TrendingUp,
  Server,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  UserPlus,
  RefreshCw,
  Cpu,
  BarChart2,
  Sliders,
  Eye,
  Ban,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

type Tab = "overview" | "users" | "config" | "system";

const users = [
  { id: 1, name: "GreenGuardian", username: "@greenguardian", email: "gg@eco.com", role: "Citizen", points: 124800, submissions: 842, status: "active", joined: "Jan 2024" },
  { id: 2, name: "EcoWarrior99", username: "@ecowarrior99", email: "ew@eco.com", role: "Citizen", points: 109500, submissions: 731, status: "active", joined: "Feb 2024" },
  { id: 3, name: "Mod_Sarah", username: "@mod_sarah", email: "sarah@eco.com", role: "Moderator", points: 45200, submissions: 301, status: "active", joined: "Jan 2024" },
  { id: 4, name: "Mod_Alex", username: "@mod_alex", email: "alex_m@eco.com", role: "Moderator", points: 38100, submissions: 255, status: "active", joined: "Mar 2024" },
  { id: 5, name: "Alex Johnson", username: "@alexj", email: "alex@eco.com", role: "Administrator", points: 2840, submissions: 148, status: "active", joined: "Mar 2024" },
  { id: 6, name: "SpamAccount99", username: "@spam99", email: "spam@fake.com", role: "Citizen", points: 0, submissions: 347, status: "suspended", joined: "Apr 2026" },
  { id: 7, name: "NatureFirst", username: "@naturefirst", email: "nf@eco.com", role: "Citizen", points: 82300, submissions: 589, status: "active", joined: "Jan 2024" },
  { id: 8, name: "NewUser2026", username: "@newuser", email: "new@example.com", role: "Citizen", points: 120, submissions: 8, status: "active", joined: "Apr 2026" },
];

const submissionsData = [
  { day: "Mon", approved: 1240, disputed: 89, flagged: 12 },
  { day: "Tue", approved: 1580, disputed: 102, flagged: 18 },
  { day: "Wed", approved: 1120, disputed: 78, flagged: 9 },
  { day: "Thu", approved: 1890, disputed: 134, flagged: 23 },
  { day: "Fri", approved: 2100, disputed: 156, flagged: 31 },
  { day: "Sat", approved: 980, disputed: 61, flagged: 8 },
  { day: "Sun", approved: 1350, disputed: 93, flagged: 14 },
];

const systemMetrics = [
  { time: "00:00", latency: 42 },
  { time: "04:00", latency: 38 },
  { time: "08:00", latency: 95 },
  { time: "12:00", latency: 187 },
  { time: "16:00", latency: 143 },
  { time: "20:00", latency: 98 },
  { time: "Now", latency: 67 },
];

const roleColors: Record<string, string> = {
  Citizen: "bg-blue-100 text-blue-700",
  Moderator: "bg-purple-100 text-purple-700",
  Administrator: "bg-amber-100 text-amber-700",
};

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [editingRole, setEditingRole] = useState<number | null>(null);
  const [config, setConfig] = useState({
    confidenceThreshold: 0.75,
    fraudWindowMinutes: 30,
    maxSubmissionsPerHour: 20,
    defaultEngine: "dual",
    requireEmailVerification: true,
    autoFlagDuplicates: true,
    leaderboardUpdateInterval: 60,
  });

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "users", label: "User Management", icon: Users },
    { id: "config", label: "System Config", icon: Sliders },
    { id: "system", label: "System Health", icon: Server },
  ];

  const overviewStats = [
    { label: "Total Users", val: "50,421", change: "+124 today", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Submissions Today", val: "9,260", change: "+15.3% vs yesterday", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Active Disputes", val: "23", change: "8 new today", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Fraud Flags", val: "7", change: "Auto-detected today", icon: Shield, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" />
            Administrator Panel
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Full system access — manage users, configuration, and observability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-xl font-medium">
            <Crown className="w-3.5 h-3.5" />
            Administrator
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-2xl p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewStats.map((s, i) => (
              <div key={i} className={`${s.bg} rounded-2xl p-4`}>
                <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                <p className="text-2xl font-black text-gray-900">{s.val}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                <p className={`text-xs font-medium mt-1 ${s.color}`}>{s.change}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">
                Weekly Submission Volume
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={submissionsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", fontSize: "12px" }} />
                  <Bar dataKey="approved" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="disputed" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="flagged" fill="#ef4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 justify-center">
                {[
                  { color: "bg-emerald-500", label: "Approved" },
                  { color: "bg-amber-500", label: "Disputed" },
                  { color: "bg-red-500", label: "Flagged" },
                ].map((l, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <div className={`w-3 h-3 rounded ${l.color}`}></div>
                    {l.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-3">
                  User Role Distribution
                </h2>
                <div className="space-y-3">
                  {[
                    { role: "Citizens", count: 50387, pct: 99.8, color: "bg-blue-500" },
                    { role: "Moderators", count: 28, pct: 0.06, color: "bg-purple-500" },
                    { role: "Administrators", count: 6, pct: 0.01, color: "bg-amber-500" },
                  ].map((r, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{r.role}</span>
                        <span className="font-semibold text-gray-900">{r.count.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${r.color} rounded-full`} style={{ width: `${Math.max(r.pct, 1)}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-3">
                  Classification Engine Stats
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { engine: "VisionNet v3", accuracy: "93.2%", latency: "142ms", uses: "64%" },
                    { engine: "EcoClassifier", accuracy: "94.8%", latency: "287ms", uses: "36%" },
                  ].map((e, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Cpu className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-bold text-gray-700">{e.engine}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Accuracy</span>
                          <span className="text-emerald-600 font-semibold">{e.accuracy}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Avg Latency</span>
                          <span className="text-gray-700">{e.latency}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Usage Share</span>
                          <span className="text-gray-700">{e.uses}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users tab */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {users.length} users shown (50,421 total)
            </p>
            <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["User", "Role", "Points", "Submissions", "Status", "Joined", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.status === "suspended" ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {editingRole === user.id ? (
                          <select
                            defaultValue={user.role}
                            onBlur={() => setEditingRole(null)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            autoFocus
                          >
                            <option>Citizen</option>
                            <option>Moderator</option>
                            <option>Administrator</option>
                          </select>
                        ) : (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity ${roleColors[user.role]}`}
                            onClick={() => setEditingRole(user.id)}
                            title="Click to change role"
                          >
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-emerald-600">
                          {user.points.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{user.submissions}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          user.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400">{user.joined}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="View">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors" title="Edit">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Suspend">
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Config tab */}
      {activeTab === "config" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-gray-400" />
              Classification Engine
            </h2>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Confidence Threshold
                </label>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                  {config.confidenceThreshold}
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={config.confidenceThreshold}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    confidenceThreshold: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0.5 (Lenient)</span>
                <span>0.95 (Strict)</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Submissions below this threshold enter dispute resolution before
                any reward is issued.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Classification Engine
              </label>
              <div className="space-y-2">
                {[
                  { id: "model-a", label: "VisionNet v3 (Fast)" },
                  { id: "model-b", label: "EcoClassifier (Accurate)" },
                  { id: "dual", label: "Dual Engine (Recommended)" },
                ].map((e) => (
                  <label
                    key={e.id}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <input
                      type="radio"
                      name="engine"
                      value={e.id}
                      checked={config.defaultEngine === e.id}
                      onChange={(ev) =>
                        setConfig((c) => ({ ...c, defaultEngine: ev.target.value }))
                      }
                      className="accent-emerald-500"
                    />
                    <span className="text-sm text-gray-700">{e.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-400" />
              Fraud Detection
            </h2>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Duplicate Detection Window
                </label>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                  {config.fraudWindowMinutes}m
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={config.fraudWindowMinutes}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    fraudWindowMinutes: parseInt(e.target.value),
                  }))
                }
                className="w-full accent-emerald-500"
              />
              <p className="text-xs text-gray-400 mt-2">
                Time window for detecting repeated/near-identical image
                submissions from the same user.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Max Submissions per Hour
                </label>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                  {config.maxSubmissionsPerHour}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={config.maxSubmissionsPerHour}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    maxSubmissionsPerHour: parseInt(e.target.value),
                  }))
                }
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Leaderboard Update Interval
                </label>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                  {config.leaderboardUpdateInterval}s
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                step="10"
                value={config.leaderboardUpdateInterval}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    leaderboardUpdateInterval: parseInt(e.target.value),
                  }))
                }
                className="w-full accent-emerald-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Maximum allowed: 60s (per system requirements)
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100">
              {[
                { key: "requireEmailVerification" as const, label: "Require Email Verification" },
                { key: "autoFlagDuplicates" as const, label: "Auto-flag Duplicate Submissions" },
              ].map((s) => (
                <div key={s.key} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-700">{s.label}</span>
                  <button
                    onClick={() => setConfig(c => ({ ...c, [s.key]: !c[s.key] }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${config[s.key] ? "bg-emerald-500" : "bg-gray-200"}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${config[s.key] ? "translate-x-6" : "translate-x-1"}`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-emerald-500/25 text-sm">
              <CheckCircle className="w-4 h-4" />
              Save Configuration
            </button>
            <button className="flex items-center gap-2 bg-gray-100 text-gray-600 hover:bg-gray-200 font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
              <RefreshCw className="w-4 h-4" />
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* System health tab */}
      {activeTab === "system" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "API Response", val: "67ms", status: "healthy", icon: Activity },
              { label: "DB Latency", val: "12ms", status: "healthy", icon: Server },
              { label: "Queue Depth", val: "23", status: "warning", icon: AlertCircle },
              { label: "Uptime", val: "99.97%", status: "healthy", icon: CheckCircle },
            ].map((m, i) => (
              <div key={i} className={`rounded-2xl p-4 ${m.status === "healthy" ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"}`}>
                <div className="flex items-center justify-between mb-2">
                  <m.icon className={`w-4 h-4 ${m.status === "healthy" ? "text-emerald-500" : "text-amber-500"}`} />
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.status === "healthy" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {m.status}
                  </span>
                </div>
                <p className="text-2xl font-black text-gray-900">{m.val}</p>
                <p className="text-xs text-gray-500">{m.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">API Response Latency (24h)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={systemMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} unit="ms" />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", fontSize: "12px" }} />
                <Line type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">Service Status</h2>
            <div className="space-y-3">
              {[
                { service: "Classification API", status: "operational", latency: "67ms" },
                { service: "VisionNet v3 Engine", status: "operational", latency: "142ms" },
                { service: "EcoClassifier Engine", status: "operational", latency: "287ms" },
                { service: "Dispute Queue Worker", status: "degraded", latency: "—" },
                { service: "Points & Rewards Service", status: "operational", latency: "34ms" },
                { service: "Audit Log Writer", status: "operational", latency: "8ms" },
                { service: "Leaderboard Sync", status: "operational", latency: "45ms" },
                { service: "Fraud Detection Engine", status: "operational", latency: "23ms" },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${s.status === "operational" ? "bg-emerald-500" : s.status === "degraded" ? "bg-amber-500 animate-pulse" : "bg-red-500"}`}></div>
                    <span className="text-sm text-gray-700">{s.service}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.latency !== "—" && (
                      <span className="text-xs text-gray-400">{s.latency}</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      s.status === "operational" ? "bg-emerald-100 text-emerald-700" :
                      s.status === "degraded" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
