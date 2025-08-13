import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './i18n'; 
import LoadingIndicator from './components/LoadingIndicator.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><LoadingIndicator /></div>}>
      <App />
    </Suspense>
  </React.StrictMode>,
);