import { useState } from "react";
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

type FeedFilter = "all" | "recyclable" | "organic" | "e-waste" | "hazardous";

const following = [
  { name: "EcoWarrior99", avatar: "EW", color: "from-gray-400 to-gray-500", active: true },
  { name: "NatureFirst", avatar: "NF", color: "from-emerald-400 to-emerald-600", active: true },
  { name: "GreenPath", avatar: "GP", color: "from-lime-400 to-lime-600", active: false },
  { name: "EcoStar", avatar: "ES", color: "from-teal-400 to-cyan-500", active: false },
  { name: "CleanEarth", avatar: "CE", color: "from-orange-400 to-orange-600", active: true },
];

const feedItems = [
  {
    id: 1,
    user: "EcoWarrior99",
    avatar: "EW",
    color: "from-gray-400 to-gray-500",
    time: "3 minutes ago",
    item: "Aluminum Can",
    category: "Recyclable",
    emoji: "♻️",
    catColor: "blue",
    catBg: "bg-blue-100",
    catText: "text-blue-700",
    confidence: 0.97,
    points: 12,
    likes: 8,
    comments: 2,
    liked: false,
    note: "Rinsed and crushed! Always rinse before recycling 🌊",
  },
  {
    id: 2,
    user: "NatureFirst",
    avatar: "NF",
    color: "from-emerald-400 to-emerald-600",
    time: "12 minutes ago",
    item: "Coffee Grounds",
    category: "Organic",
    emoji: "🌱",
    catColor: "green",
    catBg: "bg-green-100",
    catText: "text-green-700",
    confidence: 0.99,
    points: 10,
    likes: 24,
    comments: 5,
    liked: true,
    note: "Great for composting! Coffee grounds add nitrogen to soil ☕",
  },
  {
    id: 3,
    user: "GreenPath",
    avatar: "GP",
    color: "from-lime-400 to-lime-600",
    time: "28 minutes ago",
    item: "AA Batteries",
    category: "Hazardous",
    emoji: "⚠️",
    catColor: "red",
    catBg: "bg-red-100",
    catText: "text-red-700",
    confidence: 0.88,
    points: 20,
    likes: 15,
    comments: 3,
    liked: false,
    note: "Dropped these off at the local battery collection point. Never throw in regular bins!",
  },
  {
    id: 4,
    user: "EcoStar",
    avatar: "ES",
    color: "from-teal-400 to-cyan-500",
    time: "45 minutes ago",
    item: "Broken Laptop",
    category: "E-Waste",
    emoji: "💻",
    catColor: "purple",
    catBg: "bg-purple-100",
    catText: "text-purple-700",
    confidence: 0.71,
    points: 0,
    likes: 6,
    comments: 1,
    liked: false,
    note: "Confidence was low (71%) so this went to dispute review. Fingers crossed! 🤞",
    disputed: true,
  },
  {
    id: 5,
    user: "CleanEarth",
    avatar: "CE",
    color: "from-orange-400 to-orange-600",
    time: "1 hour ago",
    item: "Cardboard Box",
    category: "Recyclable",
    emoji: "♻️",
    catColor: "blue",
    catBg: "bg-blue-100",
    catText: "text-blue-700",
    confidence: 0.99,
    points: 12,
    likes: 31,
    comments: 7,
    liked: true,
    note: "Broke down a big moving box! Every cardboard counts 📦",
  },
  {
    id: 6,
    user: "NatureFirst",
    avatar: "NF",
    color: "from-emerald-400 to-emerald-600",
    time: "2 hours ago",
    item: "Apple Core",
    category: "Organic",
    emoji: "🌱",
    catColor: "green",
    catBg: "bg-green-100",
    catText: "text-green-700",
    confidence: 0.98,
    points: 8,
    likes: 19,
    comments: 4,
    liked: false,
    note: "Quick lunch break submission! Adding to the compost bin 🍎",
  },
];

const confidenceColor = (c: number) =>
  c >= 0.75 ? "text-emerald-600" : "text-amber-600";
const confidenceBg = (c: number) =>
  c >= 0.75 ? "from-emerald-500 to-green-400" : "from-amber-500 to-yellow-400";

export function ActivityFeedPage() {
  const [filter, setFilter] = useState<FeedFilter>("all");
  const [search, setSearch] = useState("");
  const [likedItems, setLikedItems] = useState<Record<number, boolean>>({});

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
    const matchFilter =
      filter === "all" ||
      item.category.toLowerCase().replace("-", "-") === filter;
    const matchSearch =
      !search ||
      item.user.toLowerCase().includes(search.toLowerCase()) ||
      item.item.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Feed</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Recent classifications from people you follow
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
              {following.map((user, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="relative">
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${user.color} flex items-center justify-center text-white text-xs font-bold`}
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
              Feed Stats (Today)
            </h2>
            <div className="space-y-3">
              {[
                { label: "Classifications", val: "47", color: "text-gray-900" },
                { label: "Total Pts Earned", val: "890", color: "text-emerald-600" },
                { label: "High Confidence", val: "41", color: "text-emerald-600" },
                { label: "Disputes", val: "6", color: "text-amber-600" },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{s.label}</span>
                  <span className={`text-sm font-bold ${s.color}`}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category trend */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="font-bold text-gray-900 text-sm mb-3">
              Trending Categories
            </h2>
            <div className="space-y-2">
              {[
                { emoji: "♻️", cat: "Recyclable", count: 21, pct: 45, color: "bg-blue-500" },
                { emoji: "🌱", cat: "Organic", count: 14, pct: 30, color: "bg-green-500" },
                { emoji: "💻", cat: "E-Waste", count: 8, pct: 17, color: "bg-purple-500" },
                { emoji: "⚠️", cat: "Hazardous", count: 4, pct: 8, color: "bg-red-500" },
              ].map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">
                      {c.emoji} {c.cat}
                    </span>
                    <span className="text-gray-400">{c.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${c.color} rounded-full`}
                      style={{ width: `${c.pct}%` }}
                    ></div>
                  </div>
                </div>
              ))}
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
            const isLiked = likedItems[item.id] ?? item.liked;
            const likeCount = item.likes + (likedItems[item.id] !== undefined
              ? (likedItems[item.id] ? 1 : 0) - (item.liked ? 1 : 0)
              : 0);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-4">
                  {/* User header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
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
                          {item.item}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{item.time}</span>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-emerald-600 transition-colors">
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Classification result */}
                  <div className={`${item.catBg} rounded-xl p-3 mb-3`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.emoji}</span>
                        <div>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.catBg} ${item.catText} border`}
                          >
                            {item.category}
                          </span>
                          {item.disputed && (
                            <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                              ⏳ In Dispute
                            </span>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <div className="h-1.5 w-24 bg-white/60 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${confidenceBg(item.confidence)} rounded-full`}
                                style={{ width: `${item.confidence * 100}%` }}
                              ></div>
                            </div>
                            <span
                              className={`text-xs font-semibold ${confidenceColor(item.confidence)}`}
                            >
                              {(item.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                          <span
                            className={`text-sm font-bold ${item.disputed ? "text-amber-600" : "text-emerald-600"}`}
                          >
                            {item.disputed ? "Pending" : `+${item.points}`}
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
                      <span>{item.comments}</span>
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
