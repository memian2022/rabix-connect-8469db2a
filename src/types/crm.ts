export type Channel = "whatsapp" | "linkedin" | "email" | "instagram";
export type ContactStatus = "prospect" | "lead" | "client" | "lost";
export type ServiceInterest = "audit" | "training" | "custom" | "tbd";
export type Priority = "high" | "medium" | "low";
export type PipelineStage = "outreach-sent" | "replied" | "call-booked" | "discovery-done" | "proposal-sent" | "closed-won" | "closed-lost";
export type MeetingType = "discovery" | "follow-up" | "proposal" | "demo" | "other";
export type OutreachStatus = "sent" | "delivered" | "replied" | "no-response";

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  country: string;
  linkedin: string;
  whatsapp: string;
  email: string;
  instagram: string;
  source: string;
  channel: Channel;
  status: ContactStatus;
  serviceInterest: ServiceInterest;
  pipelineStage: PipelineStage;
  lastContact: string;
  followUpDate: string;
  priority: Priority;
  notes: string;
  daysInStage: number;
  discoveryForm: DiscoveryFormStatus;
  auditReports: AuditReport[];
}

export type DiscoveryFormState = "not-sent" | "sent" | "completed";

export interface DiscoveryFormStatus {
  state: DiscoveryFormState;
  sentDate?: string;
  completedDate?: string;
  responses?: {
    companySize: string;
    currentTools: string;
    painPoints: string;
    monthlyBudget: string;
  };
}

export interface AuditReport {
  id: string;
  name: string;
  uploadDate: string;
  fileSize: string;
  fileType: "pdf" | "docx" | "doc";
  url?: string;
}

export interface Deal extends Contact {}

export interface Activity {
  id: string;
  type: "outreach" | "reply" | "call-booked" | "proposal" | "note" | "closed";
  contactId: string;
  contactName: string;
  company: string;
  channel: Channel;
  description: string;
  timestamp: string;
  timeAgo: string;
}

export interface Meeting {
  id: string;
  contactId: string;
  contactName: string;
  company: string;
  type: MeetingType;
  date: string;
  time: string;
  duration: number;
  channel: Channel;
  notes: string;
}

export interface OutreachMessage {
  id: string;
  contactId: string;
  contactName: string;
  company: string;
  channel: Channel;
  dateSent: string;
  messagePreview: string;
  status: OutreachStatus;
  daysSinceSent: number;
}

export interface MessageTemplate {
  id: string;
  name: string;
  channel: Channel;
  body: string;
  useCount: number;
  lastUsed: string;
}
