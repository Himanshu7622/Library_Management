import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Hide loading screen once app is ready
window.addEventListener('load', () => {
  const loading = document.getElementById('loading');
  if (loading) {
    setTimeout(() => {
      loading.classList.add('hide');
      setTimeout(() => {
        loading.remove();
      }, 500);
    }, 1000);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);