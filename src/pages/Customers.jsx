import React, { useEffect, useState } from 'react'
import { Card, Table, Button, Space, Tag, Typography, Avatar, message, Spin, Modal, Form, Input } from 'antd'
import { PlusOutlined, TeamOutlined, UserAddOutlined } from '@ant-design/icons'
import { CustomersAPI } from '../api/endpoints'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [addForm] = Form.useForm()
  const [linkForm] = Form.useForm()
  const navigate = useNavigate()

  const load = async () => {
    try {
      setLoading(true)
      const data = await CustomersAPI.list()
      setCustomers(data)
    } catch (e) { message.error('Failed to load customers') } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const createCustomer = async (values) => {
    try {
      await CustomersAPI.create(values)
      message.success('Customer added')
      setAddOpen(false)
      addForm.resetFields()
      load()
    } catch (e) { message.error('Failed to add customer') }
  }

  const linkFamily = async (values) => {
    try {
      await CustomersAPI.update(selectedCustomer.id, { familyId: values.familyId })
      message.success('Family linked')
      setLinkOpen(false)
      linkForm.resetFields()
      load()
    } catch (e) { message.error('Failed to link family') }
  }

  const columns = [
    { title: 'Customer', dataIndex: 'name', render: (name, r) => (<Space><Avatar>{name?.[0]}</Avatar><span>{name}</span></Space>) },
    { title: 'Phone', dataIndex: 'phone' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Family', dataIndex: 'familyId', render: (v) => v ? <Tag color="purple">{v}</Tag> : <Tag>None</Tag> },
    { title: 'Actions', render: (_, r) => (
      <Space>
        <Button size="small" onClick={() => navigate(`/customers/${r.id}`)}>View</Button>
        <Button size="small" icon={<TeamOutlined />} onClick={() => { setSelectedCustomer(r); setLinkOpen(true); linkForm.setFieldsValue({ familyId: r.familyId }) }}>Link Family</Button>
      </Space>
    ) },
  ]

  return (
    <div className="container py-3">
      <div className="page-header">
        <Title level={3} className="mb-0">Customers</Title>
        <Button type="primary" icon={<UserAddOutlined />} onClick={() => setAddOpen(true)}>Add Customer</Button>
      </div>
      <Card>
        {loading ? (
          <div className="py-4 text-center"><Spin /></div>
        ) : (
          <Table rowKey="id" columns={columns} dataSource={customers} />
        )}
      </Card>

      <Modal title="Add Customer" open={addOpen} onCancel={() => setAddOpen(false)} footer={null}>
        <Form layout="vertical" form={addForm} onFinish={createCustomer}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="email" label="Email"><Input /></Form.Item>
          <Form.Item name="familyId" label="Family ID"><Input /></Form.Item>
          <Form.Item><Button type="primary" htmlType="submit">Create</Button></Form.Item>
        </Form>
      </Modal>

      <Modal title="Link to Family" open={linkOpen} onCancel={() => setLinkOpen(false)} footer={null}>
        <Form layout="vertical" form={linkForm} onFinish={linkFamily}>
          <Form.Item name="familyId" label="Family ID" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item><Button type="primary" htmlType="submit">Link</Button></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
