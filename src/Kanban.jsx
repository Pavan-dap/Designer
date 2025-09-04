import React, { useEffect, useMemo, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Card, Typography, Select, Space, Tag, Divider, Spin, message } from 'antd'
import api from './api/client'
import { useAuth } from './context/AuthContext.jsx'

const { Title, Text } = Typography

const STATUSES = ['Design', 'Cutting', 'Stitching', 'Final Product']

export default function Kanban() {
  const { user, signOut } = useAuth()
  const [designers, setDesigners] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [designerFilter, setDesignerFilter] = useState('')

  const activeDesigner = useMemo(() => {
    if (user?.role === 'Designer') return user.user_id
    return designerFilter || ''
  }, [user, designerFilter])

  const columns = useMemo(() => {
    const col = Object.fromEntries(STATUSES.map((s) => [s, []]))
    for (const order of orders) {
      for (const item of order.items) {
        const card = {
          id: item.id,
          title: `${item.name} x${item.qty}`,
          customer: order.customerName,
          size: item.size,
          tailor: item.tailor,
          orderId: order.id,
          familyId: order.familyId,
        }
        if (col[item.status]) col[item.status].push(card)
      }
    }
    return col
  }, [orders])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [designersRes, ordersRes] = await Promise.all([
        api.get('/designers'),
        api.get('/orders', { params: activeDesigner ? { designer: activeDesigner } : {} }),
      ])
      setDesigners(designersRes.data)
      setOrders(ordersRes.data)
    } catch (e) {
      message.error('Failed to load data')
      if (e?.response?.status === 401) signOut()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDesigner])

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    const sourceCol = source.droppableId
    const destCol = destination.droppableId
    if (sourceCol === destCol) return
    try {
      await api.patch(`/items/${draggableId}`, { status: destCol })
      await loadAll()
    } catch (e) {
      message.error('Update failed')
    }
  }

  const assignTailor = async (itemId, tailor) => {
    try {
      await api.patch(`/items/${itemId}`, { tailor })
      await loadAll()
    } catch (e) {
      message.error('Failed to assign tailor')
    }
  }

  const header = (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <Space size={8} wrap>
          <Title level={3} className="mb-0">Kanban Board</Title>
          <Tag color="blue">{user?.role}</Tag>
          <Text type="secondary">Signed in as {user?.name}</Text>
        </Space>
        <Space size={12} wrap>
          {user?.role === 'Head' && (
            <Select
              className="designer-filter"
              allowClear
              placeholder="Filter by Designer"
              options={designers.map((d) => ({ label: d.name, value: d.user_id }))}
              onChange={(v) => setDesignerFilter(v || '')}
              value={designerFilter || undefined}
            />
          )}
        </Space>
      </div>
      <Divider className="my-3" />
    </div>
  )

  if (loading) {
    return (
      <div className="container py-5 text-center">
        {header}
        <Spin />
      </div>
    )
  }

  return (
    <div className="container py-3">
      {header}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="row g-3">
          {STATUSES.map((status) => (
            <div className="col-xl-3 col-lg-3 col-md-6" key={status}>
              <Card
                title={status}
                variant='outlined'
                className="h-100">
                <Droppable droppableId={status}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="kanban-column">
                      {columns[status].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(providedDraggable, snapshot) => (
                            <div
                              ref={providedDraggable.innerRef}
                              {...providedDraggable.draggableProps}
                              {...providedDraggable.dragHandleProps}
                              className={`kanban-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
                            >
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <div className="fw-semibold">{task.title}</div>
                                  <div className="text-muted small">{task.customer} • Size: {task.size}</div>
                                  {task.tailor ? (
                                    <div className="small mt-1">Tailor: <span className="fw-medium">{task.tailor}</span></div>
                                  ) : (
                                    <div className="small mt-1 text-muted">No tailor assigned</div>
                                  )}
                                </div>
                              </div>
                              {(user?.role === 'Designer' || user?.role === 'Head') && (
                                <div className="mt-2">
                                  <Select
                                    className="tailor-select"
                                    allowClear
                                    placeholder="Assign Tailor"
                                    value={task.tailor || undefined}
                                    onChange={(v) => assignTailor(task.id, v || null)}
                                    options={[
                                      { label: 'Ravi', value: 'Ravi' },
                                      { label: 'Anil', value: 'Anil' },
                                      { label: 'Mahesh', value: 'Mahesh' },
                                      { label: 'Lakshmi', value: 'Lakshmi' },
                                    ]}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
