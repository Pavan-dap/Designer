import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Row, Col, Tag, List, Button, Modal, Form, Input, Select, Divider, message } from 'antd'
import { CustomersAPI, OrdersAPI, STATUSES } from '../api/endpoints'

const MEASUREMENT_FIELDS = [
  { key: 'bust', label: 'Bust (in)' },
  { key: 'waist', label: 'Waist (in)' },
  { key: 'hip', label: 'Hip (in)' },
  { key: 'shoulder', label: 'Shoulder (in)' },
  { key: 'chest', label: 'Chest (in)' },
  { key: 'length', label: 'Length (in)' },
  { key: 'sleeve', label: 'Sleeve (in)' },
  { key: 'inseam', label: 'Inseam (in)' },
]

export default function CustomerDetails() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [family, setFamily] = useState([])
  const [orders, setOrders] = useState([])
  const [creating, setCreating] = useState(false)
  const [form] = Form.useForm()

  const load = async () => {
    try {
      const c = await CustomersAPI.get(id)
      setCustomer(c)
      const fam = await CustomersAPI.list({ familyId: c.familyId })
      setFamily((fam || []).filter((m) => m.id !== c.id))
      // assuming backend supports filter by customerId
      const os = await OrdersAPI.list({ customerId: id })
      setOrders(os)
    } catch (e) { message.error('Failed to load customer') }
  }

  useEffect(() => { load() }, [id])

  const addOrder = async (values) => {
    try {
      const payload = {
        assignedDesigner: values.assignedDesigner || null,
        items: (values.items || []).map((it) => ({
          name: it.name,
          qty: it.qty,
          size: it.size,
          status: 'Design',
          tailor: null,
          measurements: it.measurements || {},
        })),
      }
      await OrdersAPI.create(id, payload)
      message.success('Order created')
      setCreating(false)
      form.resetFields()
      load()
    } catch (e) { message.error('Failed to create order') }
  }

  const measurementInputs = (namePath) => (
    <Row gutter={[8, 8]}>
      {MEASUREMENT_FIELDS.map((f) => (
        <Col xs={12} md={8} key={f.key}>
          <Form.Item name={[...namePath, 'measurements', f.key]} label={f.label}>
            <Input />
          </Form.Item>
        </Col>
      ))}
    </Row>
  )

  if (!customer) return <div className="container py-4">Loading...</div>

  return (
    <div className="container py-3">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Customer">
            <div className="mb-2"><strong>{customer.name}</strong></div>
            <div className="mb-2">Phone: {customer.phone}</div>
            <div className="mb-2">Email: {customer.email || '-'}</div>
            <Tag color="purple">Family: {customer.familyId || 'None'}</Tag>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Family Members">
            <List
              dataSource={family}
              locale={{ emptyText: 'No other members' }}
              renderItem={(m) => <List.Item>{m.name} • {m.phone}</List.Item>}
            />
          </Card>
        </Col>
        <Col span={24}>
          <Card
            title="Orders"
            extra={<Button type="primary" onClick={() => setCreating(true)}>New Order</Button>}
          >
            <List
              dataSource={orders}
              renderItem={(o) => (
                <List.Item>
                  <div>
                    <div><strong>Order {o.id}</strong> • Designer: {o.assignedDesigner || '-'}</div>
                    <div className="text-muted small">Items: {(o.items || []).map((it) => `${it.name} x${it.qty}`).join(', ')}</div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Modal title="Create Order" open={creating} onCancel={() => setCreating(false)} footer={null} width={900}>
        <Form layout="vertical" form={form} onFinish={addOrder} initialValues={{ items: [{ name: '', qty: 1, size: '' }] }}>
          <Form.Item name="assignedDesigner" label="Assign Designer">
            <Input placeholder="designer username" />
          </Form.Item>
          <Divider>Items and Measurements</Divider>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div>
                {fields.map((field, idx) => (
                  <Card key={field.key} size="small" className="mb-2" title={`Item ${idx + 1}`} extra={<Button danger onClick={() => remove(field.name)}>Remove</Button>}>
                    <Row gutter={[8, 8]}>
                      <Col xs={24} md={12}><Form.Item name={[field.name, 'name']} label="Item" rules={[{ required: true }]}><Input /></Form.Item></Col>
                      <Col xs={12} md={6}><Form.Item name={[field.name, 'qty']} label="Qty" rules={[{ required: true }]}><Input type="number" /></Form.Item></Col>
                      <Col xs={12} md={6}><Form.Item name={[field.name, 'size']} label="Size"><Input /></Form.Item></Col>
                    </Row>
                    {measurementInputs([field.name])}
                  </Card>
                ))}
                <Button onClick={() => add({ name: '', qty: 1, size: '' })}>Add Item</Button>
              </div>
            )}
          </Form.List>
          <Divider />
          <Button type="primary" htmlType="submit">Create Order</Button>
        </Form>
      </Modal>
    </div>
  )
}
