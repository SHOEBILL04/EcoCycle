import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Users,
  UserPlus,
  Shield,
  Flag,
  Globe,
  Loader2,
} from "lucide-react";

type Tab = "global" | "clan";
type Period = "all-time" | "monthly" | "weekly" | "daily";

const periods: { id: Period; label: string }[] = [
  { id: "all-time", label: "All Time" },
  { id: "monthly", label: "This Month" },
  { id: "weekly", label: "This Week" },
  { id: "daily", label: "Today" },
];

export interface Clan {
  id: string;
  name: string;
  tag: string;
  members: number;
  totalPoints: number;
  avgAccuracy: number;
  location: string;
  change: number;
  rank: number;
  badge?: string;
  flaggedMembers: number;
}

function ChangeIndicator({ change }: { change: number }) {
  if (change === 0)
    return (
      <div className="flex items-center gap-0.5 text-gray-400">
        <Minus className="w-3 h-3" />
      </div>
    );
  if (change > 0)
    return (
      <div className="flex items-center gap-0.5 text-emerald-500 text-xs font-medium">
        <TrendingUp className="w-3 h-3" />
        {change}
      </div>
    );
  return (
    <div className="flex items-center gap-0.5 text-red-400 text-xs font-medium">
      <TrendingDown className="w-3 h-3" />
      {Math.abs(change)}
    </div>
  );
}

// ─── Global Leaderboard View ──────────────────────────────────────────

function UserLeaderboard({ data, myInfo }: { data: any[], myInfo?: any }) {
  const [period, setPeriod] = useState<Period>("all-time");
  const [search, setSearch] = useState("");
  const [followingFilter, setFollowingFilter] = useState(false);
  const [following, setFollowing] = useState<Record<number, boolean>>({});

  const topThree = data.slice(0, 3);
  const rest = data.slice(3);

  const toggleFollow = (rank: number) => {
    setFollowing((prev) => ({ ...prev, [rank]: !prev[rank] }));
  };

  const filteredRest = rest.filter((u) => {
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase());
    const matchFollow = !followingFilter || u.following || following[u.rank];
    return matchSearch && matchFollow;
  });

  return (
    <>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              period === p.id
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {topThree.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-900 to-gray-900 rounded-3xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10">
            <Trophy className="w-48 h-48 text-yellow-400" />
          </div>
          <h2 className="text-emerald-400 text-sm font-semibold mb-6 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            Top Champions
          </h2>
          <div className="flex items-end justify-center gap-4">
            {/* 2nd */}
            {topThree[1] && (
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${topThree[1].color || 'from-gray-400 to-gray-600'} flex items-center justify-center text-white font-bold`}>
                  {topThree[1].avatar}
                </div>
                <div className="absolute -top-2 -right-2 text-xl">🥈</div>
              </div>
              <div className="text-center">
                <p className="text-white text-xs font-bold">{topThree[1].name}</p>
                <p className="text-emerald-400 text-xs">{topThree[1].points.toLocaleString()} pts</p>
              </div>
              <div className="bg-gray-700 rounded-t-xl w-20 h-20 flex items-end justify-center pb-2">
                <span className="text-white font-black text-2xl opacity-30">2</span>
              </div>
            </div>
            )}

            {/* 1st */}
            {topThree[0] && (
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${topThree[0].color || 'from-yellow-400 to-amber-500'} flex items-center justify-center text-white font-bold text-xl`}>
                  {topThree[0].avatar}
                </div>
                <div className="absolute -top-3 -right-2 text-2xl">🏆</div>
              </div>
              <div className="text-center">
                <p className="text-yellow-300 text-sm font-bold">{topThree[0].name}</p>
                <p className="text-yellow-400 text-xs">{topThree[0].points.toLocaleString()} pts</p>
              </div>
              <div className="bg-yellow-600/40 rounded-t-xl w-20 h-28 flex items-end justify-center pb-2">
                <span className="text-yellow-400 font-black text-2xl opacity-50">1</span>
              </div>
            </div>
            )}

            {/* 3rd */}
            {topThree[2] && (
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${topThree[2].color || 'from-amber-600 to-amber-800'} flex items-center justify-center text-white font-bold`}>
                  {topThree[2].avatar}
                </div>
                <div className="absolute -top-2 -right-2 text-xl">🥉</div>
              </div>
              <div className="text-center">
                <p className="text-white text-xs font-bold">{topThree[2].name}</p>
                <p className="text-emerald-400 text-xs">{topThree[2].points.toLocaleString()} pts</p>
              </div>
              <div className="bg-gray-700 rounded-t-xl w-20 h-14 flex items-end justify-center pb-2">
                <span className="text-white font-black text-2xl opacity-30">3</span>
              </div>
            </div>
            )}
          </div>
        </div>
      )}

      {myInfo && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 mb-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
            {myInfo.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-sm">{myInfo.name}</span>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                You
              </span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-emerald-700">#{myInfo.rank}</p>
            <p className="text-xs text-gray-500 font-medium">{myInfo.points.toLocaleString()} pts</p>
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          onClick={() => setFollowingFilter(!followingFilter)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
            followingFilter
              ? "bg-emerald-50 border-emerald-300 text-emerald-700"
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Users className="w-4 h-4" />
          Following
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4">User</div>
          <div className="col-span-2 text-right">Points</div>
          <div className="col-span-2 text-right hidden sm:block">Accuracy</div>
          <div className="col-span-2 text-right hidden md:block">Submissions</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        <div className="divide-y divide-gray-50">
          {filteredRest.map((user) => {
            const isFollowing = following[user.rank] ?? user.following;
            return (
              <div
                key={user.rank}
                className={`grid grid-cols-12 px-4 py-3 items-center hover:bg-gray-50 transition-colors ${
                  user.isYou ? "bg-emerald-50/50" : ""
                }`}
              >
                <div className="col-span-1">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-gray-700">#{user.rank}</span>
                    <ChangeIndicator change={user.change ?? 0} />
                  </div>
                </div>

                <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${user.color || 'from-gray-400 to-gray-500'} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {user.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className={`text-sm font-semibold truncate ${user.isYou ? "text-emerald-700" : "text-gray-900"}`}>
                        {user.name}
                      </span>
                      {user.isYou && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          You
                        </span>
                      )}
                      {user.badge && <span className="text-base">{user.badge}</span>}
                    </div>
                    <span className="text-xs text-gray-400 truncate block">{user.username}</span>
                  </div>
                </div>

                <div className="col-span-2 text-right">
                  <span className="text-sm font-bold text-emerald-600">{user.points.toLocaleString()}</span>
                  <p className="text-xs text-gray-400">pts</p>
                </div>
                <div className="col-span-2 text-right hidden sm:block">
                  <span className="text-sm font-semibold text-gray-700">{user.accuracy}%</span>
                </div>
                <div className="col-span-2 text-right hidden md:block">
                  <span className="text-sm text-gray-600">{user.submissions}</span>
                </div>
                <div className="col-span-1 flex justify-end">
                  {!user.isYou && (
                    <button
                      onClick={() => toggleFollow(user.rank)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isFollowing ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function ClanLeaderboard({ data, myClanInfo }: { data: Clan[], myClanInfo?: any }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredClans = data.filter(
    (clan) =>
      !search ||
      clan.name.toLowerCase().includes(search.toLowerCase()) ||
      clan.tag.toLowerCase().includes(search.toLowerCase())
  );

  const topThree = filteredClans.slice(0, 3);
  const rest = filteredClans.slice(3);

  return (
    <>
      {topThree.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-900 to-gray-900 rounded-3xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10">
            <Shield className="w-48 h-48 text-emerald-400" />
          </div>
          <h2 className="text-emerald-400 text-sm font-semibold mb-6 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            Top Clans
          </h2>
          <div className="flex items-end justify-center gap-4">
            {topThree[1] && (
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold border-4 border-gray-600">
                  {topThree[1].tag}
                </div>
                <div className="absolute -top-2 -right-2 text-2xl">🥈</div>
              </div>
              <div className="text-center">
                <p className="text-white text-sm font-bold">{topThree[1].name}</p>
                <p className="text-emerald-400 text-xs">{topThree[1].totalPoints.toLocaleString()} pts</p>
                <p className="text-gray-400 text-xs">{topThree[1].members} members</p>
              </div>
              <div className="bg-gray-700 rounded-t-xl w-24 h-20 flex items-end justify-center pb-2">
                <span className="text-white font-black text-2xl opacity-30">2</span>
              </div>
            </div>
            )}

            {topThree[0] && (
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white font-bold text-xl border-4 border-yellow-600">
                  {topThree[0].tag}
                </div>
                <div className="absolute -top-3 -right-2 text-3xl">🏆</div>
              </div>
              <div className="text-center">
                <p className="text-yellow-300 text-base font-bold">{topThree[0].name}</p>
                <p className="text-yellow-400 text-sm">{topThree[0].totalPoints.toLocaleString()} pts</p>
                <p className="text-yellow-200/70 text-xs">{topThree[0].members} members</p>
              </div>
              <div className="bg-yellow-600/40 rounded-t-xl w-24 h-28 flex items-end justify-center pb-2">
                <span className="text-yellow-400 font-black text-2xl opacity-50">1</span>
              </div>
            </div>
            )}

            {topThree[2] && (
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white font-bold border-4 border-amber-800">
                  {topThree[2].tag}
                </div>
                <div className="absolute -top-2 -right-2 text-2xl">🥉</div>
              </div>
              <div className="text-center">
                <p className="text-white text-sm font-bold">{topThree[2].name}</p>
                <p className="text-emerald-400 text-xs">{topThree[2].totalPoints.toLocaleString()} pts</p>
                <p className="text-gray-400 text-xs">{topThree[2].members} members</p>
              </div>
              <div className="bg-gray-700 rounded-t-xl w-24 h-14 flex items-end justify-center pb-2">
                <span className="text-white font-black text-2xl opacity-30">3</span>
              </div>
            </div>
            )}
          </div>
        </div>
      )}

      {myClanInfo && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 mb-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold border-2 border-emerald-600">
            {myClanInfo.tag}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-sm">{myClanInfo.name}</span>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                Your Clan
              </span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-emerald-700">#{myClanInfo.rank}</p>
            <p className="text-xs text-gray-500 font-medium">{myClanInfo.points.toLocaleString()} pts</p>
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clans by name or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4">Clan</div>
          <div className="col-span-2 text-right">Points</div>
          <div className="col-span-2 text-right hidden sm:block">Accuracy</div>
          <div className="col-span-2 text-right hidden md:block">Members</div>
          <div className="col-span-1 text-right">Status</div>
        </div>

        <div className="divide-y divide-gray-50">
          {rest.map((clan) => (
            <div
              key={clan.id}
              onClick={() => navigate(`/app/clan/${clan.id}`)}
              className="grid grid-cols-12 px-4 py-4 items-center hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="col-span-1">
                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold text-gray-700">#{clan.rank}</span>
                  <ChangeIndicator change={clan.change ?? 0} />
                </div>
              </div>

              <div className="col-span-4 flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold flex-shrink-0 border-2 border-emerald-600">
                  {clan.tag}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900 truncate">{clan.name}</span>
                    {clan.badge && <span className="text-base">{clan.badge}</span>}
                    {(clan.flaggedMembers || 0) > 0 && (
                      <div className="flex items-center gap-1 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md">
                        <Flag className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-red-600 font-medium">{clan.flaggedMembers}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 truncate block">{clan.location}</span>
                </div>
              </div>

              <div className="col-span-2 text-right">
                <span className="text-sm font-bold text-emerald-600">{clan.totalPoints.toLocaleString()}</span>
                <p className="text-xs text-gray-400">pts</p>
              </div>
              <div className="col-span-2 text-right hidden sm:block">
                <span className="text-sm font-semibold text-gray-700">{clan.avgAccuracy}%</span>
              </div>
              <div className="col-span-2 text-right hidden md:block">
                <span className="text-sm text-gray-600">{clan.members}</span>
              </div>
              <div className="col-span-1 flex justify-end">
                <Users className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredClans.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No clans found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your search filters</p>
        </div>
      )}
    </>
  );
}

export function LeaderboardPage() {
  const { state } = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>(
    (state as any)?.tab === "clan" ? "clan" : "global"
  );
  
  const [data, setData] = useState<{ global: any[]; clans: Clan[]; my_info?: any; my_clan_info?: any }>({
    global: [],
    clans: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/leaderboard", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((res) => res.json())
      .then((payload) => {
        if (!payload.error) {
          setData(payload);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "global",
      label: "Global Leaderboard",
      icon: <Globe className="w-4 h-4" />,
    },
    {
      id: "clan",
      label: "Clan Leaderboard",
      icon: <Shield className="w-4 h-4" />,
    },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Live rankings updated every 60 seconds</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            Live Updates
          </div>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl mb-6 w-fit h-[48px] overflow-hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 rounded-xl text-sm font-semibold transition-all duration-200 h-full ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm shadow-gray-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className={activeTab === tab.id ? "text-emerald-600" : "text-gray-400"}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : activeTab === "global" ? (
        <UserLeaderboard data={data.global} myInfo={data.my_info} />
      ) : (
        <ClanLeaderboard data={data.clans} myClanInfo={data.my_clan_info} />
      )}
    </div>
  );
}
