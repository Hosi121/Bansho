import React from 'react';
import { File, Plus } from 'lucide-react';
import { Document } from '@/types/document';

interface DocumentListProps {
    documents: Document[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

const DocumentList = ({ documents, selectedId, onSelect }: DocumentListProps) => {
    return (
        <div className="flex flex-col h-full">
            {/* New Document Button */}
            <div className="p-3">
                <button className="w-full h-8 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center text-sm">
                    <Plus size={16} className="mr-2" />
                    New Document
                </button>
            </div>

            {/* Sections */}
            <div className="flex-1 overflow-y-auto">
                {/* Folders Section */}
                <div className="px-3 pt-3">
                    <div className="text-xs font-medium text-gray-400 mb-2">FOLDERS</div>
                    <div className="space-y-0.5">
                        <button className="w-full px-2 py-1 text-sm text-gray-300 hover:bg-gray-800 rounded flex items-center">
                            <File size={14} className="mr-2 text-gray-400" />
                            All Documents
                        </button>
                    </div>
                </div>

                {/* Documents Section */}
                <div className="px-3 pt-4">
                    <div className="text-xs font-medium text-gray-400 mb-2">DOCUMENTS</div>
                    <div className="space-y-0.5">
                        {documents.map((doc) => (
                            <button
                                key={doc.id}
                                onClick={() => onSelect(doc.id)}
                                className={`w-full px-2 py-1 text-sm rounded text-left transition-colors
                          ${selectedId === doc.id
                                        ? 'bg-gray-700 text-white'
                                        : 'text-gray-300 hover:bg-gray-800'}`}
                            >
                                {doc.title}
                                <div className="text-xs text-gray-500 mt-0.5">
                                    {new Date(doc.updatedAt).toLocaleDateString()}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentList;