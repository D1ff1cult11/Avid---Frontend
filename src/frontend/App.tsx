import { Route, Switch } from "wouter";
import CommissionerPage from "./commissioner/CommissionerPage";
import StaffPage from "./staff/StaffPage";
import Nav from "./EVMClient/components/Nav/Nav";
import VotingPage from "./EVMClient/pages/VotingPage";

export default function App() {
  return (
    <>
      <Nav />
      <Switch>
        <Route path="/" component={VotingPage} />
        <Route path="/commissioner" component={CommissionerPage} />
        <Route path="/staff" component={StaffPage} />
        <Route>
          <main className="page">
            <div className="card">
              <p className="error-text">404 – Page not found</p>
            </div>
          </main>
        </Route>
      </Switch>
    </>
  );
}
