import React from 'react'
import { Form, Input, Button, Card, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography

export default function Login() {
  const navigate = useNavigate()

  const onFinish = (values) => {
    console.log('Login success:', values)
    navigate('/kanban')
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card style={{ width: 350, padding: 20 }} className="shadow">
        <Title level={3} className="text-center mb-4">Login</Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" rules={[{ required: true, message: 'Please enter your username!' }]}>
            <Input placeholder="Username" />
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
