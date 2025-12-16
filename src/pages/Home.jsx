import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useDarkMode } from '@/hooks/useDarkMode';
import LoginForm from '@/components/LoginForm.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stethoscope } from 'lucide-react';
import axios from '@/config/api.js';

// Define signup validation schema
const signupSchema = z.object({
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Home() {
    const { token } = useAuth();
    const { isDarkMode } = useDarkMode();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [showLogo, setShowLogo] = useState(false);

    useEffect(() => {
        // If user is already logged in, redirect to stats dashboard
        if (token) {
            navigate('/stats');
            return;
        }

        // Show loading spinner for 2 seconds
        const timer = setTimeout(() => {
            setIsLoading(false);
            setShowLogo(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, [token, navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(signupSchema),
        mode: "onChange",
    });

    const submitSignup = async (data) => {
        try {
            let response = await axios.post('/register', data);
            console.log('Registration success:', response.data);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify({
                    first_name: response.data.first_name,
                    last_name: response.data.last_name,
                    email: response.data.email
                }));
                window.location.reload();
            } else {
                alert('Registration successful! Please log in.');
            }
        } catch (err) {
            console.error('Registration error:', err);
            console.error('Error response:', err.response?.data);
            
            let errorMsg = 'Registration failed. ';
            if (err.response?.data?.error) {
                errorMsg += err.response.data.error;
            } else if (err.response?.data?.message) {
                errorMsg += err.response.data.message;
            } else if (err.response?.data) {
                errorMsg += JSON.stringify(err.response.data);
            } else if (err.message) {
                errorMsg += err.message;
            } else {
                errorMsg += 'Please check all fields and try again.';
            }
            
            alert(errorMsg);
        }
    };

    // Loading screen
    if (isLoading) {
        return (
            <div className={`fixed inset-0 flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900'}`}>
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900'}`}>
            <div className={`w-full max-w-md transition-all duration-1000 ${showLogo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {/* Logo Section */}
                <div className="text-center mb-8 space-y-6">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                        <Stethoscope className={`w-12 h-12 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
                    </div>
                    <h1 className="text-4xl font-bold text-white" style={{fontFamily: 'Rubik, sans-serif'}}>IADT Medical</h1>
                </div>

                {/* Login/Register Forms */}
                {!token && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-transparent border-none">
                                <TabsTrigger value="login" className={`transition-all duration-300 ease-in-out ${isDarkMode ? 'bg-slate-700/60 text-white data-[state=active]:bg-slate-800 data-[state=active]:text-teal-400' : 'bg-teal-800/60 text-white data-[state=active]:bg-teal-100 data-[state=active]:text-teal-800'}`}>
                                    Login
                                </TabsTrigger>
                                <TabsTrigger value="signup" className={`transition-all duration-300 ease-in-out ${isDarkMode ? 'bg-slate-700/60 text-white data-[state=active]:bg-slate-800 data-[state=active]:text-teal-400' : 'bg-teal-800/60 text-white data-[state=active]:bg-teal-100 data-[state=active]:text-teal-800'}`}>
                                    Sign Up
                                </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="login">                                
                                <LoginForm />
                            </TabsContent>

                            <TabsContent value="signup">
                                <Card className={`w-full ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-white/20'}`}>
                                    <CardHeader>
                                        <CardTitle>Create an account</CardTitle>
                                        <CardDescription>
                                            Enter your details to sign up
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSubmit(submitSignup)}>
                                            <div className="flex flex-col gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="signup-first-name">First Name</Label>
                                                    <Input
                                                        id="signup-first-name"
                                                        type="text"
                                                        placeholder="John"
                                                        {...register("first_name")}
                                                        className={errors.first_name ? "border-red-500" : ""}
                                                    />
                                                    {errors.first_name && (
                                                        <p className="text-sm text-red-500">{errors.first_name.message}</p>
                                                    )}
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="signup-last-name">Last Name</Label>
                                                    <Input
                                                        id="signup-last-name"
                                                        type="text"
                                                        placeholder="Doe"
                                                        {...register("last_name")}
                                                        className={errors.last_name ? "border-red-500" : ""}
                                                    />
                                                    {errors.last_name && (
                                                        <p className="text-sm text-red-500">{errors.last_name.message}</p>
                                                    )}
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="signup-email">Email</Label>
                                                    <Input
                                                        id="signup-email"
                                                        type="email"
                                                        placeholder="m@example.com"
                                                        {...register("email")}
                                                        className={errors.email ? "border-red-500" : ""}
                                                    />
                                                    {errors.email && (
                                                        <p className="text-sm text-red-500">{errors.email.message}</p>
                                                    )}
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="signup-password">Password</Label>
                                                    <Input
                                                        id="signup-password"
                                                        type="password"
                                                        {...register("password")}
                                                        className={errors.password ? "border-red-500" : ""}
                                                    />
                                                    {errors.password && (
                                                        <p className="text-sm text-red-500">{errors.password.message}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </form>
                                    </CardContent>
                                    <CardFooter>
                                        <Button 
                                            onClick={handleSubmit(submitSignup)} 
                                            type="submit" 
                                            className={`w-full ${isDarkMode ? 'bg-teal-500 hover:bg-teal-600' : 'bg-teal-600 hover:bg-teal-700'}`}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </div>
        </div>
    );
};