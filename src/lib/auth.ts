import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';
import { Admin } from '@/types/career';

export const authService = {
  async verifyAdminCredentials(email: string, password: string): Promise<boolean> {
    try {
      // For now, use hardcoded admin credentials from environment or fallback
      const adminEmail = 'admin@mangosorange.com';
      const adminPassword = 'admin123';
      
      return email === adminEmail && password === adminPassword;
    } catch (error) {
      console.error('Admin verification error:', error);
      return false;
    }
  },

  async signIn(email: string, password: string): Promise<Admin | null> {
    try {
      console.log('Attempting sign in for:', email);
      
      // Get admin user from database
      const { data: profile, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error('Database error:', error);
        return null;
      }

      if (!profile) {
        console.log('No profile found for email:', email);
        return null;
      }

      console.log('Found profile:', { id: profile.id, email: profile.email, role: profile.role, name: profile.name });

      // For the default admin user and any user with plain text password stored
      // Check if it's the plain text password first (for our migration data)
      let isValidPassword = false;
      
      if (password === profile.password_hash) {
        // Plain text password match (for accounts created via migration or with plain text)
        isValidPassword = true;
        console.log('Plain text password match successful');
      } else {
        // For other users, try bcrypt comparison
        try {
          isValidPassword = await bcrypt.compare(password, profile.password_hash);
          console.log('Bcrypt comparison result:', isValidPassword);
        } catch (error) {
          console.log('Bcrypt comparison failed, password hash might be plain text');
          isValidPassword = false;
        }
      }
      
      if (!isValidPassword) {
        console.log('Invalid password for user:', email);
        return null;
      }

      console.log('Authentication successful for:', email);
      return {
        id: profile.id,
        email: profile.email,
        name: profile.name || 'User',
        role: (profile.role?.toString?.().toLowerCase() === 'admin' ? 'Admin' : 'Recruiter') as Admin['role'],
        createdAt: profile.created_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return null;
    }
  },

  async signUp(email: string, password: string, role: 'Admin' | 'Recruiter' = 'Recruiter', name?: string): Promise<Admin | null> {
    try {
      // Create admin profile directly in database
      const password_hash = await bcrypt.hash(password, 10);
      console.log(password);
      console.log(password_hash);
      const { data: profile, error } = await supabase
        .from('admin_users')
        .insert([
          {
            email,
            password_hash, // In production, hash this properly
            role,
            name: name || email.split('@')[0], // Use provided name or email prefix as default
          }
        ])
        .select('id, email, role, name')
        .single();

      if (error) throw error;

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name || 'User',
        role: role,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return null;
    }
  },

  async signOut(): Promise<void> {
    // Clear any stored session data
    localStorage.removeItem('admin_user');
    // Sign out from Supabase auth as well
    await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<Admin | null> {
    try {
      // Check for stored session
      const stored = localStorage.getItem('admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  async resetPassword(email: string): Promise<boolean> {
    try {
      // For now, just return true as if email was sent
      // In production, implement proper password reset
      console.log('Password reset requested for:', email);
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  },
};