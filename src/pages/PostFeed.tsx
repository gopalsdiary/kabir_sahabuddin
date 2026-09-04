import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  Send,
  User,
  Lock,
  Phone,
  LogOut,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronDown,
  X,
  Upload,
  AlertCircle,
  Compass,
  ArrowRight,
  MessageSquare,
  BadgeCheck,
  Layers,
  Edit3,
  LogIn,
  Settings,
  Eye,
  EyeOff,
  Key,
  ShieldCheck,
  Check
} from 'lucide-react';
import { 
  postService, 
  Account, 
  Post, 
  Postcard,
  CommentItem, 
  formatTimeAgo 
} from '../lib/postService';

const IMGBB_API_KEY = '03cd19c7e6990d72a74e764559101b63';

// Default avatar presets for easy selection
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
];

interface CountryItem {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  placeholder: string;
}

const COUNTRY_LIST: CountryItem[] = [
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩', placeholder: '17XXXXXXXX' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', placeholder: '98XXXXXXXX' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', placeholder: '50XXXXXXX' },
  { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪', placeholder: '50XXXXXXX' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', placeholder: '33XXXXXX' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼', placeholder: '99XXXXXX' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲', placeholder: '91XXXXXX' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭', placeholder: '36XXXXXX' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', placeholder: '12XXXXXXX' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', placeholder: '81XXXXXX' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰', placeholder: '300XXXXXXX' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', placeholder: '2025550143' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', placeholder: '7911123456' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', placeholder: '4165550143' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', placeholder: '3201234567' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', placeholder: '412345678' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', placeholder: '1511234567' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', placeholder: '612345678' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', placeholder: '9012345678' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷', placeholder: '1012345678' }
];

function parseCountryAndPhone(rawNumber: string | number | null | undefined): { dialCode: string; localNumber: string } {
  if (!rawNumber) return { dialCode: '+880', localNumber: '' };
  const str = String(rawNumber).replace(/\D/g, '');
  if (!str) return { dialCode: '+880', localNumber: '' };

  const sorted = [...COUNTRY_LIST].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const c of sorted) {
    const rawDial = c.dialCode.replace(/\D/g, '');
    if (str.startsWith(rawDial)) {
      return {
        dialCode: c.dialCode,
        localNumber: str.substring(rawDial.length)
      };
    }
  }
  return { dialCode: '+880', localNumber: str };
}

function formatFullWhatsAppNumber(dialCode: string, localNum: string): string | null {
  const cleanLocal = localNum.replace(/\D/g, '').replace(/^0+/, '');
  if (!cleanLocal) return null;
  const cleanDial = dialCode.replace(/\D/g, '');
  return `${cleanDial}${cleanLocal}`;
}

export default function PostFeed({ initialOpenSettings = false }: { initialOpenSettings?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();

  // User state
  const [currentUser, setCurrentUser] = useState<Account | null>(() => postService.getCurrentUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  // Account Settings state
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(initialOpenSettings);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'security' | 'info'>('profile');
  const [settingsName, setSettingsName] = useState('');
  const [settingsUserId, setSettingsUserId] = useState('');
  const [settingsCountryCode, setSettingsCountryCode] = useState('+880');
  const [settingsPhoneNumber, setSettingsPhoneNumber] = useState('');
  const [settingsAvatar, setSettingsAvatar] = useState('');
  const [settingsAvatarUploading, setSettingsAvatarUploading] = useState(false);
  const [settingsCurrentPassword, setSettingsCurrentPassword] = useState('');
  const [settingsNewPassword, setSettingsNewPassword] = useState('');
  const [settingsConfirmPassword, setSettingsConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [todayPostCount, setTodayPostCount] = useState<number>(0);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUserId, setRegUserId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCountryCode, setRegCountryCode] = useState('+880');
  const [regPhoneNumber, setRegPhoneNumber] = useState('');
  const [regAvatar, setRegAvatar] = useState(AVATAR_PRESETS[0]);
  const [regAvatarUploading, setRegAvatarUploading] = useState(false);

  // Login form state
  const [loginUserId, setLoginUserId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Feed & posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'myPosts' | 'popular'>('feed');
  const [searchQuery, setSearchQuery] = useState('');

  // Postcards curated by admin
  const [postcards, setPostcards] = useState<Postcard[]>([]);
  const [selectedPostcard, setSelectedPostcard] = useState<Postcard | null>(null);
  const [showPostcardPicker, setShowPostcardPicker] = useState(false);

  // Create post state
  const [postComposerOpen, setPostComposerOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);
  const [postSuccessMessage, setPostSuccessMessage] = useState<string | null>(null);

  // Edit post state
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostDescription, setEditPostDescription] = useState('');
  const [editSelectedPostcard, setEditSelectedPostcard] = useState<Postcard | null>(null);
  const [showEditPostcardPicker, setShowEditPostcardPicker] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Comments state: { [postId]: commentText }
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('kabir_guest_likes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Lightbox
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load feed on mount and tab change
  useEffect(() => {
    loadData();
  }, [activeTab, currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cards, feedPosts] = await Promise.all([
        postService.fetchPostcards(),
        activeTab === 'myPosts' && currentUser 
          ? postService.fetchUserPosts(currentUser.user_iid)
          : postService.fetchApprovedPosts()
      ]);
      setPostcards(cards);
      if (activeTab === 'popular') {
        feedPosts.sort((a, b) => b.like_count - a.like_count);
      }
      setPosts(feedPosts);

      if (currentUser) {
        postService.getTodayPostCount(currentUser.user_iid).then(setTodayPostCount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Image upload via ImgBB for avatars
  const uploadImageFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGBB_API_KEY);
    const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (!data.success) throw new Error('Image upload failed');
    return data.data.url;
  };

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!regName.trim() || !regUserId.trim() || !regPassword.trim()) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    const fullWhatsApp = formatFullWhatsAppNumber(regCountryCode, regPhoneNumber);

    const res = await postService.register({
      name: regName,
      userid: regUserId,
      password: regPassword,
      whats_app_number: fullWhatsApp || undefined,
      profile_photo: regAvatar
    });

    if (res.success && res.account) {
      setCurrentUser(res.account);
      setAuthModalOpen(false);
      setRegName('');
      setRegUserId('');
      setRegPassword('');
      setRegCountryCode('+880');
      setRegPhoneNumber('');
    } else {
      setErrorMessage(res.error || 'Registration failed');
    }
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!loginUserId.trim() || !loginPassword.trim()) {
      setErrorMessage('Please enter your username and password');
      return;
    }

    const res = await postService.login(loginUserId, loginPassword);
    if (res.success && res.account) {
      setCurrentUser(res.account);
      setAuthModalOpen(false);
      setLoginUserId('');
      setLoginPassword('');
    } else {
      setErrorMessage(res.error || 'Login failed');
    }
  };

  const handleLogout = () => {
    postService.logout();
    setCurrentUser(null);
    if (activeTab === 'myPosts') {
      setActiveTab('feed');
    }
  };

  // Handle avatar upload during registration
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRegAvatarUploading(true);
    try {
      const url = await uploadImageFile(file);
      setRegAvatar(url);
    } catch (err: any) {
      alert(err.message || 'Avatar upload failed');
    } finally {
      setRegAvatarUploading(false);
    }
  };

  // Check URL params for settings trigger
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('settings') === 'true' || initialOpenSettings) {
      if (currentUser) {
        openAccountSettings();
      } else {
        setAuthTab('login');
        setAuthModalOpen(true);
      }
    }
  }, [location.search, initialOpenSettings]);

  const openAccountSettings = async () => {
    const user = currentUser || postService.getCurrentUser();
    if (!user) {
      setAuthTab('login');
      setAuthModalOpen(true);
      return;
    }
    setSettingsName(user.name || '');
    setSettingsUserId(user.userid || '');
    const userPhone = parseCountryAndPhone(user.whats_app_number);
    setSettingsCountryCode(userPhone.dialCode);
    setSettingsPhoneNumber(userPhone.localNumber);
    setSettingsAvatar(user.profile_photo || AVATAR_PRESETS[0]);
    setSettingsCurrentPassword('');
    setSettingsNewPassword('');
    setSettingsConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setSettingsError(null);
    setSettingsSuccess(null);
    setSettingsTab('profile');
    setAccountSettingsOpen(true);

    try {
      const [todayCount, freshAcc] = await Promise.all([
        postService.getTodayPostCount(user.user_iid),
        postService.getAccount(user.user_iid)
      ]);
      setTodayPostCount(todayCount);
      if (freshAcc) {
        setCurrentUser(freshAcc);
        setSettingsName(freshAcc.name || '');
        setSettingsUserId(freshAcc.userid || '');
        const freshPhone = parseCountryAndPhone(freshAcc.whats_app_number);
        setSettingsCountryCode(freshPhone.dialCode);
        setSettingsPhoneNumber(freshPhone.localNumber);
        setSettingsAvatar(freshAcc.profile_photo || AVATAR_PRESETS[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSettingsAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSettingsAvatarUploading(true);
    setSettingsError(null);
    try {
      const url = await uploadImageFile(file);
      setSettingsAvatar(url);
    } catch (err: any) {
      setSettingsError('Failed to upload image: ' + (err.message || 'Error'));
    } finally {
      setSettingsAvatarUploading(false);
    }
  };

  const handleSaveAccountSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSettingsError(null);
    setSettingsSuccess(null);

    const cleanName = settingsName.trim();
    if (!cleanName) {
      setSettingsError('Please enter your full name.');
      return;
    }
    const cleanUid = settingsUserId.trim().toLowerCase().replace(/^@/, '');
    if (!cleanUid) {
      setSettingsError('Please enter a valid username.');
      return;
    }

    if (settingsNewPassword) {
      if (!settingsCurrentPassword) {
        setSettingsError('Please enter your current password to update password.');
        return;
      }
      if (settingsNewPassword.length < 4) {
        setSettingsError('New password must be at least 4 characters long.');
        return;
      }
      if (settingsNewPassword !== settingsConfirmPassword) {
        setSettingsError('New password and confirmation do not match!');
        return;
      }
    }

    const fullWhatsApp = formatFullWhatsAppNumber(settingsCountryCode, settingsPhoneNumber);

    setSettingsLoading(true);
    try {
      const res = await postService.updateAccount({
        user_iid: currentUser.user_iid,
        name: cleanName,
        userid: cleanUid,
        profile_photo: settingsAvatar || null,
        whats_app_number: fullWhatsApp,
        currentPassword: settingsCurrentPassword || undefined,
        newPassword: settingsNewPassword || undefined
      });

      if (!res.success || !res.account) {
        setSettingsError(res.error || 'Failed to update account.');
        setSettingsLoading(false);
        return;
      }

      const updated = res.account;
      setCurrentUser(updated);

      // Update in-memory posts so author info refreshes instantly across feed
      setPosts(prev => prev.map(p => {
        if (p.user_iid === updated.user_iid) {
          return {
            ...p,
            author: {
              ...(p.author || {}),
              ...updated
            } as Account
          };
        }
        return p;
      }));

      setSettingsSuccess('Account settings saved successfully!');
      setSettingsCurrentPassword('');
      setSettingsNewPassword('');
      setSettingsConfirmPassword('');

      setTimeout(() => {
        setAccountSettingsOpen(false);
        setSettingsSuccess(null);
      }, 1200);

    } catch (err: any) {
      setSettingsError(err.message || 'Failed to save account settings.');
    } finally {
      setSettingsLoading(false);
    }
  };


  // Handle post submission
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    if (!postTitle.trim() && !postDescription.trim() && !selectedPostcard) {
      alert('Please write something or choose a photo postcard for your post!');
      return;
    }
    if (todayPostCount >= (currentUser.post_limit || 5)) {
      alert(`You have reached your daily limit of ${currentUser.post_limit || 5} posts for today. You can submit more posts tomorrow!`);
      return;
    }

    setSubmittingPost(true);
    const res = await postService.createPost({
      user_iid: currentUser.user_iid,
      title: postTitle,
      description: postDescription,
      image_url: selectedPostcard?.image_url || undefined,
      postcard_iid: selectedPostcard?.postcard_iid || null
    });

    setSubmittingPost(false);
    if (res.success) {
      setPostTitle('');
      setPostDescription('');
      setSelectedPostcard(null);
      setShowPostcardPicker(false);
      setPostComposerOpen(false);
      setPostSuccessMessage('Your post has been submitted successfully! It will appear publicly once approved by an admin.');
      setTimeout(() => setPostSuccessMessage(null), 7000);
      
      // Refresh today's post count
      if (currentUser) {
        postService.getTodayPostCount(currentUser.user_iid).then(setTodayPostCount);
      }

      if (activeTab === 'myPosts') {
        loadData();
      }
    } else {
      alert(res.error || 'Failed to submit post');
    }
  };

  // Handle like toggle (Guests and account holders can both like!)
  const handleLike = async (post: Post) => {
    const isLiked = !!likedPosts[post.post_iid];
    const newCount = isLiked ? Math.max(0, post.like_count - 1) : post.like_count + 1;

    setLikedPosts(prev => {
      const updated = { ...prev, [post.post_iid]: !isLiked };
      try {
        localStorage.setItem('kabir_guest_likes', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setPosts(prev => prev.map(p => p.post_iid === post.post_iid ? { ...p, like_count: newCount } : p));
    await postService.toggleLike(post.post_iid, newCount);
  };

  // Handle adding comment (ACCOUNT HOLDERS ONLY)
  const handleAddComment = async (postId: number) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    const text = (commentInputs[postId] || '').trim();
    if (!text) return;

    const newComment: CommentItem = {
      id: Math.random().toString(36).substring(2, 9),
      user_iid: currentUser.user_iid,
      name: currentUser.name,
      userid: currentUser.userid,
      avatar: currentUser.profile_photo || undefined,
      text,
      created_at: new Date().toISOString()
    };

    setPosts(prev => prev.map(p => {
      if (p.post_iid === postId) {
        return {
          ...p,
          user_comment: [...(p.user_comment || []), newComment]
        };
      }
      return p;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    await postService.addComment(postId, newComment);
  };

  // Open Edit Post modal
  const handleOpenEdit = (post: Post) => {
    setEditingPost(post);
    setEditPostTitle(post.title || '');
    setEditPostDescription(post.description || '');
    setEditSelectedPostcard(post.postcard || null);
    setShowEditPostcardPicker(false);
  };

  // Handle submit edited post (Resets is_approved = false)
  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !editingPost) return;

    if (!editPostTitle.trim() && !editPostDescription.trim() && !editSelectedPostcard) {
      alert('Please write something or select a photo postcard for your post!');
      return;
    }

    setSubmittingEdit(true);
    const res = await postService.updatePost({
      post_iid: editingPost.post_iid,
      user_iid: currentUser.user_iid,
      title: editPostTitle,
      description: editPostDescription,
      postcard_iid: editSelectedPostcard?.postcard_iid || null,
      image_url: editSelectedPostcard?.image_url || undefined
    });
    setSubmittingEdit(false);

    if (res.success && res.post) {
      const updatedPost = res.post;
      setEditingPost(null);
      setPostSuccessMessage('Your post was edited successfully! It will be reviewed by an administrator before appearing on the public feed.');
      setTimeout(() => setPostSuccessMessage(null), 8000);

      if (activeTab === 'feed') {
        // Since is_approved is false, remove from approved public feed
        setPosts(prev => prev.filter(p => p.post_iid !== updatedPost.post_iid));
      } else {
        // In myPosts, keep it visible but marked as pending
        setPosts(prev => prev.map(p => p.post_iid === updatedPost.post_iid ? updatedPost : p));
      }
    } else {
      alert(res.error || 'Failed to update post');
    }
  };

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(p => 
      p.title?.toLowerCase().includes(q) || 
      p.description?.toLowerCase().includes(q) ||
      p.author?.name?.toLowerCase().includes(q) ||
      p.author?.userid?.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-900 pb-20 selection:bg-[#1877F2] selection:text-white font-sans">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')} 
              className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="Back to Gallery"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-[#1877F2] to-[#0E52AB] bg-clip-text text-transparent">
                  Kabir Sahabuddin
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1877F2] border border-blue-200">
                  Community
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Stories, reflections & poetry discussion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-xs font-semibold px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition hidden sm:inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Compass size={15} />
              Photo Gallery
            </button>

            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100/80 hover:bg-slate-100 p-1 sm:p-1.5 pr-2 sm:pr-2.5 rounded-full border border-slate-200 transition">
                <button
                  type="button"
                  onClick={openAccountSettings}
                  className="flex items-center gap-2 text-left cursor-pointer group"
                  title="View or edit account settings"
                >
                  <img 
                    src={currentUser.profile_photo || AVATAR_PRESETS[0]} 
                    alt={currentUser.name} 
                    className="w-8 h-8 rounded-full object-cover border border-white shadow-xs group-hover:ring-2 ring-[#1877F2] transition"
                  />
                  <div className="leading-tight hidden sm:block">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1 group-hover:text-[#1877F2] transition">
                      {currentUser.name}
                      <BadgeCheck size={13} className="text-[#1877F2]" />
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">@{currentUser.userid}</div>
                  </div>
                </button>

                <button 
                  type="button"
                  onClick={openAccountSettings}
                  className="text-slate-500 hover:text-[#1877F2] hover:bg-blue-50 p-1.5 rounded-full transition cursor-pointer"
                  title="Account Settings"
                >
                  <Settings size={16} />
                </button>

                <button 
                  type="button"
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-full transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthTab('login');
                  setAuthModalOpen(true);
                }}
                className="bg-[#1877F2] hover:bg-[#166fe5] active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-full shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <User size={16} />
                <span>Sign In / Join</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 pt-6 space-y-4">

        {/* Success Alert Banner */}
        <AnimatePresence>
          {postSuccessMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-emerald-900 shadow-sm"
            >
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm font-medium leading-relaxed">
                {postSuccessMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Facebook-style Create Post Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <img 
              src={currentUser?.profile_photo || AVATAR_PRESETS[0]} 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover border border-slate-100"
            />
            <button
              onClick={() => {
                if (!currentUser) {
                  setAuthModalOpen(true);
                } else {
                  setPostComposerOpen(true);
                }
              }}
              className="flex-1 bg-slate-100 hover:bg-slate-200/80 text-left px-4 py-2.5 rounded-full text-slate-500 text-xs sm:text-sm font-medium transition cursor-pointer flex items-center justify-between"
            >
              <span>
                {currentUser 
                  ? `What's on your mind, ${currentUser.name.split(' ')[0]}?` 
                  : 'Sign in or register to create a post...'}
              </span>
              <Sparkles size={16} className="text-[#1877F2] shrink-0 ml-2" />
            </button>
          </div>

          <div className="border-t border-slate-100 mt-3 pt-2.5 flex items-center justify-between">
            <button
              onClick={() => {
                if (!currentUser) {
                  setAuthModalOpen(true);
                } else {
                  setShowPostcardPicker(true);
                  setPostComposerOpen(true);
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition cursor-pointer"
            >
              <ImageIcon size={18} className="text-emerald-500" />
              <span>Add Photo (Postcard)</span>
            </button>
            <div className="h-4 w-[1px] bg-slate-200" />
            <button
              onClick={() => {
                if (!currentUser) setAuthModalOpen(true);
                else setPostComposerOpen(true);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition cursor-pointer"
            >
              <MessageSquare size={18} className="text-amber-500" />
              <span>Thoughts / Quote</span>
            </button>
          </div>
        </div>

        {/* Feed Filtering Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'feed'
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Posts
            </button>
            {currentUser && (
              <button
                onClick={() => setActiveTab('myPosts')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'myPosts'
                    ? 'bg-[#1877F2] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                My Posts
              </button>
            )}
            <button
              onClick={() => setActiveTab('popular')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'popular'
                  ? 'bg-[#1877F2] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Popular
            </button>
          </div>

          <div className="relative flex-1 sm:max-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search posts or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 text-xs rounded-xl pl-8 pr-3 py-1.5 border border-transparent focus:border-[#1877F2] focus:bg-white focus:outline-none transition"
            />
          </div>
        </div>

        {/* Author Profile Banner on My Posts */}
        {activeTab === 'myPosts' && currentUser && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative cursor-pointer" onClick={openAccountSettings}>
                <img 
                  src={currentUser.profile_photo || AVATAR_PRESETS[0]} 
                  alt={currentUser.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm ring-2 ring-slate-100"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openAccountSettings();
                  }}
                  className="absolute -bottom-1 -right-1 bg-[#1877F2] hover:bg-[#166fe5] text-white p-1 rounded-full shadow-sm cursor-pointer"
                  title="Change profile avatar"
                >
                  <Edit3 size={11} />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-bold text-slate-800">{currentUser.name}</h2>
                  <BadgeCheck size={16} className="text-[#1877F2]" />
                </div>
                <p className="text-xs text-slate-500 font-medium font-mono">@{currentUser.userid}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    Posts Today: {todayPostCount} / {currentUser.post_limit || 5}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={openAccountSettings}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-[#1877F2] hover:text-white text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Settings size={15} />
              <span>Account Settings</span>
            </button>
          </div>
        )}

        {/* Posts Feed */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 space-y-3">
            <div className="w-8 h-8 border-3 border-[#1877F2] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">Loading community feed...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 space-y-3">
            <div className="w-14 h-14 bg-blue-50 text-[#1877F2] rounded-full flex items-center justify-center mx-auto mb-2">
              <MessageSquare size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No Posts Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeTab === 'myPosts' 
                ? 'You have not submitted any posts yet. Express your thoughts using the box above!' 
                : 'No approved posts match your query. Be the first to share!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <motion.article 
                key={post.post_iid}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
              >
                {/* Post Header */}
                <div className="p-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.author?.profile_photo || AVATAR_PRESETS[0]} 
                      alt={post.author?.name || 'Author'} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900 leading-tight">
                          {post.author?.name || 'Community Member'}
                        </span>
                        <BadgeCheck size={14} className="text-[#1877F2]" />
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        {post.author?.userid && (
                          <span>@{post.author.userid}</span>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {formatTimeAgo(post.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status badge for My Posts */}
                    {activeTab === 'myPosts' && (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                        post.is_approved 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {post.is_approved ? (
                          <>
                            <CheckCircle2 size={12} />
                            Approved
                          </>
                        ) : (
                          <>
                            <Clock size={12} />
                            Pending Review
                          </>
                        )}
                      </span>
                    )}

                    {/* Edit Post button if current user is author */}
                    {currentUser && post.user_iid === currentUser.user_iid && (
                      <button
                        onClick={() => handleOpenEdit(post)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-[#1877F2] text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-slate-200"
                        title="Edit this post (requires admin re-approval)"
                      >
                        <Edit3 size={12} />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Body: Postcard Fitted View OR Standard View */}
                {post.postcard || post.postcard_iid ? (
                  /* Fitted Postcard Canvas View */
                  <div 
                    onClick={() => setZoomImage(post.postcard?.image_url || post.image_url)}
                    className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden flex items-center justify-center p-6 text-center cursor-pointer group"
                  >
                    <img 
                      src={post.postcard?.image_url || post.image_url || ''} 
                      alt={post.title || 'Postcard Post'} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Dark gradient / vignette overlay to make text pop */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/60" />

                    <div className="relative z-10 max-w-[90%] mx-auto space-y-2 text-white">
                      {post.title && (
                        <h3 className="text-base sm:text-xl font-black tracking-tight drop-shadow-md">
                          {post.title}
                        </h3>
                      )}
                      {post.description && (
                        <p className="text-xs sm:text-sm md:text-base font-serif italic leading-relaxed text-white/95 drop-shadow whitespace-pre-line line-clamp-6">
                          "{post.description}"
                        </p>
                      )}
                      <div className="pt-2 flex items-center justify-center gap-2 text-[10px] sm:text-xs text-white/80 font-sans">
                        <span className="w-5 h-[1px] bg-white/50" />
                        <span>{post.author?.name || 'Kabir Sahabuddin'}</span>
                        <span className="w-5 h-[1px] bg-white/50" />
                      </div>
                    </div>

                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 bg-black/60 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-xs transition">
                      View Full Image
                    </div>
                  </div>
                ) : (
                  /* Standard Post View (Text and optional standalone image) */
                  <>
                    <div className="px-4 pb-3 space-y-2">
                      {post.title && (
                        <h2 className="font-bold text-slate-900 text-base leading-snug">
                          {post.title}
                        </h2>
                      )}
                      {post.description && (
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-normal">
                          {post.description}
                        </p>
                      )}
                    </div>

                    {post.image_url && (
                      <div 
                        onClick={() => setZoomImage(post.image_url)}
                        className="relative bg-slate-950 max-h-[480px] overflow-hidden flex items-center justify-center cursor-pointer group"
                      >
                        <img 
                          src={post.image_url} 
                          alt={post.title || 'Post Image'} 
                          className="w-full object-contain max-h-[480px] transition-transform duration-300 group-hover:scale-[1.01]"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 bg-black/60 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full backdrop-blur-xs transition">
                            View Full Image
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Reactions Count */}
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[10px]">
                      👍
                    </span>
                    <span className="font-semibold text-slate-700">
                      {post.like_count} {post.like_count === 1 ? 'Like' : 'Likes'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>
                      {(post.user_comment || []).length} {(post.user_comment || []).length === 1 ? 'Comment' : 'Comments'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Like, Comment, Share */}
                <div className="px-2 py-1 flex items-center justify-between text-slate-600 border-b border-slate-100">
                  <button
                    onClick={() => handleLike(post)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer ${
                      likedPosts[post.post_iid] 
                        ? 'text-[#1877F2] bg-blue-50/60' 
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    <Heart 
                      size={18} 
                      className={likedPosts[post.post_iid] ? 'fill-[#1877F2] text-[#1877F2]' : ''} 
                    />
                    <span>Like</span>
                  </button>

                  <button
                    onClick={() => {
                      if (!currentUser) {
                        setAuthModalOpen(true);
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-100 transition cursor-pointer"
                  >
                    <MessageCircle size={18} />
                    <span>Comment</span>
                  </button>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: post.title || 'Kabir Sahabuddin Post',
                          text: post.description || '',
                          url: window.location.href
                        }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Post link copied to clipboard!');
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-100 transition cursor-pointer"
                  >
                    <Share2 size={18} />
                    <span>Share</span>
                  </button>
                </div>

                {/* Comments Section */}
                <div className="bg-slate-50/60 p-4 space-y-3">
                  {/* Write comment input OR Account Required Banner */}
                  {currentUser ? (
                    <div className="flex items-center gap-2">
                      <img 
                        src={currentUser.profile_photo || AVATAR_PRESETS[0]} 
                        alt="User" 
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 relative">
                        <input 
                          type="text"
                          placeholder="Write a comment..."
                          value={commentInputs[post.post_iid] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.post_iid]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(post.post_iid);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-full pl-4 pr-10 py-2 text-xs focus:outline-none focus:border-[#1877F2] transition shadow-2xs"
                        />
                        <button
                          onClick={() => handleAddComment(post.post_iid)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center transition cursor-pointer"
                        >
                          <Send size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-3 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                      <div className="flex items-center gap-2.5 text-slate-600 font-medium">
                        <div className="w-7 h-7 rounded-full bg-blue-50 text-[#1877F2] flex items-center justify-center shrink-0">
                          <LogIn size={14} />
                        </div>
                        <span>You need an account to comment. Sign in to join the conversation.</span>
                      </div>
                      <button
                        onClick={() => setAuthModalOpen(true)}
                        className="px-3.5 py-1.5 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded-xl text-xs transition self-start sm:self-auto cursor-pointer shadow-xs shrink-0"
                      >
                        Sign In / Register
                      </button>
                    </div>
                  )}

                  {/* List comments */}
                  {(post.user_comment || []).length > 0 && (
                    <div className="space-y-2.5 pt-1">
                      {(post.user_comment || []).map((cmt, idx) => (
                        <div key={cmt.id || idx} className="flex items-start gap-2.5 text-xs">
                          <img 
                            src={cmt.avatar || AVATAR_PRESETS[0]} 
                            alt={cmt.name} 
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                          />
                          <div className="bg-white border border-slate-200/80 rounded-2xl px-3.5 py-2 shadow-2xs max-w-[88%]">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">{cmt.name}</span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {formatTimeAgo(cmt.created_at)}
                              </span>
                            </div>
                            <p className="text-slate-700 mt-0.5 leading-relaxed">{cmt.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}

      </main>

      {/* Post Composer Modal */}
      <AnimatePresence>
        {postComposerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 my-8"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-base">Create New Post</h3>
                <button 
                  onClick={() => setPostComposerOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="p-6 space-y-4">
                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <img 
                    src={currentUser?.profile_photo || AVATAR_PRESETS[0]} 
                    alt="Author" 
                    className="w-11 h-11 rounded-full object-cover border border-slate-100 shadow-xs"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{currentUser?.name}</h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] font-medium text-slate-500">@{currentUser?.userid} • Public Post</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        todayPostCount >= (currentUser?.post_limit || 5)
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : 'bg-blue-50 text-[#1877F2] border-blue-100'
                      }`}>
                        Daily Quota: {todayPostCount} / {currentUser?.post_limit || 5}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Daily limit reached banner */}
                {todayPostCount >= (currentUser?.post_limit || 5) && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-start gap-2 font-medium">
                    <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                    <div>
                      <strong className="block font-bold">Daily Post Limit Reached (5/5)</strong>
                      <span>You have reached your limit of 5 posts for today. Your quota will reset at midnight!</span>
                    </div>
                  </div>
                )}

                {/* Title */}
                <input 
                  type="text"
                  placeholder="Post Title (Optional)"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full text-base font-bold text-slate-900 placeholder:text-slate-400 border-b border-slate-200 pb-2 focus:outline-none focus:border-[#1877F2] transition"
                />

                {/* Description */}
                <textarea 
                  rows={3}
                  placeholder="What's on your mind? Share your story, poem, or reflection..."
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  className="w-full text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none transition leading-relaxed"
                />

                {/* Live Fitted Postcard Canvas Preview */}
                {selectedPostcard && (
                  <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200 aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center p-6 text-center group">
                    <img 
                      src={selectedPostcard.image_url} 
                      alt={selectedPostcard.title || 'Postcard'} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/60" />

                    <div className="relative z-10 max-w-[90%] mx-auto space-y-2 text-white">
                      {postTitle && (
                        <h4 className="text-base sm:text-lg font-black tracking-tight drop-shadow-md line-clamp-2">
                          {postTitle}
                        </h4>
                      )}

                      <p className="text-xs sm:text-sm font-serif italic leading-relaxed text-white/95 drop-shadow line-clamp-5 whitespace-pre-line">
                        {postDescription ? `"${postDescription}"` : '"Your quote or poem will fit nicely on top of this postcard..."'}
                      </p>

                      <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-white/80 font-sans">
                        <span className="w-4 h-[1px] bg-white/50" />
                        <span>{currentUser?.name || 'Author'}</span>
                        <span className="w-4 h-[1px] bg-white/50" />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPostcard(null);
                        setShowPostcardPicker(false);
                      }}
                      className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition cursor-pointer"
                      title="Remove Postcard"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}

                {/* Postcard Selector Drawer (Admin Curated) */}
                {showPostcardPicker && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers size={15} className="text-[#1877F2]" />
                        <span className="text-xs font-bold text-slate-800">
                          Select Photo Postcard (Curated by Admin)
                        </span>
                      </div>
                      {selectedPostcard && (
                        <button 
                          type="button"
                          onClick={() => setSelectedPostcard(null)}
                          className="text-[11px] font-semibold text-red-500 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {postcards.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">
                        No default postcards added by admin yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                        {postcards.map((card) => (
                          <div
                            key={card.postcard_iid}
                            onClick={() => setSelectedPostcard(card)}
                            className={`relative aspect-[16/10] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                              selectedPostcard?.postcard_iid === card.postcard_iid
                                ? 'border-[#1877F2] scale-102 shadow-md ring-2 ring-blue-400/30'
                                : 'border-transparent opacity-80 hover:opacity-100 hover:border-slate-300'
                            }`}
                          >
                            <img src={card.image_url} alt={card.title || 'Template'} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-1.5">
                              <span className="text-[9px] font-bold text-white truncate drop-shadow">
                                {card.title || 'Template'}
                              </span>
                            </div>
                            {selectedPostcard?.postcard_iid === card.postcard_iid && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[10px]">
                                ✓
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Attachments Bar */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Add to your post</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPostcardPicker(prev => !prev)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        selectedPostcard || showPostcardPicker
                          ? 'bg-blue-50 text-[#1877F2] border-blue-200'
                          : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <ImageIcon size={16} className="text-emerald-500" />
                      <span>{selectedPostcard ? 'Change Photo' : 'Add Photo'}</span>
                    </button>
                  </div>
                </div>

                {/* Notice */}
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-[11px] text-blue-800 leading-relaxed flex items-start gap-2">
                  <Clock size={15} className="text-[#1877F2] shrink-0 mt-0.5" />
                  <span>
                    <strong>Please Note:</strong> Submitted posts require administrator approval before becoming visible on the public feed.
                  </span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submittingPost || todayPostCount >= (currentUser?.post_limit || 5)}
                  className="w-full bg-[#1877F2] hover:bg-[#166fe5] disabled:opacity-50 text-white font-bold text-sm py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {submittingPost ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Post...</span>
                    </>
                  ) : todayPostCount >= (currentUser?.post_limit || 5) ? (
                    <>
                      <AlertCircle size={16} />
                      <span>Daily Limit Reached (5/5 posts)</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Publish Post</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Post Modal */}
      <AnimatePresence>
        {editingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1877F2] flex items-center justify-center">
                    <Edit3 size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Edit Post</h3>
                    <p className="text-[10px] text-slate-400">Post ID #{editingPost.post_iid}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingPost(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdatePost} className="p-4 space-y-3.5">
                {/* User mini info */}
                <div className="flex items-center gap-2.5">
                  <img 
                    src={currentUser?.profile_photo || AVATAR_PRESETS[0]} 
                    alt="Author" 
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block leading-tight">
                      {currentUser?.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      @{currentUser?.userid} • Editing Mode
                    </span>
                  </div>
                </div>

                {/* Optional Title input */}
                <input 
                  type="text"
                  placeholder="Post Title (Optional)"
                  value={editPostTitle}
                  onChange={(e) => setEditPostTitle(e.target.value)}
                  className="w-full text-sm font-bold text-slate-900 placeholder:text-slate-400 border-b border-slate-100 pb-2 focus:outline-none focus:border-[#1877F2] transition"
                />

                {/* Description textarea */}
                <textarea 
                  rows={editSelectedPostcard ? 3 : 5}
                  placeholder="What's on your mind? Update your story, poem, or reflection..."
                  value={editPostDescription}
                  onChange={(e) => setEditPostDescription(e.target.value)}
                  className="w-full text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none transition leading-relaxed"
                />

                {/* Live Fitted Postcard Canvas Preview */}
                {editSelectedPostcard && (
                  <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200 aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center p-6 text-center group">
                    <img 
                      src={editSelectedPostcard.image_url} 
                      alt={editSelectedPostcard.title || 'Postcard'} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/60" />

                    <div className="relative z-10 max-w-[90%] mx-auto space-y-2 text-white">
                      {editPostTitle && (
                        <h4 className="text-base sm:text-lg font-black tracking-tight drop-shadow-md line-clamp-2">
                          {editPostTitle}
                        </h4>
                      )}

                      <p className="text-xs sm:text-sm font-serif italic leading-relaxed text-white/95 drop-shadow line-clamp-5 whitespace-pre-line">
                        {editPostDescription ? `"${editPostDescription}"` : '"Your quote or poem will fit nicely on top of this postcard..."'}
                      </p>

                      <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-white/80 font-sans">
                        <span className="w-4 h-[1px] bg-white/50" />
                        <span>{currentUser?.name || 'Author'}</span>
                        <span className="w-4 h-[1px] bg-white/50" />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditSelectedPostcard(null);
                        setShowEditPostcardPicker(false);
                      }}
                      className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition cursor-pointer"
                      title="Remove Postcard"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}

                {/* Postcard Selector Drawer (Admin Curated) */}
                {showEditPostcardPicker && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers size={15} className="text-[#1877F2]" />
                        <span className="text-xs font-bold text-slate-800">
                          Select Photo Postcard (Curated by Admin)
                        </span>
                      </div>
                      {editSelectedPostcard && (
                        <button 
                          type="button"
                          onClick={() => setEditSelectedPostcard(null)}
                          className="text-[11px] font-semibold text-red-500 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {postcards.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">
                        No default postcards added by admin yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                        {postcards.map((card) => (
                          <div
                            key={card.postcard_iid}
                            onClick={() => setEditSelectedPostcard(card)}
                            className={`relative aspect-[16/10] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                              editSelectedPostcard?.postcard_iid === card.postcard_iid
                                ? 'border-[#1877F2] scale-102 shadow-md ring-2 ring-blue-400/30'
                                : 'border-transparent opacity-80 hover:opacity-100 hover:border-slate-300'
                            }`}
                          >
                            <img src={card.image_url} alt={card.title || 'Template'} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-1.5">
                              <span className="text-[9px] font-bold text-white truncate drop-shadow">
                                {card.title || 'Template'}
                              </span>
                            </div>
                            {editSelectedPostcard?.postcard_iid === card.postcard_iid && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[10px]">
                                ✓
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Attachments Bar */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Postcard attachment</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEditPostcardPicker(prev => !prev)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        editSelectedPostcard || showEditPostcardPicker
                          ? 'bg-blue-50 text-[#1877F2] border-blue-200'
                          : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <ImageIcon size={16} className="text-emerald-500" />
                      <span>{editSelectedPostcard ? 'Change Photo' : 'Add Photo'}</span>
                    </button>
                  </div>
                </div>

                {/* Important Re-approval Alert */}
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 leading-relaxed flex items-start gap-2.5 shadow-2xs">
                  <Clock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Re-approval Required:</strong> Editing this post will reset its status to <em>Pending Review</em>. It will remain hidden from the public feed until an administrator approves your edits.
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingPost(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEdit}
                    className="px-6 py-2.5 bg-[#1877F2] hover:bg-[#166fe5] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
                  >
                    {submittingEdit ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Updating Post...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} />
                        <span>Save & Submit for Approval</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Login & Registration Modal */}
      <AnimatePresence>
        {authModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200"
            >
              {/* Header Tabs */}
              <div className="p-2 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setAuthTab('login');
                      setErrorMessage(null);
                    }}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      authTab === 'login'
                        ? 'bg-white text-[#1877F2] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setAuthTab('register');
                      setErrorMessage(null);
                    }}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      authTab === 'register'
                        ? 'bg-white text-[#1877F2] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                <button 
                  onClick={() => setAuthModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition mr-1 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6">
                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-medium flex items-start gap-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {authTab === 'login' ? (
                  /* Login Form */
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Username / User ID</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text"
                          required
                          value={loginUserId}
                          onChange={(e) => setLoginUserId(e.target.value)}
                          placeholder="e.g. kabir99"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium focus:bg-white focus:border-[#1877F2] focus:outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium focus:bg-white focus:border-[#1877F2] focus:outline-none transition"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#1877F2] hover:bg-[#166fe5] active:scale-95 text-white font-bold text-sm py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 mt-2 cursor-pointer"
                    >
                      <span>Sign In</span>
                      <ArrowRight size={16} />
                    </button>
                  </form>
                ) : (
                  /* Registration Form */
                  <form onSubmit={handleRegister} className="space-y-3.5">
                    {/* Choose Avatar */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-2">Choose Profile Avatar</label>
                      <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
                        {AVATAR_PRESETS.map((preset, i) => (
                          <img 
                            key={i} 
                            src={preset} 
                            alt={`Preset ${i}`}
                            onClick={() => setRegAvatar(preset)}
                            className={`w-10 h-10 rounded-full object-cover cursor-pointer border-2 transition ${
                              regAvatar === preset ? 'border-[#1877F2] scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                          />
                        ))}
                      </div>
                      <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold text-[#1877F2] hover:underline">
                        <Upload size={13} />
                        <span>{regAvatarUploading ? 'Uploading...' : 'Upload Custom Photo'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAvatarFileChange} 
                          disabled={regAvatarUploading} 
                          className="hidden" 
                        />
                      </label>
                    </div>

                    {/* Name */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Full Name</label>
                      <input 
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Kabir Ahmed"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-medium focus:bg-white focus:border-[#1877F2] focus:outline-none transition"
                      />
                    </div>

                    {/* UserID */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Unique Username</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">@</span>
                        <input 
                          type="text"
                          required
                          value={regUserId}
                          onChange={(e) => setRegUserId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          placeholder="kabir99"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-8 pr-4 py-2 text-xs font-medium focus:bg-white focus:border-[#1877F2] focus:outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Password</label>
                      <input 
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs font-medium focus:bg-white focus:border-[#1877F2] focus:outline-none transition"
                      />
                    </div>

                    {/* WhatsApp Country + Number (Optional) */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">WhatsApp Number (Optional)</label>
                      <div className="flex gap-2">
                        <div className="relative shrink-0 w-32 sm:w-40">
                          <select
                            value={regCountryCode}
                            onChange={(e) => setRegCountryCode(e.target.value)}
                            className="w-full h-9 bg-slate-50 border border-slate-200 rounded-2xl pl-2.5 pr-6 text-xs font-bold text-slate-700 focus:bg-white focus:border-[#1877F2] focus:outline-none transition cursor-pointer appearance-none truncate"
                          >
                            {COUNTRY_LIST.map((c) => (
                              <option key={c.code} value={c.dialCode}>
                                {c.flag} {c.code} ({c.dialCode})
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>

                        <div className="relative flex-1">
                          <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="tel"
                            value={regPhoneNumber}
                            onChange={(e) => setRegPhoneNumber(e.target.value.replace(/\D/g, ''))}
                            placeholder={COUNTRY_LIST.find(c => c.dialCode === regCountryCode)?.placeholder || 'Phone number'}
                            className="w-full h-9 bg-slate-50 border border-slate-200 rounded-2xl pl-8 pr-3 text-xs font-medium focus:bg-white focus:border-[#1877F2] focus:outline-none transition"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 ml-1">
                        Kept strictly private. Not visible to the public.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={regAvatarUploading}
                      className="w-full bg-[#1877F2] hover:bg-[#166fe5] disabled:opacity-50 text-white font-bold text-sm py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 mt-3 cursor-pointer"
                    >
                      <CheckCircle2 size={16} />
                      <span>Complete Registration</span>
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Account Settings Modal */}
      <AnimatePresence>
        {accountSettingsOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 my-8"
            >
              {/* Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1877F2] flex items-center justify-center shadow-xs">
                    <Settings size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-base leading-tight">Account Settings</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Manage your profile details and security</p>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => setAccountSettingsOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 px-6 pt-2 bg-white gap-2">
                <button
                  type="button"
                  onClick={() => setSettingsTab('profile')}
                  className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
                    settingsTab === 'profile'
                      ? 'border-[#1877F2] text-[#1877F2]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <User size={15} />
                  <span>Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsTab('security')}
                  className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
                    settingsTab === 'security'
                      ? 'border-[#1877F2] text-[#1877F2]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Key size={15} />
                  <span>Password & Security</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsTab('info')}
                  className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
                    settingsTab === 'info'
                      ? 'border-[#1877F2] text-[#1877F2]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BadgeCheck size={15} />
                  <span>Status & Quota</span>
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveAccountSettings} className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">
                {/* Alert Banners */}
                {settingsError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-medium flex items-start gap-2"
                  >
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{settingsError}</span>
                  </motion.div>
                )}

                {settingsSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{settingsSuccess}</span>
                  </motion.div>
                )}

                {/* Profile Tab */}
                {settingsTab === 'profile' && (
                  <div className="space-y-4">
                    {/* Avatar Selection */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                      <label className="text-xs font-bold text-slate-700 block">Profile Avatar / Photo</label>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={settingsAvatar || AVATAR_PRESETS[0]} 
                            alt="Current Avatar" 
                            className="w-16 h-16 rounded-full object-cover border-2 border-[#1877F2] shadow-md"
                          />
                          {settingsAvatarUploading && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition">
                            <Upload size={14} className="text-[#1877F2]" />
                            <span>{settingsAvatarUploading ? 'Uploading...' : 'Upload New Photo'}</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleSettingsAvatarUpload} 
                              disabled={settingsAvatarUploading} 
                              className="hidden" 
                            />
                          </label>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                            Upload a photo from your device or select one of the preset avatars below.
                          </p>
                        </div>
                      </div>

                      {/* Presets Carousel */}
                      <div className="pt-2 border-t border-slate-200/60">
                        <span className="text-[11px] font-bold text-slate-600 block mb-2">Preset Avatars:</span>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {AVATAR_PRESETS.map((preset, i) => (
                            <img 
                              key={i} 
                              src={preset} 
                              alt={`Preset ${i}`}
                              onClick={() => setSettingsAvatar(preset)}
                              className={`w-10 h-10 rounded-full object-cover cursor-pointer border-2 transition ${
                                settingsAvatar === preset 
                                  ? 'border-[#1877F2] scale-110 shadow-md ring-2 ring-blue-200' 
                                  : 'border-transparent opacity-70 hover:opacity-100'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Full Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text"
                          required
                          value={settingsName}
                          onChange={(e) => setSettingsName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium focus:bg-white focus:border-[#1877F2] focus:outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Username */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Username / Handle</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">@</span>
                        <input 
                          type="text"
                          required
                          value={settingsUserId}
                          onChange={(e) => setSettingsUserId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          placeholder="username"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-8 pr-4 py-2.5 text-xs font-medium focus:bg-white focus:border-[#1877F2] focus:outline-none transition font-mono"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 ml-2">Lowercase letters, numbers, and underscores only</p>
                    </div>

                    {/* WhatsApp Country + Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">WhatsApp Number</label>
                      <div className="flex gap-2">
                        <div className="relative shrink-0 w-36 sm:w-44">
                          <select
                            value={settingsCountryCode}
                            onChange={(e) => setSettingsCountryCode(e.target.value)}
                            className="w-full h-10 bg-slate-50 border border-slate-200 rounded-2xl pl-3 pr-7 text-xs font-bold text-slate-700 focus:bg-white focus:border-[#1877F2] focus:outline-none transition cursor-pointer appearance-none truncate"
                          >
                            {COUNTRY_LIST.map((c) => (
                              <option key={c.code} value={c.dialCode}>
                                {c.flag} {c.code} ({c.dialCode})
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>

                        <div className="relative flex-1">
                          <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="tel"
                            value={settingsPhoneNumber}
                            onChange={(e) => setSettingsPhoneNumber(e.target.value.replace(/\D/g, ''))}
                            placeholder={COUNTRY_LIST.find(c => c.dialCode === settingsCountryCode)?.placeholder || 'Phone number'}
                            className="w-full h-10 bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 text-xs font-medium focus:bg-white focus:border-[#1877F2] focus:outline-none transition"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 ml-1">
                        Kept strictly private for account security & verification. Not visible to the public.
                      </p>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {settingsTab === 'security' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-2xl text-amber-800 text-xs flex items-start gap-2">
                      <ShieldCheck size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Password Security</span>
                        <span className="text-[11px] text-amber-700 leading-relaxed">
                          Leave these fields blank if you do not wish to change your password.
                        </span>
                      </div>
                    </div>

                    {/* Current Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Current Password</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={settingsCurrentPassword}
                          onChange={(e) => setSettingsCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs font-medium focus:bg-white focus:border-[#1877F2] focus:outline-none transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        >
                          {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">New Password</label>
                      <div className="relative">
                        <Key size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type={showNewPassword ? 'text' : 'password'}
                          value={settingsNewPassword}
                          onChange={(e) => setSettingsNewPassword(e.target.value)}
                          placeholder="Minimum 4 characters"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs font-medium focus:bg-white focus:border-[#1877F2] focus:outline-none transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
                      <div className="relative">
                        <Check size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type={showNewPassword ? 'text' : 'password'}
                          value={settingsConfirmPassword}
                          onChange={(e) => setSettingsConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium focus:bg-white focus:border-[#1877F2] focus:outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Info & Quota Tab */}
                {settingsTab === 'info' && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                        <span className="text-xs font-medium text-slate-500">Database ID</span>
                        <span className="text-xs font-bold font-mono text-slate-800">#{currentUser?.user_iid}</span>
                      </div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                        <span className="text-xs font-medium text-slate-500">Member Since</span>
                        <span className="text-xs font-bold text-slate-800">
                          {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                        <span className="text-xs font-medium text-slate-500">Daily Post Quota</span>
                        <span className="text-xs font-bold text-[#1877F2]">
                          {todayPostCount} / {currentUser?.post_limit || 5} posts today
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Account Status</span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 size={12} /> Verified Member
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>Today's Quota Usage</span>
                        <span>{Math.min(100, Math.round((todayPostCount / (currentUser?.post_limit || 5)) * 100))}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-[#1877F2] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.round((todayPostCount / (currentUser?.post_limit || 5)) * 100))}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 text-center pt-1 font-medium">
                        Each user can create up to 5 posts per day. Quota resets daily at midnight.
                      </p>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAccountSettingsOpen(false)}
                    className="px-5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={settingsLoading || settingsAvatarUploading}
                    className="px-6 py-2.5 bg-[#1877F2] hover:bg-[#166fe5] active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
                  >
                    {settingsLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {zoomImage && (
          <div 
            onClick={() => setZoomImage(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh]"
            >
              <img 
                src={zoomImage} 
                alt="Enlarged view" 
                className="max-h-[90vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />
              <button 
                onClick={() => setZoomImage(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
