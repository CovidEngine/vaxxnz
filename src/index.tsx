import { BaseProvider } from "baseui";
import VaxxTheme from "./VaxxTheme";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import React from "react";
import ReactDOM from "react-dom";
import { initReactI18next } from "react-i18next";
import { Client as Styletron } from "styletron-engine-atomic";
import { Provider as StyletronProvider } from "styletron-react";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { config as i18nextConfig } from "./translations";
import { BrowserRouter as Router } from "react-router-dom";

i18n.use(LanguageDetector).use(initReactI18next).init(i18nextConfig);

const engine = new Styletron();

function Index() {
  return (
    <React.StrictMode>
      <StyletronProvider value={engine}>
        <BaseProvider theme={VaxxTheme}>
          <Router>
            <App />
          </Router>
        </BaseProvider>
      </StyletronProvider>
    </React.StrictMode>
  );
}

ReactDOM.render(<Index />, document.getElementById("root"));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
