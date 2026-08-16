export interface EnrolmentAccessInput {
  status: string;
  accessStartsAt: Date | null;
  accessEndsAt: Date | null;
}

export function hasActiveEnrolmentAccess(
  enrolment: EnrolmentAccessInput,
  now = new Date(),
) {
  return (
    enrolment.status === "ACTIVE" &&
    (!enrolment.accessStartsAt || enrolment.accessStartsAt <= now) &&
    (!enrolment.accessEndsAt || enrolment.accessEndsAt >= now)
  );
}

export function hasBatchCapacity(capacity: number | null, occupied: number) {
  return capacity === null || occupied < capacity;
}
