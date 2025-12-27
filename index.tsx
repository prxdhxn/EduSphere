
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { ToastProvider } from './components/ToastProvider';

console.log('index.tsx: module loaded');
import App from './App';

const rootElement = document.getElementById('root');
console.log('index.tsx: root element query result ->', rootElement);
if (!rootElement) {
  console.error('index.tsx: root element not found');
  throw new Error("Could not find root element to mount to");
}

console.log('index.tsx: creating React root');
const root = ReactDOM.createRoot(rootElement);
console.log('index.tsx: mounting App');
root.render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);
