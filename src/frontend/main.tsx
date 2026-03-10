import { render } from "preact";
import App from "./App";
import "./EVMClient/styles/theme.css";
import "./EVMClient/styles/global.css";

render(<App />, document.getElementById("app") as HTMLElement);
