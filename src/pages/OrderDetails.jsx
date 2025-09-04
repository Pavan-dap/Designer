import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Table, Select, Tag, message } from 'antd'
import { OrdersAPI, ItemsAPI, STATUSES } from '../api/endpoints'

export default function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  const load = async () => {
    try {
      const data = await OrdersAPI.get(id)
      setOrder(data)
    } catch (e) {
      message.error('Failed to load order')
    }
  }

  useEffect(() => { load() }, [id])

  const setStatus = async (itemId, status) => {
    try {
      await ItemsAPI.updateStatus(itemId, status)
      await load()
    } catch (e) { message.error('Update failed') }
  }

  const setTailor = async (itemId, tailor) => {
    try {
      await ItemsAPI.assignTailor(itemId, tailor || null)
      await load()
    } catch (e) { message.error('Assign failed') }
  }

  const columns = [
    { title: 'Item', dataIndex: 'name' },
    { title: 'Qty', dataIndex: 'qty' },
    { title: 'Size', dataIndex: 'size' },
    {
      title: 'Status',
      render: (_, r) => (
        <Select value={r.status} onChange={(v) => setStatus(r.id, v)} options={STATUSES.map((s) => ({ label: s, value: s }))} />
      ),
    },
    {
      title: 'Tailor',
      render: (_, r) => (
        <Select
          allowClear
          value={r.tailor || undefined}
          placeholder="Assign Tailor"
          onChange={(v) => setTailor(r.id, v)}
          options={[{label:'Ravi',value:'Ravi'},{label:'Anil',value:'Anil'},{label:'Mahesh',value:'Mahesh'},{label:'Lakshmi',value:'Lakshmi'}]}
        />
      ),
    },
  ]

  if (!order) return <div className="container py-4">Loading...</div>

  return (
    <div className="container py-3">
      <Card title={`Order ${order.id} • ${order.customerName}`}>
        <div className="mb-3">
          <Tag color="blue">Designer: {order.assignedDesigner || 'Unassigned'}</Tag>
          <Tag>Family: {order.familyId}</Tag>
        </div>
        <Table rowKey="id" columns={columns} dataSource={order.items || []} pagination={false} />
      </Card>
    </div>
  )
}
