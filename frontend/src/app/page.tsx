import Link from "next/link";
import { ArrowRight, BookOpen, Network, Search } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl font-bold">BANSHO</div>
            <nav className="flex gap-4">
              <Link href="/login" className="px-4 py-2 text-gray-300 hover:text-white">
                ログイン
              </Link>
              <Link 
                href="/register" 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                アカウント作成
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Content */}
          <div className="py-20 text-center">
            <h1 className="text-5xl font-bold mb-6">
              知識を、立体的に。
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              BANSHOは、あなたのメモや知識を3次元で可視化し、新しい気づきを与える次世代の知識マネジメントツールです。
            </p>
            <Link 
              href="/register"
              className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              無料で始める
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 py-20">
            <div className="p-6 bg-gray-800 rounded-2xl shadow-sm border border-gray-700">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <Network className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">3次元での知識の可視化</h3>
              <p className="text-gray-400">
                メモ同士のつながりを立体的に表示し、知識の関係性を直感的に理解できます。
              </p>
            </div>
            <div className="p-6 bg-gray-800 rounded-2xl shadow-sm border border-gray-700">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">シンプルな操作性</h3>
              <p className="text-gray-400">
                Markdownに対応したエディターで、素早く効率的にメモを取ることができます。
              </p>
            </div>
            <div className="p-6 bg-gray-800 rounded-2xl shadow-sm border border-gray-700">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <Search className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">AIによる知識の連携</h3>
              <p className="text-gray-400">
                AIが自動的にメモ同士の関連性を分析し、新しい発見をサポートします。
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-400">
            <p>© 2025 BANSHO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
