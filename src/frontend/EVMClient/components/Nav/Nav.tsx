import { Link, useLocation } from "wouter";

export default function Nav() {
  const [location] = useLocation();

  return (
    <nav className="nav">
      <Link href="/" className={location === "/" ? "nav-link active" : "nav-link"}>
        Vote
      </Link>
      <Link href="/commissioner" className={location === "/commissioner" ? "nav-link active" : "nav-link"}>
        Commissioner
      </Link>
      <Link href="/staff" className={location === "/staff" ? "nav-link active" : "nav-link"}>
        Staff
      </Link>
    </nav>
  );
}
