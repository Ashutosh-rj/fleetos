import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  vehicleApi, tripApi, userApi,
  dashboardApi, notifApi
} from '../api/services'
import toast from 'react-hot-toast'

// ─── Vehicles ────────────────────────────────────────────────────────
export const useVehicles = (params) =>
  useQuery({ queryKey: ['vehicles', params], queryFn: () => vehicleApi.list(params) })

export const useVehicle = (id) =>
  useQuery({ queryKey: ['vehicle', id], queryFn: () => vehicleApi.getById(id), enabled: !!id })

export const useAvailableVehicles = () =>
  useQuery({ queryKey: ['vehicles', 'available'], queryFn: vehicleApi.available })

export const useCreateVehicle = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: vehicleApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles'] }); toast.success('Vehicle created') },
    onError: e => toast.error(e.response?.data?.message || 'Failed to create vehicle'),
  })
}

export const useUpdateVehicle = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => vehicleApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles'] }); toast.success('Vehicle updated') },
    onError: e => toast.error(e.response?.data?.message || 'Update failed'),
  })
}

export const useDeleteVehicle = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: vehicleApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles'] }); toast.success('Vehicle deleted') },
    onError: e => toast.error(e.response?.data?.message || 'Delete failed'),
  })
}

// ─── Trips ───────────────────────────────────────────────────────────
export const useTrips = (params) =>
  useQuery({ queryKey: ['trips', params], queryFn: () => tripApi.list(params) })

export const useTrip = (id) =>
  useQuery({ queryKey: ['trip', id], queryFn: () => tripApi.getById(id), enabled: !!id })

export const useActiveTrips = () =>
  useQuery({ queryKey: ['trips', 'active'], queryFn: tripApi.active, refetchInterval: 30000 })

export const useStartTrip = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tripApi.start,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] })
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success('Trip started')
    },
    onError: e => toast.error(e.response?.data?.message || 'Failed to start trip'),
  })
}

export const useEndTrip = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => tripApi.end(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] })
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success('Trip completed')
    },
    onError: e => toast.error(e.response?.data?.message || 'Failed to end trip'),
  })
}

// ─── Users ───────────────────────────────────────────────────────────
export const useUsers = (params) =>
  useQuery({ queryKey: ['users', params], queryFn: () => userApi.list(params) })

export const useMe = () =>
  useQuery({ queryKey: ['me'], queryFn: userApi.me })

export const useCreateUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: userApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User created') },
    onError: e => toast.error(e.response?.data?.message || 'Failed to create user'),
  })
}

export const useUpdateUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => userApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User updated') },
    onError: e => toast.error(e.response?.data?.message || 'Update failed'),
  })
}

export const useDeleteUser = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: userApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User deleted') },
    onError: e => toast.error(e.response?.data?.message || 'Delete failed'),
  })
}

// ─── Dashboard ───────────────────────────────────────────────────────
export const useDashboardStats = () =>
  useQuery({ queryKey: ['dashboard', 'stats'], queryFn: dashboardApi.stats, refetchInterval: 60000 })

export const useDashboardActivity = () =>
  useQuery({ queryKey: ['dashboard', 'activity'], queryFn: dashboardApi.activity })

// ─── Notifications ───────────────────────────────────────────────────
export const useNotifications = (params) =>
  useQuery({ queryKey: ['notifications', params], queryFn: () => notifApi.list(params) })

export const useNotifCount = () =>
  useQuery({ queryKey: ['notif-count'], queryFn: notifApi.count, refetchInterval: 15000 })

export const useMarkAllRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: notifApi.markAll,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}
