import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    status: "INVITED" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
    roleKeys: string[];
    permissionKeys: string[];
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      status: "INVITED" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
      roleKeys: string[];
      permissionKeys: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    status: "INVITED" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
    roleKeys: string[];
    permissionKeys: string[];
  }
}
