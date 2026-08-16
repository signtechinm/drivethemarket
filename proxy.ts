import { getToken } from "next-auth/jwt";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });
  const isServerAction = request.headers.has("next-action");
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);

  // Let protected Server Actions reach their own authorization checks. A
  // redirect thrown inside an action is encoded as an action redirect; doing
  // it here produces an HTML login response that React cannot deserialize.
  if ((!token || token.status !== "ACTIVE") && isServerAction)
    return NextResponse.next();

  if (!token || token.status !== "ACTIVE")
    return NextResponse.redirect(loginUrl);

  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    token.roleKeys?.includes("student")
  ) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
