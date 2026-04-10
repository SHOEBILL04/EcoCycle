import { useState, useEffect } from "react";
import {
  Gift,
  Leaf,
  ShoppingBag,
  Coffee,
  Bus,
  TreePine,
  Star,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Package,
} from "lucide-react";
import { motion } from "motion/react";

type RewardCategory = "all" | "vouchers" | "eco" | "transport" | "experiences";

const iconMap: Record<string, any> = {
  ShoppingBag,
  Coffee,
  Bus,
  TreePine,
  Star,
};

export function RewardsPage() {
  const [activeCategory, setActiveCategory] = useState<RewardCategory>("all");
  const [redeemed, setRedeemed] = useState<Set<number>>(new Set());
  const [confirming, setConfirming] = useState<number | null>(null);

  const [rewards, setRewards] = useState<any[]>([]);
  const [redemptionHistory, setRedemptionHistory] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalRedeemed, setTotalRedeemed] = useState(0);
  const [redemptionsCount, setRedemptionsCount] = useState(0);
  const [joined, setJoined] = useState('recently');

  useEffect(() => {
    fetch('http://localhost:8000/api/rewards', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(res => res.json())
    .then(data => {
        setRewards(data.rewards || []);
        setRedemptionHistory(data.redemptionHistory || []);
        setUserPoints(data.userPoints || 0);
        setTotalEarned(data.totalEarned || 0);
        setTotalRedeemed(data.totalRedeemed || 0);
        setRedemptionsCount(data.redemptionsCount || 0);
        setJoined(data.joined || 'recently');
    })
    .catch(console.error);
  }, []);

  const categories: { id: RewardCategory; label: string; emoji: string }[] = [
    { id: "all", label: "All Rewards", emoji: "🎁" },
    { id: "vouchers", label: "Vouchers", emoji: "🛍️" },
    { id: "eco", label: "Eco Impact", emoji: "🌳" },
    { id: "transport", label: "Transport", emoji: "🚌" },
    { id: "experiences", label: "Experiences", emoji: "⭐" },
  ];

  const filtered =
    activeCategory === "all"
      ? rewards
      : rewards.filter((r) => r.category === activeCategory);

  const handleRedeem = (id: number, cost: number, title: string) => {
    if (confirming === id) {
      fetch('http://localhost:8000/api/redeem', {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({ cost, reward_name: title })
       }).then(res => res.json()).then(data => {
           if (data.status === 'success') {
               setRedeemed((prev) => new Set([...prev, id]));
               setUserPoints(data.remaining_points);
               setTotalRedeemed(prev => prev + cost);
               setRedemptionsCount(prev => prev + 1);
               setConfirming(null);
               setRedemptionHistory(prev => [
                   { reward: title, partner: "EcoCycle Network", points: cost, date: "Just now", status: "redeemed" },
                   ...prev
               ]);
           } else {
               alert(data.error || "Failed to redeem.");
           }
       }).catch(console.error);
    } else {
      setConfirming(id);
    }
  };

  const toNextTier = Math.max(0, 3000 - totalEarned);
  const tierProgress = Math.min(100, (totalEarned / 3000) * 100);

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rewards Center</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Redeem your eco-points for real-world rewards
          </p>
        </div>
      </div>

      {/* Points balance card */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-3xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <Gift className="w-48 h-48 text-white" />
        </div>
        <div className="relative grid sm:grid-cols-3 gap-4">
          <div>
            <p className="text-emerald-200 text-sm mb-1 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5" />
              Available Points
            </p>
            <p className="text-5xl font-black text-white">
              {userPoints.toLocaleString()}
            </p>
            <p className="text-emerald-200 text-xs mt-1">Ready to use</p>
          </div>
          <div className="sm:border-l sm:border-white/20 sm:pl-6">
            <p className="text-emerald-200 text-sm mb-1">Total Earned (All Time)</p>
            <p className="text-2xl font-bold text-white">{totalEarned.toLocaleString()}</p>
            <p className="text-emerald-200 text-xs mt-1">Since {joined}</p>
          </div>
          <div className="sm:border-l sm:border-white/20 sm:pl-6">
            <p className="text-emerald-200 text-sm mb-1">Points Redeemed</p>
            <p className="text-2xl font-bold text-white">{totalRedeemed.toLocaleString()}</p>
            <p className="text-emerald-200 text-xs mt-1">{redemptionsCount} redemptions</p>
          </div>
        </div>

        {/* Progress to next tier */}
        <div className="mt-5 pt-4 border-t border-white/20">
          <div className="flex justify-between text-xs text-emerald-200 mb-1.5">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Base Tier
            </span>
            <span>3,000 pts needed for Gold</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-300 rounded-full"
              style={{ width: `${tierProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-emerald-200 mt-1">
            {toNextTier > 0 ? `${toNextTier} more points until Gold Tier 🏆` : 'You reached Gold Tier! 🏆'}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Points to Redeem", val: userPoints.toLocaleString(), icon: Leaf, color: "text-emerald-600" },
          { label: "Rewards Available", val: rewards.length.toString(), icon: Gift, color: "text-purple-600" },
          { label: "Items Redeemed", val: redemptionsCount.toString(), icon: Package, color: "text-blue-600" },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
          >
            <s.icon className={`w-5 h-5 ${s.color}`} />
            <div>
              <p className="text-lg font-bold text-gray-900">{s.val}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Rewards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {filtered.map((reward, i) => {
          const canAfford = userPoints >= reward.points;
          const isRedeemed = redeemed.has(reward.id);
          const isConfirming = confirming === reward.id;
          const Icon = iconMap[reward.icon] || Gift;

          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${!canAfford ? "opacity-60" : ""}`}
            >
              <div
                className={`bg-gradient-to-br ${reward.color} p-5 relative`}
              >
                {reward.popular && (
                  <span className="absolute top-2 right-2 bg-white/90 text-amber-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    ⭐ Popular
                  </span>
                )}
                <Icon className="w-8 h-8 text-white mb-2" />
                <h3 className="font-bold text-white text-sm leading-tight">
                  {reward.title}
                </h3>
                <p className="text-white/80 text-xs mt-0.5">{reward.partner}</p>
              </div>

              <div className="p-4">
                <p className="text-xs text-gray-500 mb-3 leading-relaxed min-h-[36px]">
                  {reward.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Leaf className="w-4 h-4 text-emerald-500" />
                    <span className="font-black text-emerald-700 text-base">
                      {reward.points.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400">pts</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {reward.remaining} left
                  </span>
                </div>

                {isRedeemed ? (
                  <div className="flex items-center gap-2 justify-center py-2 bg-emerald-50 rounded-xl text-emerald-600 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Redeemed!
                  </div>
                ) : (
                  <button
                    onClick={() => canAfford && handleRedeem(reward.id, reward.points, reward.title)}
                    disabled={!canAfford}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      !canAfford
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : isConfirming
                          ? "bg-amber-500 text-white hover:bg-amber-600"
                          : "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 shadow-md shadow-emerald-500/20"
                    }`}
                  >
                    {!canAfford ? (
                      <>Need {(reward.points - userPoints).toLocaleString()} pts</>
                    ) : isConfirming ? (
                      <>Confirm?</>
                    ) : (
                      <>
                        Redeem
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            No rewards in this category yet.
          </div>
        )}
      </div>

      {/* Redemption history */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Redemption History</h2>
          <Clock className="w-4 h-4 text-gray-400" />
        </div>
        <div className="divide-y divide-gray-50">
          {redemptionHistory.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
                No redemptions found.
            </div>
          ) : (
              redemptionHistory.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Gift className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {item.reward}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.partner} · {item.date}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-red-400">
                      -{item.points} pts
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        item.status === "redeemed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
