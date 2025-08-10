'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/api/authApi';
import {
    User,
    Mail,
    Phone,
    Building2,
    Edit,
    Save,
    X,
    Lock,
    ArrowLeft,
    Loader2,
    LogOut
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileFormData {
    username: string;
    fullName: string;
    email: string;
    phone: string;
    companyName?: string;
}

interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Form data
    const [profileData, setProfileData] = useState<ProfileFormData>({
        username: '',
        fullName: '',
        email: '',
        phone: '',
        companyName: ''
    });

    const [passwordData, setPasswordData] = useState<PasswordFormData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Loading states
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPwd, setIsChangingPwd] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone || '',
                companyName: user.companyName || ''
            });
            setIsLoading(false);
        } else {
            router.push('/login');
        }
    }, [user, router]);

    const handleProfileUpdate = async () => {
        if (!user) return;

        try {
            setIsSaving(true);

            const updateData: any = {};
            if (profileData.username !== user.username) updateData.username = profileData.username;
            if (profileData.fullName !== user.fullName) updateData.fullName = profileData.fullName;
            if (profileData.email !== user.email) updateData.email = profileData.email;
            if (profileData.phone !== user.phone) updateData.phone = profileData.phone;
            if (profileData.companyName !== user.companyName) updateData.companyName = profileData.companyName;

            if (Object.keys(updateData).length > 0) {
                await authApi.updateUser(user.id, updateData);
                toast.success('تم تحديث الملف الشخصي بنجاح');
                setIsEditing(false);
                window.location.reload();
            }
        } catch (error: any) {
            toast.error(error.message || 'حدث خطأ في تحديث الملف الشخصي');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('كلمة المرور الجديدة غير متطابقة');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        try {
            setIsChangingPwd(true);

            await authApi.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            toast.success('تم تغيير كلمة المرور بنجاح');
            setIsChangingPassword(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error: any) {
            toast.error(error.message || 'حدث خطأ في تغيير كلمة المرور');
        } finally {
            setIsChangingPwd(false);
        }
    };

    const getRoleText = (role: string) => {
        switch (role) {
            case 'admin': return 'مدير النظام';
            case 'company': return 'شركة عقارية';
            case 'user_vip': return 'مستخدم VIP';
            default: return 'مستخدم';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            size="sm"
                        >
                            <ArrowLeft className="w-4 h-4 ml-2" />
                            العودة
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary">{getRoleText(user.role)}</Badge>
                                {user.isActive && (
                                    <Badge className="bg-green-100 text-green-800">نشط</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Profile Information */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    المعلومات الشخصية
                                </CardTitle>
                                {/* {!isEditing && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Edit className="w-4 h-4 ml-1" />
                                        تعديل
                                    </Button>
                                )} */}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="username">اسم المستخدم</Label>
                                            <Input
                                                id="username"
                                                value={profileData.username}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="fullName">الاسم الكامل</Label>
                                            <Input
                                                id="fullName"
                                                value={profileData.fullName}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="email">البريد الإلكتروني</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">رقم الهاتف</Label>
                                            <Input
                                                id="phone"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    {user.role === 'company' && (
                                        <div>
                                            <Label htmlFor="companyName">اسم الشركة</Label>
                                            <Input
                                                id="companyName"
                                                value={profileData.companyName}
                                                onChange={(e) => setProfileData(prev => ({ ...prev, companyName: e.target.value }))}
                                            />
                                        </div>
                                    )}
                                    <div className="flex gap-2 pt-4">
                                        <Button
                                            onClick={handleProfileUpdate}
                                            disabled={isSaving}
                                            size="sm"
                                        >
                                            {isSaving ? (
                                                <Loader2 className="w-4 h-4 animate-spin ml-1" />
                                            ) : (
                                                <Save className="w-4 h-4 ml-1" />
                                            )}
                                            حفظ
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsEditing(false)}
                                            disabled={isSaving}
                                            size="sm"
                                        >
                                            <X className="w-4 h-4 ml-1" />
                                            إلغاء
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">اسم المستخدم</p>
                                                <p className="font-medium">{user.username}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">الاسم الكامل</p>
                                                <p className="font-medium">{user.fullName}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                                                <p className="font-medium">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">رقم الهاتف</p>
                                                <p className="font-medium">{user.phone || 'غير محدد'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {user.role === 'company' && user.companyName && (
                                        <div className="flex items-center gap-3">
                                            <Building2 className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">اسم الشركة</p>
                                                <p className="font-medium">{user.companyName}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Password Change */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="w-5 h-5" />
                                    كلمة المرور
                                </CardTitle>
                                {!isChangingPassword && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsChangingPassword(true)}
                                    >
                                        <Edit className="w-4 h-4 ml-1" />
                                        تغيير
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isChangingPassword ? (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                                        <Input
                                            id="currentPassword"
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-4">
                                        <Button
                                            onClick={handlePasswordChange}
                                            disabled={isChangingPwd}
                                            size="sm"
                                        >
                                            {isChangingPwd ? (
                                                <Loader2 className="w-4 h-4 animate-spin ml-1" />
                                            ) : (
                                                <Save className="w-4 h-4 ml-1" />
                                            )}
                                            تغيير
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsChangingPassword(false);
                                                setPasswordData({
                                                    currentPassword: '',
                                                    newPassword: '',
                                                    confirmPassword: ''
                                                });
                                            }}
                                            disabled={isChangingPwd}
                                            size="sm"
                                        >
                                            <X className="w-4 h-4 ml-1" />
                                            إلغاء
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-600">
                                    آخر تغيير: {new Date(user.updatedAt || user.createdAt).toLocaleDateString('en-US')}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/my-reservations')}
                                    className="flex-1"
                                >
                                    حجوزاتي
                                </Button>
                                {user.role === 'company' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push('/dashboard')}
                                        className="flex-1"
                                    >
                                        لوحة التحكم
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        logout();
                                        router.push('/');
                                    }}
                                    className="flex-1 text-red-600 hover:text-red-700"
                                >
                                    <LogOut className="w-4 h-4 ml-1" />
                                    تسجيل الخروج
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}