export const notificationEvents = [
  { key: "account_invitation", label: "Account invitations", mandatory: true },
  { key: "batch_enrolment", label: "Batch enrolments", mandatory: false },
  { key: "class_schedule", label: "Class schedule changes", mandatory: false },
  {
    key: "material_release",
    label: "New materials and recordings",
    mandatory: false,
  },
  {
    key: "enrolment_access",
    label: "Enrolment suspension and expiry",
    mandatory: true,
  },
  { key: "announcement", label: "General announcements", mandatory: false },
] as const;

export type NotificationEventKey =
  (typeof notificationEvents)[number]["key"] | "website_enquiry";

export interface AnnouncementRecipient {
  userId: string;
  batchIds: string[];
}

export function selectAnnouncementRecipientIds(
  recipients: AnnouncementRecipient[],
  batchId: string | null,
) {
  return recipients
    .filter((recipient) => !batchId || recipient.batchIds.includes(batchId))
    .map((recipient) => recipient.userId);
}
