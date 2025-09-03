import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import AdminLayout from '@/components/admin/AdminLayout';
import { authService } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserPlus, Users, Trash2, Key, Shield, Eye, EyeOff } from 'lucide-react';
import { Admin } from '@/types/career';
const createRecruiterSchema = z.object({
  name: z.string().min(1, 'Please enter the name'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});
type CreateRecruiterFormData = z.infer<typeof createRecruiterSchema>;
interface RecruiterInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  password_hash: string;
  plain_password?: string; // For newly created users only
}
const AdminDashboardFull = () => {
  const [recruiters, setRecruiters] = useState<RecruiterInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [newlyCreatedPasswords, setNewlyCreatedPasswords] = useState<Record<string, string>>({});
  const createForm = useForm<CreateRecruiterFormData>({
    resolver: zodResolver(createRecruiterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  });
  useEffect(() => {
    loadRecruiters();
  }, []);
  const loadRecruiters = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('admin_users').select('id, email, name, role, created_at, password_hash').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setRecruiters(data || []);
    } catch (error) {
      console.error('Error loading recruiters:', error);
      toast.error('Failed to load recruiters');
    }
  };
  const createRecruiter = async (data: CreateRecruiterFormData) => {
    setLoading(true);
    try {
      const newUser = await authService.signUp(data.email, data.password, 'Recruiter', data.name);
      if (newUser) {
        // Store the plain password temporarily for display
        setNewlyCreatedPasswords(prev => ({
          ...prev,
          [newUser.id]: data.password
        }));
        toast.success('Recruiter account created successfully!');
        setCreateDialogOpen(false);
        createForm.reset();
        loadRecruiters();
      } else {
        toast.error('Failed to create recruiter account');
      }
    } catch (error) {
      console.error('Error creating recruiter:', error);
      toast.error('Failed to create recruiter account');
    } finally {
      setLoading(false);
    }
  };
  const deleteRecruiter = async (recruiterId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete the recruiter account for ${email}?`)) {
      return;
    }
    try {
      const {
        error
      } = await supabase.from('admin_users').delete().eq('id', recruiterId);
      if (error) throw error;
      toast.success('Recruiter account deleted successfully');
      loadRecruiters();
    } catch (error) {
      console.error('Error deleting recruiter:', error);
      toast.error('Failed to delete recruiter account');
    }
  };
  const resetRecruiterPassword = async (recruiterId: string, email: string) => {
    const newPassword = prompt(`Enter new password for ${email}:`);
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      // Update password in database using auth service
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const {
        error
      } = await supabase.from('admin_users').update({
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      }).eq('id', recruiterId);
      if (error) throw error;

      // Store the new password temporarily for display
      setNewlyCreatedPasswords(prev => ({
        ...prev,
        [recruiterId]: newPassword
      }));
      toast.success('Password reset successfully!');
      loadRecruiters();
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    }
  };
  const togglePasswordVisibility = (recruiterId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [recruiterId]: !prev[recruiterId]
    }));
  };
  return <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage recruiter accounts and oversee the career system
            </p>
          </div>
          <Badge variant="secondary" className="text-sm">
            <Shield className="w-4 h-4 mr-1" />
            Administrator
          </Badge>
        </div>

        <Tabs defaultValue="recruiters" className="space-y-6">
          

          <TabsContent value="recruiters" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recruiter Accounts</h2>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Create Recruiter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Recruiter Account</DialogTitle>
                    <DialogDescription>
                      Create a new recruiter account with limited permissions
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(createRecruiter)} className="space-y-4">
                      <FormField control={createForm.control} name="name" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                      <FormField control={createForm.control} name="email" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                      <FormField control={createForm.control} name="password" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input type={showPassword ? "text" : "password"} placeholder="Enter password" {...field} />
                                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Creating...' : 'Create Account'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {recruiters.map(recruiter => <Card key={recruiter.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{recruiter.name || 'No Name'}</p>
                        <p className="text-sm text-muted-foreground">{recruiter.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={recruiter.role === 'Admin' ? 'default' : 'secondary'}>
                            {recruiter.role}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Created {new Date(recruiter.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      
                      <Button variant="outline" size="sm" onClick={() => resetRecruiterPassword(recruiter.id, recruiter.email)} className="flex items-center gap-1">
                        <Key className="w-4 h-4" />
                        Reset Password
                      </Button>
                      {recruiter.role !== 'Admin' && <Button variant="destructive" size="sm" onClick={() => deleteRecruiter(recruiter.id, recruiter.email)} className="flex items-center gap-1">
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>}
                    </div>
                  </CardContent>
                  
                  {/* Show password if toggled */}
                  {visiblePasswords[recruiter.id] && <CardContent className="pt-0">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Current Password:
                        </p>
                        <p className="text-sm font-mono bg-background px-2 py-1 rounded border">
                          {newlyCreatedPasswords[recruiter.id] || 'Password is encrypted - use Reset Password to set a new one'}
                        </p>
                        {newlyCreatedPasswords[recruiter.id] && <p className="text-xs text-green-600 mt-1">
                            ✓ This password was recently set and is temporarily visible
                          </p>}
                      </div>
                    </CardContent>}
                </Card>)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>;
};
export default AdminDashboardFull;