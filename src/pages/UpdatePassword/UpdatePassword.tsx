// pages/UpdatePassword/UpdatePassword.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { changePassword } from "../../services/userProfileServices";
import { ApiError } from "../../lib/apiClient";

// Mirrors UpdatePasswordRequest on the backend
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 100;

const RULES: { test: (pw: string) => boolean; text: string }[] = [
  {
    test: (pw) => pw.length >= PASSWORD_MIN && pw.length <= PASSWORD_MAX,
    text: `${PASSWORD_MIN}–${PASSWORD_MAX} characters`,
  },
  { test: (pw) => /[A-Z]/.test(pw), text: "One uppercase letter" },
  { test: (pw) => /\d/.test(pw), text: "One number" },
  { test: (pw) => /[^A-Za-z0-9]/.test(pw), text: "One special character" },
];

type Field = "oldPassword" | "newPassword" | "confirmNewPassword";

function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete,
  show,
  onToggleShow,
}: {
  id: Field;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete: string;
  show: boolean;
  onToggleShow: () => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wide text-gray-500"
      >
        {label}
      </label>
      <div
        className={`mt-1.5 flex items-center gap-2 rounded-2xl bg-gray-50 px-4 py-3 ${
          error ? "ring-2 ring-red-300" : ""
        }`}
      >
        <span className="text-gray-400">🔑</span>
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          maxLength={PASSWORD_MAX}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          className="w-full bg-transparent text-base text-gray-700 outline-none placeholder:text-gray-300"
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? "Hide password" : "Show password"}
          className="text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}

function UpdatePassword() {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [show, setShow] = useState<Record<Field, boolean>>({
    oldPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<Field, string>>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const ruleResults = RULES.map((r) => ({ ...r, ok: r.test(newPassword) }));
  const meetsAllRules = ruleResults.every((r) => r.ok);
  const matches =
    confirmNewPassword.length > 0 && newPassword === confirmNewPassword;

  function update(field: Field, setter: (v: string) => void) {
    return (value: string) => {
      setter(value);
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      setError(null);
    };
  }

  function toggleShow(field: Field) {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  function validate(): Partial<Record<Field, string>> {
    const errors: Partial<Record<Field, string>> = {};

    if (!oldPassword) errors.oldPassword = "Enter your current password.";

    if (!newPassword) errors.newPassword = "Choose a new password.";
    else if (!meetsAllRules)
      errors.newPassword =
        "Your new password doesn't meet all the rules below yet.";
    else if (newPassword === oldPassword)
      errors.newPassword =
        "Pick something different from your current password.";

    if (!confirmNewPassword)
      errors.confirmNewPassword = "Type your new password again.";
    else if (confirmNewPassword !== newPassword)
      errors.confirmNewPassword = "Passwords don't match.";

    return errors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      await changePassword({ oldPassword, newPassword, confirmNewPassword });
      setIsDone(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;

      if (apiErr?.status === 400 && apiErr.fieldErrors) {
        setFieldErrors(apiErr.fieldErrors as Partial<Record<Field, string>>);
      } else if (apiErr?.status === 400 || apiErr?.status === 403) {
        // e.g. wrong current password, sent as a plain message
        setFieldErrors({
          oldPassword: apiErr.message || "That's not your current password.",
        });
      } else if (apiErr?.status === 0) {
        setError(
          "Couldn't reach the server. Check your connection and try again.",
        );
      } else {
        setError("Couldn't update your password. Try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fcf8f2]">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="text-gray-400 hover:text-gray-600"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-base font-bold text-gray-900">Password</p>
        <div className="h-5 w-5" />
      </div>

      <div className="flex flex-col gap-4 px-4 py-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <AnimatePresence mode="wait" initial={false}>
          {isDone ? (
            <motion.section
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center gap-3 rounded-3xl bg-white px-6 py-10 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <p className="text-lg font-bold text-gray-900">
                Password updated
              </p>
              <p className="max-w-[240px] text-sm text-gray-500">
                Your sanctuary is safe and sound. Use your new password next
                time you sign in.
              </p>
              <button
                type="button"
                onClick={() => navigate("/settings", { replace: true })}
                className="mt-2 rounded-full bg-emerald-800 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-900"
              >
                Back to Settings
              </button>
            </motion.section>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              noValidate
              className="flex flex-col gap-4"
            >
              {/* Intro */}
              <div className="flex items-center gap-3 rounded-3xl bg-white p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5EDE6] text-gray-700">
                  <KeyRound className="h-4 w-4" />
                </div>
                <p className="text-sm leading-snug text-gray-500">
                  Confirm your current password, then pick a new one you'll
                  remember.
                </p>
              </div>

              {/* Fields */}
              <section className="space-y-4 rounded-3xl bg-white p-4">
                <PasswordField
                  id="oldPassword"
                  label="Current password"
                  value={oldPassword}
                  onChange={update("oldPassword", setOldPassword)}
                  error={fieldErrors.oldPassword}
                  autoComplete="current-password"
                  show={show.oldPassword}
                  onToggleShow={() => toggleShow("oldPassword")}
                />

                <div className="border-t border-gray-50" />

                <PasswordField
                  id="newPassword"
                  label="New password"
                  value={newPassword}
                  onChange={update("newPassword", setNewPassword)}
                  error={fieldErrors.newPassword}
                  autoComplete="new-password"
                  show={show.newPassword}
                  onToggleShow={() => toggleShow("newPassword")}
                />

                {/* Live checklist for the new password */}
                <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  {[
                    ...ruleResults,
                    { ok: matches, text: "Passwords match" },
                  ].map((rule) => (
                    <li
                      key={rule.text}
                      className={`flex items-center gap-1.5 ${rule.ok ? "text-emerald-700" : "text-gray-400"}`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                          rule.ok
                            ? "bg-emerald-600 text-white"
                            : "border border-gray-300"
                        }`}
                      >
                        {rule.ok && <Check className="h-2.5 w-2.5" />}
                      </span>
                      {rule.text}
                    </li>
                  ))}
                </ul>

                <PasswordField
                  id="confirmNewPassword"
                  label="Confirm new password"
                  value={confirmNewPassword}
                  onChange={update("confirmNewPassword", setConfirmNewPassword)}
                  error={fieldErrors.confirmNewPassword}
                  autoComplete="new-password"
                  show={show.confirmNewPassword}
                  onToggleShow={() => toggleShow("confirmNewPassword")}
                />
              </section>

              {error && (
                <p className="text-xs font-medium text-red-500" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-emerald-800 py-3.5 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-60"
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default UpdatePassword;
