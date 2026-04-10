import { useState, useEffect } from "react";
import {
  ScrollText,
  Search,
  Download,
  Filter,
  Clock,
  User,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Gift,
  UserPlus,
  Flag,
  Settings,
  ChevronDown,
  ChevronRight,
  Activity,
} from "lucide-react";

type EventType =
  | "all"
  | "classification"
  | "dispute"
  | "reward"
  | "fraud"
  | "role"
  | "social";

const eventConfig: Record<string, any> = {
  SUBMISSION_CREATED: { icon: Activity, color: "text-blue-500", bg: "bg-blue-50", label: "Classification Submitted" },
  SUBMISSION_EVALUATED: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", label: "Classification Evaluated" },
  DISPUTE_CREATED: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50", label: "Dispute Created" },
  DISPUTE_RESOLVED: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", label: "Dispute Resolved" },
  POINTS_REDEEMED: { icon: Gift, color: "text-purple-500", bg: "bg-purple-50", label: "Reward Redeemed" },
  ROLE_CHANGED: { icon: Settings, color: "text-violet-500", bg: "bg-violet-50", label: "Role Changed" },
  FOLLOW_USER: { icon: UserPlus, color: "text-pink-500", bg: "bg-pink-50", label: "User Followed" },
  UNFOLLOW_USER: { icon: User, color: "text-gray-500", bg: "bg-gray-50", label: "User Unfollowed" },
  SECONDARY_REVIEW_PASSED: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50", label: "Secondary Review Passed" },
  SECONDARY_REVIEW_FAILED: { icon: XCircle, color: "text-red-500", bg: "bg-red-50", label: "Secondary Review Failed" },
};

const eventTypes: { id: EventType; label: string; emoji: string }[] = [
  { id: "all", label: "All Events", emoji: "📋" },
  { id: "classification", label: "Classifications", emoji: "🔍" },
  { id: "dispute", label: "Disputes", emoji: "⚖️" },
  { id: "reward", label: "Rewards", emoji: "🎁" },
  { id: "fraud", label: "Fraud", emoji: "🚩" },
  { id: "role", label: "Role Changes", emoji: "🔑" },
  { id: "social", label: "Social", emoji: "👥" },
];

export function AuditTrailPage() {
  const [filter, setFilter] = useState<EventType>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
     fetch('http://localhost:8000/api/admin/audit-trail', {
         headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
     })
     .then(res => res.json())
     .then(data => {
         // data could be paginated
         setAuditLogs(data.data || []);
     })
     .catch(console.error);
  }, []);

  const getCategoryFromType = (type: string) => {
      if (type.includes('SUBMISSION')) return 'classification';
      if (type.includes('DISPUTE')) return 'dispute';
      if (type.includes('POINTS') || type.includes('REWARD')) return 'reward';
      if (type.includes('ROLE')) return 'role';
      if (type.includes('FOLLOW')) return 'social';
      return 'classification';
  };

  const filtered = auditLogs.filter((log) => {
    const logCat = getCategoryFromType(log.event_type);
    const matchType = filter === "all" || logCat === filter;
    const matchSearch =
      !search ||
      log.id.toString().includes(search) ||
      (log.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.user?.name || "").toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const typeCounts = {
    classification: auditLogs.filter(l => getCategoryFromType(l.event_type) === "classification").length,
    dispute: auditLogs.filter(l => getCategoryFromType(l.event_type) === "dispute").length,
    reward: auditLogs.filter(l => getCategoryFromType(l.event_type) === "reward").length,
    fraud: auditLogs.filter(l => getCategoryFromType(l.event_type) === "fraud").length,
    role: auditLogs.filter(l => getCategoryFromType(l.event_type) === "role").length,
    social: auditLogs.filter(l => getCategoryFromType(l.event_type) === "social").length,
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-violet-500" />
            Audit Trail
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Complete immutable log of all system events — synchronized audit writes
          </p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      {/* Event type summary */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {Object.entries(typeCounts).map(([type, count]) => {
          const typeMeta = eventTypes.find(e => e.id === type);
          return (
            <button
              key={type}
              onClick={() => setFilter(type as EventType)}
              className={`bg-white rounded-xl border p-3 text-center transition-all hover:shadow-md ${filter === type ? "border-violet-300 bg-violet-50" : "border-gray-100"}`}
            >
              <p className="text-xl mb-1">{typeMeta?.emoji}</p>
              <p className="text-lg font-black text-gray-900">{count}</p>
              <p className="text-xs text-gray-400 capitalize">{type}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search event ID, user, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {eventTypes.map((et) => (
            <button
              key={et.id}
              onClick={() => setFilter(et.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filter === et.id
                  ? "bg-violet-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {et.emoji} {et.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-900">{filtered.length}</span> of{" "}
          <span className="font-semibold text-gray-900">{auditLogs.length}</span> events
        </p>
        <div className="flex items-center gap-1.5 text-xs text-violet-600 font-medium bg-violet-50 px-3 py-1.5 rounded-lg">
          <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
          Actively syncing
        </div>
      </div>

      {/* Audit log table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {filtered.map((log) => {
            const config = eventConfig[log.event_type] || { icon: Activity, bg: "bg-gray-100", color: "text-gray-600", label: log.event_type };
            const isExpanded = expandedId === log.id;
            let meta: any = {};
            try { meta = typeof log.payload === 'string' ? JSON.parse(log.payload) : log.payload; } catch (e) {}

            return (
              <div key={log.id}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="w-full flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  {/* Event icon */}
                  <div className={`w-8 h-8 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <config.icon className={`w-4 h-4 ${config.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Event header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                            {config.label}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            AUD-{log.id}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {log.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <User className="w-3 h-3" />
                            {log.user?.name || `USR-${log.user_id}`}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatTime(log.created_at)}
                          </span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded metadata */}
                {isExpanded && (
                  <div className="px-4 pb-4 ml-11">
                    <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                      <p className="text-gray-400 mb-2">// Event Metadata</p>
                      {meta && Object.entries(meta).map(([key, val]) => (
                        <p key={key} className="text-gray-300">
                          <span className="text-blue-400">{key}</span>
                          <span className="text-gray-500">: </span>
                          <span className={typeof val === "number" ? "text-amber-300" : typeof val === "boolean" ? "text-green-400" : "text-emerald-300"}>
                            {typeof val === "string" ? `"${val}"` : String(val)}
                          </span>
                        </p>
                      ))}
                      <p className="text-gray-400 mt-2">
                        <span className="text-blue-400">userId</span>
                        <span className="text-gray-500">: </span>
                        <span className="text-emerald-300">"{log.user_id}"</span>
                      </p>
                      <p className="text-gray-400">
                        <span className="text-blue-400">timestamp</span>
                        <span className="text-gray-500">: </span>
                        <span className="text-emerald-300">"{log.created_at}"</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <ScrollText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No audit events found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
