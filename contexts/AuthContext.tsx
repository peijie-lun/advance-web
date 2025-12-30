'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  role: string;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);//初始值設為 undefined 

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);
//建立一個 React Context，專門存放「目前登入的 user、角色（role）、載入狀態（loading）、登出方法（signOut）」。
//只要用 useAuth() 這個 hook，任何元件都能直接取得這些資料，不用一層一層傳 props。
// 會自動監聽登入狀態變化（登入、登出、重新整理），自動更新 user 和 role。
// 提供 signOut() 方法，讓你可以隨時登出並清空狀態。
  useEffect(() => {
    // 初始化時檢查用戶狀態               
    const initializeAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          // 取得用戶的 role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)//條件：id 欄位等於當前用戶的 id
            .single();
          
          setRole(profile?.role ?? 'user');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 監聽認證狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);//更新用戶狀態  //如果有登入，這裡會是目前登入的使用者物件；如果沒登入，會是 undefined
        
        if (session?.user) {//當用戶登入時，取得 role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          setRole(profile?.role ?? 'user');//預設為 'user' //當用戶登出時，重設 role 為 'user' //profile?.role：如果有查到 profile（用戶資料），就取出其中的 role 欄位（例如 'admin' 或 'user'）。
// ?? 'user'：如果 profile 或 role 是 undefined，就預設為 'user'。
        } else {
          setRole('user');
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();// 清除監聽器
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();//登出後清除用戶資料
    setUser(null);
    setRole('user');
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);// 取得 AuthContext 的值
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
