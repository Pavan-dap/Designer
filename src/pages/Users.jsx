import React, { useEffect, useState } from 'react'
import { Card, Table, Button, Space, Tag, Typography, Avatar, message, Spin, Modal, Form, Input, Select, Tooltip } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons'
import { UsersAPI } from '../api/endpoints'

const { Title } = Typography

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await UsersAPI.list()
      setUsers(data)
    } catch (error) {
      console.error(error)
      message.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleSubmit = async (values) => {
    if (values.password !== values.confirm_password) {
      message.error('Password and Confirm Password do not match')
      return
    }
    try {
      setSubmitting(true)
      await UsersAPI.create(values)
      message.success('User added successfully')
      setModalVisible(false)
      form.resetFields()
      fetchUsers()
    } catch (error) {
      console.error(error)
      message.error('Failed to add user')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div>{name}</div>
            <div className="subtle-text">{record.emp_id}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Password',
      dataIndex: 'password',
      key: 'password',
      render: (password) => (
        <Tooltip title={password}>
          <span className="masked-password">{'*'.repeat(password?.length || 6)}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
      render: (designation) => {
        const colors = { Designer: 'blue', Tailor: 'green', CEO: 'orange', Admin: 'red' }
        return <Tag color={colors[designation] || 'default'}>{designation}</Tag>
      },
    },
    {
      title: 'Status',
      dataIndex: 'Emp_Status',
      key: 'Emp_Status',
      render: (status) => <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button disabled size="small" icon={<EditOutlined />} />
          <Button disabled size="small" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ]

  return (
    <div className="container py-3">
      <div className="page-header">
        <Title level={3} className="mb-0">User Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          Add User
        </Button>
      </div>

      <Card size="small">
        {loading ? (
          <div className="py-4 text-center"><Spin tip="Loading users..." /></div>
        ) : (
          <Table
            columns={columns}
            dataSource={users.map((u) => ({ ...u, key: u.id || u.emp_id }))}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        )}
      </Card>

      <Modal title="Add User" open={modalVisible} onCancel={() => setModalVisible(false)} footer={null}>
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password autoComplete="off" />
          </Form.Item>
          <Form.Item name="confirm_password" label="Confirm Password" rules={[{ required: true }]}>
            <Input.Password autoComplete="off" />
          </Form.Item>
          <Form.Item name="designation" label="Designation" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Designer">Designer</Select.Option>
              <Select.Option value="Tailor">Tailor</Select.Option>
              <Select.Option value="CEO">CEO</Select.Option>
              <Select.Option value="Admin">Admin</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="Emp_Status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>Submit</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
