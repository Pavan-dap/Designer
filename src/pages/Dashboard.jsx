import React, { useEffect, useMemo, useState } from 'react'
import { Card, Col, Row, Statistic, Tag, Select, message } from 'antd'
import { OrdersAPI, DesignersAPI, STATUSES } from '../api/endpoints'
import { useAuth } from '../context/AuthContext.jsx'

export default function Dashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [designers, setDesigners] = useState([])
  const [designer, setDesigner] = useState('')

  const activeDesigner = useMemo(() => (user?.role === 'Designer' ? user.username : designer || ''), [user, designer])

  const load = async () => {
    try {
      const [ds, os] = await Promise.all([
        DesignersAPI.list(),
        OrdersAPI.list(activeDesigner ? { designer: activeDesigner } : {}),
      ])
      setDesigners(ds)
      setOrders(os)
    } catch (e) {
      message.error('Failed to load dashboard')
    }
  }

  useEffect(() => { load() }, [activeDesigner])

  const itemsCount = orders.reduce((acc, o) => acc + (o.items?.length || 0), 0)
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]))
  for (const o of orders) for (const it of o.items || []) byStatus[it.status] = (byStatus[it.status] || 0) + 1

  return (
    <div className="container py-3">
      <Row gutter={[16, 16]} className="mb-2">
        <Col span={24}>
          {user?.role === 'Head' && (
            <Select
              allowClear
              className="designer-filter"
              placeholder="Filter by Designer"
              options={designers.map((d) => ({ label: d.name, value: d.username }))}
              onChange={(v) => setDesigner(v || '')}
              value={designer || undefined}
            />
          )}
          {user?.role === 'Designer' && <Tag color="blue">{user?.name}</Tag>}
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Orders" value={orders.length} /></Card></Col>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Items" value={itemsCount} /></Card></Col>
        {STATUSES.map((s) => (
          <Col xs={24} sm={12} md={6} key={s}><Card><Statistic title={s} value={byStatus[s]} /></Card></Col>
        ))}
      </Row>
    </div>
  )
}
