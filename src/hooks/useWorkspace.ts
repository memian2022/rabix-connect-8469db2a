import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// ── Types ──────────────────────────────────────
export interface WorkspaceTask {
  id: string
  text: string
  done: boolean
  priority: 'high' | 'medium' | 'low'
  sort_order: number
}

export interface WorkspaceNote {
  id: string
  title: string
  content: string
  color: 'yellow' | 'blue' | 'green' | 'red'
  pinned: boolean
  date: string
}

export interface WorkspaceLink {
  id: string
  title: string
  url: string
  category: 'tools' | 'research' | 'clients' | 'social' | 'other'
}

export interface WorkspaceFile {
  id: string
  name: string
  upload_date: string
  file_size: string
  file_type: 'pdf' | 'doc' | 'image' | 'spreadsheet' | 'other'
}

// ── Tasks ──────────────────────────────────────
export function useWorkspaceTasks() {
  return useQuery({
    queryKey: ['workspace_tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspace_tasks')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map((r: any): WorkspaceTask => ({
        id: r.id,
        text: r.text,
        done: r.done,
        priority: r.priority,
      }))
    },
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (task: Omit<WorkspaceTask, 'id'>) => {
      const { error } = await supabase.from('workspace_tasks').insert({
        text: task.text,
        done: task.done,
        priority: task.priority,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace_tasks'] }),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<WorkspaceTask> }) => {
      const { error } = await supabase.from('workspace_tasks').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace_tasks'] }),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workspace_tasks').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace_tasks'] }),
  })
}

// ── Notes ──────────────────────────────────────
export function useWorkspaceNotes() {
  return useQuery({
    queryKey: ['workspace_notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspace_notes')
        .select('*')
        .order('pinned', { ascending: false })
        .order('date', { ascending: false })
      if (error) throw error
      return (data ?? []).map((r: any): WorkspaceNote => ({
        id: r.id,
        title: r.title,
        content: r.content,
        color: r.color,
        pinned: r.pinned,
        date: r.date,
      }))
    },
  })
}

export function useCreateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (note: Omit<WorkspaceNote, 'id'>) => {
      const { error } = await supabase.from('workspace_notes').insert({
        title: note.title,
        content: note.content,
        color: note.color,
        pinned: note.pinned,
        date: note.date,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace_notes'] }),
  })
}

export function useUpdateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<WorkspaceNote> }) => {
      const { error } = await supabase.from('workspace_notes').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace_notes'] }),
  })
}

export function useDeleteNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workspace_notes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace_notes'] }),
  })
}

// ── Links ──────────────────────────────────────
export function useWorkspaceLinks() {
  return useQuery({
    queryKey: ['workspace_links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspace_links')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map((r: any): WorkspaceLink => ({
        id: r.id,
        title: r.title,
        url: r.url,
        category: r.category,
      }))
    },
  })
}

export function useCreateLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (link: Omit<WorkspaceLink, 'id'>) => {
      const { error } = await supabase.from('workspace_links').insert({
        title: link.title,
        url: link.url,
        category: link.category,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace_links'] }),
  })
}

export function useDeleteLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workspace_links').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace_links'] }),
  })
}

// ── Weekly Focus ───────────────────────────────
export function useWeeklyFocus() {
  return useQuery({
    queryKey: ['workspace_settings', 'weekly_focus'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspace_settings')
        .select('value')
        .eq('key', 'weekly_focus')
        .maybeSingle()
      if (error) throw error
      return data?.value ?? ''
    },
  })
}

export function useUpdateWeeklyFocus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (value: string) => {
      const { error } = await supabase
        .from('workspace_settings')
        .upsert({ key: 'weekly_focus', value }, { onConflict: 'key' })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workspace_settings'] }),
  })
}
