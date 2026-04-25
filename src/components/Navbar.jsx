import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-serif text-gold">
            Association+
          </Link>

          <div className="space-x-6">
            <Link to="/" className="hover:text-gold transition">
              Dashboard
            </Link>
            <Link to="/membres" className="hover:text-gold transition">
              Membres
            </Link>
            <Link to="/cotisations" className="hover:text-gold transition">
              Cotisations
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;