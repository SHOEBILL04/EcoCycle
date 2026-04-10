import { useState } from "react";
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

const eventConfig = {
  classification_submitted: { icon: Activity, color: "text-blue-500", bg: "bg-blue-50", label: "Classification Submitted" },
  classification_approved: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", label: "Classification Approved" },
  classification_rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-50", label: "Classification Rejected" },
  dispute_created: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50", label: "Dispute Created" },
  dispute_resolved: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", label: "Dispute Resolved" },
  dispute_escalated: { icon: Flag, color: "text-orange-500", bg: "bg-orange-50", label: "Dispute Escalated" },
  points_awarded: { icon: Zap, color: "text-yellow-500", bg: "bg-yellow-50", label: "Points Awarded" },
  reward_redeemed: { icon: Gift, color: "text-purple-500", bg: "bg-purple-50", label: "Reward Redeemed" },
  fraud_detected: { icon: Shield, color: "text-red-500", bg: "bg-red-50", label: "Fraud Detected" },
  fraud_flagged: { icon: Flag, color: "text-red-500", bg: "bg-red-50", label: "Submission Flagged" },
  role_changed: { icon: Settings, color: "text-violet-500", bg: "bg-violet-50", label: "Role Changed" },
  user_followed: { icon: UserPlus, color: "text-pink-500", bg: "bg-pink-50", label: "User Followed" },
};

const auditLogs = [
  {
    id: "AUD-20240410-9823",
    type: "classification_approved" as const,
    category: "classification",
    user: "Alex Johnson",
    userId: "USR-4821",
    timestamp: "2026-04-10T14:32:11Z",
    details: "SUB-4821 classified as Recyclable (PET Plastic) — 94% confidence. Points awarded: 15",
    metadata: { submissionId: "SUB-4821", category: "Recyclable", confidence: 0.94, points: 15, engine: "VisionNet v3" },
    ip: "192.168.1.42",
  },
  {
    id: "AUD-20240410-9822",
    type: "points_awarded" as const,
    category: "reward",
    user: "Alex Johnson",
    userId: "USR-4821",
    timestamp: "2026-04-10T14:32:11Z",
    details: "+15 points awarded for SUB-4821. New balance: 2,840",
    metadata: { points: 15, newBalance: 2840, reason: "High-confidence classification" },
    ip: "192.168.1.42",
  },
  {
    id: "AUD-20240410-9820",
    type: "dispute_created" as const,
    category: "dispute",
    user: "System",
    userId: "SYS",
    timestamp: "2026-04-10T12:15:44Z",
    details: "DSP-0091 auto-created for SUB-4819. Confidence 61% below threshold 75%",
    metadata: { disputeId: "DSP-0091", submissionId: "SUB-4819", confidence: 0.61, threshold: 0.75 },
    ip: "—",
  },
  {
    id: "AUD-20240410-9818",
    type: "fraud_flagged" as const,
    category: "fraud",
    user: "SpamAccount99",
    userId: "USR-9032",
    timestamp: "2026-04-10T11:44:22Z",
    details: "SUB-4815 flagged as duplicate — identical image submitted within 30-minute window. No points awarded.",
    metadata: { submissionId: "SUB-4815", duplicateOf: "SUB-4809", windowMinutes: 30, similarity: 0.98 },
    ip: "10.0.0.99",
  },
  {
    id: "AUD-20240410-9815",
    type: "role_changed" as const,
    category: "role",
    user: "Alex Johnson",
    userId: "USR-4821",
    timestamp: "2026-04-10T10:00:05Z",
    details: "Role changed for Mod_Sarah (USR-3021): Citizen → Moderator",
    metadata: { targetUser: "Mod_Sarah", targetUserId: "USR-3021", previousRole: "Citizen", newRole: "Moderator" },
    ip: "192.168.1.1",
  },
  {
    id: "AUD-20240410-9810",
    type: "dispute_resolved" as const,
    category: "dispute",
    user: "Mod_Sarah",
    userId: "USR-3021",
    timestamp: "2026-04-10T09:31:18Z",
    details: "DSP-0089 resolved as Hazardous. Both models agreed (71% / 69%). Points awarded to GreenPath.",
    metadata: { disputeId: "DSP-0089", resolution: "Hazardous", pointsAwarded: 20, resolvedBy: "Mod_Sarah" },
    ip: "10.0.1.15",
  },
  {
    id: "AUD-20240410-9808",
    type: "reward_redeemed" as const,
    category: "reward",
    user: "GreenGuardian",
    userId: "USR-0001",
    timestamp: "2026-04-10T09:12:03Z",
    details: "Reward redeemed: $10 Grocery Voucher (GreenMart). 500 points deducted. Atomic redemption successful.",
    metadata: { rewardId: "RWD-042", rewardName: "$10 Grocery Voucher", points: 500, partner: "GreenMart" },
    ip: "203.0.113.5",
  },
  {
    id: "AUD-20240410-9805",
    type: "fraud_detected" as const,
    category: "fraud",
    user: "System",
    userId: "SYS",
    timestamp: "2026-04-10T08:55:41Z",
    details: "Fraud detection: SpamAccount99 submitted 47 images in 30 minutes. Rate limit exceeded. Account flagged for review.",
    metadata: { userId: "USR-9032", submissionsCount: 47, windowMinutes: 30, limit: 20 },
    ip: "—",
  },
  {
    id: "AUD-20240410-9801",
    type: "dispute_escalated" as const,
    category: "dispute",
    user: "Mod_Alex",
    userId: "USR-3022",
    timestamp: "2026-04-10T08:40:12Z",
    details: "DSP-0088 escalated to Administrator. Models strongly disagree (45%/38%). No consensus possible.",
    metadata: { disputeId: "DSP-0088", modelAConf: 0.45, modelBConf: 0.38, escalatedBy: "Mod_Alex" },
    ip: "10.0.1.20",
  },
  {
    id: "AUD-20240410-9799",
    type: "classification_submitted" as const,
    category: "classification",
    user: "NatureFirst",
    userId: "USR-0041",
    timestamp: "2026-04-10T08:12:55Z",
    details: "SUB-4810 submitted. Item: Banana Peel. Engine: Dual. Awaiting classification.",
    metadata: { submissionId: "SUB-4810", engine: "dual", fileSize: "2.1MB" },
    ip: "198.51.100.42",
  },
  {
    id: "AUD-20240410-9797",
    type: "user_followed" as const,
    category: "social",
    user: "CleanEarth",
    userId: "USR-0087",
    timestamp: "2026-04-10T07:44:33Z",
    details: "User CleanEarth started following GreenGuardian",
    metadata: { follower: "CleanEarth", following: "GreenGuardian" },
    ip: "10.20.30.40",
  },
];

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = auditLogs.filter((log) => {
    const matchType = filter === "all" || log.category === filter;
    const matchSearch =
      !search ||
      log.id.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase());
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
    classification: auditLogs.filter(l => l.category === "classification").length,
    dispute: auditLogs.filter(l => l.category === "dispute").length,
    reward: auditLogs.filter(l => l.category === "reward").length,
    fraud: auditLogs.filter(l => l.category === "fraud").length,
    role: auditLogs.filter(l => l.category === "role").length,
    social: auditLogs.filter(l => l.category === "social").length,
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
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50"
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
          <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
          Synchronous writes enforced
        </div>
      </div>

      {/* Audit log table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {filtered.map((log) => {
            const config = eventConfig[log.type];
            const isExpanded = expandedId === log.id;

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
                            {log.id}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {log.details}
                        </p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <User className="w-3 h-3" />
                            {log.user}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatTime(log.timestamp)}
                          </span>
                          {log.ip !== "—" && (
                            <span className="text-xs text-gray-300 font-mono">
                              {log.ip}
                            </span>
                          )}
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
                      {Object.entries(log.metadata).map(([key, val]) => (
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
                        <span className="text-emerald-300">"{log.userId}"</span>
                      </p>
                      <p className="text-gray-400">
                        <span className="text-blue-400">timestamp</span>
                        <span className="text-gray-500">: </span>
                        <span className="text-emerald-300">"{log.timestamp}"</span>
                      </p>
                      <p className="text-gray-400">
                        <span className="text-blue-400">sourceIp</span>
                        <span className="text-gray-500">: </span>
                        <span className="text-emerald-300">"{log.ip}"</span>
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
              <p className="text-gray-400 text-sm">No audit events match your filter</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-400">
          Page 1 of 2,847 (28,470 total events)
        </p>
        <div className="flex gap-2">
          {["← Prev", "1", "2", "3", "...", "2847", "Next →"].map((p, i) => (
            <button
              key={i}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                p === "1"
                  ? "bg-violet-500 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
