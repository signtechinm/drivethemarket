"use client";

import { useRef, useState } from "react";

export function VideoPlayer({
  materialId,
  initialPosition,
}: {
  materialId: string;
  initialPosition: number;
}) {
  const lastSaved = useRef(initialPosition);
  const [message, setMessage] = useState(
    initialPosition
      ? `Resume from ${formatTime(initialPosition)}`
      : "Not started",
  );

  async function saveProgress(video: HTMLVideoElement, force = false) {
    const position = Math.floor(video.currentTime);
    if (!force && Math.abs(position - lastSaved.current) < 10) return;
    if (!Number.isFinite(video.duration) || !video.duration) return;
    lastSaved.current = position;
    const response = await fetch("/api/portal/video-progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        materialId,
        positionSeconds: position,
        durationSeconds: video.duration,
      }),
    });
    if (response.ok) {
      const result = (await response.json()) as {
        percentComplete: number;
        completed: boolean;
      };
      setMessage(
        result.completed
          ? "Completed"
          : `${result.percentComplete}% watched · saved`,
      );
    }
  }

  return (
    <div>
      <video
        className="aspect-video w-full rounded-2xl bg-black"
        controls
        onEnded={(event) => void saveProgress(event.currentTarget, true)}
        onLoadedMetadata={(event) => {
          if (
            initialPosition > 0 &&
            initialPosition < event.currentTarget.duration
          )
            event.currentTarget.currentTime = initialPosition;
        }}
        onPause={(event) => void saveProgress(event.currentTarget, true)}
        onTimeUpdate={(event) => void saveProgress(event.currentTarget)}
        playsInline
        preload="metadata"
        src={`/api/materials/${materialId}/access`}
      />
      <p className="text-muted-foreground mt-2 text-xs" role="status">
        {message}. Progress saves approximately every 10 seconds.
      </p>
    </div>
  );
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}
