import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router";
import { UserContext } from './context/UserContext.jsx';
import { SiteConfigProvider } from './context/SiteConfigContext.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <UserContext>
      <SiteConfigProvider>
        <App />
      </SiteConfigProvider>
    </UserContext>
  </BrowserRouter>,
);
