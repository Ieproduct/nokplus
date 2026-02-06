"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || email },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMessage("สมัครสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี หรือลองเข้าสู่ระบบ");
      setIsSignUp(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">NokPlus</CardTitle>
          <CardDescription>ระบบจัดซื้อจัดจ้าง</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
              {message}
            </div>
          )}

          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">ชื่อ-นามสกุล</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ชื่อ นามสกุล"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="รหัสผ่าน"
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "กำลังดำเนินการ..." : isSignUp ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {isSignUp ? (
              <p>
                มีบัญชีแล้ว?{" "}
                <button
                  onClick={() => { setIsSignUp(false); setError(null); }}
                  className="text-primary underline"
                >
                  เข้าสู่ระบบ
                </button>
              </p>
            ) : (
              <p>
                ยังไม่มีบัญชี?{" "}
                <button
                  onClick={() => { setIsSignUp(true); setError(null); }}
                  className="text-primary underline"
                >
                  สมัครสมาชิก
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
