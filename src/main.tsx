import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import '@fontsource/inter/400.css'
import '@fontsource/inter/700.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import './index.css'
import App from './App.tsx'

// Register service worker for offline capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/serviceWorker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
        
        // Handle service worker updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) {
            return;
          }
          
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // At this point, the updated precached content has been fetched,
                // but the previous service worker will still serve the older content
                console.log('New content is available and will be used when all tabs for this page are closed.');
                
                // Dispatch event that a new version is available
                window.dispatchEvent(new CustomEvent('serviceWorkerUpdated'));
              } else {
                // At this point, everything has been precached
                console.log('Content is cached for offline use.');
                
                // Dispatch event that content is cached for offline use
                window.dispatchEvent(new CustomEvent('serviceWorkerCached'));
              }
            }
          };
        };
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
      
    // Add service worker communication
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Message from Service Worker:', event.data);
      
      // Handle specific message types
      if (event.data && event.data.type) {
        switch (event.data.type) {
          case 'SYNC_STARTED':
            console.log('Background sync started');
            window.dispatchEvent(new CustomEvent('syncStarted', { detail: event.data }));
            break;
            
          case 'SYNC_COMPLETED':
            console.log('Background sync completed');
            window.dispatchEvent(new CustomEvent('syncCompleted', { detail: event.data }));
            break;
            
          case 'SYNC_FAILED':
            console.error('Background sync failed:', event.data.error);
            window.dispatchEvent(new CustomEvent('syncFailed', { detail: event.data }));
            break;
            
          case 'CONNECTION_STATUS':
            console.log('Connection status:', event.data.status);
            window.dispatchEvent(new CustomEvent('connectionStatusChanged', { detail: event.data }));
            break;
            
          case 'REQUEST_SYNC':
            console.log('Service worker requested sync');
            // Inform the offlineService to start sync
            window.dispatchEvent(new CustomEvent('requestSync'));
            break;
        }
      }
    });
    
    // Setup connection status monitoring
    window.addEventListener('online', () => {
      console.log('Browser is online');
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CONNECTION_STATUS',
          status: 'online'
        });
      }
    });
    
    window.addEventListener('offline', () => {
      console.log('Browser is offline');
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CONNECTION_STATUS',
          status: 'offline'
        });
      }
    });
  });
}

// Create router configuration
const router = createBrowserRouter([
  {
    path: '/*',
    element: <App />,
  },
])

const root = createRoot(document.getElementById('root')!)
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
