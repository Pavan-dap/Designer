import React, { useMemo, useState } from 'react'
import { Layout, Menu, Button, Typography, Tag } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const { Header, Sider, Content } = Layout
const { Text } = Typography

const items = [
  { key: '/dashboard', label: 'Dashboard' },
  { key: '/kanban', label: 'Kanban' },
  { key: '/orders', label: 'Orders' },
  { key: '/customers', label: 'Customers' },
  { key: '/users', label: 'Users' },
  { key: '/reports', label: 'Reports' },
]

const SIDER_WIDTH = 200

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const selectedKeys = useMemo(() => {
    const match = items.find((i) => location.pathname.startsWith(i.key))
    return [match?.key || '/dashboard']
  }, [location.pathname])

  const leftPadding = collapsed ? 0 : SIDER_WIDTH

  return (
    <Layout className="app-shell" style={{ minHeight: '100vh' }}>
      <Sider
        width={SIDER_WIDTH}
        breakpoint="lg"
        collapsedWidth={0}
        onCollapse={(c) => setCollapsed(c)}
        onBreakpoint={(br) => setCollapsed(br)}
        style={{ position: 'fixed', left: 0, top: 0, bottom: 0 }}
      >
        <div className="app-logo">Designer Studio</div>
        <Menu theme="dark" mode="inline" selectedKeys={selectedKeys} items={items} onClick={(e) => navigate(e.key)} />
      </Sider>
      <Layout style={{ paddingLeft: leftPadding }}>
        <Header className="app-header d-flex justify-content-between align-items-center" style={{ position: 'fixed', top: 0, right: 0, left: leftPadding, zIndex: 10 }}>
          <div />
          <div className="d-flex align-items-center gap-2">
            <Tag color="blue">{user?.role}</Tag>
            <Text className="me-2">{user?.name}</Text>
            <Button size="small" onClick={() => { signOut(); navigate('/login') }}>Logout</Button>
          </div>
        </Header>
        <Content className="app-content" style={{ marginTop: 64, height: 'calc(100vh - 64px)', overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
