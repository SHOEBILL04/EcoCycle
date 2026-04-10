import { useState, useEffect } from "react";
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

const roleColors: Record<string, string> = {
  citizen: "bg-blue-100 text-blue-700",
  moderator: "bg-purple-100 text-purple-700",
  admin: "bg-amber-100 text-amber-700",
};

const API = 'http://localhost:8000/api';
const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('access_token')}`, 'Content-Type': 'application/json' });

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [editingRole, setEditingRole] = useState<number | null>(null);
  const [liveUsers, setLiveUsers] = useState<any[]>([]);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [config, setConfig] = useState({
    confidenceThreshold: 0.85,
    fraudWindowMinutes: 1440,
    maxSubmissionsPerHour: 20,
    defaultEngine: "dual",
    requireEmailVerification: true,
    autoFlagDuplicates: true,
    leaderboardUpdateInterval: 60,
  });

  useEffect(() => {
    fetch(`${API}/admin/users`, { headers: authHeader() })
      .then(r => r.json()).then(d => setLiveUsers(d.data || [])).catch(console.error);

    fetch(`${API}/admin/system-stats`, { headers: authHeader() })
      .then(r => r.json()).then(setSystemStats).catch(console.error);

    fetch(`${API}/admin/audit-trail`, { headers: authHeader() })
      .then(r => r.json()).then(d => setAuditLogs(d.data || [])).catch(console.error);
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    setEditingRole(null);
    try {
      const res = await fetch(`${API}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setLiveUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        const err = await res.json();
        alert('Role change failed: ' + (err.error || 'Unknown error'));
      }
    } catch (e) { console.error(e); }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "users", label: "User Management", icon: Users },
    { id: "config", label: "System Config", icon: Sliders },
    { id: "system", label: "Audit Trail", icon: Server },
  ];

  const overviewStats = [
    { label: "Total Users", val: systemStats?.user_role_breakdown ? Object.values(systemStats.user_role_breakdown).reduce((sum: number, r: any) => sum + Number(r.total), 0).toLocaleString() : "…", change: "", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Rewarded", val: systemStats?.submission_breakdown?.REWARDED?.total?.toLocaleString() ?? "…", change: "", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending Disputes", val: systemStats?.submission_breakdown?.PENDING?.total?.toLocaleString() ?? "…", change: "", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Fraud Flags", val: systemStats?.submission_breakdown?.FLAGGED?.total?.toLocaleString() ?? "…", change: "Auto-detected", icon: Shield, color: "text-red-600", bg: "bg-red-50" },
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
                <BarChart data={systemStats?.weekly_chart || []}>
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
              {liveUsers.length} users loaded from server
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
                  {liveUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {editingRole === user.id ? (
                          <select
                            defaultValue={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            onBlur={() => setEditingRole(null)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            autoFocus
                          >
                            <option value="citizen">Citizen</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity ${roleColors[user.role] ?? 'bg-gray-100 text-gray-600'}`}
                            onClick={() => setEditingRole(user.id)}
                            title="Click to change role"
                          >
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-emerald-600">
                          {(user.total_points ?? 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{user.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.is_private ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-700'}`}>
                          {user.is_private ? 'private' : 'public'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400">{new Date(user.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="View">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingRole(user.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors" title="Change Role">
                            <Edit className="w-3.5 h-3.5" />
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

      {/* Audit Trail tab */}
      {activeTab === "system" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">Full System Audit Trail</h2>
              <p className="text-xs text-gray-400 mt-0.5">All logged events, most recent first. Synchronous writes only.</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium">
              {auditLogs.length} events loaded
            </span>
          </div>
          <div className="overflow-x-auto">
            {auditLogs.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">No audit events yet.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Time", "Event Type", "User", "Description"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {auditLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-semibold ${
                          log.event_type.includes('FLAGGED') || log.event_type.includes('REJECT') ? 'bg-red-100 text-red-700' :
                          log.event_type.includes('REWARD') || log.event_type.includes('CREATED') ? 'bg-emerald-100 text-emerald-700' :
                          log.event_type.includes('ROLE') ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {log.event_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {log.user?.name ?? `#${log.user_id}`}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                        {log.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
