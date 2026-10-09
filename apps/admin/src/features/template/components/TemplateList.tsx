"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TemplateRow } from "@/features/template/components/TemplateRow";
import { refreshTemplateList } from "@/app/templates/actions";
import type { Template } from "@/features/template/types";

type Filter = "all" | "imported" | "not_imported";

export function TemplateList({ templates }: { templates: Template[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [isRefreshing, startRefresh] = useTransition();
  const router = useRouter();

  const filtered = templates.filter((template) => {
    if (filter === "all") return true;
    if (filter === "imported") return template.status !== "not_imported";
    return template.status === "not_imported";
  });

  function handleRefresh() {
    startRefresh(async () => {
      await refreshTemplateList();
      router.refresh();
    });
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(value as Filter)}
        >
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="imported">가져옴</TabsTrigger>
            <TabsTrigger value="not_imported">미가져옴</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCwIcon className={isRefreshing ? "animate-spin" : ""} />
          새로고침
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead>생성일</TableHead>
            <TableHead>가격</TableHead>
            <TableHead>공개 설정</TableHead>
            <TableHead className="text-right">상태</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((template) => (
            <TemplateRow key={template.id} template={template} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
