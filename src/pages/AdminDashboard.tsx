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
  ExternalLink,
  MessageSquare,
  Check,
  Clock,
  Phone,
  ThumbsUp,
  Layers,
  Upload,
  Key,
  Lock,
  Settings,
  Users,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { Photo, fetchAllPhotos, SECTION_CONFIG } from '../lib/gallery';
import { postService, Post, Postcard, Account, formatTimeAgo } from '../lib/postService';

export default function AdminDashboard() {
  const [mainTab, setMainTab] = useState<'gallery' | 'posts' | 'postcards' | 'users'>('gallery');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const itemsPerPage = 50;

  // Community Posts Moderation State
  const [communityPosts, setCommunityPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postFilter, setPostFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  // Postcard Templates State
  const [postcards, setPostcards] = useState<Postcard[]>([]);
  const [postcardsLoading, setPostcardsLoading] = useState(false);
  const [isAddPostcardOpen, setIsAddPostcardOpen] = useState(false);
  const [newPostcardTitle, setNewPostcardTitle] = useState('');
  const [newPostcardUrl, setNewPostcardUrl] = useState('');
  const [postcardUploading, setPostcardUploading] = useState(false);

  // Admin Security / Password state
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [adminUpdating, setAdminUpdating] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);

  // User Accounts State (kabirdatabase_account)
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [editingLimitUser, setEditingLimitUser] = useState<Account | null>(null);
  const [newPostLimit, setNewPostLimit] = useState<number>(5);
  const [savingLimit, setSavingLimit] = useState(false);
  const [editingPasswordUser, setEditingPasswordUser] = useState<Account | null>(null);
  const [newUserPassword, setNewUserPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadPhotos();
    loadCommunityPosts();
    loadPostcards();
    loadAccounts();
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

  const loadCommunityPosts = async () => {
    setPostsLoading(true);
    const data = await postService.fetchAllPostsForAdmin();
    setCommunityPosts(data);
    setPostsLoading(false);
  };

  const loadPostcards = async () => {
    setPostcardsLoading(true);
    const cards = await postService.fetchPostcards();
    setPostcards(cards);
    setPostcardsLoading(false);
  };

  const loadAccounts = async () => {
    setAccountsLoading(true);
    const data = await postService.fetchAllAccountsForAdmin();
    setAccounts(data);
    setAccountsLoading(false);
  };

  const togglePasswordVisibility = (userIid: number) => {
    setVisiblePasswords(prev => ({ ...prev, [userIid]: !prev[userIid] }));
  };

  const copyPassword = (text: string, userIid: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(userIid);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveLimit = async () => {
    if (!editingLimitUser) return;
    setSavingLimit(true);
    const ok = await postService.updateAccountLimit(editingLimitUser.user_iid, newPostLimit);
    setSavingLimit(false);
    if (ok) {
      setAccounts(prev => prev.map(a => a.user_iid === editingLimitUser.user_iid ? { ...a, post_limit: newPostLimit } : a));
      setEditingLimitUser(null);
    } else {
      alert('Failed to update post limit');
    }
  };

  const handleSaveUserPassword = async () => {
    if (!editingPasswordUser || !newUserPassword.trim()) return;
    setSavingPassword(true);
    const ok = await postService.updateAccountPasswordByAdmin(editingPasswordUser.user_iid, newUserPassword.trim());
    setSavingPassword(false);
    if (ok) {
      setAccounts(prev => prev.map(a => a.user_iid === editingPasswordUser.user_iid ? { ...a, password: newUserPassword.trim() } : a));
      setEditingPasswordUser(null);
      setNewUserPassword('');
      alert('User password updated successfully!');
    } else {
      alert('Failed to update password');
    }
  };

  const handleDeleteUser = async (userIid: number, name: string) => {
    if (!confirm(`Are you sure you want to delete user "${name}" (ID #${userIid})? This will also remove all their posts!`)) return;
    const ok = await postService.deleteAccountByAdmin(userIid);
    if (ok) {
      setAccounts(prev => prev.filter(a => a.user_iid !== userIid));
      loadCommunityPosts();
    } else {
      alert('Failed to delete user');
    }
  };

  const userPostCounts = useMemo(() => {
    const map: Record<number, number> = {};
    communityPosts.forEach(p => {
      if (p.user_iid) {
        map[p.user_iid] = (map[p.user_iid] || 0) + 1;
      }
    });
    return map;
  }, [communityPosts]);

  const filteredAccounts = useMemo(() => {
    const q = userSearchQuery.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(a => 
      a.name.toLowerCase().includes(q) ||
      a.userid.toLowerCase().includes(q) ||
      String(a.user_iid).includes(q) ||
      (a.whats_app_number && String(a.whats_app_number).includes(q))
    );
  }, [accounts, userSearchQuery]);

  const handleApprovePost = async (postId: number) => {
    const success = await postService.approvePost(postId);
    if (success) {
      setCommunityPosts(prev => prev.map(p => p.post_iid === postId ? { ...p, is_approved: true } : p));
    } else {
      alert('অনুমোদন করা সম্ভব হয়নি।');
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('এই পোস্টটি স্থায়ীভাবে মুছে ফেলতে চান?')) return;
    const success = await postService.deletePost(postId);
    if (success) {
      setCommunityPosts(prev => prev.filter(p => p.post_iid !== postId));
    } else {
      alert('পোস্ট মুছে ফেলতে সমস্যা হয়েছে।');
    }
  };

  const uploadToImgBB = async (imageInput: File | string): Promise<string> => {
    const formData = new FormData();
    formData.append('image', imageInput);
    formData.append('key', '03cd19c7e6990d72a74e764559101b63');
    const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (!data.success || !data.data?.url) {
      throw new Error(data.error?.message || 'ImgBB upload failed');
    }
    return data.data.url;
  };

  const handleUploadPostcardFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPostcardUploading(true);
    try {
      const url = await uploadToImgBB(file);
      setNewPostcardUrl(url);
    } catch (err: any) {
      alert('ImgBB-তে ছবি আপলোড করতে সমস্যা হয়েছে: ' + (err.message || 'Error'));
    } finally {
      setPostcardUploading(false);
    }
  };

  const handleAddPostcard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostcardUrl.trim()) {
      alert('দয়া করে ছবি নির্বাচন করে ImgBB-তে আপলোড করুন');
      return;
    }
    setPostcardUploading(true);
    try {
      let finalUrl = newPostcardUrl.trim();
      // If external URL is provided and not on ImgBB, automatically transfer to ImgBB
      if (!finalUrl.includes('ibb.co')) {
        try {
          finalUrl = await uploadToImgBB(finalUrl);
        } catch (uploadErr) {
          console.warn('Direct URL used as ImgBB transfer failed', uploadErr);
        }
      }

      const res = await postService.addPostcard({
        title: newPostcardTitle.trim() || 'Postcard Background',
        image_url: finalUrl
      });

      if (res) {
        setNewPostcardTitle('');
        setNewPostcardUrl('');
        setIsAddPostcardOpen(false);
        loadPostcards();
      } else {
        alert('পোস্টকার্ড যোগ করা যায়নি।');
      }
    } catch (err: any) {
      alert('ত্রুটি: ' + (err.message || 'পোস্টকার্ড সংরক্ষণে সমস্যা হয়েছে'));
    } finally {
      setPostcardUploading(false);
    }
  };

  const handleDeletePostcard = async (postcardIid: number) => {
    if (!confirm('এই পোস্টকার্ড টেমপ্লেটটি মুছে ফেলতে চান? ব্যবহারকারীরা আর এটি নির্বাচন করতে পারবেন না।')) return;
    const ok = await postService.deletePostcard(postcardIid);
    if (ok) {
      setPostcards(prev => prev.filter(c => c.postcard_iid !== postcardIid));
    } else {
      alert('পোস্টকার্ড মোছা যায়নি।');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const handleUpdateAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminSuccess(null);
    if (!adminNewPassword || adminNewPassword.length < 6) {
      setAdminError('পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (adminNewPassword !== adminConfirmPassword) {
      setAdminError('নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না!');
      return;
    }
    setAdminUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: adminNewPassword });
      if (error) throw error;
      setAdminSuccess('অ্যাডমিন পাসওয়ার্ড সফলভাবে আপডেট হয়েছে!');
      setAdminNewPassword('');
      setAdminConfirmPassword('');
      setTimeout(() => {
        setIsAdminSettingsOpen(false);
        setAdminSuccess(null);
      }, 1500);
    } catch (err: any) {
      setAdminError(err.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে');
    } finally {
      setAdminUpdating(false);
    }
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

  const pendingCount = useMemo(() => communityPosts.filter(p => !p.is_approved).length, [communityPosts]);
  const approvedCount = useMemo(() => communityPosts.filter(p => p.is_approved).length, [communityPosts]);

  const filteredCommunityPosts = useMemo(() => {
    return communityPosts.filter(p => {
      const matchFilter = postFilter === 'all' 
        ? true 
        : postFilter === 'pending' 
          ? !p.is_approved 
          : p.is_approved;
      const matchSearch = !searchQuery.trim() || 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author?.userid?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [communityPosts, postFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar - Modern & Sleek */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white/80 backdrop-blur-xl border-r border-indigo-100 p-8 overflow-y-auto hidden lg:block">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
             <h2 className="text-lg font-black uppercase tracking-tighter bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Admin</h2>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Dashboard Panel</p>
          </div>
        </div>

        <nav className="space-y-6">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-2">মডিউল নির্বাচন</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setMainTab('gallery')}
                className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${
                  mainTab === 'gallery'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/30'
                    : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ImageIcon size={16} />
                  <span>গ্যালারি ছবিসমূহ</span>
                </div>
                <span className="text-[10px] font-bold opacity-80">{photos.length}</span>
              </button>

              <button 
                onClick={() => setMainTab('posts')}
                className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${
                  mainTab === 'posts'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/30'
                    : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare size={16} />
                  <span>কমিউনিটি পোস্ট</span>
                </div>
                {pendingCount > 0 ? (
                  <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
                    {pendingCount}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold opacity-80">{communityPosts.length}</span>
                )}
              </button>

              <button 
                onClick={() => setMainTab('postcards')}
                className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${
                  mainTab === 'postcards'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/30'
                    : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers size={16} />
                  <span>পোস্টকার্ড টেমপ্লেট</span>
                </div>
                <span className="text-[10px] font-bold opacity-80">{postcards.length}</span>
              </button>

              <button 
                onClick={() => setMainTab('users')}
                className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${
                  mainTab === 'users'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/30'
                    : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users size={16} />
                  <span>ইউজার একাউন্ট</span>
                </div>
                <span className="text-[10px] font-bold opacity-80">{accounts.length}</span>
              </button>

              <button 
                onClick={() => navigate('/post')}
                className="w-full flex items-center justify-between px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-100 transition-all"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink size={14} />
                  <span>লাইভ ফিড দেখুন</span>
                </div>
                <span>↗</span>
              </button>
            </div>
          </div>

          {mainTab === 'gallery' && (
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-dim)]/40 mb-3 ml-2">Categories</h3>
              <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                {sections.map(section => (
                  <button 
                    key={section}
                    onClick={() => {
                      setSelectedSection(section);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedSection === section 
                      ? 'bg-indigo-50 text-indigo-700 font-black' 
                      : 'text-slate-500 hover:bg-indigo-50/50 hover:text-indigo-700'
                    }`}
                  >
                    {SECTION_CONFIG[section]?.name || (section === 'all' ? '✨ All Items' : section.replace(/_/g, ' '))}
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="absolute bottom-8 left-8 right-8 space-y-2">
          <button 
            type="button"
            onClick={() => {
              setAdminError(null);
              setAdminSuccess(null);
              setIsAdminSettingsOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2.5 py-3 bg-slate-100 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all cursor-pointer"
          >
            <Key size={14} />
            পাসওয়ার্ড পরিবর্তন
          </button>
          <button 
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 py-3 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5 group cursor-pointer"
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
                onClick={mainTab === 'posts' ? loadCommunityPosts : mainTab === 'postcards' ? loadPostcards : loadPhotos}
                className="p-3.5 bg-white border border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200 rounded-2xl text-indigo-600 transition-all shadow-sm"
                title="রিফ্রেশ করুন"
               >
                <RefreshCcw size={20} className={(mainTab === 'posts' ? postsLoading : mainTab === 'postcards' ? postcardsLoading : loading) ? 'animate-spin' : ''} />
               </button>

               {mainTab === 'gallery' ? (
                 <>
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
                 </>
               ) : mainTab === 'postcards' ? (
                 <button 
                  onClick={() => setIsAddPostcardOpen(true)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                 >
                  <Plus size={18} />
                  <span>নতুন পোস্টকার্ড যুক্ত করুন</span>
                 </button>
               ) : (
                 <button
                  onClick={() => navigate('/post')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#1877F2] to-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                 >
                  <ExternalLink size={16} />
                  <span>লাইভ ফিড দেখুন</span>
                 </button>
               )}
                <button
                  type="button"
                  onClick={() => {
                    setAdminError(null);
                    setAdminSuccess(null);
                    setIsAdminSettingsOpen(true);
                  }}
                  className="flex items-center justify-center p-3.5 bg-slate-100 text-slate-600 hover:text-indigo-600 hover:bg-slate-200 rounded-2xl transition cursor-pointer"
                  title="অ্যাডমিন পাসওয়ার্ড পরিবর্তন"
                >
                  <Key size={16} />
                </button>
             </div>
           </div>
         </header>

        <div className="p-6 md:p-12 max-w-[1600px] mx-auto">
           {/* Mobile Tab Switcher */}
           <div className="flex lg:hidden overflow-x-auto pb-4 gap-2 no-scrollbar -mx-6 px-6">
              <button
                onClick={() => setMainTab('gallery')}
                className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  mainTab === 'gallery'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                🖼️ গ্যালারি ছবি ({photos.length})
              </button>
              <button
                onClick={() => setMainTab('posts')}
                className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  mainTab === 'posts'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                💬 পোস্ট অনুমোদন
                {pendingCount > 0 && (
                  <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMainTab('postcards')}
                className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  mainTab === 'postcards'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                🎴 পোস্টকার্ড টেমপ্লেট ({postcards.length})
              </button>
              <button
                onClick={() => setMainTab('users')}
                className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  mainTab === 'users'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                👥 ইউজার একাউন্ট ({accounts.length})
              </button>
           </div>

           {mainTab === 'posts' ? (
             /* Community Posts Moderation View */
             <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                      কমিউনিটি পোস্ট অনুমোদন ও পরিচালনা
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      মোট পোস্ট: {communityPosts.length} টি | পর্যালোচনার অপেক্ষায়: {pendingCount} টি
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-indigo-100 shadow-sm">
                    <button
                      onClick={() => setPostFilter('pending')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        postFilter === 'pending'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Clock size={13} />
                      <span>অপেক্ষমান ({pendingCount})</span>
                    </button>
                    <button
                      onClick={() => setPostFilter('approved')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        postFilter === 'approved'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle2 size={13} />
                      <span>অনুমোদিত ({approvedCount})</span>
                    </button>
                    <button
                      onClick={() => setPostFilter('all')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                        postFilter === 'all'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      সকল ({communityPosts.length})
                    </button>
                  </div>
                </div>

                {postsLoading ? (
                  <div className="bg-white rounded-3xl p-16 text-center border border-indigo-50 shadow-sm space-y-3">
                    <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-500">পোস্ট তালিকা লোড হচ্ছে...</p>
                  </div>
                ) : filteredCommunityPosts.length === 0 ? (
                  <div className="bg-white rounded-3xl p-16 text-center border border-indigo-50 shadow-sm space-y-2">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <MessageSquare size={24} />
                    </div>
                    <h4 className="font-bold text-slate-800 text-base">কোনো পোস্ট পাওয়া যায়নি</h4>
                    <p className="text-xs text-slate-500">বর্তমানে এই ক্যাটাগরিতে পর্যালোচনার জন্য কোনো পোস্ট নেই।</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCommunityPosts.map((post) => (
                      <div 
                        key={post.post_iid}
                        className="bg-white rounded-3xl border border-indigo-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                      >
                        <div>
                          {/* Card Header */}
                          <div className="p-5 pb-3 border-b border-slate-100 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img 
                                src={post.author?.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                                alt="" 
                                className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-xs"
                              />
                              <div>
                                <h4 className="font-bold text-sm text-slate-900 leading-tight">
                                  {post.author?.name || 'অজ্ঞাতনামা লেখক'}
                                </h4>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                  {post.author?.userid && <span>@{post.author.userid}</span>}
                                  <span>•</span>
                                  <span>{formatTimeAgo(post.created_at)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {post.is_approved ? (
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                  <CheckCircle2 size={12} />
                                  অনুমোদিত
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                  <Clock size={12} />
                                  অপেক্ষমান
                                </span>
                              )}

                              {post.author?.whats_app_number && (
                                <a
                                  href={`https://wa.me/${post.author.whats_app_number}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-7 h-7 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition"
                                  title="WhatsApp"
                                >
                                  <Phone size={12} />
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-5 space-y-2">
                            {post.title && (
                              <h5 className="font-bold text-slate-900 text-sm">
                                {post.title}
                              </h5>
                            )}
                            {post.description && (
                              <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line">
                                {post.description}
                              </p>
                            )}

                            {post.postcard?.image_url ? (
                              <div className="mt-3 relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-200 shadow-sm">
                                <img 
                                  src={post.postcard.image_url} 
                                  alt={post.postcard.title || 'Postcard'} 
                                  className="w-full h-full object-cover brightness-[0.7]" 
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/50 p-4 flex flex-col justify-between text-white">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                                    🎴 {post.postcard.title || 'Postcard Background'}
                                  </span>
                                  <p className="text-xs font-semibold text-white/95 text-center leading-snug line-clamp-4 drop-shadow">
                                    "{post.description}"
                                  </p>
                                  <span className="text-[10px] text-right text-white/70 italic">
                                    — {post.author?.name || 'Author'}
                                  </span>
                                </div>
                              </div>
                            ) : post.image_url ? (
                              <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 max-h-48 flex items-center justify-center">
                                <img 
                                  src={post.image_url} 
                                  alt="" 
                                  className="max-h-48 w-full object-contain" 
                                  loading="lazy"
                                />
                              </div>
                            ) : null}

                            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-3">
                              <span>❤️ {post.like_count} লাইক</span>
                              <span>💬 {(post.user_comment || []).length} মন্তব্য</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                          <button
                            onClick={() => handleDeletePost(post.post_iid)}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                          >
                            <Trash2 size={14} />
                            <span>মুছুন</span>
                          </button>

                          {!post.is_approved ? (
                            <button
                              onClick={() => handleApprovePost(post.post_iid)}
                              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                            >
                              <Check size={14} />
                              <span>অনুমোদন করুন</span>
                            </button>
                          ) : (
                            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle2 size={14} />
                              অনুমোদিত
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
           ) : mainTab === 'postcards' ? (
             /* Postcard Templates View */
             <div className="space-y-6">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                 <div>
                   <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
                     <span>পোস্টকার্ড ব্যাকগ্রাউন্ড টেমপ্লেট</span>
                     <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold">
                       {postcards.length} টি সক্রিয়
                     </span>
                   </h3>
                   <p className="text-xs text-slate-500 font-semibold mt-1">
                     ইউজাররা /post এ পোস্ট লেখার সময় "Add Photo" তে এই ব্যাকগ্রাউন্ডগুলো বেছে নিয়ে এর ওপর তাদের লেখা ফিট করে পোস্ট করতে পারে।
                   </p>
                 </div>

                 <button
                   onClick={() => setIsAddPostcardOpen(true)}
                   className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition active:scale-95"
                 >
                   <Plus size={16} />
                   <span>নতুন পোস্টকার্ড যোগ করুন</span>
                 </button>
               </div>

               {postcardsLoading ? (
                 <div className="bg-white rounded-3xl p-16 text-center border border-indigo-50 shadow-sm space-y-3">
                   <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                   <p className="text-xs font-bold text-slate-500">পোস্টকার্ড লোড হচ্ছে...</p>
                 </div>
               ) : postcards.length === 0 ? (
                 <div className="bg-white rounded-3xl p-16 text-center border border-indigo-50 shadow-sm space-y-4">
                   <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto">
                     <Layers size={28} />
                   </div>
                   <h4 className="font-bold text-slate-800 text-lg">কোনো পোস্টকার্ড নেই</h4>
                   <p className="text-xs text-slate-500 max-w-md mx-auto">
                     এডমিন হিসেবে নতুন ছবি যুক্ত করুন যাতে ব্যবহারকারীরা পোস্টকার্ড স্টাইলে আকর্ষণীয় পোস্ট লিখতে পারে।
                   </p>
                   <button
                     onClick={() => setIsAddPostcardOpen(true)}
                     className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-indigo-700 transition"
                   >
                     <Plus size={16} />
                     <span>প্রথম পোস্টকার্ড যোগ করুন</span>
                   </button>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                   {postcards.map((card) => (
                     <div
                       key={card.postcard_iid}
                       className="group relative bg-white border border-indigo-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                     >
                       <div className="aspect-[4/3] w-full relative overflow-hidden bg-slate-950">
                         <img
                           src={card.image_url}
                           alt={card.title || 'Postcard'}
                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                           loading="lazy"
                         />
                         {/* Subtle Card ID Badge */}
                          <div className="absolute top-3 left-3 pointer-events-none">
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-xs shadow-xs">
                              ID #{card.postcard_iid}
                            </span>
                          </div>

                         <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button
                             onClick={() => handleDeletePostcard(card.postcard_iid)}
                             className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg backdrop-blur-md transition-all active:scale-90"
                             title="মুছে ফেলুন"
                           >
                             <Trash2 size={15} />
                           </button>
                         </div>
                       </div>

                       <div className="p-4 flex items-center justify-between border-t border-slate-100 bg-white">
                         <div>
                           <h4 className="font-bold text-xs text-slate-900 truncate max-w-[170px]">
                             {card.title || 'Postcard Template'}
                           </h4>
                           <p className="text-[10px] text-slate-400">
                             {card.created_at ? formatTimeAgo(card.created_at) : 'Active'}
                           </p>
                         </div>
                         <button
                           onClick={() => handleDeletePostcard(card.postcard_iid)}
                           className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                           title="মুছুন"
                         >
                           <Trash2 size={14} />
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
              </div>
            ) : mainTab === 'users' ? (
              /* User Accounts Management View (kabirdatabase_account) */
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-2">
                        <span>কমিউনিটি ইউজার ও একাউন্ট তালিকা</span>
                      </h3>
                      <span className="bg-indigo-100 text-indigo-700 text-xs font-black px-2.5 py-1 rounded-full">
                        {accounts.length} Total
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      kabirdatabase_account টেবিল থেকে সকল ইউজারের আইডি, ইউজারনেম, পাসওয়ার্ড ও পোস্ট লিমিট নিয়ন্ত্রণ করুন
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={loadAccounts}
                      disabled={accountsLoading}
                      className="px-3.5 py-2 bg-white border border-indigo-100 text-slate-600 hover:text-indigo-600 rounded-2xl shadow-xs hover:shadow-md transition cursor-pointer flex items-center gap-2 text-xs font-bold"
                      title="রিফ্রেশ করুন"
                    >
                      <RefreshCcw size={15} className={accountsLoading ? 'animate-spin text-indigo-600' : ''} />
                      <span>রিফ্রেশ</span>
                    </button>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">মোট ইউজার</span>
                    <span className="text-2xl font-black text-slate-800">{accounts.length} জন</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">ডিফল্ট দৈনিক কোটা</span>
                    <span className="text-2xl font-black text-indigo-600">৫টি / দিন</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">কাস্টম কোটা ইউজার</span>
                    <span className="text-2xl font-black text-purple-600">
                      {accounts.filter(a => (a.post_limit || 5) !== 5).length} জন
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">মোট পোস্ট সংখ্যা</span>
                    <span className="text-2xl font-black text-emerald-600">{communityPosts.length} টি</span>
                  </div>
                </div>

                {/* Search input */}
                <div className="bg-white p-3 rounded-2xl border border-indigo-100 shadow-xs flex items-center gap-3">
                  <Search size={18} className="text-slate-400 shrink-0 ml-2" />
                  <input 
                    type="text"
                    placeholder="ইউজারের নাম, @username, ইউজার আইডি (#user_iid) বা WhatsApp নম্বর দিয়ে খুঁজুন..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="flex-1 text-xs font-medium focus:outline-none bg-transparent"
                  />
                  {userSearchQuery && (
                    <button 
                      onClick={() => setUserSearchQuery('')}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* User List Table */}
                {accountsLoading ? (
                  <div className="bg-white rounded-3xl p-16 text-center border border-indigo-100 shadow-sm space-y-3">
                    <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-500">ইউজার একাউন্ট তালিকা লোড হচ্ছে...</p>
                  </div>
                ) : filteredAccounts.length === 0 ? (
                  <div className="bg-white rounded-3xl p-16 text-center border border-indigo-100 shadow-sm space-y-2">
                    <Users size={36} className="text-slate-300 mx-auto" />
                    <h4 className="font-bold text-slate-800 text-base">কোনো ইউজার পাওয়া যায়নি</h4>
                    <p className="text-xs text-slate-400">
                      {userSearchQuery ? 'সার্চ কুয়েরির সাথে কোনো একাউন্ট মেলেনি।' : 'বর্তমানে কোনো ইউজার একাউন্ট নিবন্ধিত নেই।'}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-black uppercase tracking-wider text-slate-500">
                            <th className="py-4 px-5">ইউজার তথ্য</th>
                            <th className="py-4 px-5">পাসওয়ার্ড (Password)</th>
                            <th className="py-4 px-5">পোস্ট লিমিট (Daily Limit)</th>
                            <th className="py-4 px-5">WhatsApp নম্বর</th>
                            <th className="py-4 px-5">মোট পোস্ট</th>
                            <th className="py-4 px-5">যোগদান</th>
                            <th className="py-4 px-5 text-right">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {filteredAccounts.map((user) => {
                            const isPassVisible = !!visiblePasswords[user.user_iid];
                            const isCopied = copiedId === user.user_iid;
                            const postsCount = userPostCounts[user.user_iid] || 0;

                            return (
                              <tr key={user.user_iid} className="hover:bg-indigo-50/30 transition-colors">
                                {/* User Info */}
                                <td className="py-4 px-5">
                                  <div className="flex items-center gap-3">
                                    <img 
                                      src={user.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                                      alt={user.name} 
                                      className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100 shadow-xs shrink-0"
                                    />
                                    <div>
                                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                        <span>{user.name}</span>
                                        <span className="text-[10px] font-mono text-slate-400 font-normal">#{user.user_iid}</span>
                                      </div>
                                      <span className="text-[11px] font-mono text-indigo-600 font-semibold">@{user.userid}</span>
                                    </div>
                                  </div>
                                </td>

                                {/* Password with View & Copy */}
                                <td className="py-4 px-5">
                                  <div className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-2.5 py-1.5 rounded-xl transition">
                                    <Key size={13} className="text-amber-500 shrink-0" />
                                    <span className="font-mono font-bold text-xs text-slate-800 select-all">
                                      {isPassVisible ? user.password : '••••••••'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => togglePasswordVisibility(user.user_iid)}
                                      className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer ml-1"
                                      title={isPassVisible ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                                    >
                                      {isPassVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => copyPassword(user.password || '', user.user_iid)}
                                      className="text-slate-400 hover:text-indigo-600 p-0.5 cursor-pointer"
                                      title="পাসওয়ার্ড কপি করুন"
                                    >
                                      {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                                    </button>
                                  </div>
                                </td>

                                {/* Post Limit with Quick Edit */}
                                <td className="py-4 px-5">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#1877F2] border border-blue-200">
                                      {user.post_limit || 5} টি / দিন
                                    </span>
                                    <button
                                      onClick={() => {
                                        setEditingLimitUser(user);
                                        setNewPostLimit(user.post_limit || 5);
                                      }}
                                      className="p-1 text-slate-400 hover:text-[#1877F2] hover:bg-blue-50 rounded-md transition cursor-pointer"
                                      title="পোস্ট লিমিট পরিবর্তন করুন"
                                    >
                                      <Edit3 size={13} />
                                    </button>
                                  </div>
                                </td>

                                {/* WhatsApp */}
                                <td className="py-4 px-5">
                                  {user.whats_app_number ? (
                                    <a
                                      href={`https://wa.me/${user.whats_app_number}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition"
                                    >
                                      <Phone size={12} />
                                      <span>+{user.whats_app_number}</span>
                                    </a>
                                  ) : (
                                    <span className="text-slate-400 text-[11px] italic">দেওয়া হয়নি</span>
                                  )}
                                </td>

                                {/* Posts Count */}
                                <td className="py-4 px-5">
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                                    <MessageSquare size={12} className="text-indigo-500" />
                                    <span>{postsCount} টি</span>
                                  </span>
                                </td>

                                {/* Joined Date */}
                                <td className="py-4 px-5 text-slate-500 font-medium text-[11px]">
                                  {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                </td>

                                {/* Actions */}
                                <td className="py-4 px-5 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      onClick={() => {
                                        setEditingPasswordUser(user);
                                        setNewUserPassword(user.password || '');
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                      title="পাসওয়ার্ড পরিবর্তন করুন"
                                    >
                                      <Key size={15} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(user.user_iid, user.name)}
                                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                      title="ইউজার ডিলিট করুন"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
             /* Gallery Records View */
             <>
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

      {/* Add Postcard Modal */}
      <AnimatePresence>
        {isAddPostcardOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddPostcardOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl border border-indigo-100"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">নতুন পোস্টকার্ড টেমপ্লেট</h3>
                    <p className="text-xs text-slate-500">ইউজারদের পোস্টের ব্যাকগ্রাউন্ড হিসেবে যুক্ত হবে</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsAddPostcardOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddPostcard} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    টেমপ্লেটের নাম / শিরোনাম
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Sunset Minimal, Moody Rain, Vintage Paper"
                    value={newPostcardTitle}
                    onChange={(e) => setNewPostcardTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    ছবি নির্বাচন করুন (কম্পিউটার থেকে আপলোড)
                  </label>
                  <label className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 rounded-2xl p-4 text-center cursor-pointer flex flex-col items-center justify-center gap-2 transition group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadPostcardFile}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-xl bg-white text-indigo-600 shadow-sm flex items-center justify-center group-hover:scale-110 transition">
                      <Upload size={18} />
                    </div>
                    <span className="text-xs font-bold text-indigo-700">
                      {postcardUploading ? 'আপলোড হচ্ছে...' : 'ছবি নির্বাচন করতে ক্লিক করুন'}
                    </span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, WebP (স্বয়ংক্রিয় ক্লাউড আপলোড)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    অথবা সরাসরি ছবির লিঙ্ক (Direct Image URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newPostcardUrl}
                    onChange={(e) => setNewPostcardUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition font-mono"
                  />
                </div>

                {/* Live Preview of Postcard */}
                {newPostcardUrl && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600">ImgBB ছবি প্রিভিউ:</span>
                      {newPostcardUrl.includes('ibb.co') && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ ImgBB ক্লাউডে হোস্ট করা হয়েছে
                        </span>
                      )}
                    </div>
                    <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-900 border border-slate-200 shadow-sm">
                      <img
                        src={newPostcardUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddPostcardOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={postcardUploading || !newPostcardUrl.trim()}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale transition flex items-center gap-2"
                  >
                    {postcardUploading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    <span>সংরক্ষণ করুন</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Password Change Modal */}
      <AnimatePresence>
        {isAdminSettingsOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Key size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-base leading-tight">অ্যাডমিন পাসওয়ার্ড</h3>
                    <p className="text-[11px] text-slate-500 font-medium">নিরাপত্তা পাসওয়ার্ড পরিবর্তন করুন</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdminSettingsOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateAdminPassword} className="p-6 space-y-4">
                {adminError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">
                    {adminError}
                  </div>
                )}
                {adminSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>{adminSuccess}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">নতুন পাসওয়ার্ড</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={adminNewPassword}
                      onChange={(e) => setAdminNewPassword(e.target.value)}
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
                  <div className="relative">
                    <Check size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={adminConfirmPassword}
                      onChange={(e) => setAdminConfirmPassword(e.target.value)}
                      placeholder="পুনরায় নতুন পাসওয়ার্ড লিখুন"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAdminSettingsOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={adminUpdating}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    {adminUpdating ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড সেভ করুন'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {/* Edit User Post Limit Modal */}
        <AnimatePresence>
          {editingLimitUser && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200"
              >
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1877F2] flex items-center justify-center">
                      <Edit3 size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">দৈনিক পোস্ট লিমিট পরিবর্তন</h4>
                      <p className="text-[10px] text-slate-400">@{editingLimitUser.userid} ({editingLimitUser.name})</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingLimitUser(null)}
                    className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      প্রতিদিনের পোস্ট কোটা (পোস্ট / দিন)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={newPostLimit}
                      onChange={(e) => setNewPostLimit(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-base font-bold text-slate-800 focus:bg-white focus:border-[#1877F2] focus:outline-none transition text-center"
                    />
                  </div>

                  {/* Preset limit pills */}
                  <div className="flex items-center justify-center gap-2">
                    {[5, 10, 20, 50].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setNewPostLimit(num)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                          newPostLimit === num
                            ? 'bg-[#1877F2] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {num} টি
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingLimitUser(null)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="button"
                      disabled={savingLimit}
                      onClick={handleSaveLimit}
                      className="px-5 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {savingLimit ? 'সংরক্ষণ হচ্ছে...' : 'লিমিট সেভ করুন'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit User Password Modal */}
        <AnimatePresence>
          {editingPasswordUser && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200"
              >
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Key size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">ইউজার পাসওয়ার্ড পরিবর্তন</h4>
                      <p className="text-[10px] text-slate-400">{editingPasswordUser.name} (@{editingPasswordUser.userid})</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingPasswordUser(null)}
                    className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      নতুন পাসওয়ার্ড দিন
                    </label>
                    <input
                      type="text"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="নতুন পাসওয়ার্ড লিখুন"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-mono font-bold text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none transition"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingPasswordUser(null)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="button"
                      disabled={savingPassword || !newUserPassword.trim()}
                      onClick={handleSaveUserPassword}
                      className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {savingPassword ? 'আপডেট হচ্ছে...' : 'পাসওয়ার্ড আপডেট করুন'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </div>
  );
}

