/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  Download, 
  RefreshCcw, 
  AlertCircle,
  CheckCircle2,
  Maximize2,
  X,
  Zap,
  Layers,
  ChevronRight,
  User,
  Sofa,
  Gem,
  Smartphone,
  Shirt,
  Package
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getVariationsForCategory, CATEGORIES, CategoryType, AdVariation } from './constants';
import { generateAdImage } from './services/aiService';

const ICON_MAP: Record<string, any> = {
  Sofa,
  Gem,
  Smartphone,
  Shirt,
  Package
};

export default function App() {
  const [sourceImage, setSourceImage] = useState<{ base64: string; mimeType: string, name: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Furniture');
  const [variations, setVariations] = useState<AdVariation[]>(
    getVariationsForCategory('Furniture').map(type => ({
      ...type,
      id: Math.random().toString(36).substr(2, 9),
      status: 'idle'
    }))
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const base64Data = base64.split(',')[1];
      setSourceImage({
        base64: base64Data,
        mimeType: file.type,
        name: file.name
      });
      // Reset variations when new image is uploaded
      setVariations(getVariationsForCategory(selectedCategory).map(type => ({
        ...type,
        id: Math.random().toString(36).substr(2, 9),
        status: 'idle'
      })));
    };
    reader.readAsDataURL(file);
  }, [selectedCategory]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false
  } as any);

  const handleCategoryChange = (catId: CategoryType) => {
    setSelectedCategory(catId);
    setVariations(getVariationsForCategory(catId).map(type => ({
      ...type,
      id: Math.random().toString(36).substr(2, 9),
      status: 'idle'
    })));
  };

  const handleGenerate = async () => {
    if (!sourceImage) return;
    
    setIsGenerating(true);
    
    // Process variations
    const generatePromises = variations.map(async (variation, index) => {
      setVariations(prev => prev.map((v, i) => i === index ? { ...v, status: 'generating' } : v));
      
      try {
        const imageUrl = await generateAdImage(sourceImage.base64, sourceImage.mimeType, variation.prompt);
        setVariations(prev => prev.map((v, i) => i === index ? { ...v, status: 'completed', imageUrl } : v));
      } catch (error) {
        console.error(`Failed to generate ${variation.type}:`, error);
        setVariations(prev => prev.map((v, i) => i === index ? { ...v, status: 'error' } : v));
      }
    });

    await Promise.all(generatePromises);
    setIsGenerating(false);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4f46e5', '#818cf8', '#312e81']
    });
  };

  const downloadImage = (url: string, label: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `adgenius-${label.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-screen flex flex-col bg-[#09090b] text-zinc-100">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg text-white">A</div>
          <span className="text-xl font-semibold tracking-tight text-white">Ad<span className="text-indigo-500 underline decoration-2 underline-offset-4">Genius</span> Catalog</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right flex flex-col items-end">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter leading-none mb-1">PRO PLAN</p>
            <p className="text-sm font-medium">cadeysey114@gmail.com</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500">
            <User size={18} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Controls */}
        <aside className="w-80 border-r border-zinc-800 p-6 flex flex-col gap-6 bg-zinc-900/20 overflow-y-auto overflow-x-hidden">
          <div>
            <label className="sidebar-label">Product Source</label>
            <div 
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-zinc-900/50 
                hover:border-indigo-500/50 transition-all cursor-pointer group
                ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-700'}
              `}
            >
              <input {...getInputProps()} />
              {sourceImage ? (
                <div className="text-center">
                   <div className="w-12 h-12 bg-zinc-800 rounded-lg mx-auto mb-3 flex items-center justify-center overflow-hidden">
                      <img src={`data:${sourceImage.mimeType};base64,${sourceImage.base64}`} alt="preview" className="w-full h-full object-cover" />
                   </div>
                   <p className="text-sm font-medium text-zinc-200 truncate max-w-[150px]">{sourceImage.name}</p>
                   <p className="text-xs text-indigo-400 mt-1 uppercase tracking-tighter font-bold group-hover:text-indigo-300 transition-colors">Change Product</p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-zinc-400">Upload product</p>
                    <p className="text-xs text-zinc-600 mt-1 uppercase tracking-tighter">for visualization</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <label className="sidebar-label">Product Category</label>
            <div className="grid grid-cols-1 gap-2">
              {CATEGORIES.map(cat => {
                const Icon = ICON_MAP[cat.icon] || Package;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button 
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`
                      w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center gap-3 text-sm
                      ${isSelected 
                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 font-medium' 
                        : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-500 text-zinc-300'}
                    `}
                  >
                    <Icon size={16} className={isSelected ? 'text-indigo-400' : 'text-zinc-500'} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-zinc-800/50">
            <button
              onClick={handleGenerate}
              disabled={!sourceImage || isGenerating}
              className={`
                w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]
                ${!sourceImage || isGenerating 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'}
              `}
            >
              {isGenerating ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  Visualizing...
                </>
              ) : (
                <>
                  Generate Catalog
                  <Zap className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 p-8 overflow-y-auto bg-zinc-950/20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-light tracking-tight text-white flex items-center gap-3">
              Catalog Variants 
              <span className="text-zinc-600 text-lg font-mono">/ {variations.length.toString().padStart(2, '0')}</span>
            </h2>
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 bg-zinc-800 text-zinc-200 rounded-lg text-xs font-bold hover:bg-zinc-700 transition-colors flex items-center gap-2"
                onClick={() => {
                  variations.filter(v => v.imageUrl).forEach(v => downloadImage(v.imageUrl!, v.label));
                }}
              >
                <Download size={14} />
                Download All
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {variations.map((variation, index) => (
                <motion.div
                  key={variation.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 flex flex-col min-h-[280px]"
                >
                  <div className="aspect-video bg-zinc-900 relative flex items-center justify-center overflow-hidden border-b border-zinc-800/50">
                    {/* States */}
                    {variation.status === 'generating' && (
                      <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center z-10 p-6 text-center">
                         <div className="w-12 h-12 relative flex items-center justify-center mb-4">
                            <motion.div 
                              className="absolute inset-0 rounded-full border-t-2 border-indigo-500"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            />
                            <Zap size={20} className="text-indigo-400" />
                         </div>
                         <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Processing</p>
                      </div>
                    )}

                    {variation.status === 'error' && (
                      <div className="flex flex-col items-center justify-center p-6 text-center">
                        <AlertCircle className="text-red-500 opacity-50 mb-3" size={32} />
                        <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Error</p>
                        <p className="text-[10px] text-zinc-500">Service temporarily unavailable</p>
                      </div>
                    )}

                    {variation.imageUrl ? (
                      <>
                        <img 
                          src={variation.imageUrl} 
                          alt={variation.label} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
                           <button 
                             onClick={() => setSelectedImage(variation.imageUrl!)}
                             className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all transform translate-y-2 group-hover:translate-y-0"
                           >
                             <Maximize2 size={18} />
                           </button>
                           <button 
                             onClick={() => downloadImage(variation.imageUrl!, variation.label)}
                             className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full text-xs font-bold text-white transition-all transform translate-y-2 group-hover:translate-y-0 delay-75 shadow-xl shadow-indigo-600/30"
                           >
                             Export Image
                           </button>
                        </div>
                      </>
                    ) : variation.status === 'idle' ? (
                      <div className="flex flex-col items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity p-8 text-center bg-zinc-950/20 w-full h-full">
                         <div className="w-32 h-32 bg-zinc-800/30 rounded-full blur-3xl absolute -z-10 group-hover:bg-indigo-600/10 transition-colors"></div>
                         <p className="font-serif italic text-zinc-500 relative text-xl mb-2">{variation.label}</p>
                         <p className="text-[10px] uppercase tracking-[3px] font-bold text-zinc-600">Pending</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="p-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex flex-col">
                       <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-0.5">
                         {(index + 1).toString().padStart(2, '0')} . {variation.type}
                       </span>
                       <h3 className="text-xs font-bold text-zinc-200">{variation.label}</h3>
                    </div>
                    {variation.status === 'completed' && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Bottom Bar */}
      <footer className="h-10 bg-zinc-950 border-t border-zinc-800 flex items-center px-8 justify-between flex-shrink-0">
        <div className="flex items-center gap-4 text-[10px] text-zinc-500 uppercase tracking-[2px]">
          <span className="flex items-center gap-1.5">
            GPU Status: <span className="text-emerald-500 font-bold">OPTIMAL</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
          <span>Cloud Compute: Connected</span>
        </div>
        <div className="text-[10px] text-zinc-600 font-mono">
          AdGenius-v2.2.0-stbl
        </div>
      </footer>

      {/* Fullscreen Preview */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-[#09090b]/95 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-8 right-8 text-zinc-400 hover:text-white transition-colors">
              <X size={32} />
            </button>
            <motion.div
              layoutId="fullscreen-image"
              className="relative max-w-7xl w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage} 
                alt="Enlarged variant" 
                className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_100px_rgba(79,70,229,0.2)]"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


