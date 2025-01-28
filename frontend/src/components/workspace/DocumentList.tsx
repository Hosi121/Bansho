import React from 'react';
import { File, Plus } from 'lucide-react';
import { Document } from '@/types/document';
import { useRouter } from 'next/navigation';

interface DocumentListProps {
    documents: Document[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

const DocumentList = ({ documents, selectedId, onSelect }: DocumentListProps) => {
    const router = useRouter();

    return (
        <div className="flex flex-col h-full">
            {/* 新規作成ボタン */}
            <div className="p-4">
                <button
                    onClick={() => router.push('/editor')}
                    className="w-full h-10 bg-[#7B8CDE] hover:bg-[#8E9DE5] text-white rounded-lg 
            flex items-center justify-center text-sm font-medium transition-all duration-200 
            transform hover:scale-[1.02] active:bg-[#6B7BD0]"
                >
                    <Plus size={18} className="mr-2" strokeWidth={2.5} />
                    新しい文書を作成
                </button>
            </div>

            {/* ドキュメントリスト */}
            <div className="flex-1 overflow-y-auto px-3">
                <div className="space-y-1">
                    {documents.map((doc) => (
                        <button
                            key={doc.id}
                            onClick={() => onSelect(doc.id)}
                            className={`w-full px-3 py-2 rounded-lg text-left transition-all duration-200
                ${selectedId === doc.id
                                    ? 'bg-[#7B8CDE]/20 text-white'
                                    : 'text-gray-300 hover:bg-white/5'
                                }`}
                        >
                            <div className="flex items-start">
                                <File
                                    size={16}
                                    className={`mr-2 mt-0.5 flex-shrink-0
                    ${selectedId === doc.id ? 'text-[#7B8CDE]' : 'text-gray-400'}`}
                                />
                                <div>
                                    <div className="text-sm font-medium line-clamp-1">
                                        {doc.title}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        {new Date(doc.updatedAt).toLocaleDateString('ja-JP', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DocumentList;