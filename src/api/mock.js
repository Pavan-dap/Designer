import MockAdapter from 'axios-mock-adapter'
import api from './client'

// Attach mock adapter only in dev to keep production ready for real backend
const shouldMock = import.meta.env.DEV

const STATUSES = ['Design', 'Cutting', 'Stitching', 'Final Product']

const uid = () => Math.random().toString(36).slice(2, 9)

const db = {
  users: [
    { id: 'u1', username: 'head', password: 'password', role: 'Head', name: 'Studio Head' },
    { id: 'u2', username: 'designer', password: 'password', role: 'Designer', name: 'Lead Designer' },
  ],
  designers: [
    { id: 'u2', username: 'designer', name: 'Lead Designer' },
    { id: 'u3', username: 'designer2', name: 'Assistant Designer' },
  ],
  orders: [
    {
      id: 'o1',
      customerId: 'c1',
      customerName: 'Ananya Rao',
      familyId: 'f1',
      assignedDesigner: 'designer',
      items: [
        { id: 'i1', name: 'Lehenga', qty: 1, size: 'M', status: 'Design', tailor: null },
        { id: 'i2', name: 'Blouse', qty: 2, size: 'S', status: 'Cutting', tailor: 'Ravi' },
      ],
    },
    {
      id: 'o2',
      customerId: 'c2',
      customerName: 'Meera Iyer',
      familyId: 'f1',
      assignedDesigner: 'designer',
      items: [
        { id: 'i3', name: 'Saree Fall', qty: 1, size: '-', status: 'Stitching', tailor: 'Anil' },
        { id: 'i4', name: 'Petticoat', qty: 1, size: 'L', status: 'Design', tailor: null },
      ],
    },
    {
      id: 'o3',
      customerId: 'c3',
      customerName: 'Suhasini',
      familyId: 'f2',
      assignedDesigner: 'designer2',
      items: [
        { id: 'i5', name: 'Kurta', qty: 2, size: 'XL', status: 'Final Product', tailor: 'Mahesh' },
      ],
    },
  ],
}

function findItem(itemId) {
  for (const order of db.orders) {
    const item = order.items.find((it) => it.id === itemId)
    if (item) return { order, item }
  }
  return null
}

export function setupMock() {
  if (!shouldMock) return null
  const mock = new MockAdapter(api, { delayResponse: 300 })

  // Auth login
  mock.onPost('/auth/login').reply((config) => {
    try {
      const { username, password } = JSON.parse(config.data)
      const user = db.users.find((u) => u.username === username && u.password === password)
      if (!user) return [401, { message: 'Invalid credentials' }]
      const token = uid()
      return [200, { token, user: { id: user.id, name: user.name, role: user.role, username: user.username } }]
    } catch (e) {
      return [400, { message: 'Bad request' }]
    }
  })

  // Designers list
  mock.onGet('/designers').reply(200, db.designers)

  // Orders list (optionally filter by designer)
  mock.onGet(/\/orders.*/).reply((config) => {
    const url = new URL(config.url, 'http://local')
    const d = url.searchParams.get('designer')
    const data = d ? db.orders.filter((o) => o.assignedDesigner === d) : db.orders
    return [200, data]
  })

  // Update item status or assignment
  mock.onPatch(/\/items\/[A-Za-z0-9_-]+/).reply((config) => {
    const id = config.url.split('/').pop()
    const payload = JSON.parse(config.data || '{}')
    const found = findItem(id)
    if (!found) return [404, { message: 'Item not found' }]
    const { item } = found
    if (payload.status && STATUSES.includes(payload.status)) item.status = payload.status
    if (Object.prototype.hasOwnProperty.call(payload, 'tailor')) item.tailor = payload.tailor
    return [200, item]
  })

  // Reassign whole order to a designer
  mock.onPatch(/\/orders\/[A-Za-z0-9_-]+/).reply((config) => {
    const id = config.url.split('/').pop()
    const payload = JSON.parse(config.data || '{}')
    const order = db.orders.find((o) => o.id === id)
    if (!order) return [404, { message: 'Order not found' }]
    if (payload.assignedDesigner) order.assignedDesigner = payload.assignedDesigner
    return [200, order]
  })

  return mock
}

export { STATUSES }
