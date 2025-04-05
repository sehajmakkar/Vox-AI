import React from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from './components/HomePage/HomePage'
import Room from './components/Room/Room'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />  
      <Route path="/room/:roomId" element={<Room />} />
    </Routes>
  )
}

export default App