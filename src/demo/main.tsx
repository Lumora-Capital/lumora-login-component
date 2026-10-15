import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// A login page should open at the top, not where the last visit left off
window.history.scrollRestoration = 'manual';

// Initialize the React application
ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
