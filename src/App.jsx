import React from 'react'
import { ConfigProvider, App as AntApp } from 'antd'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login.jsx'
import Kanban from './Kanban.jsx'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import OrderDetails from './pages/OrderDetails'
import Reports from './pages/Reports'
import Users from './pages/Users'
import Customers from './pages/Customers'
import CustomerDetails from './pages/CustomerDetails'
import { AuthProvider, ProtectedRoute } from './context/AuthContext'
import { MessageProvider } from './context/MessageContext'
import AppLayout from './layout/AppLayout'
import "./App.css";

// Ant Design theme configuration
const theme = {
  token: {
    colorPrimary: '#1976d2',
    borderRadius: 6,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Layout: {
      siderBg: '#001529',
      triggerBg: '#002140',
    },
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#1976d2',
      darkItemHoverBg: '#112240',
    },
  },
}

function App() {
  return (
    <ConfigProvider theme={theme}>
      <AntApp>
        <MessageProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/kanban" element={<Kanban />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderDetails />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers/:id" element={<CustomerDetails />} />
                <Route path="/users" element={<Users />} />
                <Route path="/reports" element={<Reports />} />
              </Route>
            </Routes>
          </AuthProvider>
        </MessageProvider>
      </AntApp>
    </ConfigProvider>
  )
}

export default App
