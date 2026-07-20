import { DbService } from './supabase';

const ADMIN_SESSION_KEY = 'farook_admin_session_token';

export interface AdminSession {
  email: string;
  name: string;
  loginTime: string;
}

export const AuthService = {
  async login(email: string, password_plaintext: string): Promise<boolean> {
    const admin = await DbService.loginAdmin(email, password_plaintext);
    if (admin) {
      const session: AdminSession = {
        email: admin.email,
        name: admin.name,
        loginTime: new Date().toISOString()
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
        // Also set a cookie so Server Components could inspect it if needed
        document.cookie = `${ADMIN_SESSION_KEY}=true; path=/; max-age=86400; SameSite=Strict`;
      }
      return true;
    }
    return false;
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      document.cookie = `${ADMIN_SESSION_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  },

  getCurrentSession(): AdminSession | null {
    if (typeof window === 'undefined') return null;
    const sessionStr = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!sessionStr) return null;
    try {
      const session: AdminSession = JSON.parse(sessionStr);
      // Optional: session expiry check (e.g. 24 hours)
      const loginDate = new Date(session.loginTime);
      const now = new Date();
      const diffMs = now.getTime() - loginDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (diffHours > 24) {
        this.logout();
        return null;
      }
      return session;
    } catch (e) {
      this.logout();
      return null;
    }
  },

  isAuthenticated(): boolean {
    return this.getCurrentSession() !== null;
  }
};
