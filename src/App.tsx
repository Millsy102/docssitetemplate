import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import { RealtimeNotifications } from './components/RealtimeNotifications';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

// Lazy load page components for code splitting
const Home = lazy(() => import('./pages/Home'));
const Installation = lazy(() => import('./pages/Installation'));
const GettingStarted = lazy(() => import('./pages/GettingStarted'));
const Contributing = lazy(() => import('./pages/Contributing'));
const RealtimeDemo = lazy(() => import('./pages/RealtimeDemo'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <SocketProvider>
      <Router>
        <div className='app'>
          <Header />
          <div className='main-content'>
            <Sidebar />
            <main className='content'>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path='/' element={<Home />} />
                  <Route path='/installation' element={<Installation />} />
                  <Route path='/getting-started' element={<GettingStarted />} />
                  <Route path='/contributing' element={<Contributing />} />
                  <Route path='/realtime-demo' element={<RealtimeDemo />} />
                  <Route path='*' element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
          </div>
          <RealtimeNotifications />
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;
