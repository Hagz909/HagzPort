import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard');
      const isAdminRoute = nextUrl.pathname.startsWith('/admin');
      const isAuthRoute = nextUrl.pathname === '/login' || nextUrl.pathname === '/register';

      if (isAuthRoute) {
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl));
        return true;
      }

      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        if (auth?.user?.role !== 'ADMIN') return Response.redirect(new URL('/dashboard', nextUrl));
        return true;
      }

      if (isDashboardRoute) {
        if (!isLoggedIn) return false; // Redirects to login
        return true;
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isActive = user.isActive;
      }
      
      // Handle session update (e.g. name change)
      if (trigger === 'update' && session?.name) {
        token.name = session.name;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  providers: [], // Providers di-add di auth.ts
} satisfies NextAuthConfig;
