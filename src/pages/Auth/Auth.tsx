import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Smile, Eye, EyeOff, Rocket } from "lucide-react";
import capyDoLogo from "../../assets/capydo-logo-512x512.png"

type AuthMode = "signin" | "register";

function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: replace with a real auth API call once the backend exists
    localStorage.setItem("capydo_auth", "true");
    sessionStorage.setItem("justLoggedIn", "true");
    navigate("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#fcf8f2] px-6 pb-10 pt-14">
      {/* Logo */}
      <div className="relative">
        <img src={capyDoLogo} className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-4xl"/>

        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-orange-200 px-2.5 py-0.5 text-[11px] font-medium text-orange-700">
          🐾 Cozy
        </span>
      </div>

      {/* Title + subtitle */}
      <h1 className="mt-6 text-2xl font-bold text-emerald-900">CapyDo</h1>
      <p className="mt-1 max-w-[240px] text-center text-sm text-gray-500">
        Your gentle, dopamine-rich focus companion
      </p>

      {/* Tagline pill */}
      <div className="mt-4 flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs text-gray-500">
        <span>♡</span>
        Zero pressure. One gentle breath at a time.
      </div>

      {/* Card: tab switcher + form */}
      <div className="mt-6 w-full max-w-sm rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex rounded-full bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-medium transition-colors ${
              mode === "signin" ? "bg-emerald-800 text-white" : "text-gray-500"
            }`}
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-medium transition-colors ${
              mode === "register" ? "bg-emerald-800 text-white" : "text-gray-500"
            }`}
          >
            <Smile className="h-4 w-4" />
            New Friend
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <label className="text-xs font-semibold tracking-wide text-gray-600">
            EMAIL OR NICKNAME
          </label>
          <div className="mt-1.5 flex items-center gap-2 rounded-2xl bg-gray-50 px-4 py-3">
            <span className="text-gray-400">@</span>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. cozycapy@gmail.com"
              className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-300"
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <label className="text-xs font-semibold tracking-wide text-gray-600">
              SAFE KEYWORD / PASSWORD
            </label>
            {mode === "signin" && (
              <button type="button" className="text-xs font-medium text-orange-500">
                Forgot secret?
              </button>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-2 rounded-2xl bg-gray-50 px-4 py-3">
            <span className="text-gray-400">🔑</span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Keep it cozy & memorable"
              className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-300"
            />
            <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-gray-400">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="submit"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-800 py-3.5 text-sm font-semibold text-white hover:bg-emerald-900"
          >
            {mode === "signin" ? "Begin Today's Journey" : "Create My Sanctuary"}
            <Rocket className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default Auth;