import React, { useEffect, useMemo, useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Card, Space, Collapse, Checkbox, Modal, Tag } from 'antd'

const { Panel } = Collapse

const STATUSES = ['Design', 'Cutting', 'Stitching', 'Final Product']

// Extended mock data with more orders, due dates, and priorities
const MOCK_ORDERS = [
  {
    id: 'ORD-1001',
    customerName: 'Sita Devi',
    familyId: 'FAM-1001',
    familyName: 'Devi Family',
    members: [
      {
        memberId: 'M-1', name: 'Sita', gender: 'Female', dresses: [
          { id: 'D-1', type: 'Lehenga', size: 'M', status: 'Design', dueDate: '2025-09-10', priority: 'High' },
          { id: 'D-2', type: 'Blouse', size: 'M', status: 'Cutting', dueDate: '2025-09-12', priority: 'Medium' },
        ]
      },
      {
        memberId: 'M-2', name: 'Gopal', gender: 'Male', dresses: [
          { id: 'D-3', type: 'Kurta', size: 'L', status: 'Stitching', dueDate: '2025-09-15', priority: 'Low' },
          { id: 'D-4', type: 'Pyjama', size: 'L', status: 'Final Product', dueDate: '2025-09-14', priority: 'High' },
        ]
      },
      {
        memberId: 'M-3', name: 'Radha', gender: 'Female', dresses: [
          { id: 'D-5', type: 'Saree', size: 'S', status: 'Design', dueDate: '2025-09-18', priority: 'Medium' },
        ]
      },
      {
        memberId: 'M-4', name: 'Ravi', gender: 'Male', dresses: [
          { id: 'D-6', type: 'Shirt', size: '40', status: 'Cutting', dueDate: '2025-09-20', priority: 'High' },
        ]
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
        memberId: 'M-5', name: 'Ravi', gender: 'Male', dresses: [
          { id: 'D-7', type: 'Shirt', size: '42', status: 'Design', dueDate: '2025-09-11', priority: 'Medium' },
          { id: 'D-8', type: 'Pant', size: '36', status: 'Cutting', dueDate: '2025-09-13', priority: 'High' },
        ]
      },
      {
        memberId: 'M-6', name: 'Lakshmi', gender: 'Female', dresses: [
          { id: 'D-9', type: 'Saree Blouse', size: 'S', status: 'Stitching', dueDate: '2025-09-16', priority: 'Low' },
        ]
      },
      {
        memberId: 'M-7', name: 'Anil', gender: 'Male', dresses: [
          { id: 'D-10', type: 'Kurta', size: 'L', status: 'Final Product', dueDate: '2025-09-17', priority: 'High' },
        ]
      },
      {
        memberId: 'M-8', name: 'Sunita', gender: 'Female', dresses: [
          { id: 'D-11', type: 'Gown', size: 'M', status: 'Cutting', dueDate: '2025-09-19', priority: 'Medium' },
        ]
      },
    ],
  },
  {
    id: 'ORD-1003',
    customerName: 'Anita Sharma',
    familyId: 'FAM-1003',
    familyName: 'Sharma Family',
    members: [
      {
        memberId: 'M-9', name: 'Anita', gender: 'Female', dresses: [
          { id: 'D-12', type: 'Gown', size: 'M', status: 'Cutting', dueDate: '2025-09-18', priority: 'High' },
        ]
      },
      {
        memberId: 'M-10', name: 'Karan', gender: 'Male', dresses: [
          { id: 'D-13', type: 'Suit', size: '42', status: 'Stitching', dueDate: '2025-09-22', priority: 'Medium' },
        ]
      },
      {
        memberId: 'M-11', name: 'Maya', gender: 'Female', dresses: [
          { id: 'D-14', type: 'Lehenga', size: 'S', status: 'Final Product', dueDate: '2025-09-25', priority: 'High' },
        ]
      },
    ],
  },
  {
    id: 'ORD-1004',
    customerName: 'Vikram Singh',
    familyId: 'FAM-1004',
    familyName: 'Singh Family',
    members: [
      {
        memberId: 'M-12', name: 'Vikram', gender: 'Male', dresses: [
          { id: 'D-15', type: 'Sherwani', size: '44', status: 'Design', dueDate: '2025-09-12', priority: 'High' },
        ]
      },
      {
        memberId: 'M-13', name: 'Priya', gender: 'Female', dresses: [
          { id: 'D-16', type: 'Gown', size: 'M', status: 'Cutting', dueDate: '2025-09-14', priority: 'Medium' },
        ]
      },
      {
        memberId: 'M-14', name: 'Rohit', gender: 'Male', dresses: [
          { id: 'D-17', type: 'Kurta', size: 'L', status: 'Stitching', dueDate: '2025-09-16', priority: 'Low' },
        ]
      },
    ],
  },
  {
    id: 'ORD-1005',
    customerName: 'Sanjana Mehta',
    familyId: 'FAM-1005',
    familyName: 'Mehta Family',
    members: [
      {
        memberId: 'M-15', name: 'Sanjana', gender: 'Female', dresses: [
          { id: 'D-18', type: 'Saree', size: 'S', status: 'Design', dueDate: '2025-09-10', priority: 'Medium' },
        ]
      },
      {
        memberId: 'M-16', name: 'Arjun', gender: 'Male', dresses: [
          { id: 'D-19', type: 'Shirt', size: '40', status: 'Cutting', dueDate: '2025-09-12', priority: 'High' },
        ]
      },
      {
        memberId: 'M-17', name: 'Meera', gender: 'Female', dresses: [
          { id: 'D-20', type: 'Blouse', size: 'M', status: 'Stitching', dueDate: '2025-09-15', priority: 'Low' },
        ]
      },
      {
        memberId: 'M-18', name: 'Rohan', gender: 'Male', dresses: [
          { id: 'D-21', type: 'Pant', size: '34', status: 'Final Product', dueDate: '2025-09-18', priority: 'High' },
        ]
      },
    ],
  },
  {
    id: 'ORD-1006',
    customerName: 'Rajesh Khanna',
    familyId: 'FAM-1006',
    familyName: 'Khanna Family',
    members: [
      {
        memberId: 'M-19', name: 'Rajesh', gender: 'Male', dresses: [
          { id: 'D-22', type: 'Suit', size: '44', status: 'Design', dueDate: '2025-09-11', priority: 'High' },
        ]
      },
      {
        memberId: 'M-20', name: 'Simran', gender: 'Female', dresses: [
          { id: 'D-23', type: 'Lehenga', size: 'M', status: 'Cutting', dueDate: '2025-09-14', priority: 'Medium' },
        ]
      },
      {
        memberId: 'M-21', name: 'Kunal', gender: 'Male', dresses: [
          { id: 'D-24', type: 'Kurta', size: 'L', status: 'Stitching', dueDate: '2025-09-17', priority: 'Low' },
        ]
      },
      {
        memberId: 'M-22', name: 'Anjali', gender: 'Female', dresses: [
          { id: 'D-25', type: 'Gown', size: 'M', status: 'Final Product', dueDate: '2025-09-19', priority: 'High' },
        ]
      },
    ],
  },
  {
    id: 'ORD-1007',
    customerName: 'Deepak Joshi',
    familyId: 'FAM-1007',
    familyName: 'Joshi Family',
    members: [
      {
        memberId: 'M-23', name: 'Deepak', gender: 'Male', dresses: [
          { id: 'D-26', type: 'Sherwani', size: '46', status: 'Design', dueDate: '2025-09-13', priority: 'Medium' },
        ]
      },
      {
        memberId: 'M-24', name: 'Neha', gender: 'Female', dresses: [
          { id: 'D-27', type: 'Saree', size: 'S', status: 'Cutting', dueDate: '2025-09-15', priority: 'High' },
        ]
      },
      {
        memberId: 'M-25', name: 'Ritesh', gender: 'Male', dresses: [
          { id: 'D-28', type: 'Kurta', size: 'L', status: 'Stitching', dueDate: '2025-09-18', priority: 'Low' },
        ]
      },
      {
        memberId: 'M-26', name: 'Pooja', gender: 'Female', dresses: [
          { id: 'D-29', type: 'Gown', size: 'M', status: 'Final Product', dueDate: '2025-09-20', priority: 'Medium' },
        ]
      },
    ],
  },
  {
    id: 'ORD-1008',
    customerName: 'Amitabh Bachchan',
    familyId: 'FAM-1008',
    familyName: 'Bachchan Family',
    members: [
      {
        memberId: 'M-27', name: 'Amitabh', gender: 'Male', dresses: [
          { id: 'D-30', type: 'Suit', size: '46', status: 'Design', dueDate: '2025-09-12', priority: 'High' },
        ]
      },
      {
        memberId: 'M-28', name: 'Jaya', gender: 'Female', dresses: [
          { id: 'D-31', type: 'Saree', size: 'M', status: 'Cutting', dueDate: '2025-09-15', priority: 'Medium' },
        ]
      },
    ],
  },
  {
    id: 'ORD-1009',
    customerName: 'Kiran Rao',
    familyId: 'FAM-1009',
    familyName: 'Rao Family',
    members: [
      {
        memberId: 'M-29', name: 'Kiran', gender: 'Female', dresses: [
          { id: 'D-32', type: 'Gown', size: 'M', status: 'Design', dueDate: '2025-09-11', priority: 'Medium' },
        ]
      },
      {
        memberId: 'M-30', name: 'Rakesh', gender: 'Male', dresses: [
          { id: 'D-33', type: 'Sherwani', size: '44', status: 'Cutting', dueDate: '2025-09-14', priority: 'High' },
        ]
      },
      {
        memberId: 'M-31', name: 'Naina', gender: 'Female', dresses: [
          { id: 'D-34', type: 'Lehenga', size: 'S', status: 'Stitching', dueDate: '2025-09-18', priority: 'Low' },
        ]
      },
    ],
  },
  {
    id: 'ORD-1010',
    customerName: 'Vivek Oberoi',
    familyId: 'FAM-1010',
    familyName: 'Oberoi Family',
    members: [
      {
        memberId: 'M-32', name: 'Vivek', gender: 'Male', dresses: [
          { id: 'D-35', type: 'Suit', size: '44', status: 'Design', dueDate: '2025-09-13', priority: 'High' },
        ]
      },
      {
        memberId: 'M-33', name: 'Priyanka', gender: 'Female', dresses: [
          { id: 'D-36', type: 'Gown', size: 'M', status: 'Cutting', dueDate: '2025-09-16', priority: 'Medium' },
        ]
      },
      {
        memberId: 'M-34', name: 'Rohan', gender: 'Male', dresses: [
          { id: 'D-37', type: 'Kurta', size: 'L', status: 'Stitching', dueDate: '2025-09-19', priority: 'Low' },
        ]
      },
      {
        memberId: 'M-35', name: 'Ananya', gender: 'Female', dresses: [
          { id: 'D-38', type: 'Lehenga', size: 'S', status: 'Final Product', dueDate: '2025-09-21', priority: 'High' },
        ]
      },
    ],
  },
];

export default function Kanban() {
  const [orders, setOrders] = useState([])
  const [movePrompt, setMovePrompt] = useState({ open: false, orderId: null, memberId: null, fromStatus: null, toStatus: null, dressIds: [] })

  useEffect(() => {
    setOrders(MOCK_ORDERS)
  }, [])

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

  const priorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'red'
      case 'Medium': return 'orange'
      case 'Low': return 'green'
      default: return 'blue'
    }
  }

  return (
    <Card size='small' title="Kanban Board" style={{ textAlign: 'center', fontSize: '20px', minHeight: '87vh' }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="row g-3">
          {STATUSES.map((status) => (
            <div className="col-xl-3 col-lg-3 col-md-6" key={status}>
              <Card size='small' title={status} style={{ minHeight: '79vh', }}>
                <Droppable droppableId={status}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="kanban-column">
                      {columns[status].map((group) => {
                        const { memberCount, dressCount } = countsForGroup(group)
                        const draggables = group.members.map((m) => ({ orderId: group.id, memberId: m.memberId, name: m.name, dresses: m.dresses, familyName: group.familyName, customerName: group.customerName }))
                        return (
                          <Collapse style={{ marginBottom: '5px' }} key={`${group.id}-${status}`} defaultActiveKey={[]}>
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
                                            <div>
                                              <Tag color={priorityColor(d.priority)}>{d.priority}</Tag>
                                              <Tag color="blue">{d.dueDate}</Tag>
                                            </div>
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
                {d.type} • Size {d.size} • <Tag color={priorityColor(d.priority)}>{d.priority}</Tag> • <Tag color="blue">{d.dueDate}</Tag>
              </Checkbox>
            ))
          })()}
        </Space>
      </Modal>
    </Card>
  )
}
