"use client"
import * as React from "react"

import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { orpc } from "@/lib/orpc"
import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import { Icons } from "@/components/icons"
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar"
import { cn } from "@repo/ui/lib/utils"

function ProfilePageContent() {
    const queryClient = useQueryClient();
    const { data: user, isLoading: isUserLoading } = useQuery(orpc.user.profile.me.queryOptions({ input: {} }))
    
    // Fetch helper data in parallel
    const { data: providers, isLoading: isProvidersLoading } = useQuery(
        orpc.user.profile.getProviders.queryOptions({ input: {} })
    )
    
    // Use `hasPassword` endpoint if you want to be extra safe, 
    // but typically `me` might not include this sensitive bit unless we specifically added an endpoint.
    // Based on contract changes, we added `hasPassword` endpoint.
    const { data: passwordStatus, isLoading: isPasswordStatusLoading } = useQuery(
        orpc.user.profile.hasPassword.queryOptions({ input: {} })
    )

    const isLoading = isUserLoading || isProvidersLoading || isPasswordStatusLoading

    // Update Profile Mutation
    const { mutateAsync: updateProfile, isPending: isUpdatePending } = useMutation({
        ...orpc.user.profile.update.mutationOptions(),
        onSuccess: () => {
            toast.success("Profile updated successfully")
            queryClient.invalidateQueries(orpc.user.profile.me.queryOptions({ input: {} }))
        },
        onError: (error) => toast.error(error.message)
    })

    // Update Password Mutation
    const { mutateAsync: updatePassword, isPending: isPasswordPending } = useMutation({
        ...orpc.user.profile.updatePassword.mutationOptions(),
        onSuccess: () => {
             toast.success("Password updated successfully")
             passwordForm.reset()
             queryClient.invalidateQueries(orpc.user.profile.hasPassword.queryOptions({ input: {} }))
        },
        onError: (error) => toast.error(error.message)
    })

    // Link Account Mutation
    const { mutateAsync: linkAccountMutation, isPending: isLinkPending } = useMutation({
        ...orpc.user.profile.linkAccount.mutationOptions(),
        onSuccess: () => {
             toast.success("Account connected successfully")
             queryClient.invalidateQueries(orpc.user.profile.getProviders.queryOptions({ input: {} }))
        },
        onError: (error) => toast.error(error.message)
    })

    // UnLink Account Mutation
    const { mutateAsync: unlinkAccountMutation, isPending: isUnlinkPending } = useMutation({
        ...orpc.user.profile.unlinkAccount.mutationOptions(),
        onSuccess: () => {
             toast.success("Account disconnected successfully")
             queryClient.invalidateQueries(orpc.user.profile.getProviders.queryOptions({ input: {} }))
        },
        onError: (error) => toast.error(error.message)
    })
    const { mutateAsync: getUploadUrl } = useMutation(orpc.public.storage.getUploadUrl.mutationOptions());
    const { mutateAsync: updateImage } = useMutation({
        ...orpc.user.profile.updateImage.mutationOptions(),
        onSuccess: () => {
             toast.success("Profile picture updated")
             queryClient.invalidateQueries(orpc.user.profile.me.queryOptions({ input: {} }))
        },
        onError: (error) => toast.error(error.message)
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // 1. Get Presigned URL
            const result = await getUploadUrl({
                filename: file.name,
                contentType: file.type,
                size: file.size,
            });
            const url = result.data.url;

            if (!url) {
                throw new Error("Failed to get upload URL");
            }

            // 2. Upload to R2/S3
            const upload = await fetch(url, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });

            if (!upload.ok) {
                throw new Error('Upload failed');
            }

            // 3. Update User Profile
            const pubUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
            if (!pubUrl) {
                throw new Error("R2 public URL not found");
            }
            const fileKey = result.data.key;
            const publicUrl = `${pubUrl}/${fileKey}`;
            
            await updateImage({ imageUrl: publicUrl });

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to upload image");
        }
    };

    const googleLogin = useGoogleLogin({
        flow: 'auth-code',
        onSuccess: async (codeResponse) => {
             await linkAccountMutation({ 
                 provider: 'google', 
                 idToken: codeResponse.code 
            })
        },
        onError: () => toast.error("Google Connection Failed"),
    })

    const profileForm = useForm({
        defaultValues: {
            name: user?.data.name || "",
        },
        onSubmit: async ({ value }) => {
            await updateProfile(value)
            profileForm.reset(value) // Reset dirty state with new values
        },
    })
    
    // Update form default values when user data is loaded
    React.useEffect(() => {
        if (user?.data) {
             profileForm.reset({ name: user.data.name || "" })
        }
    }, [user, profileForm])
    
     const passwordForm = useForm({
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        validators: {
            onChange: ({ value }) => {
                if (value.newPassword !== value.confirmPassword) {
                    return { confirmPassword: "Passwords do not match" }
                }
                return undefined
            }
        },
        onSubmit: async ({ value }) => {
             // If validation fails, it won't submit, but double check or just rely on form state
            await updatePassword({
                currentPassword: value.currentPassword || undefined,
                newPassword: value.newPassword,
            })
        },
    })

    const isGoogleConnected = providers?.data?.some(acc => acc.provider === 'google');
    const hasPassword = passwordStatus?.data?.hasPassword;

    if (isLoading) {
        return <div className="flex h-[50vh] items-center justify-center">
             <Icons.spinner className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    }

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Profile</h1>
                <p className="text-muted-foreground">Manage your account settings and connected accounts.</p>
            </div>

            {/* Profile Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your public profile information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user?.data.image || ""} />
                            <AvatarFallback className="text-lg">{user?.data.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                            <Label>Profile Picture</Label>
                             <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    type="button" 
                                    onClick={() => document.getElementById('avatar-upload')?.click()}
                                >
                                    Upload New
                                </Button>
                                <input 
                                    type="file" 
                                    id="avatar-upload" 
                                    className="hidden" 
                                    accept="image/png, image/jpeg, image/jpg, image/webp, image/avif, image/apng"
                                    onChange={handleFileChange}
                                />
                             </div>
                        </div>
                     </div>

                    <form
                         onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            profileForm.handleSubmit()
                        }}
                        className="space-y-4"
                    >
                         <profileForm.Field
                            name="name"
                            children={(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor="name">Display Name</Label>
                                    <Input
                                        id="name"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="Your name"
                                    />
                                </div>
                            )}
                         />
                         <div className="flex justify-end">
                             <profileForm.Subscribe
                                selector={(state) => [state.canSubmit, state.isDirty]}
                                children={([canSubmit, isDirty]) => (
                                    <Button disabled={isUpdatePending || !isDirty}>
                                        {isUpdatePending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                )}
                             />
                         </div>
                    </form>
                </CardContent>
            </Card>

            {/* Password Form */}
             <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Update your password.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                         onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            passwordForm.handleSubmit()
                        }}
                        className="space-y-4"
                    >
                         <passwordForm.Field
                            name="currentPassword"
                            children={(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="••••••••"
                                        disabled={!hasPassword}
                                        required={hasPassword}
                                    />
                                    {!hasPassword && (
                                        <p className="text-xs text-muted-foreground">
                                            You are ensuring your account security by setting a password.
                                        </p>
                                    )}
                                </div>
                            )}
                         />
                           <passwordForm.Field
                            name="newPassword"
                            children={(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                         type="password"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                         placeholder="••••••••"
                                         required
                                         minLength={8}
                                    />
                                </div>
                            )}
                         />
                           <passwordForm.Field
                            name="confirmPassword"
                            children={(field) => (
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input
                                        id="confirmPassword"
                                         type="password"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                         placeholder="••••••••"
                                         required
                                         minLength={8}
                                    />
                                     {field.state.meta.errors ? (
                                        <p className="text-sm text-red-500">{field.state.meta.errors.join(", ")}</p>
                                    ) : null}
                                </div>
                            )}
                         />
                         <div className="flex justify-end">
                             <Button disabled={isPasswordPending}>
                                 {isPasswordPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                                 {hasPassword ? "Update Password" : "Set Password"}
                             </Button>
                         </div>
                    </form>
                </CardContent>
            </Card>

            {/* Connected Accounts */}
            <Card>
                <CardHeader>
                    <CardTitle>Connected Accounts</CardTitle>
                    <CardDescription>Connect your social accounts for easier login.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                            <Icons.google className="h-6 w-6" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">Google</p>
                                <p className="text-sm text-muted-foreground">
                                    {isGoogleConnected 
                                        ? "Your Google account is connected." 
                                        : "Connect your Google account"}
                                </p>
                            </div>
                        </div>
                        {isGoogleConnected ? (
                             <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => unlinkAccountMutation({ provider: 'google' })}
                                disabled={isUnlinkPending || !hasPassword}
                                title={!hasPassword ? "You must set a password before disconnecting your only login method." : "Disconnect Google Account"}
                            >
                                {isUnlinkPending ? <Icons.spinner className="h-4 w-4 animate-spin" /> : "Disconnect"}
                            </Button>
                        ) : (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => googleLogin()}
                                disabled={isLinkPending}
                            >
                                {isLinkPending ? <Icons.spinner className="h-4 w-4 animate-spin" /> : "Connect"}
                            </Button>
                        )}
                        
                     </div>
                     {!hasPassword && isGoogleConnected && (
                         <p className="text-xs text-muted-foreground text-red-500">
                             * You must set a password before you can disconnect your Google account.
                         </p>
                     )}
                </CardContent>
            </Card>
        </div>
    )
}

export default function ProfilePage() {
     return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
            <ProfilePageContent />
        </GoogleOAuthProvider>
     )
}
