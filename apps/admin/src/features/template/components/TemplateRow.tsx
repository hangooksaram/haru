"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { ImportActionButton } from "@/features/template/components/ImportActionButton";
import { TemplateActiveToggle } from "@/features/template/components/TemplateActiveToggle";
import { TemplatePriceInput } from "@/features/template/components/TemplatePriceInput";
import type { Template } from "@/features/template/types";

const STATUS_LABEL: Record<Template["status"], string> = {
  not_imported: "가져오지 않음",
  imported: "최신",
  changed: "외부 변경됨",
};

export function TemplateRow({ template }: { template: Template }) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = template.status !== "not_imported";

  return (
    <>
      <TableRow>
        <TableCell>
          <button
            type="button"
            onClick={() => canExpand && setExpanded((prev) => !prev)}
            disabled={!canExpand}
            className="flex items-center gap-1 text-left disabled:opacity-60"
          >
            {canExpand ? (
              expanded ? (
                <ChevronDownIcon className="text-muted-foreground size-4 shrink-0" />
              ) : (
                <ChevronRightIcon className="text-muted-foreground size-4 shrink-0" />
              )
            ) : (
              <span className="size-4 shrink-0" />
            )}
            {template.name}
          </button>
        </TableCell>
        <TableCell>
          {new Date(template.createdAt).toLocaleDateString("ko-KR")}
        </TableCell>
        <TableCell>
          {canExpand ? (
            <TemplatePriceInput
              templateId={template.id}
              price={template.price}
            />
          ) : (
            <span className="text-muted-foreground text-xs">
              가져온 뒤 설정 가능
            </span>
          )}
        </TableCell>
        <TableCell>
          {canExpand ? (
            <TemplateActiveToggle
              templateId={template.id}
              isActive={template.isActive}
            />
          ) : (
            <span className="text-muted-foreground text-xs">
              가져온 뒤 설정 가능
            </span>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-end gap-2">
            <Badge
              variant={
                template.status === "not_imported"
                  ? "outline"
                  : template.status === "changed"
                    ? "secondary"
                    : "default"
              }
            >
              {STATUS_LABEL[template.status]}
            </Badge>
            {template.status !== "imported" ? (
              <ImportActionButton
                templateId={template.id}
                mode={template.status === "not_imported" ? "import" : "update"}
              />
            ) : null}
          </div>
        </TableCell>
      </TableRow>
      {expanded && canExpand ? (
        <TableRow>
          <TableCell colSpan={5}>
            <pre className="bg-muted max-h-96 overflow-auto rounded-md p-3 text-xs">
              {JSON.stringify(
                {
                  tags: template.tags,
                  updatedAt: template.updatedAt,
                  elements: template.elements,
                },
                null,
                2,
              )}
            </pre>
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}
