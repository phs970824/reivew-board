"use client";

import { useEffect, useMemo, useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { API_URL } from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";

type PostEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function PostEditor({ value, onChange }: PostEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
        ],
        handlers: {
          image() {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) {
                return;
              }

              const token = getStoredToken();
              if (!token) {
                window.alert("로그인 후 이미지를 올릴 수 있습니다.");
                return;
              }

              const formData = new FormData();
              formData.append("file", file);

              const response = await fetch(`${API_URL}/api/upload`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
              });
              const data = (await response.json()) as {
                url?: string;
                message?: string;
              };

              if (!response.ok || !data.url) {
                window.alert(data.message ?? "이미지 업로드에 실패했습니다.");
                return;
              }

              const editor = quillRef.current?.getEditor();
              if (!editor) {
                return;
              }

              const range = editor.getSelection(true);
              editor.insertEmbed(range.index, "image", data.url);
              editor.setSelection(range.index + 1);
            };
            input.click();
          },
        },
      },
    }),
    [],
  );

  useEffect(() => {
    const root = wrapRef.current?.querySelector(".ql-editor");
    if (!root) {
      return;
    }

    function onCompositionStart() {
      root.classList.add("ql-composing");
    }

    function onCompositionEnd() {
      root.classList.remove("ql-composing");
    }

    root.addEventListener("compositionstart", onCompositionStart);
    root.addEventListener("compositionend", onCompositionEnd);
    return () => {
      root.removeEventListener("compositionstart", onCompositionStart);
      root.removeEventListener("compositionend", onCompositionEnd);
    };
  }, []);

  return (
    <div ref={wrapRef}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder="방문한 맛집 후기를 적어 주세요."
      />
    </div>
  );
}
