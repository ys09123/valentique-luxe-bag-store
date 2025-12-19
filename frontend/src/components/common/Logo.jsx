import { Link } from "react-router-dom";
const Logo = ({ className }) => {
  return (
    <div>
      <Link to="/" className="flex items-center space-x-2 group">
        <div className="relative">
          {/* <div className="absolute inset-0 bg-amber-500/20 blur-xl group-hover:bg-amber-500/30 transition-all" /> */}
          <svg
            width="260"
            height="56"
            viewBox="0 0 260 56"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={{ color: "#F4C430" }}
          >
            {/* Brand text */}
            <text
              y="38"
              fontFamily="Playfair Display, serif"
              fontSize="34"
              letterSpacing="2.5"
              fill="currentColor"
            >
              VALENTIQUE
            </text>
          </svg>

          {/* <ShoppingBag className="h-8 w-8 text-amber-500 relative" /> */}
        </div>
        {/* <span className="text-2xl font-light text-white tracking-[0.2em]">
              <span className="text-amber-500">Valentique</span>
            </span> */}
      </Link>
    </div>
  );
};

export default Logo;
