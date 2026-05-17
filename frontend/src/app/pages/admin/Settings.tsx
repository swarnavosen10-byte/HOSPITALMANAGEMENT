import { useState, type ChangeEvent } from "react";

type Profile = {
  name: string;
  email: string;
  phone: string;
  avatar: string;
};

type Hospital = {
  name: string;
  location: string;
  gst: string;
};

type Notifications = {
  email: boolean;
  appointment: boolean;
  patient: boolean;
  billing: boolean;
};

type PasswordState = {
  current: string;
  new: string;
  confirm: string;
};

type Privacy = {
  logs: boolean;
  analytics: boolean;
};

const loadStored = <T,>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  // ================= PROFILE =================
  const [profile, setProfile] = useState<Profile>(() =>
    loadStored<Profile>("profile", {
    name: "Swarnavo Sen",
    email: "swarnavosen@gmail.com",
    phone: "+91 98765 43210",
    avatar: "",
    })
  );
  const [profileMsg, setProfileMsg] = useState("");

  // ================= HOSPITAL =================
  const [hospital, setHospital] = useState<Hospital>(() =>
    loadStored<Hospital>("hospital", {
    name: "Medisync Hospital",
    location: "Kolkata, India",
    gst: "22ABCDE1234F1Z5",
    })
  );
  const [hospitalMsg, setHospitalMsg] = useState("");

  // ================= NOTIFICATIONS =================
  const [notifications, setNotifications] = useState<Notifications>(() =>
    loadStored<Notifications>("notifications", {
    email: true,
    appointment: true,
    patient: true,
    billing: true,
    })
  );

  // ================= SECURITY =================
  const [password, setPassword] = useState<PasswordState>({
    current: "",
    new: "",
    confirm: "",
  });
  const [securityMsg, setSecurityMsg] = useState("");
  const [twoFA, setTwoFA] = useState(false);

  // ================= LANGUAGE =================
  const [language, setLanguage] = useState("English");
  const [region, setRegion] = useState("India");

  // ================= PRIVACY =================
  const [privacy, setPrivacy] = useState<Privacy>(() =>
    loadStored<Privacy>("privacy", {
    logs: true,
    analytics: false,
    })
  );

  // ================= SAVE =================
  const saveProfile = () => {
    if (!profile.name || !profile.email) {
      setProfileMsg("Fill all fields ❌");
      return;
    }
    localStorage.setItem("profile", JSON.stringify(profile));
    setProfileMsg("Profile Saved ✅");
  };

  const saveHospital = () => {
    if (!hospital.name) {
      setHospitalMsg("Hospital name required ❌");
      return;
    }
    localStorage.setItem("hospital", JSON.stringify(hospital));
    setHospitalMsg("Hospital Info Saved ✅");
  };

  const updatePassword = () => {
    if (password.new.length < 6) {
      setSecurityMsg("Minimum 6 characters required ❌");
      return;
    }
    if (password.new !== password.confirm) {
      setSecurityMsg("Passwords do not match ❌");
      return;
    }
    setSecurityMsg("Password Updated (Demo) ✅");
    setPassword({ current: "", new: "", confirm: "" });
  };

  // ================= IMAGE =================
  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () =>
      setProfile({ ...profile, avatar: reader.result as string });
    reader.readAsDataURL(file);
  };

  const tabs = [
    "profile",
    "hospital",
    "notifications",
    "security",
    "billing",
    "language",
    "privacy",
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-gray-500 mb-6">Manage your system preferences</p>

      <div className="grid grid-cols-[280px_1fr] gap-6">
        {/* LEFT MENU */}
        <div className="bg-white p-4 rounded-xl shadow border space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-3 rounded-lg ${
                activeTab === tab
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              {{
                profile: "Profile Settings",
                hospital: "Hospital Info",
                notifications: "Notifications",
                security: "Security",
                billing: "Billing & Plans",
                language: "Language & Region",
                privacy: "Privacy",
              }[tab]}
            </button>
          ))}
        </div>

        {/* RIGHT PANEL */}
        <div className="bg-white p-6 rounded-xl shadow border space-y-4">

          {/* PROFILE */}
          {activeTab === "profile" && (
            <>
              <h2 className="font-semibold text-lg">Profile</h2>

              <div className="flex gap-4 items-center">
                {profile.avatar ? (
                  <img src={profile.avatar} className="w-16 h-16 rounded-full" />
                ) : (
                  <div className="w-16 h-16 bg-blue-500 text-white flex items-center justify-center rounded-full">
                    {profile.name[0]}
                  </div>
                )}

                <label className="border px-3 py-1 rounded cursor-pointer">
                  Upload
                  <input type="file" hidden onChange={handleImage} />
                </label>
              </div>

              <input
                placeholder="Full Name"
                className="border p-2 w-full rounded"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
              />

              <input
                placeholder="Email"
                className="border p-2 w-full rounded"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
              />

              <input
                placeholder="Phone"
                className="border p-2 w-full rounded"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />

              <button onClick={saveProfile} className="bg-blue-600 text-white px-4 py-2 rounded">
                Save
              </button>

              {profileMsg && <p className="text-blue-600">{profileMsg}</p>}
            </>
          )}

          {/* HOSPITAL */}
          {activeTab === "hospital" && (
            <>
              <h2>Hospital Info</h2>

              <input
                placeholder="Hospital Name"
                className="border p-2 w-full rounded"
                value={hospital.name}
                onChange={(e) =>
                  setHospital({ ...hospital, name: e.target.value })
                }
              />

              <input
                placeholder="Location"
                className="border p-2 w-full rounded"
                value={hospital.location}
                onChange={(e) =>
                  setHospital({ ...hospital, location: e.target.value })
                }
              />

              <input
                placeholder="GST Number"
                className="border p-2 w-full rounded"
                value={hospital.gst}
                onChange={(e) =>
                  setHospital({ ...hospital, gst: e.target.value })
                }
              />

              <button onClick={saveHospital} className="bg-blue-600 text-white px-4 py-2 rounded">
                Save
              </button>

              {hospitalMsg && <p className="text-blue-600">{hospitalMsg}</p>}
            </>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === "notifications" &&
            (Object.keys(notifications) as Array<keyof Notifications>).map((key) => (
              <div key={key} className="flex justify-between">
                <span>{key}</span>
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      [key]: !prev[key],
                    }))
                  }
                />
              </div>
            ))}

          {/* SECURITY */}
          {activeTab === "security" && (
            <>
              <input placeholder="Current Password" className="border p-2 w-full rounded"
                value={password.current}
                onChange={(e)=>setPassword({...password,current:e.target.value})}
              />

              <input placeholder="New Password" className="border p-2 w-full rounded"
                value={password.new}
                onChange={(e)=>setPassword({...password,new:e.target.value})}
              />

              <input placeholder="Confirm Password" className="border p-2 w-full rounded"
                value={password.confirm}
                onChange={(e)=>setPassword({...password,confirm:e.target.value})}
              />

              <button onClick={updatePassword} className="border px-4 py-2 rounded">
                Update
              </button>

              <div className="flex justify-between pt-4 border-t">
                <span>Two Factor Auth</span>
                <button onClick={()=>setTwoFA(!twoFA)}
                  className={twoFA ? "bg-green-600 text-white px-3 rounded" : "border px-3 rounded"}>
                  {twoFA ? "Enabled" : "Enable"}
                </button>
              </div>

              {securityMsg && <p className="text-red-500">{securityMsg}</p>}
            </>
          )}

          {/* BILLING */}
          {activeTab === "billing" && (
            <>
              <h2>Billing Plan</h2>
              <p className="text-gray-600">Premium Hospital Suite</p>
              <p className="text-sm text-gray-400">
                Upgrade handled by backend system (demo UI)
              </p>
            </>
          )}

          {/* LANGUAGE */}
          {activeTab === "language" && (
            <>
              <select className="border p-2 rounded" value={language} onChange={(e)=>setLanguage(e.target.value)}>
                <option>English</option>
                <option>Hindi</option>
                <option>Bengali</option>
              </select>

              <select className="border p-2 rounded" value={region} onChange={(e)=>setRegion(e.target.value)}>
                <option>India</option>
                <option>USA</option>
                <option>UK</option>
              </select>
            </>
          )}

          {/* PRIVACY */}
          {activeTab === "privacy" && (
            <>
              <div className="flex justify-between">
                <span>System Logs</span>
                <input type="checkbox"
                  checked={privacy.logs}
                  onChange={()=>setPrivacy({...privacy,logs:!privacy.logs})}
                />
              </div>

              <div className="flex justify-between">
                <span>Analytics</span>
                <input type="checkbox"
                  checked={privacy.analytics}
                  onChange={()=>setPrivacy({...privacy,analytics:!privacy.analytics})}
                />
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}