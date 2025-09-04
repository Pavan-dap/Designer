import React, { useEffect, useMemo, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Card, Typography, Select, Space, Tag, Divider, Spin, message, Collapse, Checkbox, Modal, Button } from 'antd'
import { useAuth } from './context/AuthContext.jsx'

const { Title, Text } = Typography
const { Panel } = Collapse

const STATUSES = ['Design', 'Cutting', 'Stitching', 'Final Product']

// Dummy mock data for orders -> families -> members -> dresses
const MOCK_ORDERS = [
  {
    id: 'ORD-1001',
    customerName: 'Sita Devi',
    familyId: 'FAM-1001',
    familyName: 'Devi Family',
    members: [
      {
        memberId: 'M-1',
        name: 'Sita',
        gender: 'Female',
        dresses: [
          { id: 'D-1', type: 'Lehenga', size: 'M', status: 'Design' },
          { id: 'D-2', type: 'Blouse', size: 'M', status: 'Design' },
        ],
      },
      {
        memberId: 'M-2',
        name: 'Gopal',
        gender: 'Male',
        dresses: [
          { id: 'D-3', type: 'Kurta', size: 'L', status: 'Design' },
          { id: 'D-4', type: 'Pyjama', size: 'L', status: 'Design' },
        ],
      },
    ],
  },
  {
    id: 'ORD-1002',
    customerName: 'Ravi Kumar',
    familyId: 'FAM-1002',
    familyName: 'Kumar Family',
    members: [
      {
        memberId: 'M-3',
        name: 'Ravi',
        gender: 'Male',
        dresses: [
          { id: 'D-5', type: 'Shirt', size: '40', status: 'Design' },
          { id: 'D-6', type: 'Pant', size: '34', status: 'Design' },
        ],
      },
      {
        memberId: 'M-4',
        name: 'Lakshmi',
        gender: 'Female',
        dresses: [
          { id: 'D-7', type: 'Saree Blouse', size: 'S', status: 'Design' },
        ],
      },
    ],
  },
]

export default function Kanban() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [movePrompt, setMovePrompt] = useState({ open: false, orderId: null, memberId: null, fromStatus: null, toStatus: null, dressIds: [] })

  useEffect(() => {
    setOrders(MOCK_ORDERS)
  }, [])

  // Build columns grouped by family, then members with dresses filtered by status
  const columns = useMemo(() => {
    const base = Object.fromEntries(STATUSES.map((s) => [s, []]))

    for (const order of orders) {
      const orderGroups = Object.fromEntries(STATUSES.map((s) => [s, { ...order, members: [] }]))

      for (const member of order.members) {
        for (const status of STATUSES) {
          const dressesInStatus = member.dresses.filter((d) => d.status === status)
          if (dressesInStatus.length) {
            orderGroups[status].members.push({ ...member, dresses: dressesInStatus })
          }
        }
      }

      for (const status of STATUSES) {
        if (orderGroups[status].members.length) {
          base[status].push(orderGroups[status])
        }
      }
    }

    return base
  }, [orders])

  const countsForGroup = (group) => {
    const memberCount = group.members.length
    const dressCount = group.members.reduce((acc, m) => acc + m.dresses.length, 0)
    return { memberCount, dressCount }
  }

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    const sourceCol = source.droppableId
    const destCol = destination.droppableId
    if (sourceCol === destCol) return

    // draggableId encoded as `${orderId}::${memberId}`
    const [orderId, memberId] = String(draggableId).split('::')
    const order = orders.find((o) => o.id === orderId)
    const member = order?.members.find((m) => m.memberId === memberId)
    if (!order || !member) return

    const availableDressIds = member.dresses.filter((d) => d.status === sourceCol).map((d) => d.id)
    if (availableDressIds.length === 0) return

    setMovePrompt({ open: true, orderId, memberId, fromStatus: sourceCol, toStatus: destCol, dressIds: availableDressIds })
  }

  const confirmMove = () => {
    const { orderId, memberId, fromStatus, toStatus, dressIds } = movePrompt
    if (!orderId || !memberId || !toStatus) return setMovePrompt({ open: false, orderId: null, memberId: null, fromStatus: null, toStatus: null, dressIds: [] })

    setOrders((prev) => prev.map((o) => {
      if (o.id !== orderId) return o
      return {
        ...o,
        members: o.members.map((m) => {
          if (m.memberId !== memberId) return m
          return {
            ...m,
            dresses: m.dresses.map((d) => (dressIds.includes(d.id) && d.status === fromStatus) ? { ...d, status: toStatus } : d),
          }
        }),
      }
    }))

    setMovePrompt({ open: false, orderId: null, memberId: null, fromStatus: null, toStatus: null, dressIds: [] })
  }

  const toggleDress = (id, checked) => {
    setMovePrompt((p) => ({ ...p, dressIds: checked ? Array.from(new Set([...p.dressIds, id])) : p.dressIds.filter((x) => x !== id) }))
  }

  const header = (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <Space size={8} wrap>
          <Title level={3} className="mb-0">Kanban Board</Title>
          <Tag color="blue">{user?.role}</Tag>
          <Text type="secondary">Signed in as {user?.name}</Text>
        </Space>
      </div>
      <Divider className="my-3" />
    </div>
  )

  return (
    <div className="container py-3">
      {header}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="row g-3">
          {STATUSES.map((status) => (
            <div className="col-xl-3 col-lg-3 col-md-6" key={status}>
              <Card title={status} variant='outlined' className="h-100">
                <Droppable droppableId={status}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="kanban-column">
                      {columns[status].map((group) => {
                        const { memberCount, dressCount } = countsForGroup(group)
                        // Flatten members to create stable drag list indices within this column
                        const draggables = group.members.map((m) => ({ orderId: group.id, memberId: m.memberId, name: m.name, dresses: m.dresses, familyName: group.familyName, customerName: group.customerName }))
                        return (
                          <Collapse key={`${group.id}-${status}`} bordered={false} defaultActiveKey={[]}>
                            <Panel header={`${group.familyName} • ${memberCount} members • ${dressCount} dresses`} key={`${group.id}-${status}-panel`}>
                              {draggables.map((m, idx) => (
                                <Draggable key={`${m.orderId}::${m.memberId}`} draggableId={`${m.orderId}::${m.memberId}`} index={idx}>
                                  {(providedDraggable, snapshot) => (
                                    <div
                                      ref={providedDraggable.innerRef}
                                      {...providedDraggable.draggableProps}
                                      {...providedDraggable.dragHandleProps}
                                      className={`kanban-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
                                    >
                                      <div className="fw-semibold">{m.name}</div>
                                      <div className="text-muted small">{m.familyName} • {m.customerName}</div>
                                      <div className="mt-2">
                                        {m.dresses.map((d) => (
                                          <div key={d.id} className="d-flex justify-content-between align-items-center small py-1 border-bottom">
                                            <div>{d.type}</div>
                                            <div className="text-muted">Size: {d.size}</div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            </Panel>
                          </Collapse>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card>
            </div>
          ))}
        </div>
      </DragDropContext>

      <Modal
        title={`Move dresses from ${movePrompt.fromStatus || ''} to ${movePrompt.toStatus || ''}`}
        open={movePrompt.open}
        onOk={confirmMove}
        onCancel={() => setMovePrompt({ open: false, orderId: null, memberId: null, fromStatus: null, toStatus: null, dressIds: [] })}
        okText="Move"
      >
        <div className="mb-2">Select dresses to move:</div>
        <Space direction="vertical" style={{ width: '100%' }}>
          {(() => {
            const order = orders.find((o) => o.id === movePrompt.orderId)
            const member = order?.members.find((m) => m.memberId === movePrompt.memberId)
            const dresses = (member?.dresses || []).filter((d) => d.status === movePrompt.fromStatus)
            return dresses.map((d) => (
              <Checkbox key={d.id} checked={movePrompt.dressIds.includes(d.id)} onChange={(e) => toggleDress(d.id, e.target.checked)}>
                {d.type} • Size {d.size}
              </Checkbox>
            ))
          })()}
        </Space>
      </Modal>
    </div>
  )
}
