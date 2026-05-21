import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  RefreshCcw, 
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  Image as ImageIcon,
  CheckCircle2,
  X,
  ExternalLink
} from 'lucide-react';
import { Photo, fetchAllPhotos, SECTION_CONFIG } from '../lib/gallery';

export default function AdminDashboard() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const itemsPerPage = 50;

  const navigate = useNavigate();


  useEffect(() => {
    checkAuth();
    loadPhotos();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigate('/admin/login');
  };

  const loadPhotos = async () => {
    setLoading(true);
    const data = await fetchAllPhotos();
    setPhotos(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const filteredPhotos = useMemo(() => {
    return photos.filter(p => {
      const matchSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.section?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSection = selectedSection === 'all' || p.section === selectedSection;
      return matchSearch && matchSection;
    });
  }, [photos, searchQuery, selectedSection]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const { error } = await supabase.from('kabirdatabase').delete().eq('image_iid', id);
    if (!error) loadPhotos();

  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} items?`)) return;
    const { error } = await supabase.from('kabirdatabase').delete().in('image_iid', selectedIds);
    if (!error) {
      loadPhotos();
      setSelectedIds([]);
    }
  };


  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedPhotos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedPhotos.map(p => p.id));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;
    setLoading(true);
    const { error } = await supabase
      .from('kabirdatabase')
      .update({
        title: editingPhoto.title,
        description: editingPhoto.description,
        section: editingPhoto.section
      })
      .eq('image_iid', editingPhoto.id);
    
    if (!error) {
      setEditingPhoto(null);
      loadPhotos();
    } else {
      setLoading(false);
    }
  };

  const paginatedPhotos = useMemo(() => {

    const start = (currentPage - 1) * itemsPerPage;
    return filteredPhotos.slice(start, start + itemsPerPage);
  }, [filteredPhotos, currentPage]);

  const totalPages = Math.ceil(filteredPhotos.length / itemsPerPage);

  const sections = ['all', ...Array.from(new Set(photos.map(p => p.section)))].sort();


  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar - Modern & Sleek */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white/80 backdrop-blur-xl border-r border-indigo-100 p-8 overflow-y-auto hidden lg:block">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
             <h2 className="text-lg font-black uppercase tracking-tighter bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Admin</h2>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Dashboard Panel</p>
          </div>
        </div>

        <nav className="space-y-8">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]/40 mb-4 ml-4">Management</h3>
            <div className="space-y-1">
              {sections.map(section => (
                <button 
                  key={section}
                  onClick={() => {
                    setSelectedSection(section);
                    setCurrentPage(1);
                  }}
                  className={`w-full text-left px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedSection === section 
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/30' 
                    : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                >
                  {SECTION_CONFIG[section]?.name || (section === 'all' ? '✨ All Items' : section.replace(/_/g, ' '))}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="absolute bottom-8 left-8 right-8">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 py-4 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5 group"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-72 min-h-screen">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/5 p-6 md:px-12">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" size={18} />
              <input 
                type="text"
                placeholder="Search database records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-indigo-100 focus:border-indigo-500 rounded-2xl py-3.5 pl-14 pr-6 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-[13px] font-medium shadow-sm"
              />
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
               <button 
                onClick={loadPhotos}
                className="p-3.5 bg-white border border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200 rounded-2xl text-indigo-600 transition-all shadow-sm"
               >
                <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
               </button>
               <button 
                onClick={toggleSelectAll}
                className="p-3.5 bg-white border border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200 rounded-2xl text-indigo-600 transition-all flex items-center gap-2 shadow-sm"
                title="Select All on Page"
               >
                <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                  selectedIds.length > 0 && selectedIds.length === paginatedPhotos.length
                  ? 'bg-indigo-500 border-indigo-500 text-white'
                  : 'border-indigo-200'
                }`}>
                  {selectedIds.length > 0 && selectedIds.length === paginatedPhotos.length && <CheckCircle2 size={12} />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Select Page</span>
               </button>

               <button 
                onClick={() => navigate('/admin/add')}

                className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
               >
                <Plus size={20} />
                Add Record
               </button>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-12 max-w-[1600px] mx-auto">
           {/* Mobile/Device Section Pills */}
           <div className="flex lg:hidden overflow-x-auto pb-6 gap-2 no-scrollbar -mx-6 px-6">
              {sections.map(section => (
                <button 
                  key={section}
                  onClick={() => {
                    setSelectedSection(section);
                    setCurrentPage(1);
                  }}
                  className={`flex-shrink-0 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    selectedSection === section 
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-lg shadow-indigo-500/30' 
                    : 'bg-white text-slate-500 border-indigo-100 hover:border-indigo-300 shadow-sm'
                  }`}
                >
                  {SECTION_CONFIG[section]?.name || (section === 'all' ? 'All' : section.replace(/_/g, ' '))}
                </button>
              ))}
           </div>

           <div className="mb-8 flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">
                   {SECTION_CONFIG[selectedSection]?.name || (selectedSection === 'all' ? 'All Global Records' : selectedSection.replace(/_/g, ' '))}
                </h3>
                <p className="text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-widest mt-1">
                   Showing {filteredPhotos.length} items in this directory
                </p>
              </div>
           </div>

           {loading ? (
             <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="w-12 h-12 border-t-4 border-black rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-dim)]">Synchronizing...</p>
             </div>
           ) : (
             <>
               <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-8">
                {paginatedPhotos.map((photo) => (

                  <motion.div 
                    layout
                    key={photo.id}
                    className="group relative bg-white border border-indigo-50 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-200 transition-all duration-300"
                  >
                    <div className="aspect-[4/5] overflow-hidden relative">
                      <img 
                        src={photo.thumbnail_url || photo.image_url} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt=""
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                         <button 
                            onClick={() => setEditingPhoto(photo)}
                            className="p-3 bg-white/20 hover:bg-white/40 rounded-xl text-white backdrop-blur-md"
                         >
                            <Edit3 size={18} />
                         </button>
</div>

                      <button 
                        onClick={() => toggleSelect(photo.id)}
                        className={`absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                          selectedIds.includes(photo.id) 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'bg-black/20 border-white/20 text-white opacity-0 group-hover:opacity-100 hover:bg-white/40'
                        }`}
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    </div>
                    <div className="p-3 space-y-1">
                       <p className="text-[7px] font-black text-[var(--text-dim)] uppercase tracking-wider">{photo.section}</p>
                       <h4 className="text-[9px] font-bold truncate text-[var(--text)] uppercase">{photo.title || 'Untitled'}</h4>
                    </div>
                  </motion.div>
                ))}
             </div>

             {/* Pagination Control */}
             {totalPages > 1 && (
               <div className="mt-12 flex items-center justify-center gap-4">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl disabled:opacity-50 disabled:grayscale transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Page</span>
                     <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-md shadow-indigo-500/20">
                        {currentPage}
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">of {totalPages}</span>
                  </div>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl disabled:opacity-50 disabled:grayscale transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                  >
                    <ArrowRight size={18} />
                  </button>
               </div>
             )}
           </>
           )}

        </div>
      </main>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-black text-white px-8 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-12"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Selection Mode</span>
              <span className="text-xl font-black italic">{selectedIds.length} ITEMS SELECTED</span>
            </div>
            <div className="flex items-center gap-4 border-l border-white/10 pl-12">
               <button 
                onClick={() => setSelectedIds([])}
                className="text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors"
               >
                Cancel
               </button>
               <button 
                onClick={handleBulkDelete}
                className="flex items-center gap-3 px-8 py-3.5 bg-red-500 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-500/20 hover:scale-105 transition-all"
               >
                <Trash2 size={18} />
                Delete Permanently
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingPhoto && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingPhoto(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] w-full max-w-sm relative z-10 overflow-hidden shadow-2xl"
            >
              <form onSubmit={handleUpdate} className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                   <h2 className="text-base font-black uppercase tracking-tighter">Edit Record</h2>
                   <div className="flex items-center gap-1.5">

                     <button 
                      type="button"
                      onClick={() => {
                        if (confirm('Delete this record permanently?')) {
                          handleDelete(editingPhoto.id);
                          setEditingPhoto(null);
                        }
                      }}
                      className="p-2.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm group"
                      title="Delete Permanently"
                     >
                      <Trash2 size={16} />
                     </button>
                     <button type="button" onClick={() => setEditingPhoto(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                       <X size={18} />
                     </button>
                   </div>
                </div>

                <div className="aspect-[16/10] w-full bg-black/[0.03] rounded-2xl overflow-hidden border border-black/5 flex items-center justify-center">
                   <img src={editingPhoto.image_url} className="w-full h-full object-contain p-2" alt="" />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest ml-3 text-[var(--text-dim)]">Title</label>
                    <input 
                      type="text"
                      value={editingPhoto.title || ''}
                      onChange={(e) => setEditingPhoto({...editingPhoto, title: e.target.value})}
                      className="w-full bg-black/[0.03] border border-transparent focus:border-black/10 rounded-xl py-3 px-4 transition-all focus:outline-none text-[12px] font-bold uppercase tracking-widest"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest ml-3 text-[var(--text-dim)]">Description</label>
                    <textarea 
                      value={editingPhoto.description || ''}
                      onChange={(e) => setEditingPhoto({...editingPhoto, description: e.target.value})}
                      className="w-full bg-black/[0.03] border border-transparent focus:border-black/10 rounded-xl py-3 px-4 transition-all focus:outline-none text-[12px] font-medium min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest ml-3 text-[var(--text-dim)]">Section Selection</label>
                    <div className="relative">
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)] pointer-events-none" size={16} />
                      <select 
                        value={editingPhoto.section || ''}
                        onChange={(e) => setEditingPhoto({...editingPhoto, section: e.target.value})}
                        className="w-full bg-black/[0.03] border border-transparent focus:border-black/10 rounded-xl py-3 pl-4 pr-10 transition-all focus:outline-none text-[11px] font-black uppercase tracking-widest appearance-none cursor-pointer"
                      >
                         {Object.entries(SECTION_CONFIG).map(([id, config]) => (
                           <option key={id} value={id}>{config.name}</option>
                         ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                   <button 
                    type="submit"
                    className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-black/10 active:scale-95 transition-all"
                   >
                    Update Integration
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

