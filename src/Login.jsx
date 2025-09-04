import React from 'react'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import api from './api/client'
import { useAuth } from './context/AuthContext.jsx'

const { Title } = Typography

export default function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const onFinish = async (values) => {
    try {
      const { data } = await api.post('/auth/login', {
        user_id: values.user_id,
        password: values.password,
      })
      const authPayload = {
        user: {
          id: data.user_id,
          name: data.name,
          role: data.designation,
          username: data.user_id,
          status: data.Emp_Status,
        },
        token: data.token || 'session',
      }
      signIn(authPayload)
      navigate('/kanban')
    } catch (err) {
      message.error(err?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="auth-page bg-light">
      <Card className="auth-card shadow">
        <Title level={3} className="text-center mb-4">Login</Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="user_id" rules={[{ required: true, message: 'Please enter your user id!' }]}> 
            <Input placeholder="user_id" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Please enter your password!' }]}> 
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block className="mt-3">
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
