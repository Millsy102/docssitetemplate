import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Installation from './pages/Installation'
import GettingStarted from './pages/GettingStarted'
import Contributing from './pages/Contributing'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <div className="main-content">
          <Sidebar />
          <main className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/installation" element={<Installation />} />
              <Route path="/getting-started" element={<GettingStarted />} />
              <Route path="/contributing" element={<Contributing />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
