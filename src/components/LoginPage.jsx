import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const ok = login(form.email, form.password);
      if (!ok) setError("Email ou mot de passe incorrect.");
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center"
      style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="bg-[#0d1e38] border border-[#d4af7a33] rounded-xl p-10 w-full max-w-sm">
        <p className="text-3xl text-[#f0e8d6] mb-1 text-center"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          JECT-TRIANI
        </p>
        <p className="text-xs text-[#8899aa] tracking-widest uppercase mb-8 text-center">
          Espace responsables
        </p>

        <div className="mb-3">
          <label className="block text-[10px] tracking-widest uppercase text-[#8899aa] mb-1.5">Email</label>
          <input
            type="email"
            placeholder="votre@email.ci"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-[#0a1628] border border-[#d4af7a22] rounded-lg px-3 py-2.5 text-sm text-[#f0e8d6] placeholder-[#445566] outline-none focus:border-[#d4af7a44]"
          />
        </div>

        <div className="mb-5">
          <label className="block text-[10px] tracking-widest uppercase text-[#8899aa] mb-1.5">Mot de passe</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full bg-[#0a1628] border border-[#d4af7a22] rounded-lg px-3 py-2.5 text-sm text-[#f0e8d6] placeholder-[#445566] outline-none focus:border-[#d4af7a44]"
          />
        </div>

        {error && (
          <p className="text-red-400 text-xs mb-4 text-center">{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#d4af7a] text-[#0a1628] font-medium text-sm py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </div>
    </div>
  );
}