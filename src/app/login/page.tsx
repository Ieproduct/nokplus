"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Blue Background with Logo */}
      <div className="relative hidden w-[45%] overflow-hidden lg:block">
        <Image
          src="/login-bg.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex size-[128px] items-center justify-center rounded-[32px] bg-white p-4 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
            <Image
              src="/logo.png"
              alt="NokPlus Logo"
              width={87}
              height={87}
              className="object-contain"
            />
          </div>
          <h1 className="mt-6 text-[40px] font-semibold leading-[44px] text-white">
            Welcome to ERP
          </h1>
          <p className="mt-2 text-base text-white">
            ระบบจัดซื้อจัดจ้าง NokPlus
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-1 items-center justify-center bg-white px-4">
        <div className="w-full max-w-[400px] space-y-6">
          {/* Header */}
          <div className="space-y-2 text-center">
            {/* Mobile logo */}
            <div className="mb-6 flex justify-center lg:hidden">
              <div className="flex size-[96px] items-center justify-center rounded-[24px] bg-white p-3 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                <Image
                  src="/logo.png"
                  alt="NokPlus Logo"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
            </div>
            <h2 className="text-[32px] font-semibold leading-[36px] text-[#686868]">
              NokPlus
            </h2>
            <p className="text-lg text-[#686868]">
              กรุณากรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งาน
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=" "
                className="peer w-full rounded border border-black/23 px-3 pb-4 pt-6 text-base text-black/87 outline-none transition-colors focus:border-[#0288d1] focus:ring-1 focus:ring-[#0288d1]"
              />
              <label
                htmlFor="email"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-black/60 transition-all peer-focus:top-3 peer-focus:text-xs peer-focus:text-[#0288d1] peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-xs"
              >
                อีเมล
              </label>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder=" "
                className="peer w-full rounded border border-black/23 px-3 pb-4 pr-12 pt-6 text-base text-black/87 outline-none transition-colors focus:border-[#0288d1] focus:ring-1 focus:ring-[#0288d1]"
              />
              <label
                htmlFor="password"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-black/60 transition-all peer-focus:top-3 peer-focus:text-xs peer-focus:text-[#0288d1] peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:text-xs"
              >
                รหัสผ่าน
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 hover:text-black/87"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-5" />
                ) : (
                  <Eye className="size-5" />
                )}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-base text-[#2563eb] hover:underline"
              >
                ลืมรหัสผ่านใช่หรือไม่ ?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-[#0288d1] px-6 py-3 text-[15px] font-medium uppercase tracking-[0.46px] text-white transition-colors hover:bg-[#0277bd] disabled:opacity-60"
            >
              {loading ? "กำลังดำเนินการ..." : "เข้าสู่ระบบ"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
