import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login.jsx'
import Kanban from './Kanban.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/kanban" element={<Kanban />} />
    </Routes>
  )
}
