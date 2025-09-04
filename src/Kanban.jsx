import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Card, Typography } from 'antd'

const { Title } = Typography

const initialData = {
  todo: ['Task 1', 'Task 2'],
  inprogress: ['Task 3'],
  done: ['Task 4'],
}

export default function Kanban() {
  const [columns, setColumns] = useState(initialData)

  const onDragEnd = (result) => {
    const { source, destination } = result
    if (!destination) return

    const sourceCol = source.droppableId
    const destCol = destination.droppableId
    const sourceItems = Array.from(columns[sourceCol])
    const destItems = Array.from(columns[destCol])
    const [removed] = sourceItems.splice(source.index, 1)

    if (sourceCol === destCol) {
      sourceItems.splice(destination.index, 0, removed)
      setColumns({ ...columns, [sourceCol]: sourceItems })
    } else {
      destItems.splice(destination.index, 0, removed)
      setColumns({
        ...columns,
        [sourceCol]: sourceItems,
        [destCol]: destItems,
      })
    }
  }

  return (
    <div className="container py-4">
      <Title level={2} className="text-center mb-4">Kanban Board</Title>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="row g-3">
          {Object.entries(columns).map(([colId, tasks]) => (
            <div className="col-md-4" key={colId}>
              <Card title={colId.toUpperCase()} bordered className="h-100">
                <Droppable droppableId={colId}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{ minHeight: 200 }}
                    >
                      {tasks.map((task, index) => (
                        <Draggable key={task} draggableId={task} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-2 mb-2 bg-white border rounded ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                            >
                              {task}
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
