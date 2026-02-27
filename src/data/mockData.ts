export const pipelineStages = [
  { id: "outreach-sent", label: "Outreach Sent", color: "stage-outreach" },
  { id: "replied", label: "Replied", color: "stage-replied" },
  { id: "call-booked", label: "Call Booked", color: "stage-booked" },
  { id: "discovery-done", label: "Discovery Done", color: "stage-discovery" },
  { id: "proposal-sent", label: "Proposal Sent", color: "stage-proposal" },
  { id: "closed-won", label: "Closed Won", color: "stage-won" },
  { id: "closed-lost", label: "Closed Lost", color: "stage-lost" },
] as const;
