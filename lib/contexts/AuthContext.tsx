'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface AuthContextType {//定義 context 裡會有的東西
  user: User | null;
  role: string;
  loading: boolean;
  signOut: () => Promise<void>;
}
//我要做一個專門放『登入狀態』的公共空間 
//AuthContext 會存放 登入狀態、角色、loading、登出方法，整個網站都能存取
const AuthContext = createContext<AuthContextType | undefined>(undefined);//建立 Context
//useState 回傳的兩個東西
//建立一個 state 變數 user
// 建立一個更新函式 setUser 用來修改 user 的值 
//state 是元件內部用來存放資料的變數，而且當它改變時，React 會自動重新渲染元件
export function AuthProvider({ children }: { children: React.ReactNode }) {//任何被 <AuthProvider> 包住的元件，都能用 useAuth() 拿到狀態 //setUser 是用來更新 user 狀態的函式 //<>useState 告訴 TypeScript 這個 state 的型別
  const [user, setUser] = useState<User | null>(null);//用來存放目前登入的使用者物件 // ()初始值
  //<>state 的值可以是 User 物件，也可以是 null ()括號裡的 null 是 state 的初始值 user 一開始就是 null 直到你呼叫 setUser(someUser) 才會變成 User 
  const [role, setRole] = useState<string>('user');//預設角色是 user //角色有 admin、user 兩種 
  const [loading, setLoading] = useState(true);

  useEffect(() => {//useEffect 是 React hook，用來處理副作用（Side Effect）
    // 初始化時檢查用戶狀態
    const initializeAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();//取得目前的登入使用者
        setUser(user);//更新 state，讓全站知道現在的登入者是誰
        
        if (user) {
          // 取得用戶的 role
          const { data: profile } = await supabase//profile = result.data //profile 是變數名稱
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          setRole(profile?.role ?? 'user');//先檢查 profile 這個物件有沒有 role 這個屬性，如果有就用它，沒有就用 'user' 當預設值
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 監聽認證狀態變化
    //這段會監聽 supabase 的登入狀態變化，當使用者登入或登出時會觸發回呼函式
    const { data: { subscription } } = supabase.auth.onAuthStateChange(//監聽登入登出事件  //Supabase 會丟兩個東西進來
      async (_event, session) => {//_event = 事件類型session = 目前的登入狀態
        setUser(session?.user ?? null);//如果有登入，把 user 設成目前的 user，沒登入就設成 null。
        // //session?.user     // 有 session 才拿 user
// ?? null           // 如果是 undefined，就用 null

        if (session?.user) {
          // 當用戶登入時，取得 role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
//如果有登入，去資料庫查詢這個 user 的角色（role），查到就設進 state，查不到就預設 'user'      
          setRole(profile?.role ?? 'user');
        } else {
          setRole('user');
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();//清除監聽
  }, []);
//登出功能
  const signOut = async () => {
    await supabase.auth.signOut();//呼叫 Supabase 的登出方法 
    setUser(null);
    setRole('user');
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {children}//
    </AuthContext.Provider>
  );//把『身分資訊』包起來，讓整個網站都拿得到
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Context = 全站共用的廣播 不用一層一層傳 props，大家都可以直接拿
// useAuth=我去公共空間拿資料
// session=使用者的登入狀態資料
// provideer=包住全站，讓全站都能拿到狀態
//Session 就像門禁卡或票證，告訴系統「這個人已經登入了」
//使用者的登入資料存在 state → Context 共享 → useAuth 拿來用

// 使用者登入
//    │
//    ▼
// Supabase 認證成功
//    │
//    ▼
// 生成 session（包含 user）
//    │
//    ▼
// 前端拿到 session.user
//    │
//    ▼
// setUser(user) → 更新 React state
//    │
//    ▼
// AuthProvider 把 state 放進 Context
//    │
//    ▼
// 全站元件用 useAuth() 拿資料
//    │
//    ▼
// 畫面自動更新 → 顯示登入使用者資訊

// 使用者按登出
//    │
//    ▼
// Supabase 清掉 session
//    │
//    ▼
// setUser(null) → state 清空
//    │
//    ▼
// Context 更新 → 全站知道沒人登入
//    │
//    ▼
// 畫面自動更新 → 顯示未登入狀態
