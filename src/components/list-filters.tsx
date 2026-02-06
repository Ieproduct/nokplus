"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface ListFiltersProps {
  statusOptions: { value: string; label: string }[];
  placeholder?: string;
}

export function ListFilters({
  statusOptions,
  placeholder = "ค้นหา...",
}: ListFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQuery = searchParams.get("q") || "";
  const currentStatus = searchParams.get("status") || "";

  const [search, setSearch] = useState(currentQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      updateParams("q", search);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search, updateParams]);

  const handleStatusChange = (value: string) => {
    updateParams("status", value === "all" ? "" : value);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        value={currentStatus || "all"}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="สถานะทั้งหมด" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">สถานะทั้งหมด</SelectItem>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
