import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import 'antd/dist/reset.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.css'
import { AuthProvider } from './context/AuthContext.jsx'

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
)
