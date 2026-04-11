import { useEffect, useMemo, useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { 
  FileSearch, 
  AlertOctagon, 
  CheckCircle, 
  XCircle, 
  Info,
  Clock,
  User as UserIcon,
  ChevronRight,
  Zap,
  ShieldAlert
} from "lucide-react";

type ScoreMap = {
  recyclable: number;
  organic: number;
  "e-waste": number;
  hazardous: number;
};

type AuditEntry = {
  id: number;
  event_type: string;
  description: string;
  created_at: string;
  user?: { name: string; role: string };
};

type DisputeItem = {
  id: number;
  status: 'PENDING' | 'FLAGGED';
  flaggedReason?: string;
  imageUrl: string;
  aiConfidenceScores: any;
  createdAt: string;
  submittedBy: string;
};

const API = import.meta.env.VITE_API_URL;
const categories: Array<keyof ScoreMap> = ["recyclable", "organic", "e-waste", "hazardous"];

function normalizeSubmissionImageUrl(rawUrl: string) {
  if (!rawUrl) {
    return "";
  }

  try {
    const apiUrl = new URL(API);
    const parsedUrl = new URL(rawUrl, apiUrl.origin);

    if (parsedUrl.pathname.startsWith("/storage/")) {
      return new URL(parsedUrl.pathname, apiUrl.origin).toString();
    }

    return parsedUrl.toString();
  } catch {
    return rawUrl;
  }
}

export function ModeratorPage() {
  const [queue, setQueue] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  
  // Audit Modal State
  const [inspectingId, setInspectingId] = useState<number | null>(null);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const pendingCount = useMemo(() => queue.length, [queue]);

  const loadQueue = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API}/moderator/disputes`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Failed to load disputes");
      setQueue(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue().catch(console.error);
  }, []);

  const openAuditModal = async (submissionId: number) => {
    setInspectingId(submissionId);
    setLoadingAudit(true);
    setAuditEntries([]);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API}/moderator/audit/${submissionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const data = await response.json();
      setAuditEntries(data.audit_trail || []);
    } catch (err) {
      console.error("Failed to load audit trail", err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const submitVerdict = async (submissionId: number, category: keyof ScoreMap) => {
    const ok = window.confirm(`Are you sure you want to classify this as ${category}?`);
    if (!ok) return;

    setWorkingId(submissionId);
    setError("");
    setToast("");

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API}/moderator/disputes/${submissionId}/verdict`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ category }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Verdict failed");

      setQueue((prev) => prev.filter((item) => item.id !== submissionId));
      setToast("Submission resolved! Point reward triggered.");
      window.dispatchEvent(new CustomEvent('user-updated')); // Local UI update
    } catch (verdictError) {
      setError(verdictError instanceof Error ? verdictError.message : "Verdict failed");
    } finally {
      setWorkingId(null);
    }
  };

  const rejectSubmission = async (submissionId: number) => {
    const ok = window.confirm("Are you sure you want to REJECT this submission? No points will be awarded.");
    if (!ok) return;

    setWorkingId(submissionId);
    try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${API}/moderator/resolve/${submissionId}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ resolution: 'REJECTED' }),
        });
        if (!response.ok) throw new Error("Rejection failed");
        setQueue((prev) => prev.filter((item) => item.id !== submissionId));
        setToast("Submission rejected.");
    } catch (err) {
        setError("Rejection failed.");
    } finally {
        setWorkingId(null);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moderation Queue</h1>
          <p className="text-sm text-gray-500 mt-1">Review disputes, resolve flags, and inspect audit trails.</p>
        </div>
        <div className="flex gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                Disputes
                <span className="inline-flex min-w-6 justify-center rounded-full bg-amber-200 px-2 py-0.5 text-amber-900">
                    {queue.filter(i => i.status === 'PENDING').length}
                </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                Flagged
                <span className="inline-flex min-w-6 justify-center rounded-full bg-red-200 px-2 py-0.5 text-red-900">
                    {queue.filter(i => i.status === 'FLAGGED').length}
                </span>
            </div>
        </div>
      </div>

      {toast && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {toast}</div>}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2"><AlertOctagon className="w-4 h-4" /> {error}</div>}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 space-y-3">
              <Zap className="w-8 h-8 m-auto animate-pulse" />
              <p className="text-sm font-medium">Fetching moderator tasks...</p>
          </div>
        ) : queue.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
              <CheckCircle className="w-12 h-12 m-auto text-gray-200 mb-4" />
              <p className="text-sm">Queue empty! All submissions resolved.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {queue.map((item) => (
              <div key={item.id} className={`p-5 space-y-4 transition-colors ${item.status === 'FLAGGED' ? 'bg-red-50/30' : ''}`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${item.status === 'FLAGGED' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                        {item.status}
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Submission #{item.id}</p>
                        <p className="text-xs text-gray-500 mt-1">Submitted by {item.submittedBy || 'Anonymous'} • {new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => openAuditModal(item.id)}
                    className="flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors border border-emerald-100"
                  >
                      <FileSearch className="w-3.5 h-3.5" />
                      Inspect Audit Trail
                  </button>
                </div>

                {item.status === 'FLAGGED' && (
                    <div className="flex items-start gap-3 bg-white border border-red-100 rounded-xl p-3 shadow-sm">
                        <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-red-800 uppercase tracking-tighter">Fraud Detection Warning</p>
                            <p className="text-xs text-red-600 mt-0.5">{item.flaggedReason || 'Suspicious activity detected by automated engines.'}</p>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden relative group">
                    <ImageWithFallback
                      src={normalizeSubmissionImageUrl(item.imageUrl)}
                      alt={`Submission ${item.id}`}
                      className="h-72 w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">Click image to enlarge</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                        {/* Primary Engine Card */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 flex items-center gap-1.5">
                              <Zap className="w-3 h-3 text-emerald-500" /> Primary Engine Analysis
                          </p>
                          <div className="space-y-3">
                            {categories.map((category) => {
                                const dist = item.aiConfidenceScores?.primary_distribution || {};
                                const score = dist[category] ?? 0;
                                return (
                                <div key={category}>
                                    <div className="mb-1 flex items-center justify-between text-[10px] text-gray-600">
                                    <span className="font-medium">{category}</span>
                                    <span>{(score * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-gray-50 border border-gray-100 overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: `${score * 100}%` }} />
                                    </div>
                                </div>
                                );
                            })}
                          </div>
                        </div>

                        {/* Fallback Engine Card */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 flex items-center gap-1.5">
                              <Info className="w-3 h-3 text-blue-500" /> Consensus Analysis
                          </p>
                          <div className="space-y-3">
                            {categories.map((category) => {
                                const dist = item.aiConfidenceScores?.secondary_distribution || {};
                                const score = dist[category] ?? 0;
                                return (
                                <div key={category}>
                                    <div className="mb-1 flex items-center justify-between text-[10px] text-gray-600">
                                    <span className="font-medium">{category}</span>
                                    <span>{(score * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-gray-50 border border-gray-100 overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: `${score * 100}%` }} />
                                    </div>
                                </div>
                                );
                            })}
                          </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Final Verdict</p>
                        <div className="flex flex-wrap gap-2">
                           {categories.map((category) => (
                             <button
                               key={category}
                               type="button"
                               disabled={workingId === item.id}
                               onClick={() => submitVerdict(item.id, category).catch(console.error)}
                               className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-all disabled:opacity-50 active:scale-95"
                             >
                               {category}
                             </button>
                           ))}
                           <div className="w-full sm:w-auto h-10 border-l border-gray-100 hidden sm:block mx-1"></div>
                           <button
                             disabled={workingId === item.id}
                             onClick={() => rejectSubmission(item.id)}
                             className="px-4 py-2 text-xs font-bold rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-50 flex items-center gap-2"
                           >
                               <XCircle className="w-3.5 h-3.5" />
                               Reject
                           </button>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Modal */}
      {inspectingId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl border border-white/20 flex flex-col">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <div>
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                              <FileSearch className="w-5 h-5 text-emerald-600" />
                              Audit Trail: Submission #{inspectingId}
                          </h3>
                          <p className="text-xs text-gray-500">Immutable system logs for legal compliance.</p>
                      </div>
                      <button onClick={() => setInspectingId(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                          <XCircle className="w-6 h-6 text-gray-400" />
                      </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {loadingAudit ? (
                          <div className="py-12 text-center text-gray-400">Loading trail...</div>
                      ) : auditEntries.length === 0 ? (
                          <div className="py-12 text-center text-gray-400">No logs found.</div>
                      ) : (
                          <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-4 before:w-px before:bg-gray-100">
                             {auditEntries.map((log) => (
                                 <div key={log.id} className="relative pl-10">
                                     <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center z-10">
                                         <Clock className="w-3 h-3 text-emerald-600" />
                                     </div>
                                     <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                         <div className="flex items-center justify-between mb-2">
                                             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                                 {log.event_type}
                                             </span>
                                             <span className="text-[10px] text-gray-400 font-medium">{new Date(log.created_at).toLocaleString()}</span>
                                         </div>
                                         <p className="text-xs text-gray-700 leading-relaxed mb-3">{log.description}</p>
                                         {log.user && (
                                             <div className="flex items-center gap-2 pt-3 border-t border-gray-200/50">
                                                 <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                                     <UserIcon className="w-2.5 h-2.5 text-white" />
                                                 </div>
                                                 <span className="text-[10px] font-bold text-gray-600">{log.user.name}</span>
                                                 <span className="text-[10px] text-gray-400">• {log.user.role}</span>
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             ))}
                          </div>
                      )}
                  </div>

                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                      <button onClick={() => setInspectingId(null)} className="px-6 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors">
                          Close
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
