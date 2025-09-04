import React, { useMemo } from 'react'
import { Layout, Menu, Button, Typography, Tag } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const items = [
  { key: '/dashboard', label: 'Dashboard' },
  { key: '/kanban', label: 'Kanban' },
  { key: '/orders', label: 'Orders' },
  { key: '/reports', label: 'Reports' },
]

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const selectedKeys = useMemo(() => {
    const match = items.find((i) => location.pathname.startsWith(i.key))
    return [match?.key || '/dashboard']
  }, [location.pathname])

  return (
    <Layout className="app-shell">
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="app-logo">Designer Studio</div>
        <Menu theme="dark" mode="inline" selectedKeys={selectedKeys} items={items} onClick={(e) => navigate(e.key)} />
      </Sider>
      <Layout>
        <Header className="app-header d-flex justify-content-between align-items-center">
          <div />
          <div className="d-flex align-items-center gap-2">
            <Tag color="blue">{user?.role}</Tag>
            <Text className="me-2">{user?.name}</Text>
            <Button size="small" onClick={() => { signOut(); navigate('/login') }}>Logout</Button>
          </div>
        </Header>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
