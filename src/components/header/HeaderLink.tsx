import { Link } from "react-router";

export default function HeaderLink({
  name,
  to,
}: Readonly<{ name: string; to: string }>) {
  return (
    <Link
      to={to}
      className="text-xl transition-all duration-300 ease-in-out hover:text-primary hover:underline hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary active:text-primary"
    >
      {name}
    </Link>
  );
}
