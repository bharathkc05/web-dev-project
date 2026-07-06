import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return <h1>Client app is ready</h1>;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);