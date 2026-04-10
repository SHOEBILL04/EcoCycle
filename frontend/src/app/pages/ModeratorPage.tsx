import { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Filter,
  Search,
  ChevronDown,
  Cpu,
  BarChart2,
  ArrowUpRight,
  MessageSquare,
  Flag,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type DisputeStatus = "pending" | "reviewing" | "resolved" | "escalated";
type FilterStatus = "all" | DisputeStatus;

const disputes = [
  {
    id: "DSP-0091",
    submissionId: "SUB-4819",
    item: "Old Smartphone",
    user: "Alex Johnson",
    userAvatar: "AJ",
    time: "8 hours ago",
    status: "pending" as const,
    modelA: { name: "VisionNet v3", confidence: 0.61, category: "E-Waste" },
    modelB: { name: "EcoClassifier", confidence: 0.44, category: "Hazardous" },
    imageThumb: "💻",
    notes: "",
  },
  {
    id: "DSP-0090",
    submissionId: "SUB-4808",
    item: "Mixed Packaging",
    user: "NatureFirst",
    userAvatar: "NF",
    time: "14 hours ago",
    status: "reviewing" as const,
    modelA: { name: "VisionNet v3", confidence: 0.58, category: "Recyclable" },
    modelB: { name: "EcoClassifier", confidence: 0.52, category: "Mixed Waste" },
    imageThumb: "📦",
    notes: "Both models disagree on subcategory. Reviewing image quality.",
  },
  {
    id: "DSP-0089",
    submissionId: "SUB-4801",
    item: "Car Battery",
    user: "GreenPath",
    userAvatar: "GP",
    time: "1 day ago",
    status: "resolved" as const,
    modelA: { name: "VisionNet v3", confidence: 0.71, category: "Hazardous" },
    modelB: { name: "EcoClassifier", confidence: 0.69, category: "Hazardous" },
    imageThumb: "🔋",
    notes: "Both models agree on category. Resolved as Hazardous.",
    resolution: "Hazardous",
    resolvedBy: "Mod_Sarah",
  },
  {
    id: "DSP-0088",
    submissionId: "SUB-4795",
    item: "Pill Blister Pack",
    user: "EcoStar",
    userAvatar: "ES",
    time: "2 days ago",
    status: "escalated" as const,
    modelA: { name: "VisionNet v3", confidence: 0.45, category: "Hazardous" },
    modelB: { name: "EcoClassifier", confidence: 0.38, category: "Recyclable" },
    imageThumb: "💊",
    notes: "Models strongly disagree. Low confidence on both. Escalated to Admin.",
  },
  {
    id: "DSP-0087",
    submissionId: "SUB-4790",
    item: "Compostable Bag",
    user: "CleanEarth",
    userAvatar: "CE",
    time: "2 days ago",
    status: "resolved" as const,
    modelA: { name: "VisionNet v3", confidence: 0.66, category: "Organic" },
    modelB: { name: "EcoClassifier", confidence: 0.71, category: "Recyclable" },
    imageThumb: "🛍️",
    notes: "Resolved as Organic after visual inspection.",
    resolution: "Organic",
    resolvedBy: "Mod_Alex",
  },
];

const statusConfig = {
  pending: {
    color: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    label: "Pending",
  },
  reviewing: {
    color: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    label: "Reviewing",
  },
  resolved: {
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    label: "Resolved",
  },
  escalated: {
    color: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
    label: "Escalated",
  },
};

export function ModeratorPage() {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [selectedDispute, setSelectedDispute] = useState<(typeof disputes)[0] | null>(null);
  const [resolution, setResolution] = useState("");
  const [note, setNote] = useState("");

  const stats = [
    { label: "Pending Review", val: disputes.filter(d => d.status === "pending").length, color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
    { label: "In Review", val: disputes.filter(d => d.status === "reviewing").length, color: "text-blue-600", bg: "bg-blue-50", icon: Eye },
    { label: "Resolved Today", val: 8, color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle },
    { label: "Escalated", val: disputes.filter(d => d.status === "escalated").length, color: "text-red-600", bg: "bg-red-50", icon: Flag },
  ];

  const filtered = disputes.filter((d) => {
    const matchFilter = filter === "all" || d.status === filter;
    const matchSearch =
      !search ||
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.item.toLowerCase().includes(search.toLowerCase()) ||
      d.user.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const confidenceColor = (c: number) =>
    c >= 0.75 ? "text-emerald-600" : c >= 0.5 ? "text-amber-600" : "text-red-600";

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            Moderator Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage dispute queue and resolve low-confidence classifications
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          Live Queue
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`${s.bg} rounded-2xl p-4 flex items-center gap-3`}
          >
            <s.icon className={`w-5 h-5 ${s.color}`} />
            <div>
              <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Dispute queue */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search disputes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterStatus)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="resolved">Resolved</option>
                  <option value="escalated">Escalated</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {filtered.map((dispute) => {
                const sc = statusConfig[dispute.status];
                const isSelected = selectedDispute?.id === dispute.id;

                return (
                  <button
                    key={dispute.id}
                    onClick={() => setSelectedDispute(isSelected ? null : dispute)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left ${isSelected ? "bg-emerald-50 border-l-4 border-l-emerald-500" : ""}`}
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      {dispute.imageThumb}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">
                          {dispute.item}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border ${sc.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                          {sc.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{dispute.id}</span>
                        <span>By {dispute.user}</span>
                        <span>{dispute.time}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-semibold ${confidenceColor(dispute.modelA.confidence)}`}>
                          ModelA: {(dispute.modelA.confidence * 100).toFixed(0)}%
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className={`text-xs font-semibold ${confidenceColor(dispute.modelB.confidence)}`}>
                          ModelB: {(dispute.modelB.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </button>
                );
              })}

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No disputes found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedDispute ? (
              <motion.div
                key={selectedDispute.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-4 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-gray-900 text-sm">
                        {selectedDispute.id}
                      </h2>
                      <p className="text-xs text-gray-400">
                        {selectedDispute.submissionId} · {selectedDispute.time}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${statusConfig[selectedDispute.status].color}`}
                    >
                      {statusConfig[selectedDispute.status].label}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Submitted item */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Submitted Item
                    </p>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <span className="text-3xl">{selectedDispute.imageThumb}</span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {selectedDispute.item}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
                            {selectedDispute.userAvatar}
                          </div>
                          <span className="text-xs text-gray-400">
                            {selectedDispute.user}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Model results */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      AI Analysis
                    </p>
                    <div className="space-y-2">
                      {[selectedDispute.modelA, selectedDispute.modelB].map((model, i) => (
                        <div
                          key={i}
                          className="border border-gray-200 rounded-xl p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <Cpu className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-xs font-semibold text-gray-700">
                                {model.name}
                              </span>
                            </div>
                            <span
                              className={`text-xs font-bold ${confidenceColor(model.confidence)}`}
                            >
                              {(model.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  model.confidence >= 0.75
                                    ? "bg-emerald-500"
                                    : model.confidence >= 0.5
                                      ? "bg-amber-500"
                                      : "bg-red-500"
                                }`}
                                style={{ width: `${model.confidence * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-700 font-medium flex-shrink-0">
                              → {model.category}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Existing notes */}
                  {selectedDispute.notes && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Moderator Notes
                      </p>
                      <p className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3">
                        {selectedDispute.notes}
                      </p>
                    </div>
                  )}

                  {/* Resolution panel */}
                  {selectedDispute.status !== "resolved" && (
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Resolution
                      </p>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1.5">
                          Final Classification
                        </label>
                        <select
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                        >
                          <option value="">Select category...</option>
                          <option value="recyclable">♻️ Recyclable</option>
                          <option value="organic">🌱 Organic</option>
                          <option value="e-waste">💻 E-Waste</option>
                          <option value="hazardous">⚠️ Hazardous</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1.5">
                          Notes
                        </label>
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Add resolution notes..."
                          rows={2}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors">
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                        <button className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors">
                          <Flag className="w-3.5 h-3.5" />
                          Escalate
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedDispute.status === "resolved" && (
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-2 bg-emerald-50 rounded-xl p-3">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p className="text-xs font-bold text-emerald-800">
                            Resolved as: {selectedDispute.resolution}
                          </p>
                          <p className="text-xs text-emerald-600">
                            By {selectedDispute.resolvedBy}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 h-64 flex flex-col items-center justify-center text-center p-6"
              >
                <ShieldCheck className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-gray-400 font-medium text-sm">
                  Select a dispute to review
                </p>
                <p className="text-gray-300 text-xs mt-1">
                  Click any item from the queue to view details
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mt-4">
            <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-gray-400" />
              My Moderation Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Resolved Today", val: "8" },
                { label: "Avg. Resolution", val: "4.2m" },
                { label: "This Week", val: "47" },
                { label: "Accuracy", val: "96%" },
              ].map((s, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-gray-900">{s.val}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
