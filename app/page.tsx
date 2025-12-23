'use client';// This is a client component because it uses hooks and context

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

//把UI拆成元件
import HomeHeader from '@/components/HomeHeader';
import HomeFeatureCard from '@/components/HomeFeatureCard';
import AuthButtons from '@/components/AuthButtons';
import HomeFooter from '@/components/HomeFooter';

// 根據身分顯示不同的頁面連結
const getRoleBasedLinks = (role: string, isLoggedIn: boolean) => {
  if (!isLoggedIn) {
    return [
      { href: '/order/orderlist', label: '📦 訂單列表', roles: [] },
    ];
  }

  const allLinks = [
    { href: '/order/orderlist', label: '📦 商品列表', roles: ['admin', 'user'] },
    { href: '/orders', label: '🧾 我的訂單', roles: ['admin', 'user'] },
    { href: '/cart', label: '🛒 購物車', roles: ['admin', 'user'] },
    { href: '/profile', label: '👤 個人資料', roles: ['admin', 'user'] },
  ];

  return allLinks.filter(link => link.roles.includes(role));
};

export default function HomePage() {
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const isLoggedIn = !!user;

  /** ✔ 前往頁面時檢查登入 */
  const handleNavigate = (href: string) => {
    if (!isLoggedIn) {
      alert('請先登入才能查看頁面');
      router.push('/login');
      return;
    }
    router.push(href);
  };

  const links = getRoleBasedLinks(role, isLoggedIn);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen">
        <p>載入中...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen">
      
      <HomeHeader user={user} />

      {isLoggedIn && (
        <div className="w-full max-w-md mt-6 mb-4 text-center">
          <p className="text-sm text-gray-600">
            目前身分：<span className="font-bold text-blue-600">{role}</span>
          </p>
        </div>
      )}

      <div className="w-full max-w-md space-y-4 mt-6">
        {links.map(link => (
          <HomeFeatureCard
            key={link.href}
            label={link.label}
            href={link.href}
            onNavigate={handleNavigate}
          />
        ))}
      </div>

      {!isLoggedIn && <AuthButtons />}

      <HomeFooter />
    </div>
  );
}
