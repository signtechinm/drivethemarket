"use client";

import { useActionState } from "react";

import {
  processEmailOutboxAction,
  publishAnnouncementAction,
  queueExpiryNoticesAction,
  type CommunicationActionState,
} from "@/app/actions/communications";
import { Button } from "@/components/ui/button";

const initialState: CommunicationActionState = { success: false, message: "" };

export function PublishAnnouncementControl({
  announcementId,
}: {
  announcementId: string;
}) {
  const [state, action, pending] = useActionState(
    publishAnnouncementAction,
    initialState,
  );
  return (
    <form action={action}>
      <input name="announcementId" type="hidden" value={announcementId} />
      <Button disabled={pending} size="sm">
        {pending ? "Publishing…" : "Publish"}
      </Button>
      {state.message ? <p className="mt-2 text-xs">{state.message}</p> : null}
    </form>
  );
}

export function DeliveryControls() {
  const [delivery, deliver, delivering] = useActionState(
    processEmailOutboxAction,
    initialState,
  );
  const [expiry, queueExpiry, queueing] = useActionState(
    queueExpiryNoticesAction,
    initialState,
  );
  return (
    <div className="space-y-4">
      <form action={deliver}>
        <Button className="w-full" disabled={delivering}>
          {delivering ? "Processing…" : "Process email outbox"}
        </Button>
        {delivery.message ? (
          <p className="mt-2 text-xs">{delivery.message}</p>
        ) : null}
      </form>
      <form action={queueExpiry}>
        <Button className="w-full" disabled={queueing} variant="outline">
          {queueing ? "Scanning…" : "Queue 7-day expiry notices"}
        </Button>
        {expiry.message ? (
          <p className="mt-2 text-xs">{expiry.message}</p>
        ) : null}
      </form>
    </div>
  );
}
