import React, { useEffect, useMemo, useState } from 'react'
import { Table, Select, Button, Space, Tag, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { DesignersAPI, OrdersAPI } from '../api/endpoints'
import { useAuth } from '../context/AuthContext.jsx'

export default function Orders() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [designers, setDesigners] = useState([])
  const [orders, setOrders] = useState([])
  const [designerFilter, setDesignerFilter] = useState('')

  const activeDesigner = useMemo(() => (user?.role === 'Designer' ? user.username : designerFilter || ''), [user, designerFilter])

  const load = async () => {
    try {
      const [ds, os] = await Promise.all([
        DesignersAPI.list(),
        OrdersAPI.list(activeDesigner ? { designer: activeDesigner } : {}),
      ])
      setDesigners(ds)
      setOrders(os)
    } catch (e) {
      message.error('Failed to load orders')
    }
  }

  useEffect(() => { load() }, [activeDesigner])

  const assignDesigner = async (orderId, assignedDesigner) => {
    try {
      await OrdersAPI.assignDesigner(orderId, assignedDesigner)
      await load()
    } catch (e) {
      message.error('Assign failed')
    }
  }

  const columns = [
    { title: 'Order ID', dataIndex: 'id' },
    { title: 'Customer', dataIndex: 'customerName' },
    { title: 'Family', dataIndex: 'familyId' },
    { title: 'Items', render: (_, r) => r.items?.length || 0 },
    {
      title: 'Designer',
      render: (_, r) => (
        user?.role === 'Head' ? (
          <Select
            style={{ minWidth: 180 }}
            value={r.assignedDesigner}
            onChange={(v) => assignDesigner(r.id, v)}
            options={designers.map((d) => ({ label: d.name, value: d.username }))}
          />
        ) : (
          <Tag color="blue">{r.assignedDesigner}</Tag>
        )
      ),
    },
    {
      title: 'Action',
      render: (_, r) => (
        <Space>
          <Button onClick={() => navigate(`/orders/${r.id}`)}>View</Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2 align-items-center">
          {user?.role === 'Head' && (
            <Select
              allowClear
              className="designer-filter"
              placeholder="Filter by Designer"
              options={designers.map((d) => ({ label: d.name, value: d.username }))}
              onChange={(v) => setDesignerFilter(v || '')}
              value={designerFilter || undefined}
            />
          )}
        </div>
      </div>
      <Table rowKey="id" columns={columns} dataSource={orders} pagination={{ pageSize: 10 }} />
    </div>
  )
}
