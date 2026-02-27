import { Channel } from "@/types/crm";
import { Linkedin, Mail, MessageCircle, Instagram } from "lucide-react";

export function getChannelIcon(channel: Channel) {
  switch (channel) {
    case "whatsapp": return MessageCircle;
    case "linkedin": return Linkedin;
    case "email": return Mail;
    case "instagram": return Instagram;
  }
}

export function getChannelColorClass(channel: Channel) {
  switch (channel) {
    case "whatsapp": return "text-channel-whatsapp";
    case "linkedin": return "text-channel-linkedin";
    case "email": return "text-channel-email";
    case "instagram": return "text-channel-instagram";
  }
}

export function getChannelBgClass(channel: Channel) {
  switch (channel) {
    case "whatsapp": return "bg-channel-whatsapp";
    case "linkedin": return "bg-channel-linkedin";
    case "email": return "bg-channel-email";
    case "instagram": return "bg-channel-instagram";
  }
}

export function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    prospect: "Prospect",
    lead: "Lead",
    client: "Client",
    lost: "Lost",
  };
  return map[status] || status;
}

export function getServiceLabel(service: string) {
  const map: Record<string, string> = {
    audit: "AI Audit",
    training: "AI Training",
    custom: "Custom Systems",
    tbd: "TBD",
  };
  return map[service] || service;
}

export function getStageLabel(stage: string) {
  const map: Record<string, string> = {
    "outreach-sent": "Outreach Sent",
    "replied": "Replied",
    "call-booked": "Call Booked",
    "discovery-done": "Discovery Done",
    "proposal-sent": "Proposal Sent",
    "closed-won": "Closed Won",
    "closed-lost": "Closed Lost",
  };
  return map[stage] || stage;
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
