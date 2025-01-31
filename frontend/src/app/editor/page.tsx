"use client";

import React, { useState } from "react";
import Toolbar from "@/components/editor/Toolbar";
import TextEditor from "@/components/editor/TextEditor";
import Viewer from "@/components/editor/Viewer";
import { Document } from "@/types/document";
import AppLayout from "@/components/common/layout/AppLayout";

type UpdateableDocumentField = {
  title: string;
  tags: string[];
  content: string;
};

const EditorPage: React.FC = () => {
  const [document, setDocument] = useState<Document>({
    id: "",
    title: "",
    tags: [],
    content: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 保存中フラグ
  const [isSaving, setIsSaving] = useState(false);

  // ドキュメントの特定のフィールドを更新するヘルパー関数
  const updateDocument = <K extends keyof UpdateableDocumentField>(
    field: K,
    value: UpdateableDocumentField[K]
  ) => {
    setDocument((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date(),
    }));
  };

  // ここで保存処理（POST）を行う
  const handleSaveDocument = async () => {
    setIsSaving(true);

    try {
      // user_id は固定で 1 として送る例
      const payload = {
        user_id: 1,
        title: document.title,
        tags: document.tags,
        content: document.content,
        // createdAt, updatedAt など必要に応じて送る
      };

      const res = await fetch("http://localhost:8080/api/v1/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // エラー応答が返ってきた場合
        const errorData = await res.json();
        console.error("保存に失敗しました:", errorData.error || errorData);
        alert("保存に失敗しました: " + (errorData.error || "不明なエラー"));
      } else {
        // 正常応答が返ってきた場合
        const createdDoc = await res.json();
        console.log("Document created:", createdDoc);
        alert("保存が完了しました");
        // 必要に応じて setDocument で ID を反映するなど
        // setDocument((prev) => ({ ...prev, id: createdDoc.id }));
      }
    } catch (error) {
      console.error("保存中にエラーが発生しました:", error);
      alert("保存中にエラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-3rem)] bg-[#1A1B23] text-white">
        <Toolbar
          title={document.title}
          setTitle={(value) => updateDocument("title", value)}
          tags={document.tags}
          setTags={(value) => updateDocument("tags", value)}
          // 親コンポーネントが持つ保存関数と保存中フラグを渡す
          onSave={handleSaveDocument}
          isSaving={isSaving}
        />
        <div className="flex flex-1">
          <TextEditor
            content={document.content}
            setContent={(value) => updateDocument("content", value)}
          />
          <Viewer content={document.content} />
        </div>
      </div>
    </AppLayout>
  );
};

export default EditorPage;
