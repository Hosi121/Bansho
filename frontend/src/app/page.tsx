"use client";

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Network, Brain, Edit, Layers,
  ChevronDown, Box, FileText, Sparkles, LucideIcon, Eye, Github
} from 'lucide-react';

interface HeaderProps {
  scrollProgress: MotionValue<number>;
}

interface MousePosition {
  x: number;
  y: number;
}

interface FeaturePointProps {
  icon: LucideIcon;
  text: string;
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const [, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });

  // カラースキームを強制的にダークに設定
  useEffect(() => {
    document.documentElement.style.colorScheme = 'dark';
    document.documentElement.style.backgroundColor = '#1A1B23';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <SplashScreen />
      <div className="relative bg-[#1A1B23]">
        <Header scrollProgress={scrollYProgress} />
        <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory">
          {/* Hero Section */}
          <section className="snap-start h-screen w-full flex items-center justify-center relative overflow-hidden">
            <FloatingElements />
            <div className="absolute inset-0 bg-gradient-radial from-[#1A1B23] via-[#1A1B23] to-[#232429]" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center z-10 max-w-4xl mx-auto px-4"
            >
              <motion.h1
                className="text-7xl font-bold text-white mb-8 tracking-tight"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                知識を、立体的に
              </motion.h1>
              <motion.p
                className="text-xl text-gray-300 mb-12 leading-relaxed"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                BANSHOは、あなたのアイデアと知識を繋ぎ、
                新たな発見を生み出す次世代の知識管理プラットフォームです。
              </motion.p>
              <StartButton />
              <ScrollIndicator />
            </motion.div>
          </section>

          {/* Connect Section */}
          <section className="snap-start h-screen w-full flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0">
              <motion.div
                className="absolute inset-0 bg-[#232429]"
                style={{
                  background: "radial-gradient(circle at 30% 50%, #7B8CDE 0%, transparent 40%),radial-gradient(circle at 70% 50%, #1A1B23 0%, #232429 100%)"
                }}
              />
            </div>
            <div className="max-w-7xl mx-auto px-4 z-10">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="grid lg:grid-cols-2 gap-16 items-center"
              >
                <div>
                  <motion.h2
                    className="text-5xl font-bold text-white mb-8"
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                  >
                    繋げる・整える・発見する
                  </motion.h2>
                  <motion.p
                    className="text-xl text-gray-300 mb-8 leading-relaxed"
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    ドキュメント間の「繋がり」を可視化し、AIが自動で関連性を分析。
                    散らばった情報を整理し、新しい知的体験を提供します。
                  </motion.p>
                  <div className="space-y-4">
                    <FeaturePoint icon={Network} text="知識のネットワークを構築" />
                    <FeaturePoint icon={Layers} text="自動で整理・最適化" />
                    <FeaturePoint icon={Sparkles} text="新たな関連性を発見" />
                  </div>
                </div>
                <NetworkVisualization />
              </motion.div>
            </div>
          </section>

          {/* Write Section */}
          <section className="snap-start h-screen w-full flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A1B23] to-[#232429]" />
            <div className="max-w-7xl mx-auto px-4 z-10">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <EditorPreview />
                <div>
                  <motion.h2
                    className="text-5xl font-bold text-white mb-8"
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                  >
                    楽々、書ける
                  </motion.h2>
                  <motion.p
                    className="text-xl text-gray-300 mb-8 leading-relaxed"
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    高度なエディタ機能とAIによる執筆支援で、
                    あなたのアイデアを自由に表現できます。
                  </motion.p>
                  <div className="space-y-4">
                    <FeaturePoint icon={Edit} text="高度なテキストエディタ" />
                    <FeaturePoint icon={FileText} text="リアルタイムプレビュー" />
                    <FeaturePoint icon={Brain} text="AI執筆支援" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Visualize Section */}
          <section className="snap-start h-screen w-full flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0">
              <motion.div
                className="absolute inset-0"
                style={{
                  background: "radial-gradient(circle at 70% 50%, #7B8CDE 0%, transparent 40%),radial-gradient(circle at 30% 50%, #1A1B23 0%, #232429 100%)"
                }}
              />
            </div>
            <div className="max-w-7xl mx-auto px-4 z-10">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <motion.h2
                    className="text-5xl font-bold text-white mb-8"
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                  >
                    立体的に見える
                  </motion.h2>
                  <motion.p
                    className="text-xl text-gray-300 mb-8 leading-relaxed"
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    3次元空間で知識のつながりを可視化。
                    インタラクティブな操作で、新しい視点を発見できます。
                  </motion.p>
                  <div className="space-y-4">
                    <FeaturePoint icon={Eye} text="3D可視化" />
                    <FeaturePoint icon={Box} text="自由な視点操作" />
                  </div>
                </div>
                <ThreeDVisualization />
              </div>
            </div>
          </section>

          {/* Final CTA Section */}
          <div className="snap-start bg-[#1A1B23]">
            <section className="snap-start h-screen w-full flex items-center justify-center relative overflow-hidden">
              <FloatingElements />
              <div className="absolute inset-0 bg-gradient-radial from-[#1A1B23] to-[#232429]" />
              <div className="max-w-4xl mx-auto px-4 text-center z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="space-y-8"
                >
                  <h2 className="text-5xl font-bold text-white mb-8">
                    あなたの知識を、新たな次元へ
                  </h2>
                  <p className="text-xl text-gray-300 mb-12">
                    BANSHOで、知識管理の未来を体験しましょう
                  </p>
                  <StartButton />
                </motion.div>
              </div>
            </section>

            <footer className="bg-[#1A1B23] border-t border-white/10 py-8">
              <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="flex flex-col items-center gap-4 mb-4">
                  <Link
                    href="https://github.com/Hosi121/Bansho"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <Github size={20} />
                    GitHub
                  </Link>
                </div>
                <p className="text-gray-400 text-sm">
                  Built with Webデザイン2024
                </p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const nodes = [
    { cx: 100, cy: 100, r: 12, delay: 0.2 }, // 中心ノード
    { cx: 65, cy: 85, r: 8, delay: 0.4 },    // 左上
    { cx: 148, cy: 63, r: 8, delay: 0.5 },   // 右上
    { cx: 52, cy: 142, r: 8, delay: 0.6 },   // 左下
    { cx: 155, cy: 125, r: 8, delay: 0.7 },  // 右下
    { cx: 105, cy: 45, r: 8, delay: 0.8 },   // 上
    { cx: 88, cy: 158, r: 8, delay: 0.9 },   // 下
  ];

  const edges = [
    { start: nodes[0], end: nodes[1] }, // 中心から左上
    { start: nodes[0], end: nodes[2] }, // 中心から右上
    { start: nodes[0], end: nodes[3] }, // 中心から左下
    { start: nodes[0], end: nodes[4] }, // 中心から右下
    { start: nodes[0], end: nodes[5] }, // 中心から上
    { start: nodes[0], end: nodes[6] }, // 中心から下
  ];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 1.1
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onAnimationComplete={() => {
        if (!isVisible) {
          document.getElementById('splash-screen')?.classList.add('hidden');
        }
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1B23]"
      id="splash-screen"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mb-8 relative w-48 h-48 mx-auto">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
          >
            {/* エッジ */}
            {edges.map((edge, index) => (
              <motion.path
                key={`edge-${index}`}
                d={`M${edge.start.cx},${edge.start.cy} L${edge.end.cx},${edge.end.cy}`}
                stroke="#7B8CDE"
                strokeWidth="2"
                strokeOpacity="0.4"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: edge.end.delay, duration: 0.6 }}
              />
            ))}

            {/* ノード */}
            {nodes.map((node, index) => (
              <motion.circle
                key={`node-${index}`}
                cx={node.cx}
                cy={node.cy}
                r={node.r}
                fill="#7B8CDE"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: index === 0 ? 1 : 0.8 }}
                transition={{ delay: node.delay, duration: 0.4 }}
              />
            ))}
          </svg>
        </div>
        <motion.h1
          className="text-4xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          BANSHO
        </motion.h1>
      </motion.div>
    </motion.div>
  );
};

const Header = ({ scrollProgress }: HeaderProps) => {
  const headerOpacity = useTransform(scrollProgress, [0, 0.1], [0, 1]);

  return (
    <motion.header
      style={{ opacity: headerOpacity }}
      className="fixed top-0 w-full bg-[#1A1B23]/80 backdrop-blur-sm border-b border-white/10 z-50"
    >
      <nav className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-white">
          BANSHO
        </Link>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            ログイン
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-[#7B8CDE] text-white rounded-lg hover:bg-[#8E9DE5] 
              transition-all duration-300 hover:scale-105"
          >
            アカウント作成
          </Link>
        </div>
      </nav>
    </motion.header>
  );
};

const FeaturePoint = ({ icon: Icon, text }: FeaturePointProps) => (
  <motion.div
    className="flex items-center gap-3"
    initial={{ x: -20, opacity: 0 }}
    whileInView={{ x: 0, opacity: 1 }}
    viewport={{ once: true }}
  >
    <div className="p-2 bg-[#7B8CDE]/20 rounded-lg">
      <Icon className="text-[#7B8CDE]" size={24} />
    </div>
    <span className="text-gray-300">{text}</span>
  </motion.div>
);

const NetworkVisualization = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="relative aspect-square bg-[#1A1B23]/50 rounded-xl border border-white/10 backdrop-blur-sm p-8"
  >
    <svg
      viewBox="0 0 400 400"
      className="w-full h-full"
      style={{ filter: 'drop-shadow(0 0 8px rgba(123, 140, 222, 0.2))' }}
    >
      {/* エッジ（線） */}
      <g stroke="#7B8CDE" strokeWidth="2" strokeOpacity="0.3">
        <path d="M200 140 L140 220" />
        <path d="M200 140 L260 220" />
        <path d="M170 250 L230 250" />
      </g>

      {/* ドキュメントノード */}
      <g>
        {/* 中央上のドキュメント */}
        <g transform="translate(170, 80)">
          <rect width="60" height="60" rx="8" fill="#7B8CDE" fillOpacity="0.2" stroke="#7B8CDE" strokeWidth="2" />
          <path d="M12 15 h36 M12 30 h24 M12 45 h30" stroke="#7B8CDE" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* 左のドキュメント */}
        <g transform="translate(110, 220)">
          <rect width="60" height="60" rx="8" fill="#7B8CDE" fillOpacity="0.2" stroke="#7B8CDE" strokeWidth="2" />
          <path d="M12 15 h36 M12 30 h24 M12 45 h30" stroke="#7B8CDE" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* 右のドキュメント */}
        <g transform="translate(230, 220)">
          <rect width="60" height="60" rx="8" fill="#7B8CDE" fillOpacity="0.2" stroke="#7B8CDE" strokeWidth="2" />
          <path d="M12 15 h36 M12 30 h24 M12 45 h30" stroke="#7B8CDE" strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  </motion.div>
);

const EditorPreview = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="relative aspect-video bg-[#1A1B23]/50 rounded-xl border border-white/10 backdrop-blur-sm p-8"
  >
    <div className="flex gap-2 mb-4">
      <div className="w-3 h-3 rounded-full bg-red-500" />
      <div className="w-3 h-3 rounded-full bg-yellow-500" />
      <div className="w-3 h-3 rounded-full bg-green-500" />
    </div>
    <div className="flex gap-4 h-full">
      <div className="flex-1 bg-[#1A1B23] rounded-lg p-4">
        <div className="space-y-2">
          <div className="w-3/4 h-4 bg-white/10 rounded" />
          <div className="w-1/2 h-4 bg-white/10 rounded" />
          <div className="w-2/3 h-4 bg-white/10 rounded" />
        </div>
      </div>
      <div className="flex-1 bg-[#1A1B23] rounded-lg p-4">
        <div className="space-y-2">
          <div className="w-3/4 h-4 bg-white/20 rounded" />
          <div className="w-1/2 h-4 bg-white/20 rounded" />
          <div className="w-2/3 h-4 bg-white/20 rounded" />
        </div>
      </div>
    </div>
  </motion.div>
);

const ThreeDVisualization = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="relative aspect-square bg-[#1A1B23]/50 rounded-xl border border-white/10 backdrop-blur-sm p-8"
  >
    <svg
      viewBox="0 0 400 400"
      className="w-full h-full"
      style={{ filter: 'drop-shadow(0 0 8px rgba(123, 140, 222, 0.2))' }}
    >
      {/* 中心からの放射状のエッジ */}
      <g>
        <g stroke="#7B8CDE" strokeWidth="2" strokeOpacity="0.4">
          <path d="M200 200 Q 150 180, 100 150" fill="none" />
          <path d="M200 200 Q 250 180, 300 150" fill="none" />
          <path d="M200 200 Q 180 250, 150 300" fill="none" />
          <path d="M200 200 Q 220 250, 250 300" fill="none" />
          <path d="M200 200 Q 180 150, 150 100" fill="none" />
          <path d="M200 200 Q 220 150, 250 100" fill="none" />
        </g>
      </g>

      {/* ノード */}
      <g>
        {/* メインノード */}
        <circle cx="200" cy="200" r="20" fill="#7B8CDE" fillOpacity="0.8" />

        {/* 周囲のノード */}
        <circle cx="100" cy="150" r="15" fill="#7B8CDE" fillOpacity="0.6" />
        <circle cx="300" cy="150" r="15" fill="#7B8CDE" fillOpacity="0.6" />
        <circle cx="150" cy="300" r="15" fill="#7B8CDE" fillOpacity="0.6" />
        <circle cx="250" cy="300" r="15" fill="#7B8CDE" fillOpacity="0.6" />

        {/* 奥のノード */}
        <circle cx="150" cy="100" r="10" fill="#7B8CDE" fillOpacity="0.4" />
        <circle cx="250" cy="100" r="10" fill="#7B8CDE" fillOpacity="0.4" />
      </g>
    </svg>
  </motion.div>
);

const StartButton = () => (
  <div className="flex justify-center gap-4">
    <Link
      href="/register"
      className="px-8 py-4 bg-[#7B8CDE] text-white rounded-lg font-medium 
        hover:bg-[#8E9DE5] transition-all duration-300 hover:scale-105
        flex items-center"
    >
      今すぐ始める
      <ArrowRight className="ml-2" />
    </Link>
  </div>
);

const ScrollIndicator = () => (
  <motion.div
    animate={{ y: [0, 10, 0] }}
    transition={{ repeat: Infinity, duration: 2 }}
    className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
  >
    <ChevronDown className="text-white/50" size={32} />
  </motion.div>
);

const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 10 + 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
};