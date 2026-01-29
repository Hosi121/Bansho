'use client';

import { useState } from 'react';
import { User, Camera, KeyRound } from 'lucide-react';
import AppLayout from '@/components/common/layout/AppLayout';
import { useProfile } from '@/libs/hooks/useProfile';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChangePasswordDialog } from '@/components/dialogs/ChangePasswordDialog';

export default function ProfilePage() {
  const { user } = useAuthContext();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    error,
    isLoading,
    handleUpdate,
    handleAvatarChange,
  } = useProfile();

  return (
    <AppLayout>
      <div className="min-h-[calc(100dvh-3rem)] p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-8 text-balance">プロフィール</h1>

          <Card>
            <CardHeader>
              <div className="relative inline-block">
                <Avatar className="size-20">
                  <AvatarImage src={user?.avatar} alt={user?.name ?? ''} />
                  <AvatarFallback>
                    <User className="size-10 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarChange(file);
                    }}
                  />
                  <Camera className="size-5 text-white" />
                </label>
              </div>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/50 text-destructive rounded-lg">
                  {error}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">名前</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                    >
                      キャンセル
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? '更新中...' : '変更を保存'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <Label className="text-muted-foreground">名前</Label>
                    <div className="mt-1">{user?.name}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">メールアドレス</Label>
                    <div className="mt-1">{user?.email}</div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsPasswordDialogOpen(true)}>
                      <KeyRound className="mr-2 h-4 w-4" />
                      パスワードを変更
                    </Button>
                    <Button variant="link" onClick={() => setIsEditing(true)}>
                      プロフィールを編集
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {user && (
            <ChangePasswordDialog
              open={isPasswordDialogOpen}
              onOpenChange={setIsPasswordDialogOpen}
              userId={user.id}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
