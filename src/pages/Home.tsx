import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Menu,
  Download,
  X,
  LayoutGrid,
  Image as ImageIcon,
  Quote,
  Camera,
  BookOpen,
  Filter,
  ExternalLink,
  ChevronDown,
  MessageSquare,
  Settings
} from 'lucide-react';
import { Photo, fetchAllPhotos, smartShuffle, ImageOptimizer } from '../lib/gallery';
import { supabase } from '../lib/supabase';
import { postService, Account } from '../lib/postService';

export default function Home() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<Account | null>(() => postService.getCurrentUser());
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<Photo[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [siteViews, setSiteViews] = useState<number | null>(null);
  const pageSize = 50;


  useEffect(() => {
    async function loadData() {
      const data = await fetchAllPhotos();
      setPhotos(data);
      setGalleryPhotos(smartShuffle(data));
      setLoading(false);

      // Site View Counter Update
      if (data.length > 0) {
        try {
          const { data: viewData } = await supabase.rpc('increment_site_view', {
            row_id: 106639,
            inc_val: data.length
          });
          if (viewData) setSiteViews(viewData);
        } catch (e) {
          console.warn('View update skipped', e);
        }
      }
    }
    loadData();


    // PWA Install Logic
    const checkStandalone = () => {
      return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    };

    // Detect iOS
    const detectedIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(detectedIOS);

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!checkStandalone()) setShowInstallBanner(true);
    });

    // Forced show for iOS/Unsupported if not installed
    if (!checkStandalone() && detectedIOS) {
      setTimeout(() => setShowInstallBanner(true), 3000);
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
      setShowInstallBanner(false);
    } else if (isIOS) {
      alert('To Install: Tap the "Share" icon (square with arrow) and select "Add to Home Screen" from the menu. 📲');
      setShowInstallBanner(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All', icon: <LayoutGrid size={18} /> },
    { id: 'bangla', name: 'Bangla', icon: <Quote size={18} /> },
    { id: 'english', name: 'English', icon: <Quote size={18} /> },
    { id: 'photography', name: 'Photography', icon: <Camera size={18} /> },
    { id: 'illustrations', name: 'Illustration', icon: <ImageIcon size={18} /> },
    { id: 'stories', name: 'Stories', icon: <BookOpen size={18} /> },
  ];

  const filteredPhotos = useMemo(() => {
    let result = galleryPhotos;
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (searchQuery) {
      result = result.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.section?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [galleryPhotos, selectedCategory, searchQuery]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const paginatedPhotos = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPhotos.slice(start, start + pageSize);
  }, [filteredPhotos, currentPage]);

  const totalPages = Math.ceil(filteredPhotos.length / pageSize);

  const handleDownload = async (photo: Photo) => {
    try {
      const response = await fetch(photo.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(photo.title || 'photo').replace(/\s+/g, '_').toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      window.open(photo.image_url, '_blank');
    }
  };

  const navigatePhoto = (direction: 'next' | 'prev') => {
    if (!selectedPhoto) return;
    const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0) nextIndex = filteredPhotos.length - 1;
    if (nextIndex >= filteredPhotos.length) nextIndex = 0;
    setSelectedPhoto(filteredPhotos[nextIndex]);
    setIsSheetOpen(false);
  };

  useEffect(() => {
    if (!selectedPhoto) setIsSheetOpen(false);
  }, [selectedPhoto]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg)]">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 border-t-4 border-b-4 border-[var(--primary)] rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--primary)] rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[var(--primary)] rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--glass)] backdrop-blur-xl border-b border-[var(--glass-border)] py-3 md:py-4">
        <div className="max-w-[2000px] mx-auto px-4 md:px-8 flex items-center justify-between gap-4 md:gap-8">
          <div className="flex items-center gap-3">
            <motion.img
              whileHover={{ rotate: 10 }}
              src="/favicon-96x96.png"
              alt="Logo"
              className="w-10 h-10 md:w-12 md:h-12 object-contain"
            />
            <h1 className="text-lg md:text-2xl font-black tracking-tighter bg-gradient-to-br from-[var(--text)] to-[var(--text-dim)] bg-clip-text text-transparent hidden sm:block">
              KOBIR LYRICS
            </h1>
          </div>

          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" size={18} />
            <input
              type="text"
              placeholder="Search aesthetics, lyrics, sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--glass-border)] rounded-2xl py-2.5 md:py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-dim)]/40 text-sm md:text-base"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/post')}
              className="flex items-center gap-2 bg-[var(--primary)] hover:opacity-90 text-black px-3 md:px-4 py-2 md:py-2.5 rounded-2xl font-bold text-xs md:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <MessageSquare size={16} />
              <span>Community Posts</span>
            </button>

            {currentUser && (
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--glass-border)] text-[var(--text)] p-1.5 md:px-3 md:py-1.5 rounded-2xl transition shadow-xs cursor-pointer group"
                title="Account Settings"
              >
                <img 
                  src={currentUser.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                  alt={currentUser.name} 
                  className="w-7 h-7 rounded-full object-cover group-hover:scale-105 transition"
                />
                <span className="text-xs font-bold hidden md:inline">{currentUser.name.split(' ')[0]}</span>
                <Settings size={14} className="text-[var(--text-dim)] group-hover:text-[var(--primary)] transition" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Categories Bar */}
      <div className="sticky top-[64px] md:top-[80px] z-30 bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--glass-border)] py-4">
        <div className="max-w-[2000px] mx-auto px-4 md:px-8">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-2xl whitespace-nowrap transition-all duration-300 border text-sm md:text-base font-bold ${selectedCategory === cat.id
                    ? 'bg-[var(--primary)] border-[var(--primary)] text-black shadow-lg scale-105'
                    : 'bg-[var(--surface)] border-[var(--glass-border)] text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                  }`}
              >
                {cat.icon}
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Install Banner */}
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-4 right-4 z-[100] bg-[var(--primary)] text-black p-5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between gap-4 md:max-w-md md:left-1/2 md:-translate-x-1/2"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black/10 rounded-2xl flex items-center justify-center overflow-hidden">
                <img src="/web-app-manifest-192x192.png" className="w-full h-full object-cover" alt="" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-tight">Install  App?</p>
                <p className="text-[10px] font-bold opacity-70"></p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowInstallBanner(false)}
                className="text-[10px] font-black uppercase opacity-40 hover:opacity-100 transition-opacity px-2"
              >
                Later
              </button>
              <button
                onClick={handleInstall}
                className="px-6 py-3 bg-black text-white rounded-2xl text-[10px] font-black uppercase shadow-xl hover:scale-105 transition-transform"
              >
                Install
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-[2000px] mx-auto p-4 md:p-8">
        <div className="masonry-grid">


          {paginatedPhotos.map((photo, i) => (
            <motion.div
              layoutId={photo.id}
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.02, 0.4) }}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative bg-[var(--surface)] border border-[var(--glass-border)] rounded-xl mb-1 overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all sm:rounded-2xl sm:mb-1.5"
            >
              <div className="overflow-hidden bg-[var(--surface-hover)]">
                <img
                  src={ImageOptimizer.getOptimizedUrl(photo.thumbnail_url || photo.image_url, 400, 60)}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-auto group-hover:scale-105 group-hover:blur-sm transition-all duration-700 ease-out"
                />
              </div>

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-between p-4 md:p-6 backdrop-blur-sm">
                <div className="flex justify-end">
                  <div className="p-2 md:p-3 bg-[var(--surface)] border border-[var(--glass-border)] rounded-2xl text-[var(--text)]">
                    <ImageIcon size={18} />
                  </div>
                </div>

                <div className="space-y-1 md:space-y-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="px-2 py-0.5 md:px-3 md:py-1 bg-[var(--primary)] text-black text-[8px] md:text-[10px] font-black uppercase rounded-md md:rounded-lg tracking-widest block w-fit">
                    {photo.category}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-20 flex flex-col items-center gap-6">
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-6 py-3 bg-[var(--surface)] border border-[var(--glass-border)] rounded-2xl font-bold disabled:opacity-20 flex items-center gap-2 hover:bg-[var(--surface-hover)] transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center gap-1 px-4">
                <span className="text-sm font-black uppercase tracking-widest opacity-40">Page</span>
                <span className="text-lg font-black">{currentPage}</span>
                <span className="text-sm font-black uppercase tracking-widest opacity-40">of {totalPages}</span>
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-6 py-3 bg-[var(--primary)] text-black rounded-2xl font-bold disabled:opacity-20 flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-[var(--primary)]/20"
              >
                Next
              </button>
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20">
              Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredPhotos.length)} of {filteredPhotos.length} Items
            </p>
          </div>
        )}

        {filteredPhotos.length === 0 && (
          <div className="py-20 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-xs mx-auto space-y-4"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                <Search size={32} className="text-white/20" />
              </div>
              <h3 className="text-xl font-bold">No results found</h3>
              <p className="text-[var(--text-dim)]">We couldn't find any matches for "{searchQuery}". Try something else?</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="text-[var(--primary)] font-bold decoration-[var(--primary)] underline underline-offset-4"
              >
                Clear all filters
              </button>
            </motion.div>
          </div>
        )}
      </main>

      {/* Lightbox / Details Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white flex items-center justify-center"
          >

            {/* Modal Container (Full Screen Slider) */}
            <div className="w-full h-full relative overflow-hidden flex flex-col">
              {/* Gallery Header (Minimal) */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-b from-white to-transparent sticky top-0 z-[100] w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-black/10 p-0.5">
                    <img src="/favicon-96x96.png" className="w-full h-full rounded-full object-contain" alt="Logo" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black tracking-tight text-[var(--text)] uppercase">Kobir Aesthetics</h4>
                    <p className="text-[10px] text-[var(--text-dim)] font-medium uppercase tracking-widest">{selectedPhoto.section.replace(/_/g, ' ')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="p-3 bg-black/5 hover:bg-black/10 rounded-full text-black transition-colors backdrop-blur-md"
                  >
                    <X size={20} />
                  </button>

                </div>
              </div>

              {/* Main Slider Area (Immersive) */}
              <div className="flex-1 relative flex items-center justify-center overflow-hidden touch-none -mt-20">
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 80) navigatePhoto('prev');
                    else if (info.offset.x < -80) navigatePhoto('next');
                  }}
                  className="w-full h-full flex items-center justify-center p-0 lg:p-12"
                >
                  <motion.img
                    key={selectedPhoto.id}
                    initial={{ opacity: 0, x: 200 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -200 }}
                    transition={{ type: "spring", damping: 30, stiffness: 250 }}
                    src={selectedPhoto.thumbnail_url || selectedPhoto.image_url}
                    className="max-w-full max-h-screen object-contain shadow-[0_30px_60px_rgba(0,0,0,0.1)]"
                  />

                </motion.div>
              </div>

              {/* Dark Draggable Bottom Sheet */}
              <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 500 }}
                dragElastic={0.05}
                initial={{ y: "88%" }}
                animate={{ y: isSheetOpen ? 0 : "88%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                onClick={() => setIsSheetOpen(!isSheetOpen)}
                className="absolute bottom-0 left-0 right-0 z-[90] bg-white border-t border-black/5 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] backdrop-blur-3xl min-h-[80%] overflow-y-auto cursor-grab active:cursor-grabbing pb-20"
              >
                {/* Drag Handle & Visual Hint */}
                <div className="sticky top-0 z-[100] bg-white/50 backdrop-blur-md pb-2">
                  <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto my-6" />
                  {!isSheetOpen && (
                    <div className="flex justify-center mb-2">
                      <p className="text-[10px] uppercase font-black text-black/20 tracking-[0.2em] animate-bounce">Details</p>
                    </div>
                  )}
                </div>

                <div className="max-w-xl mx-auto px-8 pb-12 text-[var(--text)]">
                  <div className="space-y-8">
                    <div className="text-center space-y-4">
                      <span className="px-3 py-1 bg-[var(--primary)] text-black text-[10px] font-black uppercase rounded-lg tracking-widest">
                        {selectedPhoto.category}
                      </span>
                      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text)] uppercase">
                        {selectedPhoto.title || selectedPhoto.section.replace(/_/g, ' ')}
                      </h2>
                    </div>


                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-black/5 border border-black/5 rounded-[2rem] text-center">
                        <p className="text-[10px] uppercase text-[var(--text-dim)] font-black mb-1">Channel</p>
                        <p className="text-sm font-bold text-[var(--text)]">{selectedPhoto.section.replace(/_/g, ' ')}</p>
                      </div>
                      <div className="p-4 bg-black/5 border border-black/5 rounded-[2rem] text-center">
                        <p className="text-[10px] uppercase text-[var(--text-dim)] font-black mb-1">Resolution</p>
                        <p className="text-sm font-bold text-[var(--text)]">Ultra HD</p>
                      </div>
                    </div>


                    {/* Action Buttons */}
                    <div className="space-y-4 pt-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(selectedPhoto); }}
                        className="w-full flex items-center justify-center gap-3 py-5 bg-[var(--primary)] text-black rounded-[2rem] text-base font-black uppercase hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <Download size={24} />
                        Download HD
                      </button>
                    </div>

                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Footer */}
      <footer className="py-6 px-4 text-center border-t border-[var(--glass-border)] bg-white/30 backdrop-blur-xl">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/[0.03] border border-black/5 rounded-xl">
              <img src="/favicon-96x96.png" className="w-5 h-5 object-contain" alt="" />
              <p className="text-black font-black tracking-[0.15em] text-[9px] uppercase">Kobir Lyrics Studio</p>
            </div>

            {siteViews !== null && (
              <div className="px-3 py-1.5 bg-black/[0.02] border border-black/5 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-[9px] font-bold text-black/40 uppercase tracking-[0.1em]">
                    <span className="text-black font-black tracking-tight">{siteViews.toLocaleString()}</span> Images Viewed
                  </p>
                </div>
              </div>
            )}
          </div>

          <motion.a
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
            href="/admin/login"
            className="bg-black text-white px-7 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.25em] shadow-lg shadow-black/10 inline-block"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/admin/login';
            }}
          >
            Admin Login
          </motion.a>
        </div>
      </footer>

    </div>
  );
}
