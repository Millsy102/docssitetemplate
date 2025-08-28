import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export interface Plugin {
  id: string
  name: string
  description: string
  version: string
  author: string
  category: string
  tags: string[]
  rating: number
  downloads: number
  price: number
  isInstalled: boolean
  isEnabled: boolean
  dependencies: string[]
  requirements: {
    nodeVersion: string
    memory: string
    disk: string
  }
  screenshots: string[]
  changelog: string
  lastUpdated: string
  size: string
  license: string
}

export interface PluginInstallRequest {
  pluginId: string
  version?: string
  options?: {
    autoUpdate: boolean
    backup: boolean
  }
}

export interface PluginReview {
  id: string
  pluginId: string
  userId: string
  rating: number
  title: string
  content: string
  pros: string[]
  cons: string[]
  helpful: number
  createdAt: string
  updatedAt: string
  verified: boolean
}

// API Functions
const API_BASE = '/api/plugins'

export const pluginApi = {
  // Get all plugins
  getPlugins: async (filters?: {
    category?: string
    search?: string
    rating?: number
    price?: 'free' | 'paid' | 'all'
    sortBy?: 'name' | 'rating' | 'downloads' | 'updated'
    sortOrder?: 'asc' | 'desc'
  }): Promise<Plugin[]> => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString())
      })
    }
    
    const response = await fetch(`${API_BASE}?${params}`)
    if (!response.ok) throw new Error('Failed to fetch plugins')
    return response.json()
  },

  // Get plugin details
  getPlugin: async (pluginId: string): Promise<Plugin> => {
    const response = await fetch(`${API_BASE}/${pluginId}`)
    if (!response.ok) throw new Error('Failed to fetch plugin')
    return response.json()
  },

  // Install plugin
  installPlugin: async (request: PluginInstallRequest): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE}/install`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    if (!response.ok) throw new Error('Failed to install plugin')
    return response.json()
  },

  // Uninstall plugin
  uninstallPlugin: async (pluginId: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE}/${pluginId}/uninstall`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to uninstall plugin')
    return response.json()
  },

  // Enable/disable plugin
  togglePlugin: async (pluginId: string, enabled: boolean): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE}/${pluginId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    })
    if (!response.ok) throw new Error('Failed to toggle plugin')
    return response.json()
  },

  // Get plugin reviews
  getReviews: async (pluginId: string): Promise<PluginReview[]> => {
    const response = await fetch(`${API_BASE}/${pluginId}/reviews`)
    if (!response.ok) throw new Error('Failed to fetch reviews')
    return response.json()
  },

  // Add review
  addReview: async (pluginId: string, review: Omit<PluginReview, 'id' | 'pluginId' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<PluginReview> => {
    const response = await fetch(`${API_BASE}/${pluginId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    })
    if (!response.ok) throw new Error('Failed to add review')
    return response.json()
  },

  // Rate plugin
  ratePlugin: async (pluginId: string, rating: number): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE}/${pluginId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    })
    if (!response.ok) throw new Error('Failed to rate plugin')
    return response.json()
  },

  // Get installed plugins
  getInstalledPlugins: async (): Promise<Plugin[]> => {
    const response = await fetch(`${API_BASE}/installed`)
    if (!response.ok) throw new Error('Failed to fetch installed plugins')
    return response.json()
  },

  // Update plugin
  updatePlugin: async (pluginId: string, version?: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE}/${pluginId}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version }),
    })
    if (!response.ok) throw new Error('Failed to update plugin')
    return response.json()
  },
}

// React Query Hooks
export const usePlugins = (filters?: Parameters<typeof pluginApi.getPlugins>[0]) => {
  return useQuery({
    queryKey: ['plugins', filters],
    queryFn: () => pluginApi.getPlugins(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const usePlugin = (pluginId: string) => {
  return useQuery({
    queryKey: ['plugin', pluginId],
    queryFn: () => pluginApi.getPlugin(pluginId),
    enabled: !!pluginId,
  })
}

export const useInstalledPlugins = () => {
  return useQuery({
    queryKey: ['plugins', 'installed'],
    queryFn: () => pluginApi.getInstalledPlugins(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const usePluginReviews = (pluginId: string) => {
  return useQuery({
    queryKey: ['plugin', pluginId, 'reviews'],
    queryFn: () => pluginApi.getReviews(pluginId),
    enabled: !!pluginId,
  })
}

// Mutations
export const useInstallPlugin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: pluginApi.installPlugin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins', 'installed'] })
      queryClient.invalidateQueries({ queryKey: ['plugins'] })
    },
  })
}

export const useUninstallPlugin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: pluginApi.uninstallPlugin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins', 'installed'] })
      queryClient.invalidateQueries({ queryKey: ['plugins'] })
    },
  })
}

export const useTogglePlugin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ pluginId, enabled }: { pluginId: string; enabled: boolean }) =>
      pluginApi.togglePlugin(pluginId, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins', 'installed'] })
    },
  })
}

export const useAddReview = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ pluginId, review }: { pluginId: string; review: Parameters<typeof pluginApi.addReview>[1] }) =>
      pluginApi.addReview(pluginId, review),
    onSuccess: (_, { pluginId }) => {
      queryClient.invalidateQueries({ queryKey: ['plugin', pluginId, 'reviews'] })
      queryClient.invalidateQueries({ queryKey: ['plugin', pluginId] })
    },
  })
}

export const useRatePlugin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: pluginApi.ratePlugin,
    onSuccess: (_, pluginId) => {
      queryClient.invalidateQueries({ queryKey: ['plugin', pluginId] })
      queryClient.invalidateQueries({ queryKey: ['plugins'] })
    },
  })
}

export const useUpdatePlugin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ pluginId, version }: { pluginId: string; version?: string }) =>
      pluginApi.updatePlugin(pluginId, version),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins', 'installed'] })
      queryClient.invalidateQueries({ queryKey: ['plugins'] })
    },
  })
}
