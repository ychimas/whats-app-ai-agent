import { withAuth } from "next-auth/middleware"

export default withAuth({
    callbacks: {
        authorized: ({ token }) => !!token,
    },
})

export const config = {
    matcher: [
        // Protect API routes except auth
        "/api/((?!auth).*)",
        // Protect all dashboard routes if you had them, but currently everything is on page.tsx which is public initially but protected by client state.
        // Ideally we'd move dashboard to /dashboard
    ],
}
