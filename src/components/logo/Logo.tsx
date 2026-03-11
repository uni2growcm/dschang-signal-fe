import { MdOutlineWifiTethering } from "react-icons/md";
import { Link } from "react-router";

export default function Logo({hideText = false, className = ""}: Readonly<{hideText?: boolean; className?: string}>) {
  return (
    <Link to="/" className={`flex items-center gap-3 z-50 ${className}`}>
      <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl">
        <MdOutlineWifiTethering size={32} className="text-white" />
      </div>
      {!hideText && (
        <span className="text-white text-2xl font-bold tracking-wide">
          Dschang's Signal
        </span>
      )}
    </Link>
  );
}