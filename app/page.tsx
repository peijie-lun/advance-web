'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

import HomeHeader from '@/components/HomeHeader';
import HomeFeatureCard from '@/components/HomeFeatureCard';
import AuthButtons from '@/components/AuthButtons';
import HomeFooter from '@/components/HomeFooter';

const links = [
  { href: '/order/orderlist', label: '訂單列表' },
];

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  /** ✅ Supabase Auth 監聽 */
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoggedIn(!!user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setUser(session?.user ?? null);
        setIsLoggedIn(!!session?.user);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  /** ✔ 前往頁面時檢查登入 */
  const handleNavigate = (href: string) => {
    if (!isLoggedIn) {
      alert('請先登入才能查看訂單列表');
      router.push('/login');
      return;
    }
    router.push(href);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen">
      
      <HomeHeader user={user} />

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
