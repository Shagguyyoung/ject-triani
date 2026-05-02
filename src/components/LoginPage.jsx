import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { scaleIn, fadeIn } from "../utils/animations";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  setError("");
  if (!form.email || !form.password) {
    setError("Veuillez remplir tous les champs.");
    return;
  }
  setLoading(true);
  const ok = await login(form.email, form.password);
  if (!ok) setError("Email ou mot de passe incorrect.");
  setLoading(false);
};

  return (
    <motion.div {...fadeIn}
      className="min-h-screen bg-[#0a1628] flex items-center justify-center"
      style={{ fontFamily: "'Montserrat', sans-serif" }}>

      {/* Cercles décoratifs animés */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-96 h-96 rounded-full border border-[#d4af7a] top-10 -left-20 pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.03, 0.08, 0.03] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute w-64 h-64 rounded-full border border-[#d4af7a] bottom-10 -right-10 pointer-events-none"
      />

      <motion.div {...scaleIn}
        className="bg-[#0d1e38] border border-[#d4af7a33] rounded-xl p-10 w-full max-w-sm relative z-10">

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl text-[#f0e8d6] mb-1 text-center"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          JECT-TRIANI
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs text-[#8899aa] tracking-widest uppercase mb-8 text-center">
          Espace responsables
        </motion.p>

        {["email", "password"].map((key, i) => (
          <motion.div key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="mb-3">
            <label className="block text-[10px] tracking-widest uppercase text-[#8899aa] mb-1.5">
              {key === "email" ? "Email" : "Mot de passe"}
            </label>
            <input
              type={key === "password" ? "password" : "email"}
              placeholder={key === "email" ? "votre@email.ci" : "••••••••"}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full bg-[#0a1628] border border-[#d4af7a22] rounded-lg px-3 py-2.5 text-sm text-[#f0e8d6] placeholder-[#445566] outline-none focus:border-[#d4af7a44] transition-colors"
            />
          </motion.div>
        ))}

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-xs mb-4 text-center">
            {error}
          </motion.p>
        )}

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#d4af7a] text-[#0a1628] font-medium text-sm py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 mt-2">
          {loading ? "Connexion..." : "Se connecter"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}