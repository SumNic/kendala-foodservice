import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  const hash = req.cookies.get("hash")?.value

  if (!token || !hash) {
    // Например, если не залогинен — редирект на /login
    return NextResponse.redirect(new URL("/admin", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/menu/upload", "/delivery", "/kitchen"],
}
