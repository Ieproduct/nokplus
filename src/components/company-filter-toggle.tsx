"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CompanyFilterToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showAll = searchParams.get("all") === "1";

  const toggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (showAll) {
      params.delete("all");
    } else {
      params.set("all", "1");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <Button
      variant={showAll ? "default" : "outline"}
      size="sm"
      onClick={toggle}
      className={showAll ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
    >
      <Building2 className="mr-1.5 h-4 w-4" />
      {showAll ? "ทุกบริษัท" : "บริษัทปัจจุบัน"}
    </Button>
  );
}
