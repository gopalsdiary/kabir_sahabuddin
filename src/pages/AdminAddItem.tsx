import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle,
  ImageIcon,
  Type,
  Layout,
  Loader2
} from 'lucide-react';

import { SECTION_CONFIG } from '../lib/gallery';

const IMGBB_API_KEY = '03cd19c7e6990d72a74e764559101b63';

export default function AdminAddItem() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [section, setSection] = useState('photography_1');
  const [files, setFiles] = useState<File[]>([]);
  const [directUrl, setDirectUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const uploadToImgBB = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGBB_API_KEY);
    const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (!data.success) throw new Error('ImgBB Upload failed');
    return {
      url: data.data.url,
      mediumUrl: data.data.medium?.url || data.data.thumb?.url || data.data.url
    };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatus('Initializing entry secure connection...');

    try {
      if (files.length === 0 && !directUrl) {
        throw new Error('Selection required: Image files or Direct URL');
      }

      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const currentFile = files[i];
          setStatus(`Processing and uploading image ${i + 1} of ${files.length}...`);
          
          const { url, mediumUrl } = await uploadToImgBB(currentFile);

          const { error: dbError } = await supabase.from('kabirdatabase').insert([{
            title: files.length > 1 ? `${title} ${i + 1}`.trim() : title,
            description,
            section,
            image_url: url,
            thumbnail_url: mediumUrl
          }]);

          if (dbError) throw dbError;
        }
      } else {
        setStatus('Saving Direct URL...');
        const { error: dbError } = await supabase.from('kabirdatabase').insert([{
          title,
          description,
          section,
          image_url: directUrl,
          thumbnail_url: directUrl
        }]);
        if (dbError) throw dbError;
      }

      setStatus('Success! Integration Complete');
      setTimeout(() => navigate('/admin/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-12">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-[var(--text-dim)] hover:text-[var(--text)] transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[9px] font-black uppercase tracking-widest">Return to Dashboard</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12">
          {/* Form Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="space-y-3">
               <h1 className="text-3xl font-black uppercase tracking-tighter">Add New Record</h1>
               <p className="text-[9px] text-[var(--text-dim)] font-bold uppercase tracking-[0.2em] max-w-sm leading-relaxed">
                  Populate the gallery with high-fidelity visual assets. Automatic optimization and synchronization enabled.
               </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-4">Section Identity</label>
                    <div className="relative">
                      <Layout className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" size={16} />
                      <select 
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="w-full bg-black/[0.03] border border-transparent focus:border-black/10 rounded-2xl py-4 px-14 transition-all focus:outline-none text-xs font-bold appearance-none uppercase tracking-widest cursor-pointer"
                      >
                         {Object.entries(SECTION_CONFIG).map(([id, config]) => (
                           <option key={id} value={id}>{config.name}</option>
                         ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-4">Title Identity</label>
                    <div className="relative">
                      <Type className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" size={16} />
                      <input 
                        type="text"
                        placeholder="Untitled Entry"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-black/[0.03] border border-transparent focus:border-black/10 rounded-2xl py-4 px-14 transition-all focus:outline-none text-xs font-bold uppercase tracking-widest placeholder:text-black/10"
                      />
                    </div>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-4">Description</label>
                  <textarea 
                    placeholder="Provide additional metadata or context..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-black/[0.03] border border-transparent focus:border-black/10 rounded-2xl py-5 px-6 transition-all focus:outline-none text-xs font-medium min-h-[100px] placeholder:text-black/10"
                  />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-4">Direct File</label>
                    <div className="relative group cursor-pointer">
                      <Upload className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" size={16} />
                      <input 
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const selectedFiles = Array.from(e.target.files || []);
                          if (selectedFiles.length > 5) {
                            alert('You can only upload up to 5 photos at a time.');
                            setFiles(selectedFiles.slice(0, 5));
                          } else {
                            setFiles(selectedFiles);
                          }
                        }}
                        className="w-full bg-black/[0.03] border border-dashed border-black/10 group-hover:border-[var(--primary)] rounded-2xl py-4 px-14 transition-all focus:outline-none text-[10px] font-bold uppercase opacity-0 absolute inset-0 cursor-pointer"
                      />
                      <div className="bg-black/[0.03] border border-dashed border-black/10 group-hover:bg-white group-hover:border-[var(--primary)] group-hover:shadow-xl group-hover:shadow-[var(--primary)]/10 rounded-2xl py-4 px-14 transition-all text-[10px] font-black uppercase tracking-tighter text-[var(--text-dim)] group-hover:text-black truncate">
                         {files.length > 0 ? `${files.length} file(s) selected (max 5)` : 'Select HD Media (up to 5)'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] ml-4">Remote Link</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" size={16} />
                      <input 
                        type="url"
                        placeholder="https://server.com/img.jpg"
                        value={directUrl}
                        onChange={(e) => setDirectUrl(e.target.value)}
                        className="w-full bg-black/[0.03] border border-transparent focus:border-black/10 rounded-2xl py-4 px-14 transition-all focus:outline-none text-xs font-bold uppercase tracking-widest placeholder:text-black/10"
                      />
                    </div>
                  </div>
               </div>

               <div className="pt-4 flex flex-col items-center gap-4">
                  <button 
                    disabled={loading || (files.length === 0 && !directUrl)}
                    type="submit"
                    className="w-full max-w-sm bg-black text-white rounded-2xl py-5 font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:gap-6 transition-all disabled:opacity-20 shadow-xl shadow-black/10"
                  >
                    {loading ? 'Initializing...' : 'Deploy to Database'}
                  </button>
                  
                  <AnimatePresence mode="wait">
                    {status && (
                      <motion.div 
                        key="status-msg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest"
                      >
                         <CheckCircle2 size={14} className="animate-pulse" />
                         {status}
                      </motion.div>
                    )}
                    {error && (
                      <motion.div 
                        key="error-msg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest"
                      >
                         <AlertCircle size={14} />
                         {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

               </div>
            </form>
          </motion.div>

          {/* Preview Sidebar */}
          <aside className="hidden lg:block space-y-8 sticky top-32 h-fit">
             <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)] ml-4">Live Preview</h3>
                <div className="aspect-[4/5] bg-black/[0.03] rounded-[3rem] border border-black/5 overflow-hidden flex items-center justify-center group relative shadow-2xl shadow-black/5">
                   {files.length > 0 ? (
                     <img 
                       src={URL.createObjectURL(files[0])} 
                       className="w-full h-full object-cover" 
                       alt="Preview" 
                     />
                   ) : directUrl ? (
                     <img 
                       src={directUrl} 
                       className="w-full h-full object-cover" 
                       alt="Preview" 
                     />
                   ) : (
                     <div className="flex flex-col items-center gap-3 opacity-20">
                        <ImageIcon size={48} />
                        <span className="text-[10px] font-black uppercase tracking-widest">No Media</span>
                     </div>
                   )}
                   {files.length > 1 && (
                     <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-md">
                       + {files.length - 1} more
                     </div>
                   )}
                   
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end">
                      <p className="text-[10px] font-black uppercase text-white/50 tracking-widest">{section}</p>
                      <h4 className="text-xl font-black text-white uppercase">{title || 'Entry Preview'}</h4>
                   </div>
                </div>
             </div>
             
             <div className="p-8 bg-black/5 rounded-[2.5rem] border border-black/5 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-black">Security Protocol</h4>
                <p className="text-[11px] leading-relaxed text-[var(--text-dim)] font-medium">
                  Entries are globally indexed. Ensure all metadata adheres to platform standards.
                </p>
             </div>
          </aside>
        </div>
      </div>

      {/* Uploading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-6">
               <div className="relative">
                 <Loader2 className="w-12 h-12 text-black animate-spin" />
                 <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-black/5 rounded-full filter blur-xl"
                 />
               </div>
               <div className="flex flex-col items-center gap-1">
                 <h2 className="text-sm font-black uppercase tracking-[0.3em] text-black">Deploying Record</h2>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)] animate-pulse">
                    {status || 'Synchronizing with registry...'}
                 </p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

  );
}
