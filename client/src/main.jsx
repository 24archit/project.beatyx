import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleReCaptchaProvider reCaptchaKey={SITE_KEY}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </GoogleReCaptchaProvider>
)
