import { Link } from "react-router";
import { motion } from "motion/react";
import {
  Recycle,
  Camera,
  Trophy,
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
  Leaf,
  Shield,
  BarChart3,
  Star,
  ChevronRight,
  Globe,
  Activity,
} from "lucide-react";

const heroImage =
  "https://images.unsplash.com/photo-1771172195332-3bc9ded9f3b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWN5Y2xpbmclMjB3YXN0ZSUyMHNvcnRpbmclMjBlbnZpcm9ubWVudGFsfGVufDF8fHx8MTc3NTc4OTcxMHww&ixlib=rb-4.1.0&q=80&w=1080";
const cityImage =
  "https://images.unsplash.com/photo-1759503393199-c86cbd2c44df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlbiUyMGNpdHklMjBzdXN0YWluYWJsZSUyMGNvbW11bml0eXxlbnwxfHx8fDE3NzU3ODk3MTB8MA&ixlib=rb-4.1.0&q=80&w=1080";

const features = [
  {
    icon: Camera,
    title: "AI-Powered Classification",
    desc: "Dual-engine AI instantly classifies waste into recyclable, organic, e-waste, or hazardous — with a real confidence score.",
    color: "bg-blue-500",
    light: "bg-blue-50",
  },
  {
    icon: Zap,
    title: "Confidence Scoring",
    desc: "Every decision comes with a transparent [0,1] confidence score. Low-confidence items enter a dispute workflow before reward.",
    color: "bg-amber-500",
    light: "bg-amber-50",
  },
  {
    icon: Trophy,
    title: "Gamified Rewards",
    desc: "Earn points for accurate submissions, climb the leaderboard, and redeem rewards at partner businesses.",
    color: "bg-emerald-500",
    light: "bg-emerald-50",
  },
  {
    icon: Users,
    title: "Community Layer",
    desc: "Follow eco-champions, view public profiles, and browse activity feeds of classified items in your network.",
    color: "bg-purple-500",
    light: "bg-purple-50",
  },
  {
    icon: Shield,
    title: "Fraud-Proof System",
    desc: "Duplicate image detection, idempotent point awards, and atomic redemption prevent abuse at every step.",
    color: "bg-red-500",
    light: "bg-red-50",
  },
  {
    icon: BarChart3,
    title: "Full Audit Trail",
    desc: "Every event — classification, dispute, reward, role change — is synchronously recorded in an immutable audit log.",
    color: "bg-cyan-500",
    light: "bg-cyan-50",
  },
];

const categories = [
  {
    emoji: "♻️",
    label: "Recyclable",
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    examples: "Plastic, Glass, Paper, Metal",
  },
  {
    emoji: "🌱",
    label: "Organic",
    color: "from-green-500 to-green-600",
    bg: "bg-green-50",
    examples: "Food scraps, Garden waste",
  },
  {
    emoji: "💻",
    label: "E-Waste",
    color: "from-purple-500 to-purple-600",
    bg: "bg-purple-50",
    examples: "Electronics, Batteries, Cables",
  },
  {
    emoji: "⚠️",
    label: "Hazardous",
    color: "from-red-500 to-red-600",
    bg: "bg-red-50",
    examples: "Chemicals, Paint, Solvents",
  },
];

const leaderboard = [
  {
    rank: 1,
    name: "GreenGuardian",
    points: 12480,
    accuracy: "98.2%",
    avatar: "GG",
    color: "from-yellow-400 to-yellow-600",
  },
  {
    rank: 2,
    name: "EcoWarrior99",
    points: 10950,
    accuracy: "96.7%",
    avatar: "EW",
    color: "from-gray-400 to-gray-500",
  },
  {
    rank: 3,
    name: "RecycleKing",
    points: 9840,
    accuracy: "95.1%",
    avatar: "RK",
    color: "from-amber-600 to-amber-700",
  },
  {
    rank: 4,
    name: "NatureFirst",
    points: 8230,
    accuracy: "94.8%",
    avatar: "NF",
    color: "from-emerald-400 to-emerald-600",
  },
  {
    rank: 5,
    name: "Alex Johnson",
    points: 2840,
    accuracy: "91.3%",
    avatar: "AJ",
    color: "from-blue-400 to-blue-600",
    isYou: true,
  },
];

const steps = [
  {
    step: "01",
    title: "Snap a Photo",
    desc: "Take or upload a photo of your waste item from anywhere.",
  },
  {
    step: "02",
    title: "AI Classifies",
    desc: "Two independent AI engines analyze the image and return a category with confidence score.",
  },
  {
    step: "03",
    title: "Earn Points",
    desc: "High-confidence results earn points instantly. Disputed items go through resolution before reward.",
  },
  {
    step: "04",
    title: "Redeem & Rise",
    desc: "Climb the leaderboard, redeem points for eco-rewards, and inspire your community.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Recycle className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">EcoCycle</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">
              How it Works
            </a>
            <a href="#leaderboard" className="hover:text-emerald-600 transition-colors">
              Leaderboard
            </a>
            <a href="#categories" className="hover:text-emerald-600 transition-colors">
              Categories
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:block text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-emerald-500/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-24 bg-gradient-to-br from-emerald-950 via-gray-900 to-emerald-900 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-1.5 text-emerald-400 text-sm font-medium mb-6">
                <Leaf className="w-3.5 h-3.5" />
                AI-Powered Waste Intelligence Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Turn Waste Into{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
                  Rewards
                </span>{" "}
                With AI
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-xl">
                EcoCycle uses dual-engine AI to instantly classify your waste,
                assign confidence scores, and reward you for making the right
                disposal decision. Join thousands of eco-champions making a
                difference.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold px-7 py-3.5 rounded-2xl hover:from-emerald-600 hover:to-green-600 transition-all shadow-xl shadow-emerald-500/30 text-sm"
                >
                  Start Classifying Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/app"
                  className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-2xl hover:bg-white/20 transition-all text-sm"
                >
                  View Demo
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex items-center gap-6 mt-10">
                {[
                  { val: "50K+", label: "Active Users" },
                  { val: "2.1M", label: "Items Classified" },
                  { val: "94%", label: "Avg Accuracy" },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="text-2xl font-bold text-white">{s.val}</div>
                    <div className="text-xs text-gray-400">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
                <img
                  src={heroImage}
                  alt="Waste sorting"
                  className="w-full h-80 lg:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                {/* Floating classification card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <span className="text-sm">♻️</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          Recyclable — PET Plastic
                        </div>
                        <div className="text-xs text-gray-500">
                          Classification complete
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-600">
                        +15 pts
                      </div>
                      <div className="text-xs text-gray-400">awarded</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                        style={{ width: "92%" }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600">
                      92% confidence
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-3 shadow-xl text-white text-center">
                <Trophy className="w-6 h-6 mx-auto mb-1" />
                <div className="text-xs font-bold">#1 Today</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              4 Waste Categories
            </h2>
            <p className="text-gray-500">
              Every item is classified into one of four predefined categories
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`${cat.bg} rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 cursor-default group`}
              >
                <div className="text-4xl mb-3">{cat.emoji}</div>
                <div
                  className={`inline-block bg-gradient-to-r ${cat.color} text-white text-xs font-bold px-3 py-1 rounded-full mb-2`}
                >
                  {cat.label}
                </div>
                <p className="text-gray-500 text-xs mt-2">{cat.examples}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              <Zap className="w-3.5 h-3.5" />
              Platform Features
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for
              <br />
              <span className="text-emerald-600">Smart Waste Management</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              A complete ecosystem combining AI classification, community
              engagement, and tamper-proof reward mechanics.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-emerald-100 transition-all duration-300 group"
              >
                <div
                  className={`w-12 h-12 ${f.light} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <f.icon
                    className={`w-6 h-6 ${f.color.replace("bg-", "text-")}`}
                  />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="py-20 bg-gradient-to-br from-emerald-50 to-green-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How EcoCycle Works
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              From snap to reward in seconds — with full transparency at every
              step.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
                  <div className="text-5xl font-black text-emerald-100 mb-3">
                    {step.step}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-6 h-6 text-emerald-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof / Leaderboard preview */}
      <section id="leaderboard" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
                <Trophy className="w-3.5 h-3.5" />
                Live Leaderboard
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Compete & Climb the
                <br />
                <span className="text-emerald-600">Eco Rankings</span>
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                A live global leaderboard ranks users by verified points, updated
                within 60 seconds. Follow eco-champions and track your community's
                impact in real time.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  "✅ Real-time leaderboard updates every 60 seconds",
                  "✅ Follow other eco-champions and view their activity",
                  "✅ Privacy controls — go public or private anytime",
                  "✅ Earn badges for milestones and streaks",
                ].map((point, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/app/leaderboard"
                className="inline-flex items-center gap-2 mt-8 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all shadow-lg shadow-emerald-500/25 text-sm"
              >
                View Full Leaderboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-gray-50 rounded-3xl p-6 space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Global Rankings</h3>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  Live
                </div>
              </div>
              {leaderboard.map((user, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${user.isYou ? "bg-emerald-50 border-2 border-emerald-200" : "bg-white hover:bg-gray-50"}`}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center font-bold text-sm ${
                      user.rank === 1
                        ? "text-yellow-600"
                        : user.rank === 2
                          ? "text-gray-500"
                          : user.rank === 3
                            ? "text-amber-600"
                            : "text-gray-400"
                    }`}
                  >
                    {user.rank <= 3 ? ["🥇", "🥈", "🥉"][user.rank - 1] : `#${user.rank}`}
                  </div>
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${user.color} flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {user.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-900 text-sm">
                        {user.name}
                      </span>
                      {user.isYou && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{user.accuracy} accuracy</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-600">
                      {user.points.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">pts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-green-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          ></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Globe className="w-12 h-12 text-white/60 mx-auto mb-6" />
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto">
              Join 50,000+ citizens already earning rewards for smarter waste
              disposal. Every classification helps build a greener world.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/signup"
                className="bg-white text-emerald-700 font-bold px-8 py-4 rounded-2xl hover:bg-emerald-50 transition-colors shadow-xl text-sm"
              >
                Create Free Account
              </Link>
              <Link
                to="/app"
                className="bg-white/20 border border-white/30 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/30 transition-colors text-sm"
              >
                Explore the App
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center">
                <Recycle className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">EcoCycle</span>
            </div>
            <div className="flex gap-6 text-sm">
              {["Privacy", "Terms", "Contact", "API Docs"].map((l) => (
                <a key={l} href="#" className="hover:text-white transition-colors">
                  {l}
                </a>
              ))}
            </div>
            <p className="text-sm">© 2026 EcoCycle. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
