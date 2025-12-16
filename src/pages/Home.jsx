import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/LoginForm.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(signupSchema),
        mode: "onChange", // Validate as user types
    });

    const submitSignup = async (data) => {
        try {
            let response = await axios.post('/register', data);
            console.log('Registration success:', response.data);
            // After successful registration, save the token and user data
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify({
                    first_name: response.data.first_name,
                    last_name: response.data.last_name,
                    email: response.data.email
                }));
                window.location.reload(); // Refresh to update auth state
            } else {
                alert('Registration successful! Please log in.');
            }
        } catch (err) {
            console.error('Registration error:', err);
            console.error('Error response:', err.response?.data);
            
            // Show detailed error message
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

    return (
        <>
            <h1>Home</h1>
            {/* Only show the forms if the user is NOT logged in */}
            {!token && (
                <div className="max-w-md mx-auto">
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="login">
                            <LoginForm />
                        </TabsContent>
                        
                        <TabsContent value="signup">
                            <Card className="w-full">
                                <CardHeader>
                                    <CardTitle>Create an account</CardTitle>
                                    <CardDescription>
                                        Enter your details to sign up
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit(submitSignup)}>
                                        <div className="flex flex-col gap-6">
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
                                <CardFooter className="flex-col gap-2">
                                    <Button 
                                        onClick={handleSubmit(submitSignup)} 
                                        type="submit" 
                                        className="w-full"
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
            
            {/* Show this content when logged in */}
            {token && (
                <div>
                    <p>Wort wort wort, you're logged in.</p>
                </div>
            )}
        </>
    );
};