import { useEffect, useState } from "react";
import { ChevronRight, Shield, CalendarDays, MapPin, Users, Crown, BookOpen } from "lucide-react";

type AdminUser = {
  id: number;
  username: string;
  email: string;
  role: "citizen" | "moderator" | "admin";
  createdAt: string;
};

type UserProfile = {
  id: number;
  name?: string;
  username?: string;
  email?: string;
  role?: "citizen" | "moderator" | "admin";
  total_points?: number;
  user_title?: string;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  country?: string | null;
  district?: string | null;
  is_private?: boolean;
  is_banned?: boolean;
  banned_at?: string | null;
  created_at?: string;
  createdAt?: string;
  clan?: { id: number; name: string } | null;
};

const API = "http://localhost:8000/api";

const roleBadgeClasses: Record<AdminUser["role"], string> = {
  citizen: "bg-blue-100 text-blue-700",
  moderator: "bg-yellow-100 text-yellow-700",
  admin: "bg-red-100 text-red-700",
};

export function AdminDashboardPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [savingUserId, setSavingUserId] = useState<number | null>(null);
  const [openRoleUserId, setOpenRoleUserId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedUserLoading, setSelectedUserLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("No auth token found");
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        };

        const [usersRes, meRes] = await Promise.all([
          fetch(`${API}/admin/users`, { headers }),
          fetch(`${API}/user`, { headers }),
        ]);

        if (!usersRes.ok) {
          const errText = await usersRes.text();
          setError(`Admin API error: ${usersRes.status} ${errText}`);
          setLoading(false);
          return;
        }

        const data = (await usersRes.json()) as AdminUser[];
        setUsers(data);

        if (meRes.ok) {
          const me = await meRes.json();
          setCurrentUserId(me.id ?? null);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Error: ${msg}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleChangeRole = async (userId: number, role: "citizen" | "moderator") => {
    setSavingUserId(userId);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No auth token");
      }

      const res = await fetch(`${API}/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.message || "Failed to update role");
      }

      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)));
      setMessage("Role changed successfully.");
      setOpenRoleUserId(null);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Failed to update role";
      setError(text);
    } finally {
      setSavingUserId(null);
    }
  };

  const handleBanUser = async (userId: number) => {
    setSavingUserId(userId);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No auth token");
      }

      const res = await fetch(`${API}/admin/users/${userId}/ban`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.message || "Failed to ban user");
      }

      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setMessage("User banned successfully.");
      setOpenRoleUserId(null);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Failed to ban user";
      setError(text);
    } finally {
      setSavingUserId(null);
    }
  };

  const handleSelectUser = async (user: AdminUser) => {
    setSelectedUserLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No auth token");
      }

      const res = await fetch(`${API}/admin/users/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to load user profile");
      }

      const profile = (await res.json()) as UserProfile;
      setSelectedUser(profile);
      setOpenRoleUserId(null);
    } catch (loadError) {
      const text = loadError instanceof Error ? loadError.message : "Failed to load user profile";
      setError(text);
    } finally {
      setSelectedUserLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-gray-600">Manage all users in the system</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">All Users</h2>
          <p className="text-sm text-gray-600">Manage user roles and permissions</p>
        </div>

        <div className="px-6 py-4">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 font-mono">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
              {message}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-gray-500">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-gray-500">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-3">Username</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Role</th>
                    <th className="px-3 py-3">Joined date</th>
                    <th className="px-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isSelf = user.id === currentUserId;
                    const isSaving = savingUserId === user.id;

                    return (
                      <tr key={user.id} className="border-b border-gray-100 text-gray-700">
                        <td className="px-3 py-3 font-medium">
                          <button
                            type="button"
                            onClick={() => handleSelectUser(user).catch(console.error)}
                            className="inline-flex items-center gap-1 text-left text-emerald-700 hover:text-emerald-900 hover:underline"
                          >
                            {user.username}
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                        <td className="px-3 py-3">{user.email}</td>
                        <td className="px-3 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeClasses[user.role]}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-3 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-3 py-3">
                          {openRoleUserId === user.id ? (
                            <select
                              disabled={isSelf || isSaving}
                              defaultValue={user.role === "admin" ? "citizen" : user.role}
                              onBlur={() => setOpenRoleUserId(null)}
                              onChange={(event) => {
                                const nextRole = event.target.value as "citizen" | "moderator";
                                handleChangeRole(user.id, nextRole).catch(console.error);
                              }}
                              className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                              autoFocus
                            >
                              <option value="citizen">citizen</option>
                              <option value="moderator">moderator</option>
                            </select>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={isSelf || isSaving}
                                onClick={() => setOpenRoleUserId(user.id)}
                                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Change Role
                              </button>
                              <button
                                type="button"
                                disabled={isSelf || isSaving}
                                onClick={() => handleBanUser(user.id).catch(console.error)}
                                className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Ban
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
            <p className="text-sm text-gray-600">Click a name to inspect the full profile</p>
          </div>

          <div className="p-6">
            {selectedUserLoading ? (
              <p className="text-sm text-gray-500">Loading profile...</p>
            ) : selectedUser ? (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedUser.name ?? selectedUser.username ?? "User"}</h3>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${roleBadgeClasses[selectedUser.role ?? "citizen"]}`}>
                    {selectedUser.role ?? "citizen"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="flex items-center gap-2 text-gray-500 mb-1"><Crown className="w-4 h-4" />Title</div>
                    <div className="font-semibold text-gray-900">{selectedUser.user_title ?? "Citizen"}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="flex items-center gap-2 text-gray-500 mb-1"><Users className="w-4 h-4" />Points</div>
                    <div className="font-semibold text-gray-900">{(selectedUser.total_points ?? 0).toLocaleString()}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="flex items-center gap-2 text-gray-500 mb-1"><MapPin className="w-4 h-4" />Location</div>
                    <div className="font-semibold text-gray-900">{selectedUser.location || [selectedUser.district, selectedUser.country].filter(Boolean).join(", ") || "N/A"}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <div className="flex items-center gap-2 text-gray-500 mb-1"><CalendarDays className="w-4 h-4" />Joined</div>
                    <div className="font-semibold text-gray-900">{new Date(selectedUser.createdAt ?? selectedUser.created_at ?? Date.now()).toLocaleDateString()}</div>
                  </div>
                </div>

                {selectedUser.clan?.name && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                    <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold mb-1">
                      <Shield className="w-4 h-4" /> Clan
                    </div>
                    <div className="text-gray-900 font-medium">{selectedUser.clan.name}</div>
                  </div>
                )}

                {selectedUser.bio && (
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <BookOpen className="w-4 h-4" /> Bio
                    </div>
                    <p className="text-sm leading-6 text-gray-600 bg-gray-50 rounded-xl p-4">{selectedUser.bio}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedUser.is_banned && (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">Banned</span>
                  )}
                  {selectedUser.is_private && (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">Private profile</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
                Select a user name from the table to view their profile details here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
