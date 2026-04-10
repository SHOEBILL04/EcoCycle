import { useState, useEffect } from "react";
import {
  Activity,
  Search,
  Filter,
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
  UserCheck,
  Clock,
  Leaf,
  TrendingUp,
} from "lucide-react";
import { parseJsonResponse } from "../lib/api";

function timeAgo(dateParam: string | Date): string {
  const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
  const today = new Date();
  const seconds = Math.round((today.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return "just now";
  else if (minutes < 60) return `${minutes}m ago`;
  else if (hours < 24) return `${hours}h ago`;
  else return `${days}d ago`;
}

type FeedFilter = "all" | "recyclable" | "organic" | "e-waste" | "hazardous";

const confidenceColor = (c: number) =>
  c >= 0.75 ? "text-emerald-600" : "text-amber-600";
const confidenceBg = (c: number) =>
  c >= 0.75 ? "from-emerald-500 to-green-400" : "from-amber-500 to-yellow-400";

const categoryMeta: Record<string, { emoji: string; color: string; bg: string; text: string }> = {
  recyclable: { emoji: "♻️", color: "bg-blue-500", bg: "bg-blue-100", text: "text-blue-700" },
  organic: { emoji: "🌱", color: "bg-green-500", bg: "bg-green-100", text: "text-green-700" },
  'e-waste': { emoji: "💻", color: "bg-purple-500", bg: "bg-purple-100", text: "text-purple-700" },
  hazardous: { emoji: "⚠️", color: "bg-red-500", bg: "bg-red-100", text: "text-red-700" },
};

export function ActivityFeedPage() {
  const [filter, setFilter] = useState<FeedFilter>("all");
  const [search, setSearch] = useState("");
  const [likedItems, setLikedItems] = useState<Record<number, boolean>>({});

  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/feed`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Accept': 'application/json',
      }
    })
    .then(parseJsonResponse)
    .then(data => {
      setFeedItems(data.feed || []);
      setFollowing(data.following || []);
      setStats(data.stats || []);
      setTrending(data.trending || []);
    })
    .catch(console.error);
  }, []);

  const toggleLike = (id: number) => {
    setLikedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filters: { id: FeedFilter; label: string; emoji: string }[] = [
    { id: "all", label: "All Activity", emoji: "🌍" },
    { id: "recyclable", label: "Recyclable", emoji: "♻️" },
    { id: "organic", label: "Organic", emoji: "🌱" },
    { id: "e-waste", label: "E-Waste", emoji: "💻" },
    { id: "hazardous", label: "Hazardous", emoji: "⚠️" },
  ];

  const filteredFeed = feedItems.filter((item) => {
    const itemCat = item.category ? item.category.toLowerCase().replace("-", "-") : "";
    const matchFilter = filter === "all" || itemCat === filter;
    const matchSearch =
      !search ||
      item.user.toLowerCase().includes(search.toLowerCase()) ||
      (item.subcategory || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Feed</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Recent classifications from people you follow and global updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            Live Feed
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-5">
          {/* Following list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              Following ({following.length})
            </h2>
            <div className="space-y-2">
              {following.length === 0 && (
                <p className="text-xs text-gray-400">You aren't following anyone yet.</p>
              )}
              {following.map((user, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="relative">
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${user.color || 'from-emerald-400 to-green-600'} flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {user.avatar}
                    </div>
                    {user.active && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {user.active ? "Active now" : "Offline"}
                    </p>
                  </div>
                  <button className="text-gray-300 hover:text-red-400 transition-colors">
                    <UserCheck className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium py-2 rounded-lg hover:bg-emerald-50 transition-colors">
              <UserPlus className="w-3.5 h-3.5" />
              Find more people
            </button>
          </div>

          {/* Feed stats */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Global Stats (Today)
            </h2>
            <div className="space-y-3">
              {stats.map((s, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{s.label}</span>
                  <span className={`text-sm font-bold ${s.color}`}>{s.val}</span>
                </div>
              ))}
              {stats.length === 0 && <p className="text-xs text-gray-400">No stats available.</p>}
            </div>
          </div>

          {/* Category trend */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="font-bold text-gray-900 text-sm mb-3">
              Trending Categories
            </h2>
            <div className="space-y-2">
              {trending.map((c, i) => {
                const meta = categoryMeta[c.cat?.toLowerCase()] || { emoji: "♻️", color: "bg-gray-400" };
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 inline-flex items-center gap-1">
                        <span>{meta.emoji}</span> <span className="capitalize">{c.cat}</span>
                      </span>
                      <span className="text-gray-400">{c.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${meta.color} rounded-full`}
                        style={{ width: `${c.pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {trending.length === 0 && <p className="text-xs text-gray-400">No trends yet.</p>}
            </div>
          </div>
        </div>

        {/* Main feed */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user or item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  filter === f.id
                    ? "bg-emerald-500 text-white shadow-md"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{f.emoji}</span>
                {f.label}
              </button>
            ))}
          </div>

          {/* Feed cards */}
          {filteredFeed.map((item) => {
            const isLiked = likedItems[item.id] ?? false;
            const likeCount = (item.likes || 0) + (isLiked ? 1 : 0);
            const meta = categoryMeta[item.category?.toLowerCase()] || { emoji: "♻️", color: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-700" };
            const isDisputed = item.status === 'PENDING' || item.status === 'FLAGGED';
            const catUpper = item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'Unknown';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-4">
                  {/* User header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                    >
                      {item.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">
                          {item.user}
                        </span>
                        <span className="text-xs text-gray-400">classified</span>
                        <span className="text-xs font-semibold text-gray-800">
                          {item.subcategory || catUpper}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{timeAgo(item.created_at)}</span>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-emerald-600 transition-colors">
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Classification result */}
                  <div className={`${meta.bg} rounded-xl p-3 mb-3`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{meta.emoji}</span>
                        <div>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text} border`}
                          >
                            {catUpper}
                          </span>
                          {isDisputed && (
                            <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                              ⏳ In Dispute
                            </span>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <div className="h-1.5 w-24 bg-white/60 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${confidenceBg(item.confidence_score)} rounded-full`}
                                style={{ width: `${item.confidence_score * 100}%` }}
                              ></div>
                            </div>
                            <span
                              className={`text-xs font-semibold ${confidenceColor(item.confidence_score)}`}
                            >
                              {(item.confidence_score * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                          <span
                            className={`text-sm font-bold ${isDisputed ? "text-amber-600" : "text-emerald-600"}`}
                          >
                            {isDisputed ? "Pending" : `+${item.points_awarded}`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">pts</p>
                      </div>
                    </div>
                  </div>

                  {/* Note */}
                  {item.note && (
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      "{item.note}"
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
                    <button
                      onClick={() => toggleLike(item.id)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${
                        isLiked ? "text-red-500" : "text-gray-400 hover:text-red-400"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                      />
                      <span>{likeCount}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-400 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>{item.comments || 0}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-emerald-500 transition-colors">
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    <div className="ml-auto text-xs text-gray-300">
                      SUB-{4800 + item.id}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredFeed.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="text-4xl mb-3">🌿</div>
              <p className="text-gray-500 font-medium">No activity matches your filter</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
