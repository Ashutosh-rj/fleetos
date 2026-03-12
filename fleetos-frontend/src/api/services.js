import api from './client'

// ─── Auth ────────────────────────────────────────────────────────────
export const authApi = {
  login:         data => api.post('/auth/login', data).then(r => r.data.data),
  register:      data => api.post('/auth/register', data).then(r => r.data.data),
  sendOtp:       data => api.post('/auth/send-otp', data),
  verifyOtp:     data => api.post('/auth/verify-otp', data),
  resetPassword: data => api.post('/auth/reset-password', data),
}

// ─── Vehicles ────────────────────────────────────────────────────────
export const vehicleApi = {
  list:       params => api.get('/vehicles', { params }).then(r => r.data.data),
  getById:    id     => api.get(`/vehicles/${id}`).then(r => r.data.data),
  getByUuid:  uuid   => api.get(`/vehicles/uuid/${uuid}`).then(r => r.data.data),
  available:  ()     => api.get('/vehicles/available').then(r => r.data.data),
  create:     data   => api.post('/vehicles', data).then(r => r.data.data),
  update:     (id,d) => api.put(`/vehicles/${id}`, d).then(r => r.data.data),
  delete:     id     => api.delete(`/vehicles/${id}`),
  regenQr:    id     => api.post(`/vehicles/${id}/qr`).then(r => r.data.data),
  exportExcel:()     => api.get('/vehicles/export', { responseType: 'blob' }),
}

// ─── Trips ───────────────────────────────────────────────────────────
export const tripApi = {
  list:    params => api.get('/trips', { params }).then(r => r.data.data),
  getById: id     => api.get(`/trips/${id}`).then(r => r.data.data),
  active:  ()     => api.get('/trips/active').then(r => r.data.data),
  start:   data   => api.post('/trips/start', data).then(r => r.data.data),
  end:     (id,d) => api.post(`/trips/${id}/end`, d).then(r => r.data.data),
}

// ─── Users ───────────────────────────────────────────────────────────
export const userApi = {
  list:    params => api.get('/users', { params }).then(r => r.data.data),
  me:      ()     => api.get('/users/me').then(r => r.data.data),
  getById: id     => api.get(`/users/${id}`).then(r => r.data.data),
  create:  data   => api.post('/users', data).then(r => r.data.data),
  update:  (id,d) => api.put(`/users/${id}`, d).then(r => r.data.data),
  delete:  id     => api.delete(`/users/${id}`),
}

// ─── Dashboard ───────────────────────────────────────────────────────
export const dashboardApi = {
  stats:    () => api.get('/dashboard/stats').then(r => r.data.data),
  activity: () => api.get('/dashboard/activity').then(r => r.data.data),
}

// ─── Reports ─────────────────────────────────────────────────────────
export const reportApi = {
  downloadPdf:   () => api.get('/reports/pdf',     { responseType: 'blob' }),
  downloadExcel: () => api.get('/reports/summary', { responseType: 'blob' }),
}

// ─── Notifications ───────────────────────────────────────────────────
export const notifApi = {
  list:       params => api.get('/notifications', { params }).then(r => r.data.data),
  count:      ()     => api.get('/notifications/count').then(r => r.data.data),
  markOne:    id     => api.patch(`/notifications/${id}/read`),
  markAll:    ()     => api.patch('/notifications/read-all'),
}
