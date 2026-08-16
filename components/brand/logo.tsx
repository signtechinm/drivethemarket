import Image from "next/image";

import { cn } from "@/lib/utils/cn";

interface LogoProps {
  className?: string;
  compact?: boolean;
  priority?: boolean;
}

export function Logo({
  className,
  compact = false,
  priority = false,
}: LogoProps) {
  return (
    <span
      aria-label="Drive the Market"
      className={cn("inline-flex items-center gap-2.5", className)}
      role="img"
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative block shrink-0 overflow-hidden",
          compact ? "h-11 w-10" : "h-14 w-[3.2rem]",
        )}
      >
        <Image
          alt=""
          className={cn(
            "absolute top-0 left-0 w-auto max-w-none",
            compact ? "h-11" : "h-14",
          )}
          height={741}
          preload={priority}
          src="/drive-the-market-logo.png"
          width={2123}
        />
      </span>
      <span
        aria-hidden="true"
        className="flex items-baseline font-sans tracking-[-0.045em] whitespace-nowrap"
      >
        <span
          className={cn(
            "bg-gradient-to-b from-olive-700 to-olive-950 bg-clip-text leading-none font-bold text-transparent",
            compact ? "text-[1.18rem]" : "text-[1.6rem]",
          )}
        >
          Drive
        </span>
        <span
          className={cn(
            "from-silver-400 to-silver-800 bg-gradient-to-b bg-clip-text leading-none font-bold tracking-[-0.025em] text-transparent italic",
            compact ? "mx-1 text-[0.72rem]" : "mx-1.5 text-[1rem]",
          )}
        >
          the
        </span>
        <span
          className={cn(
            "bg-gradient-to-b from-olive-700 to-olive-950 bg-clip-text leading-none font-bold text-transparent",
            compact ? "text-[1.18rem]" : "text-[1.6rem]",
          )}
        >
          Market
        </span>
      </span>
    </span>
  );
}
