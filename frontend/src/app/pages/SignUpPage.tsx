import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Recycle, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";

const perks = [
  "AI-powered waste classification in seconds",
  "Earn points for every correct submission",
  "Compete on a live global leaderboard",
  "Join a community of eco-champions",
];

export function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    agree: false,
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      try {
        const response = await fetch('http://localhost:8000/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            password_confirmation: form.password,
          })
        });

        if (response.ok) {
           const data = await response.json();
           localStorage.setItem('access_token', data.access_token);
           navigate("/app");
        } else {
           const err = await response.json();
           alert('Registration failed: ' + (err.message || 'Unknown error'));
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-gray-900 to-green-900 flex relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Left panel - desktop only */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 bg-gradient-to-b from-emerald-800/30 to-transparent border-r border-white/10 p-10">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-xl">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">EcoCycle</h1>
              <p className="text-emerald-400 text-xs">Waste Intelligence Platform</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Join the Green Revolution
          </h2>
          <p className="text-gray-300 text-sm mb-8 leading-relaxed">
            50,000+ citizens are already making smarter waste decisions and earning
            rewards. Start your journey today.
          </p>

          <div className="space-y-4">
            {perks.map((perk, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-gray-300 text-sm">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-gray-300 text-sm italic mb-3">
            "EcoCycle changed how my whole family thinks about waste. We've earned
            over 8,000 points and redeemed them for grocery vouchers!"
          </p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
              SL
            </div>
            <div>
              <p className="text-white text-sm font-medium">Sarah L.</p>
              <p className="text-gray-400 text-xs">Eco Champion, Rank #12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile back link */}
          <Link
            to="/"
            className="lg:hidden flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step >= s
                      ? "bg-emerald-500 text-white"
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  {step > s ? "✓" : s}
                </div>
                <span
                  className={`text-xs ${step >= s ? "text-emerald-400" : "text-gray-500"}`}
                >
                  {s === 1 ? "Account Info" : "Preferences"}
                </span>
                {s < 2 && (
                  <div
                    className={`h-px w-8 ${step > s ? "bg-emerald-500" : "bg-white/10"}`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-1">
              {step === 1 ? "Create Your Account" : "Almost There!"}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {step === 1
                ? "Fill in your details to get started"
                : "Set your preferences to personalize your experience"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1.5">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="eco_hero"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Minimum 8 characters"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 pr-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {/* Password strength */}
                    <div className="flex gap-1 mt-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full ${
                            form.password.length > i * 2
                              ? i < 2
                                ? "bg-red-400"
                                : i < 3
                                  ? "bg-yellow-400"
                                  : "bg-emerald-400"
                              : "bg-white/10"
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agree"
                      checked={form.agree}
                      onChange={handleChange}
                      className="mt-0.5 rounded"
                      required
                    />
                    <span className="text-xs text-gray-400">
                      I agree to the{" "}
                      <a href="#" className="text-emerald-400 hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-emerald-400 hover:underline">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-2">
                      Profile Visibility
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Public", "Private"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className={`py-3 rounded-xl text-sm font-medium border transition-all ${
                            opt === "Public"
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                              : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                          }`}
                        >
                          {opt === "Public" ? "🌍" : "🔒"} {opt}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">
                      Public profiles appear on leaderboards and feeds. You can change
                      this in settings.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-2">
                      Your Primary Goal
                    </label>
                    <div className="space-y-2">
                      {[
                        "🌱 Reduce my environmental footprint",
                        "🏆 Compete and earn rewards",
                        "📚 Learn about proper waste disposal",
                        "👥 Connect with eco-community",
                      ].map((goal, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                        >
                          <input
                            type="radio"
                            name="goal"
                            className="accent-emerald-500"
                          />
                          <span className="text-sm text-gray-300">{goal}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-2">
                      Notification Preferences
                    </label>
                    <div className="space-y-2">
                      {[
                        "Submission results & disputes",
                        "Leaderboard changes",
                        "New followers & social activity",
                      ].map((pref, i) => (
                        <label
                          key={i}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 cursor-pointer"
                        >
                          <span className="text-xs text-gray-300">{pref}</span>
                          <input
                            type="checkbox"
                            defaultChecked
                            className="accent-emerald-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold py-3.5 rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all shadow-lg shadow-emerald-500/25 mt-2"
              >
                {step === 1 ? "Continue →" : "Create Account & Start Earning"}
              </button>

              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-sm text-gray-400 hover:text-white transition-colors py-2"
                >
                  ← Back
                </button>
              )}
            </form>
          </div>

          {step === 1 && (
            <p className="text-center text-gray-400 text-sm mt-5">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
