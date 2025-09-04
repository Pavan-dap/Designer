import React, { useEffect, useMemo, useState } from 'react'
import { Card, Table, Select, Button, Row, Col, message } from 'antd'
import { OrdersAPI, DesignersAPI, STATUSES } from '../api/endpoints'

function toCSV(rows) {
  const headers = Object.keys(rows[0] || {})
  const lines = [headers.join(','), ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(','))]
  return lines.join('\n')
}

export default function Reports() {
  const [orders, setOrders] = useState([])
  const [designers, setDesigners] = useState([])
  const [designer, setDesigner] = useState('')

  const load = async () => {
    try {
      const [ds, os] = await Promise.all([DesignersAPI.list(), OrdersAPI.list(designer ? { designer } : {})])
      setDesigners(ds)
      setOrders(os)
    } catch (e) { message.error('Failed to load reports') }
  }

  useEffect(() => { load() }, [designer])

  const rows = useMemo(() => {
    const data = []
    for (const o of orders) {
      for (const it of o.items || []) {
        data.push({
          Order: o.id,
          Customer: o.customerName,
          Family: o.familyId,
          Item: it.name,
          Qty: it.qty,
          Size: it.size,
          Status: it.status,
          Tailor: it.tailor || '',
          Designer: o.assignedDesigner || '',
        })
      }
    }
    return data
  }, [orders])

  const exportCSV = () => {
    const csv = toCSV(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const columns = Object.keys(rows[0] || {}).map((key) => ({ title: key, dataIndex: key }))

  return (
    <div className="container py-3">
      <Row justify="space-between" className="mb-3">
        <Col>
          <Select
            allowClear
            className="designer-filter"
            placeholder="Filter by Designer"
            options={designers.map((d) => ({ label: d.name, value: d.username }))}
            onChange={(v) => setDesigner(v || '')}
            value={designer || undefined}
          />
        </Col>
        <Col>
          <Button type="primary" onClick={exportCSV} disabled={!rows.length}>Export CSV</Button>
        </Col>
      </Row>
      <Card>
        <Table rowKey={(r, i) => `${r.Order}-${i}`} columns={columns} dataSource={rows} pagination={{ pageSize: 20 }} />
      </Card>
    </div>
  )
}
