import { useEffect, useMemo, useState } from "react";

type ScoreMap = {
  recyclable: number;
  organic: number;
  "e-waste": number;
  hazardous: number;
};

type DisputeItem = {
  id: number;
  imageUrl: string;
  aiConfidenceScores: ScoreMap;
  createdAt: string;
  submittedBy: string;
};

const API = import.meta.env.VITE_API_URL;

const categories: Array<keyof ScoreMap> = ["recyclable", "organic", "e-waste", "hazardous"];

export function ModeratorPage() {
  const [queue, setQueue] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const pendingCount = useMemo(() => queue.length, [queue]);

  const loadQueue = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No auth token");
      }

      const response = await fetch(`${API}/moderator/disputes`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to load disputes");
      }

      setQueue(Array.isArray(payload) ? payload : payload.disputes || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue().catch(console.error);
  }, []);

  const submitVerdict = async (submissionId: number, category: keyof ScoreMap) => {
    const ok = window.confirm(`Are you sure you want to classify this as ${category}?`);
    if (!ok) {
      return;
    }

    setWorkingId(submissionId);
    setError("");
    setToast("");

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No auth token");
      }

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

      if (response.status === 409) {
        setError("Already resolved");
        setQueue((prev) => prev.filter((item) => item.id !== submissionId));
        return;
      }

      if (!response.ok) {
        throw new Error(payload.error || "Verdict failed");
      }

      setQueue((prev) => prev.filter((item) => item.id !== submissionId));
      setToast("Verdict submitted! User has been notified.");
    } catch (verdictError) {
      setError(verdictError instanceof Error ? verdictError.message : "Verdict failed");
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dispute Queue</h1>
          <p className="text-sm text-gray-500 mt-1">Review and resolve pending submissions.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
          Pending
          <span className="inline-flex min-w-6 justify-center rounded-full bg-amber-200 px-2 py-0.5 text-amber-900">{pendingCount}</span>
        </div>
      </div>

      {toast && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{toast}</div>}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Loading pending disputes...</p>
        ) : queue.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No pending disputes.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {queue.map((item) => (
              <div key={item.id} className="p-5 space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Submission #{item.id}</p>
                    <p className="text-xs text-gray-500 mt-1">Submitted by {item.submittedBy} • {new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                    <img src={item.imageUrl} alt={`Submission ${item.id}`} className="h-64 w-full object-cover" />
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-sm font-semibold text-gray-800 mb-3">AI Confidence Scores</p>
                      <div className="space-y-3">
                        {categories.map((category) => {
                          const score = item.aiConfidenceScores?.[category] ?? 0;
                          return (
                            <div key={category}>
                              <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                                <span>{category}</span>
                                <span>{(score * 100).toFixed(1)}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-gray-100">
                                <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.max(2, score * 100)}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          disabled={workingId === item.id}
                          onClick={() => submitVerdict(item.id, category).catch(console.error)}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
