import React, { useEffect, useState } from 'react'
import {
  Layout as AntLayout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  Typography,
  Button,
  Tag,
  Drawer
} from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  BarChartOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMessage } from '../context/MessageContext'

const { Header, Sider, Content } = AntLayout
const { Text } = Typography

const MainLayout = () => {
  const { user, signOut } = useAuth()
  const messageApi = useMessage()
  const navigate = useNavigate()
  const location = useLocation()

  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 992)
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 992
      setIsMobile(mobile)
      if (!mobile) {
        setMobileDrawerVisible(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = async () => {
    await signOut()
    messageApi.success('Logged out successfully')
    navigate('/login')
  }

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/kanban', icon: <FileTextOutlined />, label: 'Kanban' },
    { key: '/orders', icon: <ShoppingCartOutlined />, label: 'Orders' },
    { key: '/customers', icon: <UserOutlined />, label: 'Customers' },
    { key: '/users', icon: <TeamOutlined />, label: 'Users' },
    { key: '/reports', icon: <BarChartOutlined />, label: 'Reports' },
  ]

  const SidebarContent = () => (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={({ key }) => {
        navigate(key)
        setMobileDrawerVisible(false)
      }}
      style={{
        border: 'none',
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
      }}
    />
  )

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          breakpoint="lg"
          collapsedWidth="80"
          width={250}
          style={{
            overflow: 'hidden',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: collapsed ? '16px' : '18px',
              fontWeight: 'bold',
              borderBottom: '1px solid #434343',
            }}
          >
            {collapsed ? 'DS' : 'Designer Studio'}
          </div>
          <SidebarContent />
        </Sider>
      )}

      {isMobile && (
        <Drawer
          title="Designer Studio"
          placement="left"
          onClose={() => setMobileDrawerVisible(false)}
          open={mobileDrawerVisible}
          styles={{
            body: { padding: 0, backgroundColor: '#001529' },
            header: {
              backgroundColor: '#001529',
              color: 'white',
              borderBottom: '1px solid #434343',
            },
          }}
          width={250}
          className="mobile-drawer"
        >
          <SidebarContent />
        </Drawer>
      )}

      <AntLayout style={{ marginLeft: !isMobile ? (collapsed ? 80 : 250) : 0 }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => {
              if (isMobile) {
                setMobileDrawerVisible(true)
              } else {
                setCollapsed(!collapsed)
              }
            }}
          />
          <Space>
            <Tag color="blue">{user?.role}</Tag>
            <Text strong>{user?.name}</Text>
            <Avatar style={{ backgroundColor: '#1976d2' }} icon={<UserOutlined />} />
            <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} danger>
              {!isMobile && 'Logout'}
            </Button>
          </Space>
        </Header>

        <Content
          style={{
            margin: isMobile ? '3px' : '8px',
            padding: isMobile ? '3px' : '8px',
            background: '#f0f2f5',
            minHeight: 'calc(100vh - 96px)',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default MainLayout
