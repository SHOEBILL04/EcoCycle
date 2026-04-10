import { useState, useRef } from "react";
// @ts-ignore
import * as tmImage from "@teachablemachine/image";
import {
  Upload,
  Camera,
  X,
  Zap,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Cpu,
  BarChart2,
  Leaf,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ApiError, parseJsonBody, parseJsonResponse } from "../lib/api";

type ClassificationStatus = "idle" | "analyzing" | "result" | "dispute";
type ProbabilityMap = Record<string, number>;
const ECHO_MODEL_URL = "https://teachablemachine.withgoogle.com/models/MUD5GsV1U/";

const engines = [
  {
    id: "echo_engine",
    name: "Echo_engine",
    desc: "Default Teachable Machine detector with automatic Gemini fallback",
    badge: "Recommended",
    color: "emerald",
  },
  {
    id: "gemini_engine",
    name: "Gemini",
    desc: "High-accuracy cloud classifier for direct analysis",
    badge: "High Accuracy",
    color: "blue",
  },
];

const mockResults = {
  high: {
    category: "Recyclable",
    subcategory: "PET Plastic — Type 1",
    confidence: 0.94,
    emoji: "♻️",
    color: "blue",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    points: 15,
    status: "approved" as const,
    modelA: { confidence: 0.94, category: "Recyclable" },
    modelB: { confidence: 0.91, category: "Recyclable" },
    probabilities: {
      recyclable: 0.94,
      organic: 0.03,
      "e-waste": 0.02,
      hazardous: 0.01,
    },
    tips: [
      "Rinse container before placing in recycling bin",
      "Remove any lids or caps",
      "Crush to save space in the bin",
    ],
    isDisputeResolved: false,
    isPenalty: false,
    message: "",
  },
  low: {
    category: "E-Waste",
    subcategory: "Consumer Electronics",
    confidence: 0.61,
    emoji: "💻",
    color: "purple",
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
    points: 0,
    status: "dispute" as const,
    modelA: { confidence: 0.61, category: "E-Waste" },
    modelB: { confidence: 0.44, category: "Hazardous" },
    probabilities: {
      recyclable: 0.08,
      organic: 0.11,
      "e-waste": 0.61,
      hazardous: 0.2,
    },
    tips: [
      "E-waste must be dropped at a certified collection point",
      "Never dispose in regular trash",
      "Check for manufacturer take-back programs",
    ],
    isDisputeResolved: false,
    isPenalty: false,
    message: "",
  },
};

export function SubmitWastePage() {
  const [selectedEngine, setSelectedEngine] = useState("echo_engine");
  const [dragOver, setDragOver] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [status, setStatus] = useState<ClassificationStatus>("idle");
  const [result, setResult] = useState<(typeof mockResults)["high"] | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.85);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setStatus("idle");
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) return;
    setStatus("analyzing");
    setAnalysisProgress(0);
    
    // Start an artificial progress bar
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => (prev >= 80 ? 80 : prev + 10));
    }, 150);

    try {
      let tmCategory = null;
      let tmConfidence = null;
      let tmPredictions: ProbabilityMap = {};

      if (selectedEngine === "echo_engine") {
        try {
          const modelURL = ECHO_MODEL_URL.endsWith('/') ? ECHO_MODEL_URL + "model.json" : ECHO_MODEL_URL + "/model.json";
          const metadataURL = ECHO_MODEL_URL.endsWith('/') ? ECHO_MODEL_URL + "metadata.json" : ECHO_MODEL_URL + "/metadata.json";
          
          const model = await tmImage.load(modelURL, metadataURL);
          const img = new Image();
          img.src = uploadedImage;
          await new Promise((resolve) => { img.onload = resolve; });
          
          const prediction = await model.predict(img);
          prediction.sort((a, b) => b.probability - a.probability);
          tmPredictions = prediction.reduce((acc, item) => {
            acc[String(item.className).toLowerCase()] = item.probability;
            return acc;
          }, {} as ProbabilityMap);
          
          tmCategory = prediction[0].className;
          tmConfidence = prediction[0].probability;
        } catch (e) {
          clearInterval(interval);
          setStatus("idle");
          alert("Failed to load or execute your Teachable Machine model! Is the URL correct?");
          return;
        }
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/submit-waste`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ 
            image_b64: uploadedImage, 
            engine: selectedEngine,
            ...(tmCategory && { tm_category: tmCategory }),
            ...(tmConfidence !== null && { tm_confidence: tmConfidence }),
            ...(Object.keys(tmPredictions).length > 0 && { tm_predictions: tmPredictions }),
        })
      });

      clearInterval(interval);
      setAnalysisProgress(100);
      
      if (response.status === 401) {
        clearInterval(interval);
        setStatus("idle");
        alert('Your session has expired. Please sign in again.');
        return;
      }

      if (response.status === 422) {
        const payload = await parseJsonBody(response);

        if (payload.status === 'FLAGGED') {
          const isPenalty = payload.penalty !== undefined;
          const fakeResult = {
            category: 'Unknown', subcategory: isPenalty ? 'Cheating Detected' : 'Fraud detected', confidence: 0,
            emoji: "⚠️", color: isPenalty ? "red" : "amber", bg: isPenalty ? "bg-red-50" : "bg-amber-50", border: isPenalty ? "border-red-200" : "border-amber-200",
            badge: isPenalty ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700", points: payload.penalty ? -payload.penalty : 0, status: "dispute",
            modelA: { category: '-', confidence: 0 },
            modelB: { category: '-', confidence: 0 },
            tips: [payload.message],
            isDisputeResolved: false,
            isPenalty: isPenalty,
            message: payload.message
          };
          setResult(fakeResult as any);
          setStatus("dispute");
          window.dispatchEvent(new CustomEvent('user-updated'));
          return;
        }
      }

      const payload = await parseJsonResponse(response);

      const { submission, points_awarded, status: responseStatus, message } = payload;
      const isHigh = responseStatus === 'REWARDED' || responseStatus === 'REWARDED_VIA_DISPUTE';
      const isDisputeResolved = responseStatus === 'REWARDED_VIA_DISPUTE';
      const classification = payload.classification || {};
      const threshold = Number(classification.threshold ?? confidenceThreshold);
      setConfidenceThreshold(threshold);
      const probabilities = (classification.primary_distribution || {}) as ProbabilityMap;
      
      // Map API result to fakeResult shape
      const fakeResult = {
        category: formatCategoryLabel(String(submission.category || "unknown")),
        subcategory: "Recognized System Category",
        confidence: parseFloat(submission.confidence_score),
        emoji: submission.category === 'organic' ? '🌱' : submission.category === 'e-waste' ? '💻' : submission.category === 'hazardous' ? '⚠️' : '♻️',
        bg: isHigh ? 'bg-emerald-50' : 'bg-amber-50',
        border: isHigh ? 'border-emerald-200' : 'border-amber-200',
        badge: isHigh ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
        points: points_awarded || 0,
        status: isHigh ? "approved" : "dispute",
        modelA: {
          category: classification.primary_engine || "Echo_engine (Teachable Machine)",
          confidence: parseFloat(classification.primary_confidence ?? 0),
        },
        modelB: {
          category: classification.secondary_engine || "Gemini High Accuracy Fallback",
          confidence: parseFloat(classification.secondary_confidence ?? 0),
        },
        probabilities,
        tips: ["Check your profile points!"],
        isDisputeResolved,
        isPenalty: false,
        message
      };
      
      setResult(fakeResult as any);
      setStatus(isHigh ? "result" : "dispute");

      // Notify the global layout that user points/stats have changed
      window.dispatchEvent(new CustomEvent('user-updated'));

    } catch (err: any) {
      clearInterval(interval);
      setStatus("idle");
      console.error(err);
      const message =
        err instanceof ApiError
          ? err.payload?.message || err.payload?.error || err.message
          : err.message || 'Failed to analyze image';
      alert(`Error: ${message}`);
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setStatus("idle");
    setResult(null);
    setAnalysisProgress(0);
  };

  const confidenceColor = (c: number) =>
    c >= 0.75 ? "text-emerald-600" : c >= 0.5 ? "text-amber-600" : "text-red-600";
  const confidenceBg = (c: number) =>
    c >= 0.75
      ? "from-emerald-500 to-green-400"
      : c >= 0.5
        ? "from-amber-500 to-yellow-400"
        : "from-red-500 to-red-400";
  const formatCategoryLabel = (category: string) =>
    category
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("-");
  const primaryProgressLabel =
    selectedEngine === "echo_engine"
      ? "Echo_engine (Teachable Machine)"
      : "Gemini High Accuracy";
  const secondaryProgressLabel =
    selectedEngine === "echo_engine"
      ? "Gemini High Accuracy Fallback"
      : "Gemini Consensus Check";

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Submit Waste Item</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Upload a photo of your waste item for AI-powered classification
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left column: upload + engine */}
        <div className="lg:col-span-2 space-y-5">
          {/* Engine selector */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-gray-500" />
              <h2 className="font-bold text-gray-900 text-sm">
                Classification Engine
              </h2>
            </div>
            <div className="space-y-2">
              {engines.map((engine) => (
                <button
                  key={engine.id}
                  onClick={() => setSelectedEngine(engine.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${
                    selectedEngine === engine.id
                      ? engine.color === "emerald"
                        ? "bg-emerald-50 border-emerald-300"
                        : engine.color === "blue"
                          ? "bg-blue-50 border-blue-300"
                          : "bg-purple-50 border-purple-300"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                      selectedEngine === engine.id
                        ? engine.color === "emerald"
                          ? "border-emerald-500 bg-emerald-500"
                          : engine.color === "blue"
                            ? "border-blue-500 bg-blue-500"
                            : engine.color === "purple"
                              ? "border-purple-500 bg-purple-500"
                              : "border-amber-500 bg-amber-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedEngine === engine.id && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-0.5"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {engine.name}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          engine.color === "emerald"
                            ? "bg-emerald-100 text-emerald-700"
                            : engine.color === "blue"
                              ? "bg-blue-100 text-blue-700"
                              : engine.color === "purple"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {engine.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{engine.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2">
              <Leaf className="w-4 h-4" /> Photo Tips
            </h3>
            <ul className="space-y-1.5 text-xs text-emerald-700">
              {[
                "Good lighting — avoid dark or blurry photos",
                "Single item per submission for best accuracy",
                "Include the full item in the frame",
                "Avoid obstructions like hands or other objects",
              ].map((tip, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right column: upload area + results */}
        <div className="lg:col-span-3 space-y-5">
          {/* Upload area */}
          {!uploadedImage ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer min-h-64 flex flex-col items-center justify-center gap-4 p-8 ${
                dragOver
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 bg-gray-50 hover:border-emerald-300 hover:bg-emerald-50/50"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
              <div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-colors ${dragOver ? "bg-emerald-100" : "bg-white border border-gray-200"}`}
              >
                {dragOver ? (
                  <Upload className="w-10 h-10 text-emerald-500" />
                ) : (
                  <Camera className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-700">
                  {dragOver
                    ? "Drop to upload"
                    : "Drag & drop your waste photo"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  or click to browse — JPG, PNG, WEBP up to 10MB
                </p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <Upload className="w-4 h-4" />
                  Browse Files
                </button>
                <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <Camera className="w-4 h-4" />
                  Use Camera
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Uploaded waste"
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                {status === "idle" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <button
                      onClick={handleAnalyze}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-2xl shadow-xl transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                      Analyze with AI
                    </button>
                  </div>
                )}
              </div>

              {/* Analysis progress */}
              <AnimatePresence>
                {status === "analyzing" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <RefreshCw className="w-5 h-5 text-emerald-500 animate-spin" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {selectedEngine === "echo_engine"
                            ? "Analyzing with Echo_engine first, Gemini on fallback..."
                            : "Analyzing with Gemini high-accuracy engine..."}
                        </p>
                        <p className="text-xs text-gray-400">
                          {selectedEngine === "echo_engine"
                            ? "Running Teachable Machine detection and confidence checks"
                            : "Running direct Gemini classification"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { label: primaryProgressLabel, progress: analysisProgress },
                        {
                          label: secondaryProgressLabel,
                          progress: Math.max(0, analysisProgress - 15),
                        },
                      ].map((m, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{m.label}</span>
                            <span>{m.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-100"
                              style={{ width: `${m.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Result */}
              <AnimatePresence>
                {result && status !== "analyzing" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5"
                  >
                    {/* Status banner */}
                    {result.isPenalty ? (
                      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-red-800">
                            Penalty Applied — Duplicate Submission
                          </p>
                          <p className="text-xs text-red-600">
                            {result.message}
                          </p>
                        </div>
                      </div>
                    ) : status === "dispute" ? (
                      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-amber-800">
                            Low Confidence — Dispute Triggered
                          </p>
                          <p className="text-xs text-amber-600">
                            Score {(result.confidence * 100).toFixed(0)}% is below the {(confidenceThreshold * 100).toFixed(0)}% threshold. A
                            moderator will review this submission before points
                            are awarded.
                          </p>
                        </div>
                      </div>
                    ) : result.isDisputeResolved ? (
                      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-emerald-800">
                            Resolved via Gemini Fallback
                          </p>
                          <p className="text-xs text-emerald-600">
                            {result.message || "Echo_engine confidence was low, but Gemini high-accuracy fallback resolved it and points were awarded."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-emerald-800">
                            Classification Approved
                          </p>
                          <p className="text-xs text-emerald-600">
                            High confidence result — points awarded instantly
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Category result */}
                    <div
                      className={`${result.bg} ${result.border} border rounded-2xl p-4 mb-4`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-4xl">{result.emoji}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {result.category}
                            </h3>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${result.badge}`}
                            >
                              {result.subcategory}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${confidenceBg(result.confidence)} rounded-full`}
                                style={{
                                  width: `${result.confidence * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span
                              className={`text-sm font-bold ${confidenceColor(result.confidence)}`}
                            >
                              {(result.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dual model scores */}
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          {
                            name: "Primary Result",
                            data: result.modelA,
                          },
                          {
                            name: "Fallback Result",
                            data: result.modelB,
                          },
                        ].map((m, i) => (
                          <div
                            key={i}
                            className="bg-white/70 rounded-xl p-2.5 text-center"
                          >
                            <p className="text-xs text-gray-500 mb-1">{m.name}</p>
                            <p className="text-sm font-bold text-gray-900">
                              {m.data.category}
                            </p>
                            <p
                              className={`text-xs font-semibold ${confidenceColor(m.data.confidence)}`}
                            >
                              {(m.data.confidence * 100).toFixed(0)}%
                            </p>
                          </div>
                        ))}
                      </div>

                      {!!Object.keys(result.probabilities || {}).length && (
                        <div className="mt-3 rounded-xl bg-white/70 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                            Category Probabilities
                          </p>
                          <div className="space-y-2">
                            {Object.entries(result.probabilities)
                              .sort((a, b) => b[1] - a[1])
                              .map(([category, score]) => (
                                <div key={category}>
                                  <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                                    <span className="font-medium">{formatCategoryLabel(category)}</span>
                                    <span>{(score * 100).toFixed(0)}%</span>
                                  </div>
                                  <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                                    <div
                                      className={`h-full bg-gradient-to-r ${confidenceBg(score)} rounded-full`}
                                      style={{ width: `${score * 100}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Points */}
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-gray-600">Points</span>
                      </div>
                      <span
                        className={`text-base font-bold ${result.isPenalty ? "text-red-600" : status === "dispute" ? "text-gray-400" : "text-emerald-600"}`}
                      >
                        {result.isPenalty || status === "dispute"
                          ? "Review Pending"
                          : `+${result.points} pts`}
                      </span>
                    </div>

                    {/* Disposal tips */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                        Disposal Tips
                      </p>
                      <ul className="space-y-1.5">
                        {result.tips.map((tip, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-xs text-gray-600"
                          >
                            <ChevronRight className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={handleReset}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl text-sm transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        New Submission
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
                        Share Result
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Analyze button when image loaded and idle */}
              {status === "idle" && (
                <div className="p-4 border-t border-gray-100">
                  <button
                    onClick={handleAnalyze}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold py-3.5 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-emerald-500/25"
                  >
                    <Zap className="w-4 h-4" />
                    Classify with AI
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Submission history */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-gray-400" />
              <h2 className="font-bold text-gray-900 text-sm">
                Recent Submissions
              </h2>
            </div>
            <div className="space-y-2">
              {[
                {
                  emoji: "♻️",
                  item: "PET Plastic Bottle",
                  cat: "Recyclable",
                  conf: 0.94,
                  pts: 15,
                  ok: true,
                },
                {
                  emoji: "🌱",
                  item: "Banana Peel",
                  cat: "Organic",
                  conf: 0.97,
                  pts: 10,
                  ok: true,
                },
                {
                  emoji: "💻",
                  item: "Old Smartphone",
                  cat: "E-Waste",
                  conf: 0.61,
                  pts: 0,
                  ok: false,
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl">{s.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium truncate">
                      {s.item}
                    </p>
                    <p className="text-xs text-gray-400">{s.cat}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${s.ok ? "text-emerald-600" : "text-amber-600"}`}
                    >
                      {s.ok ? `+${s.pts}` : "⏳"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(s.conf * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
