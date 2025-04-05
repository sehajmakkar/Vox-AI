import React from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from './components/HomePage/HomePage'
import Room from './components/Room/Room'
import Landing from './components/Landing/Landing'
import Navbar from './components/Navbar'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing/>} />  
      <Route path="/join" element={<HomePage />} />  
      <Route path="/room/:roomId" element={<Room />} />
    </Routes>
  )
}

export default App