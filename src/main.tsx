import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * FIXED: Resolving React Error #299
 * Ensures the mounting point is strictly 'app' and handles potential 
 * double-initialisation issues.
 */
const container = document.getElementById('app');

if (!container) {
  // If the container is missing, we log a clear error to the console
  console.error("Error #299: Target container 'app' not found in index.html.");
} else {
  // Check if root already exists to prevent double mounting in dev mode
  const root = (container as any)._reactRootContainer 
    ? (container as any)._reactRootContainer 
    : ReactDOM.createRoot(container);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
