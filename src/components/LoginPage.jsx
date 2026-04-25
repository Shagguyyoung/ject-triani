import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { loginWithRedirect } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="bg-[#0d1e38] border border-[#d4af7a33] rounded-xl p-10 w-full max-w-sm text-center">
        <p className="text-3xl text-[#f0e8d6] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          JECT-TRIANI
        </p>
        <p className="text-xs text-[#8899aa] tracking-widest uppercase mb-8">Espace responsables</p>
        <button
          onClick={() => loginWithRedirect()}
          className="w-full bg-[#d4af7a] text-[#0a1628] font-medium text-sm py-3 rounded-lg hover:opacity-90 transition"
        >
          Se connecter
        </button>
      </div>
    </div>
  );
}