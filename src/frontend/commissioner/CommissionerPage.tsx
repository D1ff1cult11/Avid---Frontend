import { useState } from "preact/hooks";
import CommissionerDashboard from "./CommissionerDashboard";
import CommissionerLoginPage from "./CommissionerLoginPage";

export default function CommissionerPage() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) {
    return <CommissionerLoginPage onLoginSuccess={() => setLoggedIn(true)} />;
  }

  return <CommissionerDashboard onLogout={() => setLoggedIn(false)} />;
}
