import React, { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Headphones,
  Film,
  Newspaper,
  Share2,
  User,
  Layout,
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';
import {
  portfolioService,
  PortfolioData,
  BookItem,
  AudioItem,
  PressItem,
  ConnectLink
} from '../lib/portfolioService';

type SectionKey = 'hero' | 'about' | 'books' | 'audio' | 'film' | 'press' | 'connect' | 'footer';

interface SectionMeta {
  key: SectionKey;
  label: string;
  sub: string;
  icon: React.ReactNode;
}

const SECTIONS: SectionMeta[] = [
  { key: 'hero', label: 'Hero & Banner', sub: 'Hero & Intro', icon: <User size={18} /> },
  { key: 'about', label: 'About & Biography', sub: 'Bio & Story', icon: <Info size={18} /> },
  { key: 'books', label: 'Published Books', sub: 'Bibliography', icon: <BookOpen size={18} /> },
  { key: 'audio', label: 'Audio & Voice Works', sub: 'Audio Stories', icon: <Headphones size={18} /> },
  { key: 'film', label: 'Film & Direction', sub: 'Hotath Dekha Film', icon: <Film size={18} /> },
  { key: 'press', label: 'Press & Media', sub: 'Press & Media', icon: <Newspaper size={18} /> },
  { key: 'connect', label: 'Connect & Socials', sub: 'Social Channels', icon: <Share2 size={18} /> },
  { key: 'footer', label: 'Footer & Site Meta', sub: 'Footer & SEO', icon: <Layout size={18} /> },
];

export default function AdminPortfolioEditor() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>('hero');
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await portfolioService.getPortfolioData();
      if (res) {
        setData(res);
      } else {
        setMessage({
          type: 'error',
          text: 'No records found in database (kabirdatabase_home). Please verify the SQL insert was completed.'
        });
      }
    } catch (e: any) {
      console.error(e);
      setMessage({ type: 'error', text: 'Error loading from database: ' + (e?.message || '') });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save only the currently active section to Supabase
   */
  const handleSaveCurrentSection = async () => {
    if (!data) return;
    setSavingSection(activeSection);
    setMessage(null);

    const activeMeta = SECTIONS.find(s => s.key === activeSection);
    const sectionName = activeMeta ? activeMeta.label : activeSection;

    try {
      const value = (data as any)[activeSection];
      const res = await portfolioService.savePortfolioSection(activeSection, value);
      if (res.success) {
        setMessage({
          type: 'success',
          text: `✓ "${sectionName}" section saved to database successfully! (${new Date().toLocaleTimeString('en-US')})`
        });
      } else {
        setMessage({
          type: 'error',
          text: `Failed to save "${sectionName}": ${res.error?.message || 'Unknown error'}`
        });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to save section.' });
    } finally {
      setSavingSection(null);
    }
  };

  /**
   * Save all sections together
   */
  const handleSaveAll = async () => {
    if (!data) return;
    setSavingAll(true);
    setMessage(null);
    try {
      const res = await portfolioService.savePortfolioData(data);
      if (res.success) {
        setMessage({
          type: 'success',
          text: `✓ All portfolio sections saved to database successfully! (${new Date().toLocaleTimeString('en-US')})`
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Failed to save portfolio data. Please check Supabase RLS policies.'
        });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to save.' });
    } finally {
      setSavingAll(false);
    }
  };

  // Helper updaters
  const updateHero = (field: string, val: any) => {
    if (!data) return;
    setData({
      ...data,
      hero: { ...data.hero, [field]: val }
    });
  };

  const updateAbout = (field: string, val: any) => {
    if (!data) return;
    setData({
      ...data,
      about: { ...data.about, [field]: val }
    });
  };

  const updateFilm = (field: string, val: any) => {
    if (!data) return;
    setData({
      ...data,
      film: { ...data.film, [field]: val }
    });
  };

  const updateFooter = (field: string, val: any) => {
    if (!data) return;
    setData({
      ...data,
      footer: { ...data.footer, [field]: val }
    });
  };

  const updateSiteMeta = (field: string, val: any) => {
    if (!data) return;
    setData({
      ...data,
      site_metadata: { ...data.site_metadata, [field]: val }
    });
  };

  // Books handlers
  const handleAddBook = () => {
    if (!data) return;
    const newBook: BookItem = {
      id: `book-${Date.now()}`,
      title_bn: 'নতুন বই',
      title_en: 'NEW BOOK TITLE',
      author: 'Kobir Sahabuddin',
      category: 'Bengali Literature',
      display_title: 'New Book Title',
      url: 'https://',
      action_label: 'Google Play ↗',
      cover_class: 'cover-one'
    };
    setData({
      ...data,
      books: {
        ...data.books,
        items: [...(data.books.items || []), newBook]
      }
    });
  };

  const handleUpdateBook = (index: number, field: keyof BookItem, val: string) => {
    if (!data) return;
    const updated = [...(data.books.items || [])];
    updated[index] = { ...updated[index], [field]: val };
    setData({
      ...data,
      books: { ...data.books, items: updated }
    });
  };

  const handleRemoveBook = (index: number) => {
    if (!data) return;
    setData({
      ...data,
      books: {
        ...data.books,
        items: data.books.items.filter((_, i) => i !== index)
      }
    });
  };

  // Audio handlers
  const handleAddAudio = () => {
    if (!data) return;
    const newAudio: AudioItem = {
      id: `audio-${Date.now()}`,
      number: `0${(data.audio.items?.length || 0) + 1}`,
      title: 'New Audio Story',
      title_bn: 'নতুন অডিও গল্প',
      subtitle: 'In Heartbeat Audio',
      category: 'Audio Story',
      description: 'Audio story synopsis and details',
      url: 'https://',
      action_label: 'Listen on Spotify ↗',
      art_class: 'art-tram'
    };
    setData({
      ...data,
      audio: {
        ...data.audio,
        items: [...(data.audio.items || []), newAudio]
      }
    });
  };

  const handleUpdateAudio = (index: number, field: keyof AudioItem, val: string) => {
    if (!data) return;
    const updated = [...(data.audio.items || [])];
    updated[index] = { ...updated[index], [field]: val };
    setData({
      ...data,
      audio: { ...data.audio, items: updated }
    });
  };

  const handleRemoveAudio = (index: number) => {
    if (!data) return;
    setData({
      ...data,
      audio: {
        ...data.audio,
        items: data.audio.items.filter((_, i) => i !== index)
      }
    });
  };

  // Press handlers
  const handleAddPress = () => {
    if (!data) return;
    const newPress: PressItem = {
      id: `press-${Date.now()}`,
      no: `0${(data.press.items?.length || 0) + 1}`,
      source: 'MEDIA OUTLET · 2026',
      title: 'Featured Story Headline',
      url: 'https://'
    };
    setData({
      ...data,
      press: {
        ...data.press,
        items: [...(data.press.items || []), newPress]
      }
    });
  };

  const handleUpdatePress = (index: number, field: keyof PressItem, val: string) => {
    if (!data) return;
    const updated = [...(data.press.items || [])];
    updated[index] = { ...updated[index], [field]: val };
    setData({
      ...data,
      press: { ...data.press, items: updated }
    });
  };

  const handleRemovePress = (index: number) => {
    if (!data) return;
    setData({
      ...data,
      press: {
        ...data.press,
        items: data.press.items.filter((_, i) => i !== index)
      }
    });
  };

  // Connect links handlers
  const handleAddLink = () => {
    if (!data) return;
    const newLink: ConnectLink = {
      platform: 'New Platform',
      action: 'Follow ↗',
      url: 'https://'
    };
    setData({
      ...data,
      connect: {
        ...data.connect,
        links: [...(data.connect.links || []), newLink]
      }
    });
  };

  const handleUpdateLink = (index: number, field: keyof ConnectLink, val: string) => {
    if (!data) return;
    const updated = [...(data.connect.links || [])];
    updated[index] = { ...updated[index], [field]: val };
    setData({
      ...data,
      connect: { ...data.connect, links: updated }
    });
  };

  const handleRemoveLink = (index: number) => {
    if (!data) return;
    setData({
      ...data,
      connect: {
        ...data.connect,
        links: data.connect.links.filter((_, i) => i !== index)
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-700">Loading portfolio data from database (kabirdatabase_home)...</p>
        <span className="text-xs text-slate-400 mt-1">Directly retrieving realtime rows from Supabase</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-10 bg-white rounded-3xl border border-slate-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No Portfolio Data Found</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          {message?.text || 'No record found in kabirdatabase_home. Please ensure the SQL insert query has been executed in Supabase.'}
        </p>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition"
        >
          <RefreshCw size={15} />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  const activeMeta = SECTIONS.find(s => s.key === activeSection) || SECTIONS[0];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected to Live Database (Row #{data.id || 1})
            </span>
            <span className="text-xs text-slate-400 font-mono">kabirdatabase_home</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Portfolio Content Management</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Edit sections independently and click <b className="text-indigo-600">"Save This Section"</b> below to update Supabase.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={loadData}
            title="Reload from database"
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
          >
            <ExternalLink size={14} />
            <span>View Live Site</span>
          </a>

          <button
            onClick={handleSaveAll}
            disabled={savingAll}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition shadow-sm disabled:opacity-50"
          >
            <Save size={14} />
            <span>{savingAll ? 'Saving all...' : 'Save All Sections'}</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
              : 'bg-red-50 text-red-800 border border-red-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-700 ml-4 font-normal text-sm">✕</button>
        </div>
      )}

      {/* Section Switcher Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SECTIONS.map((sec) => {
          const isActive = activeSection === sec.key;
          return (
            <button
              key={sec.key}
              type="button"
              onClick={() => {
                setActiveSection(sec.key);
                setMessage(null);
              }}
              className={`p-3.5 rounded-2xl text-left transition-all border flex items-center gap-3.5 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-600/20'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/30 shadow-xs'
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${isActive ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                {sec.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black leading-tight text-inherit">{sec.label}</p>
                <p className={`text-[11px] font-medium mt-0.5 ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>{sec.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Section Content Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Section Action Bar (Per-section save option) */}
        <div className="p-6 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              {activeMeta.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  Column: {activeSection}
                </span>
                <span className="text-xs text-slate-400">JSONB Format</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">{activeMeta.label}</h3>
            </div>
          </div>

          {/* Section Individual Save Button */}
          <button
            onClick={handleSaveCurrentSection}
            disabled={savingSection === activeSection}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer"
          >
            <Save size={16} />
            <span>
              {savingSection === activeSection
                ? 'Saving...'
                : `💾 Save ${activeMeta.label}`}
            </span>
          </button>
        </div>

        <div className="p-6 md:p-8">
          {/* ================= 1. HERO SECTION ================= */}
          {activeSection === 'hero' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Eyebrow Tag</label>
                  <input
                    type="text"
                    value={data.hero.eyebrow || ''}
                    onChange={(e) => updateHero('eyebrow', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-600"
                    placeholder="OFFICIAL PORTFOLIO · 2026"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={data.hero.location || ''}
                    onChange={(e) => updateHero('location', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-600"
                    placeholder="West Bengal, India"
                  />
                </div>
              </div>

              {/* Title breakdown */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-4">
                <p className="text-xs font-bold text-slate-800">Main Heading Structure</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Prefix Text</label>
                    <input
                      type="text"
                      value={data.hero.title_prefix || ''}
                      onChange={(e) => updateHero('title_prefix', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                      placeholder="Stories that "
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-indigo-600 mb-1">Emphasis (Italic) Text</label>
                    <input
                      type="text"
                      value={data.hero.title_emphasis || ''}
                      onChange={(e) => updateHero('title_emphasis', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700"
                      placeholder="stay"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Suffix Text</label>
                    <input
                      type="text"
                      value={data.hero.title_suffix || ''}
                      onChange={(e) => updateHero('title_suffix', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                      placeholder=" after the book is closed."
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Lede / Summary Description</label>
                <textarea
                  rows={3}
                  value={data.hero.lede || ''}
                  onChange={(e) => updateHero('lede', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Call to Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
                  <p className="text-xs font-bold text-slate-800">Primary Action Button</p>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Button Text</label>
                    <input
                      type="text"
                      value={data.hero.cta_primary?.text || ''}
                      onChange={(e) => updateHero('cta_primary', { ...data.hero.cta_primary, text: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Button Link (URL / Anchor)</label>
                    <input
                      type="text"
                      value={data.hero.cta_primary?.url || ''}
                      onChange={(e) => updateHero('cta_primary', { ...data.hero.cta_primary, url: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
                  <p className="text-xs font-bold text-slate-800">Secondary Action Link</p>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Link Text</label>
                    <input
                      type="text"
                      value={data.hero.cta_secondary?.text || ''}
                      onChange={(e) => updateHero('cta_secondary', { ...data.hero.cta_secondary, text: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Link URL</label>
                    <input
                      type="text"
                      value={data.hero.cta_secondary?.url || ''}
                      onChange={(e) => updateHero('cta_secondary', { ...data.hero.cta_secondary, url: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Portrait & Media */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Portrait Image Path / URL</label>
                  <input
                    type="text"
                    value={data.hero.portrait_image || ''}
                    onChange={(e) => updateHero('portrait_image', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    placeholder="/assets/kobir-sahabuddin-portrait.webp"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Use local path like <code>/assets/kobir-sahabuddin-portrait.webp</code> or an external image link.
                  </span>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                  <img
                    src={data.hero.portrait_image}
                    alt="Portrait Preview"
                    className="w-16 h-20 object-cover rounded-xl border border-slate-200 shadow-sm"
                    onError={(e: any) => { e.target.src = '/assets/kobir-sahabuddin-portrait.jpg'; }}
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Image Preview</p>
                    <p className="text-[11px] text-slate-500">{data.hero.image_tag || 'Official portrait'}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{data.hero.caption_text}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. ABOUT SECTION ================= */}
          {activeSection === 'about' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Kicker Label</label>
                  <input
                    type="text"
                    value={data.about.kicker_text || ''}
                    onChange={(e) => updateAbout('kicker_text', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Kicker Number</label>
                  <input
                    type="text"
                    value={data.about.kicker_number || ''}
                    onChange={(e) => updateAbout('kicker_number', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Heading</label>
                  <input
                    type="text"
                    value={data.about.heading || ''}
                    onChange={(e) => updateAbout('heading', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Heading Emphasis</label>
                  <input
                    type="text"
                    value={data.about.heading_emphasis || ''}
                    onChange={(e) => updateAbout('heading_emphasis', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              {/* Paragraphs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">About Paragraphs</label>
                  <button
                    type="button"
                    onClick={() => {
                      updateAbout('paragraphs', [...(data.about.paragraphs || []), 'New paragraph content...']);
                    }}
                    className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Paragraph
                  </button>
                </div>
                {(data.about.paragraphs || []).map((p, idx) => (
                  <div key={idx} className="flex gap-2">
                    <textarea
                      rows={3}
                      value={p}
                      onChange={(e) => {
                        const updated = [...data.about.paragraphs];
                        updated[idx] = e.target.value;
                        updateAbout('paragraphs', updated);
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = data.about.paragraphs.filter((_, i) => i !== idx);
                        updateAbout('paragraphs', updated);
                      }}
                      className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition self-start"
                      title="Remove paragraph"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Identity Strip */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800">Identity Strip &amp; Metadata Tags</p>
                  <button
                    type="button"
                    onClick={() => {
                      updateAbout('identity_strip', [
                        ...(data.about.identity_strip || []),
                        { label: 'Label', value: 'Value' }
                      ]);
                    }}
                    className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Tag
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {(data.about.identity_strip || []).map((item, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 relative group">
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => {
                          const updated = [...data.about.identity_strip];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          updateAbout('identity_strip', updated);
                        }}
                        className="text-[10px] font-bold text-slate-400 uppercase tracking-wider w-full bg-transparent border-b border-transparent focus:border-indigo-300 pb-1 mb-1 outline-none"
                      />
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => {
                          const updated = [...data.about.identity_strip];
                          updated[idx] = { ...updated[idx], value: e.target.value };
                          updateAbout('identity_strip', updated);
                        }}
                        className="text-xs font-bold text-slate-800 w-full bg-transparent outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = data.about.identity_strip.filter((_, i) => i !== idx);
                          updateAbout('identity_strip', updated);
                        }}
                        className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. BOOKS SECTION ================= */}
          {activeSection === 'books' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Section Heading</label>
                  <input
                    type="text"
                    value={data.books.heading || ''}
                    onChange={(e) => setData({ ...data, books: { ...data.books, heading: e.target.value } })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={data.books.description || ''}
                    onChange={(e) => setData({ ...data, books: { ...data.books, description: e.target.value } })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Total Books: {data.books.items?.length || 0}
                </h4>
                <button
                  onClick={handleAddBook}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <Plus size={14} />
                  <span>Add New Book</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data.books.items || []).map((book, idx) => (
                  <div key={book.id || idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 relative group">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">BOOK #{idx + 1}</span>
                      <button
                        onClick={() => handleRemoveBook(idx)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition"
                        title="Delete Book"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Bengali Title</label>
                        <input
                          type="text"
                          value={book.title_bn}
                          onChange={(e) => handleUpdateBook(idx, 'title_bn', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                          placeholder="দূরত্ব"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">English Title</label>
                        <input
                          type="text"
                          value={book.title_en}
                          onChange={(e) => handleUpdateBook(idx, 'title_en', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                          placeholder="DUROTTO"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Category</label>
                        <input
                          type="text"
                          value={book.category}
                          onChange={(e) => handleUpdateBook(idx, 'category', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          placeholder="Poetry Collection"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Cover Theme (Class)</label>
                        <select
                          value={book.cover_class}
                          onChange={(e) => handleUpdateBook(idx, 'cover_class', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                        >
                          <option value="cover-one">Cover One (Classic Amber)</option>
                          <option value="cover-two">Cover Two (Forest Emerald)</option>
                          <option value="cover-three">Cover Three (Deep Charcoal)</option>
                          <option value="cover-four">Cover Four (Indigo Slate)</option>
                          <option value="cover-five">Cover Five (Terracotta Warm)</option>
                          <option value="cover-six">Cover Six (Golden Ochre)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Google Play / Purchase Link (URL)</label>
                      <input
                        type="text"
                        value={book.url}
                        onChange={(e) => handleUpdateBook(idx, 'url', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                        placeholder="https://share.google/..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 4. AUDIO SECTION ================= */}
          {activeSection === 'audio' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Heading Prefix</label>
                  <input
                    type="text"
                    value={data.audio.heading_prefix || ''}
                    onChange={(e) => setData({ ...data, audio: { ...data.audio, heading_prefix: e.target.value } })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Heading Emphasis</label>
                  <input
                    type="text"
                    value={data.audio.heading_emphasis || ''}
                    onChange={(e) => setData({ ...data, audio: { ...data.audio, heading_emphasis: e.target.value } })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-indigo-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Audio Stories &amp; Series: {data.audio.items?.length || 0}
                </h4>
                <button
                  onClick={handleAddAudio}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <Plus size={14} />
                  <span>Add Audio Track</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(data.audio.items || []).map((audio, idx) => (
                  <div key={audio.id || idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 relative group">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">AUDIO #{audio.number || idx + 1}</span>
                      <button
                        onClick={() => handleRemoveAudio(idx)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Title</label>
                      <input
                        type="text"
                        value={audio.title}
                        onChange={(e) => handleUpdateAudio(idx, 'title', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Subtitle / Series Name</label>
                      <input
                        type="text"
                        value={audio.subtitle}
                        onChange={(e) => handleUpdateAudio(idx, 'subtitle', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Spotify / YouTube Link</label>
                      <input
                        type="text"
                        value={audio.url}
                        onChange={(e) => handleUpdateAudio(idx, 'url', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Art Theme (Class)</label>
                      <select
                        value={audio.art_class}
                        onChange={(e) => handleUpdateAudio(idx, 'art_class', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                      >
                        <option value="art-tram">Art Tram (Golden Vintage)</option>
                        <option value="art-horror">Art Horror (Mystic Suspense)</option>
                        <option value="art-mist">Art Mist (Atmospheric Noir)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 5. FILM SECTION ================= */}
          {activeSection === 'film' && (
            <div className="space-y-6">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-4">
                <p className="text-xs font-bold text-slate-800">Movie Poster Metadata</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Bengali Title</label>
                    <input
                      type="text"
                      value={data.film.poster?.title_bn || ''}
                      onChange={(e) => updateFilm('poster', { ...data.film.poster, title_bn: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">English Title</label>
                    <input
                      type="text"
                      value={data.film.poster?.title_en || ''}
                      onChange={(e) => updateFilm('poster', { ...data.film.poster, title_en: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Studio / Producer</label>
                    <input
                      type="text"
                      value={data.film.poster?.studio || ''}
                      onChange={(e) => updateFilm('poster', { ...data.film.poster, studio: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Tag / Category</label>
                    <input
                      type="text"
                      value={data.film.poster?.tag || ''}
                      onChange={(e) => updateFilm('poster', { ...data.film.poster, tag: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Film Synopsis &amp; Overview</label>
                <textarea
                  rows={4}
                  value={data.film.description || ''}
                  onChange={(e) => updateFilm('description', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">IMDb / Watch Link</label>
                  <input
                    type="text"
                    value={data.film.cta?.url || ''}
                    onChange={(e) => updateFilm('cta', { ...data.film.cta, url: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Button Label</label>
                  <input
                    type="text"
                    value={data.film.cta?.text || ''}
                    onChange={(e) => updateFilm('cta', { ...data.film.cta, text: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= 6. PRESS SECTION ================= */}
          {activeSection === 'press' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Press &amp; Media Features: {data.press.items?.length || 0}
                  </h4>
                </div>
                <button
                  onClick={handleAddPress}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <Plus size={14} />
                  <span>Add Press Feature</span>
                </button>
              </div>

              <div className="space-y-3">
                {(data.press.items || []).map((item, idx) => (
                  <div key={item.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-col md:flex-row items-start md:items-center gap-3">
                    <span className="text-xs font-mono font-bold text-indigo-600 w-8">{item.no}</span>
                    <input
                      type="text"
                      value={item.source}
                      onChange={(e) => handleUpdatePress(idx, 'source', e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold w-full md:w-56"
                      placeholder="Outlet Name (e.g. SPOTIFY VERIFIED)"
                    />
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdatePress(idx, 'title', e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium flex-1 w-full"
                      placeholder="Headline or Feature description"
                    />
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) => handleUpdatePress(idx, 'url', e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono w-full md:w-56"
                      placeholder="https://..."
                    />
                    <button
                      onClick={() => handleRemovePress(idx)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-xl transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 7. CONNECT SECTION ================= */}
          {activeSection === 'connect' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Heading Prefix</label>
                  <input
                    type="text"
                    value={data.connect.heading_prefix || ''}
                    onChange={(e) => setData({ ...data, connect: { ...data.connect, heading_prefix: e.target.value } })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Heading Emphasis</label>
                  <input
                    type="text"
                    value={data.connect.heading_emphasis || ''}
                    onChange={(e) => setData({ ...data, connect: { ...data.connect, heading_emphasis: e.target.value } })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={data.connect.description || ''}
                  onChange={(e) => setData({ ...data, connect: { ...data.connect, description: e.target.value } })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Social Channels &amp; Links: {data.connect.links?.length || 0}
                </h4>
                <button
                  onClick={handleAddLink}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <Plus size={14} />
                  <span>Add Social Link</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(data.connect.links || []).map((link, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 relative group">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={link.platform}
                        onChange={(e) => handleUpdateLink(idx, 'platform', e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 w-full mr-2"
                        placeholder="Platform"
                      />
                      <button
                        onClick={() => handleRemoveLink(idx)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={link.action}
                        onChange={(e) => handleUpdateLink(idx, 'action', e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 w-full"
                        placeholder="Action (e.g. Follow ↗)"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => handleUpdateLink(idx, 'url', e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-500 w-full"
                        placeholder="URL"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 8. FOOTER & METADATA ================= */}
          {activeSection === 'footer' && (
            <div className="space-y-6">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-4">
                <p className="text-xs font-bold text-slate-800">Footer &amp; Branding Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Brand Monogram</label>
                    <input
                      type="text"
                      value={data.footer.brand_mark || ''}
                      onChange={(e) => updateFooter('brand_mark', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center"
                      placeholder="KS"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Brand Prefix</label>
                    <input
                      type="text"
                      value={data.footer.brand_name_prefix || ''}
                      onChange={(e) => updateFooter('brand_name_prefix', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                      placeholder="Kobir "
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Brand Name (Bold)</label>
                    <input
                      type="text"
                      value={data.footer.brand_name_bold || ''}
                      onChange={(e) => updateFooter('brand_name_bold', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                      placeholder="Sahabuddin"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Tagline</label>
                    <input
                      type="text"
                      value={data.footer.tagline || ''}
                      onChange={(e) => updateFooter('tagline', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                      placeholder="Author · Poet · Voice Actor · Storyteller"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Copyright Notice</label>
                    <input
                      type="text"
                      value={data.footer.copyright || ''}
                      onChange={(e) => updateFooter('copyright', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                      placeholder="© 2026 Kobir Sahabuddin. All creative work reserved."
                    />
                  </div>
                </div>
              </div>

              {/* Site Metadata / SEO */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-4">
                <p className="text-xs font-bold text-slate-800">Search Engine Metadata (SEO)</p>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Page Title (Browser tab &amp; Search Engine title)</label>
                  <input
                    type="text"
                    value={data.site_metadata?.title || ''}
                    onChange={(e) => updateSiteMeta('title', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Meta Description</label>
                  <textarea
                    rows={2}
                    value={data.site_metadata?.description || ''}
                    onChange={(e) => updateSiteMeta('description', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Sticky/Bottom Save Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Current Section: <b className="text-slate-800">{activeMeta.label}</b>
          </span>
          <button
            onClick={handleSaveCurrentSection}
            disabled={savingSection === activeSection}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-sm disabled:opacity-50"
          >
            <Save size={15} />
            <span>
              {savingSection === activeSection
                ? 'Saving...'
                : `💾 Save ${activeMeta.label}`}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
