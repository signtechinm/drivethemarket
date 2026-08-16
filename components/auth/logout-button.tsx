"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: "/login" })}
      size="sm"
      variant="ghost"
    >
      <LogOut className="size-4" /> Sign out
    </Button>
  );
}
