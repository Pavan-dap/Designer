import api from './client'

export const STATUSES = ['Design', 'Cutting', 'Stitching', 'Final Product']

export const DesignersAPI = {
  list: () => api.get('/designers').then((r) => r.data),
}

export const OrdersAPI = {
  list: (params = {}) => api.get('/orders', { params }).then((r) => r.data),
  get: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  create: (customerId, payload) => api.post(`/customers/${customerId}/orders`, payload).then((r) => r.data),
  assignDesigner: (id, assignedDesigner) => api.patch(`/orders/${id}`, { assignedDesigner }).then((r) => r.data),
}

export const ItemsAPI = {
  updateStatus: (id, status) => api.patch(`/items/${id}`, { status }).then((r) => r.data),
  assignTailor: (id, tailor) => api.patch(`/items/${id}`, { tailor }).then((r) => r.data),
}

export const UsersAPI = {
  list: () => api.get('/Users_View/').then((r) => r.data),
  create: (payload) => api.post('/Users_View/', payload).then((r) => r.data),
}

export const CustomersAPI = {
  list: (params = {}) => api.get('/Customer_Master_View/', { params }).then((r) => r.data),
  get: (id) => api.get(`/Customer_Master_View/${id}`).then((r) => r.data),
  create: (payload) => api.post('/Customer_Master_View/', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/Customer_Master_View//${id}`, payload).then((r) => r.data),
}

export const MeasurementsAPI = {
  createBoy: (payload) => api.post('/Boys_Measurement_Sheet_View/', payload).then((r) => r.data),
  createGirl: (payload) => api.post('/Girls_Measurement_Sheet_View/', payload).then((r) => r.data),
}
