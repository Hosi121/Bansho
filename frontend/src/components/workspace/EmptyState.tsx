import { FileText, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const EmptyState = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="bg-[#232429] rounded-2xl p-8 max-w-md w-full">
        <div className="w-16 h-16 bg-[#2A2B32] rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">
          文書がありません
        </h3>
        <p className="text-gray-400 mb-8">
          新しい文書を作成して、知識の整理を始めましょう
        </p>
        <button
          onClick={() => router.push('/editor')}
          className="flex items-center justify-center gap-2 w-full h-12 bg-[#7B8CDE] text-white rounded-lg font-medium 
            hover:bg-[#8E9DE5] active:bg-[#6B7BD0] transition-all duration-200 
            transform hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5" />
          新しい文書を作成
        </button>
      </div>
    </div>
  );
};

export default EmptyState;