'use client';

import React, { useState } from "react";
import Toolbar from "@/components/editor/Toolbar";
import TextEditor from "@/components/editor/TextEditor";
import Viewer from "@/components/editor/Viewer";
import { Document } from "@/types/document";
import AppLayout from "@/components/common/layout/AppLayout";

const EditorPage: React.FC = () => {
  const [document, setDocument] = useState<Document>({
    id: "",
    title: "",
    tags: [],
    content: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const updateDocument = (field: keyof Document, value: any) => {
    setDocument((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date(),
    }));
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-3rem)] bg-[#1A1B23] text-white">
        <Toolbar
          title={document.title}
          setTitle={(value) => updateDocument("title", value)}
          tags={document.tags}
          setTags={(value) => updateDocument("tags", value)}
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