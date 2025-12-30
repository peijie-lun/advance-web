'use client';// This is a client component because it uses hooks and context

import { useEffect, useState } from 'react';// React hooks
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

//把UI拆成元件
import HomeHeader from '@/components/HomeHeader';
import HomeFeatureCard from '@/components/HomeFeatureCard';
import AuthButtons from '@/components/AuthButtons';
import HomeFooter from '@/components/HomeFooter';

// 依據使用者是否登入以及角色，決定要顯示哪些頁面連結
const getRoleBasedLinks = (role: string, isLoggedIn: boolean) => {//接收兩個參數：使用者角色和登入狀態
  if (!isLoggedIn) {
    return [
      { href: '/order/orderlist', label: '📦 訂單列表', roles: [] },//role空陣列，因為使用者未登入，所以角色不適用。
    ];
  }

  const allLinks = [// 定義所有可能的連結
    { href: '/order/orderlist', label: '📦 商品列表', roles: ['admin', 'user'] },//每個連結都標註哪些角色可以看到
    { href: '/orders', label: '🧾 我的訂單', roles: ['admin', 'user'] },
    { href: '/cart', label: '🛒 購物車', roles: ['admin', 'user'] },
    { href: '/profile', label: '👤 個人資料', roles: ['admin', 'user'] },
  ];

  return allLinks.filter(link => link.roles.includes(role));// allLinks 陣列裡的每個連結物件，依序丟給 link 這個參數，讓它去判斷 link.roles 裡面有沒有包含目前的 role
};
//function 不是只執行一次 畫面每更新一次 → 它就「整個重跑一次」
//怎麼「記住」登入狀態
//Hook 是 React 給你的「保險箱」 其實就是保存資料的地方
// 就算 function 重跑，裡面的東西不會消失
//Hook 不是存在 function 裡而是存在 React 幫你保管的地方
//所以你每次呼叫 Hook，拿到的東西都是「同一個」
// useAuth() 這個 Hook 就是從 AuthContext 拿到 user、role、loading
// count

// 就是目前的狀態值。

// 當畫面渲染時，它會顯示最新的數值。

// setCount

// 用來更新狀態。

// 每次呼叫 setCount，React 會重新渲染這個元件，把最新狀態反映在畫面上。

//useAuth  不管你在哪個頁面拿到的是同一份登入狀態
//你只要呼叫 useAuth()，就能拿到 user 和 role，再用 !!user 判斷是否登入，這樣就能把這兩個值傳給 getRoleBasedLinks(role, isLoggedIn)
export default function HomePage() {
  const router = useRouter();//做頁面導向
  const { user, role, loading } = useAuth();//從自訂的 AuthContext 取得目前登入的 user 物件、角色（role）、以及 loading 狀態。 //任何頁面只要用這一行，就能知道使用者是誰、角色是什麼、還有載入狀態
  const isLoggedIn = !!user;//將 user 物件轉換為布林值，表示使用者是否已登入

//
  /** ✔ 前往頁面時檢查登入 */
  const handleNavigate = (href: string) => {//當使用者點擊功能卡片時會呼叫它
    if (!isLoggedIn) {
      alert('請先登入才能查看頁面');
      router.push('/login');
      return;
    }
    router.push(href);
  };

  const links = getRoleBasedLinks(role, isLoggedIn);
  //inks 陣列看到每個卡片的 href。
  //如果沒登入，只給你看訂單列表；如果有登入，會根據你是 admin 還是 user，顯示你有權限用的功能
//呼叫16行的 getRoleBasedLinks 函式，傳入目前使用者的角色和登入狀態，取得適合顯示的連結陣列
  if (loading) {//載入中顯示載入中
    return (
      <div className="w-full flex items-center justify-center min-h-screen">
        <p>載入中...</p>
      </div>
    );
  }
//  //傳user進去 //把header獨立成元件
////顯示功能卡片的區域
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen">
 
      <HomeHeader user={user} />
      

      {isLoggedIn && (//如果有登入才顯示目前身分
        <div className="w-full max-w-md mt-6 mb-4 text-center">
          <p className="text-sm text-gray-600">
            目前身分：<span className="font-bold text-blue-600">{role}</span>
          </p>
        </div>
      )}
  

      <div className="w-full max-w-md space-y-4 mt-6">
        {links.map(link => (//每一個 link → 變成一張卡片
          <HomeFeatureCard
            key={link.href}
            label={link.label}
            href={link.href}//卡片要導向的頁面 //傳給 HomeFeatureCard 元件 //58行的 link.href
            onNavigate={handleNavigate}//點卡片 → 呼叫 handleNavigate
          />
        ))}
      </div>

      {!isLoggedIn && <AuthButtons />}

      <HomeFooter />
    </div>
  );
}
//沒登入就顯示登入註冊按鈕