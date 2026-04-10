import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Bell,
  Globe,
  Shield,
  Trash2,
  Camera,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  Smartphone,
  Mail,
  AlertTriangle,
} from "lucide-react";

type Tab = "profile" | "privacy" | "security" | "notifications" | "danger";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "privacy", label: "Privacy", icon: Globe },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
];

const ToggleSwitch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => (
  <button
    onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-emerald-500" : "bg-gray-200"}`}
  >
    <div
      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
    ></div>
  </button>
);

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saved, setSaved] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [passForm, setPassForm] = useState({ current: "", new: "", confirm: "" });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    username: "",
    email: "",
    bio: "Passionate eco-warrior reducing urban waste one item at a time 🌿",
    location: "Global Citizen",
    website: "",
  });

  useEffect(() => {
    fetch('http://localhost:8000/api/user', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(res => res.json())
    .then(data => {
        if (data.id) {
            setProfile({
                name: data.name || "",
                username: data.email ? data.email.split('@')[0] : "",
                email: data.email || "",
                bio: data.bio || "Passionate eco-warrior reducing urban waste one item at a time 🌿",
                location: data.location || "Global Citizen",
                website: data.website || "",
            });
            if (data.settings) {
                if (data.settings.privacy) {
                    setPrivacy(prev => ({ ...prev, ...data.settings.privacy }));
                }
                if (data.settings.notifications) {
                    setNotifs(prev => ({ ...prev, ...data.settings.notifications }));
                }
            }
        }
    })
    .catch(console.error);
  }, []);

  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showInLeaderboard: true,
    showActivity: true,
    allowFollowers: true,
    showAccuracyRate: true,
    showPoints: true,
  });

  const [notifs, setNotifs] = useState({
    submissionResults: true,
    disputeUpdates: true,
    leaderboardChanges: false,
    newFollowers: true,
    weeklyDigest: true,
    rewardReminders: false,
    emailNotifs: true,
    pushNotifs: false,
  });

  const handleProfileSave = async () => {
    try {
        const res = await fetch('http://localhost:8000/api/user/profile', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({
                name: profile.name,
                bio: profile.bio,
                location: profile.location,
                website: profile.website
            })
        });
        if (res.ok) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    } catch (error) {
        console.error("Failed to save profile:", error);
    }
  };

  const handlePrivacySave = async () => {
    try {
        const res = await fetch('http://localhost:8000/api/user/settings', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({ privacy })
        });
        if (res.ok) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    } catch (error) {
        console.error("Failed to save privacy settings:", error);
    }
  };

  const handleNotifSave = async () => {
    try {
        const res = await fetch('http://localhost:8000/api/user/settings', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({ notifications: notifs })
        });
        if (res.ok) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    } catch (error) {
        console.error("Failed to save notifications:", error);
    }
  };

  const togglePrivacy = (key: keyof typeof privacy) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleNotif = (key: keyof typeof notifs) => {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess(false);
    
    if (passForm.new !== passForm.confirm) {
        setPassError("New passwords do not match.");
        return;
    }

    setPassLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/user/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          current_password: passForm.current,
          new_password: passForm.new,
          new_password_confirmation: passForm.confirm,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPassError(data.message || "Failed to update password");
      } else {
        setPassSuccess(true);
        setPassForm({ current: "", new: "", confirm: "" });
        setTimeout(() => setPassSuccess(false), 3000);
      }
    } catch (err: any) {
      setPassError(err.message || "An error occurred");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Manage your account, privacy, and notifications
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left border-b border-gray-50 last:border-0 ${
                  activeTab === tab.id
                    ? tab.id === "danger"
                      ? "bg-red-50 text-red-600"
                      : "bg-emerald-50 text-emerald-700"
                    : tab.id === "danger"
                      ? "text-red-500 hover:bg-red-50"
                      : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile tab */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Profile Information</h2>
                {saved && (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Saved!
                  </div>
                )}
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-black text-2xl">
                    {profile.name ? profile.name.slice(0, 2).toUpperCase() : 'U'}
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-emerald-600 transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Profile Photo
                  </p>
                  <p className="text-xs text-gray-400">JPG, PNG or GIF. Max 2MB.</p>
                  <button className="mt-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    Upload new photo
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Username
                  </label>
                  <div className="flex">
                    <span className="bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl px-3 py-2.5 text-sm text-gray-400">
                      @
                    </span>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, username: e.target.value }))
                      }
                      className="flex-1 border border-gray-200 rounded-r-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, email: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, location: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Bio
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, bio: e.target.value }))
                  }
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {profile.bio.length}/160 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Website
                </label>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, website: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                />
              </div>

              <button
                onClick={handleProfileSave}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-emerald-500/25 text-sm"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          )}

          {/* Privacy tab */}
          {activeTab === "privacy" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-900">Privacy Settings</h2>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800 font-medium mb-1">
                  Privacy Enforcement
                </p>
                <p className="text-xs text-blue-600">
                  Privacy settings are enforced at the API layer. Private
                  profiles are never visible in other users' feeds, leaderboards,
                  or search results — regardless of follow status.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: "profilePublic" as const,
                    label: "Public Profile",
                    desc: "Allow others to see your profile page and classification history",
                    icon: Globe,
                  },
                  {
                    key: "showInLeaderboard" as const,
                    label: "Appear on Leaderboard",
                    desc: "Show your rank and points on the global leaderboard",
                    icon: Shield,
                  },
                  {
                    key: "showActivity" as const,
                    label: "Show Activity in Feeds",
                    desc: "Let followers see your classifications in their activity feed",
                    icon: Eye,
                  },
                  {
                    key: "allowFollowers" as const,
                    label: "Allow Follow Requests",
                    desc: "Let other users follow your account",
                    icon: User,
                  },
                  {
                    key: "showAccuracyRate" as const,
                    label: "Show Accuracy Rate",
                    desc: "Display your accuracy percentage on your public profile",
                    icon: CheckCircle,
                  },
                  {
                    key: "showPoints" as const,
                    label: "Show Points Balance",
                    desc: "Show your total points on your public profile",
                    icon: Shield,
                  },
                ].map((setting) => (
                  <div
                    key={setting.key}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <setting.icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {setting.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {setting.desc}
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={privacy[setting.key]}
                      onChange={() => togglePrivacy(setting.key)}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handlePrivacySave}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-emerald-500/25 text-sm"
              >
                <Save className="w-4 h-4" />
                Save Privacy Settings
              </button>
            </div>
          )}

          {/* Security tab */}
          {activeTab === "security" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-5">Change Password</h2>
                {passError && (
                    <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                        {passError}
                    </div>
                )}
                {passSuccess && (
                    <div className="mb-4 bg-emerald-50 text-emerald-600 text-sm p-3 rounded-lg border border-emerald-100 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Password updated successfully!
                    </div>
                )}
                <form className="space-y-4" onSubmit={handlePasswordChange}>
                  {[
                    { label: "Current Password", placeholder: "Enter current password", key: "current" as const },
                    { label: "New Password", placeholder: "Enter new password", key: "new"  as const },
                    { label: "Confirm New Password", placeholder: "Confirm new password", key: "confirm" as const },
                  ].map((field, i) => (
                    <div key={i}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {field.label}
                      </label>
                      <div className="relative">
                        <input
                          type={showPass ? "text" : "password"}
                          placeholder={field.placeholder}
                          value={passForm[field.key]}
                          onChange={(e) => setPassForm(p => ({ ...p, [field.key]: e.target.value }))}
                          required
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showPass ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="submit" disabled={passLoading} className={`mt-4 flex items-center gap-2 ${passLoading ? 'bg-emerald-400' : 'bg-emerald-500 hover:bg-emerald-600'} text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm`}>
                    {passLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-2">
                  Two-Factor Authentication
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Add an extra layer of security to your account
                </p>
                <div className="space-y-3">
                  {[
                    {
                      icon: Smartphone,
                      label: "Authenticator App",
                      desc: "Use an app like Google Authenticator",
                      enabled: true,
                    },
                    {
                      icon: Mail,
                      label: "Email OTP",
                      desc: "Receive codes via email",
                      enabled: false,
                    },
                  ].map((method, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <method.icon className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {method.label}
                          </p>
                          <p className="text-xs text-gray-400">{method.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.enabled && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                        <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                          {method.enabled ? "Manage" : "Enable"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-4">Active Sessions</h2>
                <div className="space-y-3">
                  {[
                    { device: "MacBook Pro", location: "San Francisco, CA", time: "Current session", current: true },
                    { device: "iPhone 15", location: "San Francisco, CA", time: "2 hours ago", current: false },
                  ].map((session, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {session.device}
                          </p>
                          {session.current && (
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          {session.location} · {session.time}
                        </p>
                      </div>
                      {!session.current && (
                        <button className="text-xs text-red-500 hover:text-red-600 font-medium">
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications tab */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-bold text-gray-900">Notification Preferences</h2>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Activity Notifications
                </h3>
                <div className="space-y-3">
                  {[
                    { key: "submissionResults" as const, label: "Submission Results", desc: "Get notified when your classification is processed" },
                    { key: "disputeUpdates" as const, label: "Dispute Updates", desc: "Updates on low-confidence dispute resolutions" },
                    { key: "leaderboardChanges" as const, label: "Leaderboard Changes", desc: "When your rank changes significantly" },
                    { key: "newFollowers" as const, label: "New Followers", desc: "When someone starts following you" },
                  ].map((n) => (
                    <div
                      key={n.key}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{n.label}</p>
                        <p className="text-xs text-gray-400">{n.desc}</p>
                      </div>
                      <ToggleSwitch checked={notifs[n.key]} onChange={() => toggleNotif(n.key)} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Digest & Reminders
                </h3>
                <div className="space-y-3">
                  {[
                    { key: "weeklyDigest" as const, label: "Weekly Summary", desc: "A weekly roundup of your eco-impact" },
                    { key: "rewardReminders" as const, label: "Reward Reminders", desc: "Reminders when you have enough points to redeem" },
                  ].map((n) => (
                    <div
                      key={n.key}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{n.label}</p>
                        <p className="text-xs text-gray-400">{n.desc}</p>
                      </div>
                      <ToggleSwitch checked={notifs[n.key]} onChange={() => toggleNotif(n.key)} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Delivery Channels
                </h3>
                <div className="space-y-3">
                  {[
                    { key: "emailNotifs" as const, label: "Email Notifications", icon: Mail },
                    { key: "pushNotifs" as const, label: "Push Notifications", icon: Smartphone },
                  ].map((n) => (
                    <div
                      key={n.key}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-2">
                        <n.icon className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-900">{n.label}</p>
                      </div>
                      <ToggleSwitch checked={notifs[n.key]} onChange={() => toggleNotif(n.key)} />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNotifSave}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-emerald-500/25 text-sm"
              >
                <Save className="w-4 h-4" />
                Save Preferences
              </button>
            </div>
          )}

          {/* Danger zone */}
          {activeTab === "danger" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Danger Zone
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                  These actions are irreversible. Please proceed with caution.
                </p>

                <div className="space-y-4">
                  <div className="border border-amber-200 rounded-xl p-4 bg-amber-50">
                    <h3 className="font-semibold text-amber-800 text-sm mb-1">
                      Export Account Data
                    </h3>
                    <p className="text-xs text-amber-600 mb-3">
                      Download a copy of all your classifications, points history,
                      and account data.
                    </p>
                    <button className="text-sm font-medium text-amber-700 border border-amber-300 bg-white px-4 py-2 rounded-lg hover:bg-amber-50 transition-colors">
                      Request Data Export
                    </button>
                  </div>

                  <div className="border border-orange-200 rounded-xl p-4 bg-orange-50">
                    <h3 className="font-semibold text-orange-800 text-sm mb-1">
                      Deactivate Account
                    </h3>
                    <p className="text-xs text-orange-600 mb-3">
                      Temporarily deactivate your account. Your profile will be
                      hidden but data is preserved.
                    </p>
                    <button className="text-sm font-medium text-orange-700 border border-orange-300 bg-white px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors">
                      Deactivate Account
                    </button>
                  </div>

                  <div className="border border-red-200 rounded-xl p-4 bg-red-50">
                    <h3 className="font-semibold text-red-800 text-sm mb-1 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete Account Permanently
                    </h3>
                    <p className="text-xs text-red-600 mb-3">
                      Permanently delete your account and all associated data.
                      This action cannot be undone and will forfeit all earned
                      points.
                    </p>
                    <button className="text-sm font-medium text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors">
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
