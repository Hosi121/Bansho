import React from 'react';
import { Search } from 'lucide-react';

const Header = () => {
    return (
        <header className="h-12 bg-[#13141f] border-b border-gray-800">
            <div className="h-full px-4 flex items-center justify-between">
                <h1 className="text-lg text-white font-medium">Bansho</h1>

                <div className="flex-1 max-w-2xl mx-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search documents..."
                            className="w-full h-8 pl-8 pr-4 rounded-md bg-[#1a1b26] border border-gray-700 text-gray-200 
                       placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                </div>

                <div className="w-[200px]" /> {/* バランスを取るためのスペーサー */}
            </div>
        </header>
    );
};

export default Header;