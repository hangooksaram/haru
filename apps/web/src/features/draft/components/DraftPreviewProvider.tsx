"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useDraftId } from "@/features/draft/components/DraftIdProvider";
import { useDraft } from "@/features/draft/hooks/useDraft";
import { useDraftPreview } from "@/features/draft/hooks/useDraftPreview";

import type { DraftPreviewSegment } from "@/features/draft/components/DraftPreviewPanel";
import type { DraftPhoto, DraftSavedText } from "@/features/draft/types";

const EMPTY_PHOTOS: DraftPhoto[] = [];
const EMPTY_TEXTS: DraftSavedText[] = [];
const EMPTY_SEGMENTS: DraftPreviewSegment[] = [];

type DraftPreviewContextValue = ReturnType<typeof useDraftPreview> & {
  segments: DraftPreviewSegment[];
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  setSegments: (segments: DraftPreviewSegment[]) => void;
  setTextsOverride: (texts: DraftSavedText[] | null) => void;
};

const DraftPreviewContext = createContext<DraftPreviewContextValue | null>(
  null,
);

function isSameSegments(a: DraftPreviewSegment[], b: DraftPreviewSegment[]) {
  return (
    a.length === b.length &&
    a.every(
      (segment, index) =>
        segment.name === b[index].name && segment.filled === b[index].filled,
    )
  );
}

type ProviderProps = {
  templateId: string;
  children: React.ReactNode;
};

// 에디터 스텝 사이에서 Preview 인스턴스를 유지한다.
// 스텝을 이동해도 이 Provider는 언마운트되지 않으므로 Preview가 재생성되지 않는다.
export function DraftPreviewProvider({ templateId, children }: ProviderProps) {
  const { draftId } = useDraftId();
  const { data: draft } = useDraft(draftId ?? null);
  const [textsOverride, setTextsOverride] = useState<DraftSavedText[] | null>(
    null,
  );
  const [segments, setSegmentsState] = useState(EMPTY_SEGMENTS);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const setSegments = useCallback((next: DraftPreviewSegment[]) => {
    setSegmentsState((prev) => (isSameSegments(prev, next) ? prev : next));
  }, []);

  const preview = useDraftPreview({
    templateId,
    photos: draft?.photos ?? EMPTY_PHOTOS,
    texts: textsOverride ?? draft?.texts ?? EMPTY_TEXTS,
  });

  const value: DraftPreviewContextValue = {
    ...preview,
    segments,
    isCollapsed,
    setIsCollapsed,
    setSegments,
    setTextsOverride,
  };

  return (
    <DraftPreviewContext.Provider value={value}>
      {children}
    </DraftPreviewContext.Provider>
  );
}

export function useDraftPreviewContext() {
  const context = useContext(DraftPreviewContext);

  if (!context) {
    throw new Error(
      "useDraftPreviewContext는 DraftPreviewProvider 안에서만 사용할 수 있습니다.",
    );
  }

  return context;
}

type BindingProps = {
  segments: DraftPreviewSegment[];
  // 입력 중인 값을 미리보기에 반영하는 스텝만 넘긴다. 없으면 저장된 draft 값을 쓴다.
  texts?: DraftSavedText[];
};

// 스텝이 자신의 요소 목록(segments)과 미리보기용 텍스트를 Provider에 전달한다.
// 스텝이 언마운트되면 전달한 값을 비운다.
export function DraftPreviewBinding({ segments, texts }: BindingProps) {
  const { setSegments, setTextsOverride } = useDraftPreviewContext();

  useEffect(() => {
    setSegments(segments);
  }, [segments, setSegments]);

  useEffect(() => {
    setTextsOverride(texts ?? null);
  }, [texts, setTextsOverride]);

  useEffect(() => {
    return () => {
      setSegments(EMPTY_SEGMENTS);
      setTextsOverride(null);
    };
  }, [setSegments, setTextsOverride]);

  return null;
}
