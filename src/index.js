import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { GoogleOAuthProvider } from '@react-oauth/google';

// scroll bar
import 'simplebar/dist/simplebar.min.css';

import App from "./App";
import * as serviceWorker from "./serviceWorker";
import reportWebVitals from "./reportWebVitals";

// Suppress ResizeObserver loop errors (common in React/MUI, not critical)
const resizeObserverErrorSuppress = (e) => {
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
      e.message === 'ResizeObserver loop limit exceeded') {
    const resizeObserverErrDiv = document.getElementById('webpack-dev-server-client-overlay');
    const resizeObserverErr = document.getElementById('webpack-dev-server-client-overlay-div');
    if (resizeObserverErr) resizeObserverErr.setAttribute('style', 'display: none');
    if (resizeObserverErrDiv) resizeObserverErrDiv.setAttribute('style', 'display: none');
  }
};
window.addEventListener('error', resizeObserverErrorSuppress);


// ----------------------------------------------------------------------

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

// Old methods for React 16.8 and below
// ReactDOM.render(
//   <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
//     <HelmetProvider>
//       <BrowserRouter>
//         <App />
//       </BrowserRouter>
//     </HelmetProvider>
//   </GoogleOAuthProvider>,
//   document.getElementById("root")
// );

// If you want to enable client cache, register instead.
serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

if (process.env.NODE_ENV === 'development') {
  // Reduce initial load
  const script = document.createElement('script');
  script.textContent = `
    // Disable React DevTools in development if causing issues
    if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.isDisabled = true;
    }
  `;
  document.head.appendChild(script);
  
  // Import performance monitor
  import('./utils/performanceMonitor').then(({ performanceMonitor }) => {
    performanceMonitor.startMonitoring();
  });
}