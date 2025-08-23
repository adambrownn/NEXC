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