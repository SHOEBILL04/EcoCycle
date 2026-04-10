import { useMemo, useState } from "react";

type SubmissionResult = {
  status: "pending" | "auto_classified";
  message?: string;
  finalCategory?: string;
  pointsAwarded?: number;
};

const API = "http://localhost:8000/api";

export function SubmitWastePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SubmissionResult | null>(null);

  const fileName = useMemo(() => file?.name ?? "No file selected", [file]);

  const handleFileChange = (nextFile: File | null) => {
    setFile(nextFile);
    setResult(null);
    setError("");

    if (!nextFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(nextFile);
    setPreviewUrl(objectUrl);
  };

  const submitImage = async () => {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setSubmitting(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("You are not logged in.");
      }

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API}/submissions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || payload.message || "Submission failed");
      }

      if (payload.status === "pending") {
        setResult({
          status: "pending",
          message: "Your image is under review by our moderators",
        });
      } else {
        setResult({
          status: "auto_classified",
          finalCategory: payload.finalCategory,
          pointsAwarded: payload.pointsAwarded,
          message: `Classified as ${payload.finalCategory}! You earned ${payload.pointsAwarded} points!`,
        });
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Submission failed";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Submit Waste</h1>
        <p className="text-sm text-gray-500 mt-1">Upload a waste image for AI classification.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Waste Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
          />
          <p className="mt-2 text-xs text-gray-500">{fileName}</p>
        </div>

        {previewUrl && (
          <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <img src={previewUrl} alt="Waste preview" className="max-h-80 w-full object-contain" />
          </div>
        )}

        <button
          type="button"
          onClick={() => submitImage().catch(console.error)}
          disabled={!file || submitting}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit For Classification"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {result && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {result.message}
        </div>
      )}
    </div>
  );
}
