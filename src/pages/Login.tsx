import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, UserPlus, LogIn, ArrowLeft, User } from 'lucide-react';

const Login = () => {
  const { isAuthenticated, login, signup, guestLogin } = useAuth();
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard/overview" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      if (isSignupMode) {
        const result = await signup(email, password, confirmPassword);
        if (result.success) {
          setMessageType('success');
          setMessage(result.message || 'Account created successfully! Please check your email to confirm.');
          setIsSignupMode(false);
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        } else {
          setMessageType('error');
          setMessage(result.message || 'Signup failed');
        }
      } else {
        const result = await login(email, password);
        if (!result.success) {
          setMessageType('error');
          setMessage(result.message || 'Invalid credentials');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    guestLogin();
    navigate('/dashboard/overview');
  };

  const toggleMode = () => {
    setIsSignupMode(!isSignupMode);
    setMessage('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-medium">
        <CardHeader className="text-center space-y-4">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-4 h-8 w-8 p-0"
            onClick={() => navigate('/')}
            aria-label="Back to welcome page"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            {isSignupMode ? (
              <UserPlus className="w-6 h-6 text-primary-foreground" />
            ) : (
              <LogIn className="w-6 h-6 text-primary-foreground" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {isSignupMode ? 'Create Admin Account' : 'Admin Login'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            {isSignupMode && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                />
              </div>
            )}
            {message && (
              <Alert variant={messageType === 'error' ? 'destructive' : 'default'}>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : (isSignupMode ? 'Create Account' : 'Login')}
            </Button>
          </form>

          {!isSignupMode && (
            <>
              <div className="mt-4 relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={handleGuestLogin}
              >
                <User className="w-4 h-4 mr-2" />
                Continue as Guest
              </Button>
            </>
          )}

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={toggleMode}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {isSignupMode
                ? 'Already have an account? Login'
                : 'Need to create an admin account? Sign up'}
            </Button>
          </div>

          {!isSignupMode && (
            <div className="mt-2 text-center text-xs text-muted-foreground">
              Create an account to get started
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
