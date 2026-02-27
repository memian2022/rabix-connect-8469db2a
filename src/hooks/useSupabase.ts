import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Contact, Activity, Meeting, OutreachMessage, MessageTemplate } from '@/types/crm'

function mapContact(row: any): Contact {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    company: row.company,
    jobTitle: row.job_title ?? '',
    country: row.country ?? '',
    linkedin: row.linkedin ?? '',
    whatsapp: row.whatsapp ?? '',
    email: row.email ?? '',
    instagram: row.instagram ?? '',
    source: row.source ?? '',
    channel: row.channel,
    status: row.status,
    serviceInterest: row.service_interest,
    pipelineStage: row.pipeline_stage,
    lastContact: row.last_contact ?? '',
    followUpDate: row.follow_up_date ?? '',
    priority: row.priority,
    notes: row.notes ?? '',
    daysInStage: row.days_in_stage ?? 0,
    discoveryForm: row.discovery_form ?? { state: 'not-sent' },
    auditReports: row.audit_reports ?? [],
  }
}

function mapActivity(row: any): Activity {
  return {
    id: row.id,
    type: row.type,
    contactId: row.contact_id,
    contactName: row.contact_name,
    company: row.company,
    channel: row.channel,
    description: row.description,
    timestamp: row.timestamp,
    timeAgo: row.time_ago ?? '',
  }
}

function mapMeeting(row: any): Meeting {
  return {
    id: row.id,
    contactId: row.contact_id,
    contactName: row.contact_name,
    company: row.company,
    type: row.type,
    date: row.date,
    time: row.time,
    duration: row.duration,
    channel: row.channel,
    notes: row.notes ?? '',
  }
}

function mapOutreachMessage(row: any): OutreachMessage {
  return {
    id: row.id,
    contactId: row.contact_id,
    contactName: row.contact_name,
    company: row.company,
    channel: row.channel,
    dateSent: row.date_sent,
    messagePreview: row.message_preview ?? '',
    status: row.status,
    daysSinceSent: row.days_since_sent ?? 0,
  }
}

function mapTemplate(row: any): MessageTemplate {
  return {
    id: row.id,
    name: row.name,
    channel: row.channel,
    body: row.body,
    useCount: row.use_count ?? 0,
    lastUsed: row.last_used ?? '',
  }
}

export function useContacts() {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(mapContact)
    },
  })
}

export function useCreateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (contact: Omit<Contact, 'id'>) => {
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          first_name: contact.firstName,
          last_name: contact.lastName,
          company: contact.company,
          job_title: contact.jobTitle,
          country: contact.country,
          linkedin: contact.linkedin,
          whatsapp: contact.whatsapp,
          email: contact.email,
          instagram: contact.instagram,
          source: contact.source,
          channel: contact.channel,
          status: contact.status,
          service_interest: contact.serviceInterest,
          pipeline_stage: contact.pipelineStage,
          priority: contact.priority,
          notes: contact.notes,
          last_contact: contact.lastContact || null,
          follow_up_date: contact.followUpDate || null,
          discovery_form: contact.discoveryForm,
          audit_reports: contact.auditReports,
        })
        .select()
        .single()
      if (error) throw error
      return mapContact(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  })
}

export function useUpdateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Contact> }) => {
      const dbUpdates: any = {}
      if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName
      if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName
      if (updates.company !== undefined) dbUpdates.company = updates.company
      if (updates.jobTitle !== undefined) dbUpdates.job_title = updates.jobTitle
      if (updates.country !== undefined) dbUpdates.country = updates.country
      if (updates.linkedin !== undefined) dbUpdates.linkedin = updates.linkedin
      if (updates.whatsapp !== undefined) dbUpdates.whatsapp = updates.whatsapp
      if (updates.email !== undefined) dbUpdates.email = updates.email
      if (updates.instagram !== undefined) dbUpdates.instagram = updates.instagram
      if (updates.channel !== undefined) dbUpdates.channel = updates.channel
      if (updates.status !== undefined) dbUpdates.status = updates.status
      if (updates.serviceInterest !== undefined) dbUpdates.service_interest = updates.serviceInterest
      if (updates.pipelineStage !== undefined) dbUpdates.pipeline_stage = updates.pipelineStage
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes
      if (updates.lastContact !== undefined) dbUpdates.last_contact = updates.lastContact || null
      if (updates.followUpDate !== undefined) dbUpdates.follow_up_date = updates.followUpDate || null
      if (updates.discoveryForm !== undefined) dbUpdates.discovery_form = updates.discoveryForm
      if (updates.auditReports !== undefined) dbUpdates.audit_reports = updates.auditReports

      const { data, error } = await supabase
        .from('contacts')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return mapContact(data)
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}

export function useDeleteContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contacts').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  })
}

export function useActivities(limit = 20) {
  return useQuery({
    queryKey: ['activities', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit)
      if (error) throw error
      return (data ?? []).map(mapActivity)
    },
  })
}

export function useCreateActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (activity: Omit<Activity, 'id' | 'timeAgo'>) => {
      const { data, error } = await supabase
        .from('activities')
        .insert({
          type: activity.type,
          contact_id: activity.contactId,
          contact_name: activity.contactName,
          company: activity.company,
          channel: activity.channel,
          description: activity.description,
          timestamp: activity.timestamp,
        })
        .select()
        .single()
      if (error) throw error
      return mapActivity(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  })
}

export function useMeetings() {
  return useQuery({
    queryKey: ['meetings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('date', { ascending: true })
      if (error) throw error
      return (data ?? []).map(mapMeeting)
    },
  })
}

export function useCreateMeeting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (meeting: Omit<Meeting, 'id'>) => {
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          contact_id: meeting.contactId,
          contact_name: meeting.contactName,
          company: meeting.company,
          type: meeting.type,
          date: meeting.date,
          time: meeting.time,
          duration: meeting.duration,
          channel: meeting.channel,
          notes: meeting.notes,
        })
        .select()
        .single()
      if (error) throw error
      return mapMeeting(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meetings'] }),
  })
}

export function useOutreachMessages() {
  return useQuery({
    queryKey: ['outreach_messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outreach_messages')
        .select('*')
        .order('date_sent', { ascending: false })
      if (error) throw error
      return (data ?? []).map(mapOutreachMessage)
    },
  })
}

export function useMessageTemplates() {
  return useQuery({
    queryKey: ['message_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('is_active', true)
        .order('use_count', { ascending: false })
      if (error) throw error
      return (data ?? []).map(mapTemplate)
    },
  })
}

export function usePipelineCounts() {
  return useQuery({
    queryKey: ['pipeline_counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('pipeline_stage')
      if (error) throw error
      const counts: Record<string, number> = {}
      ;(data ?? []).forEach((row) => {
        counts[row.pipeline_stage] = (counts[row.pipeline_stage] ?? 0) + 1
      })
      return counts
    },
  })
}
