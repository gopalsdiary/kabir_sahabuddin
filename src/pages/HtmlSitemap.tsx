import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, MapPin, BookOpen, Mic, Film, Newspaper, Image as ImageIcon, MessageSquare, Globe, Shield, Code2 } from 'lucide-react';

export default function HtmlSitemap() {
  return (
    <div className="portfolio-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="site-header">
        <div className="header-shell">
          <Link to="/" className="brand">
            <span className="brand-mark">KS</span>
            <span className="brand-text">
              Kobir<b>Sahabuddin</b>
            </span>
          </Link>

          <nav className="desktop-nav">
            <Link to="/">Portfolio</Link>
            <Link to="/gallery">Gallery</Link>
            <Link to="/post">Feed</Link>
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer">
              XML Feed ↗
            </a>
          </nav>

          <Link to="/" className="btn-gallery-pill">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Sitemap Content */}
      <main style={{ flex: 1, padding: '120px 24px 80px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '48px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '32px' }}>
          <div className="section-kicker" style={{ marginBottom: '12px' }}>
            <span>INDEX</span>
            <span>STRUCTURE &amp; DIRECTORY</span>
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.15, marginBottom: '16px' }}>
            Website Sitemap &amp; Content Directory
          </h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: '1.05rem', maxWidth: '680px', lineHeight: 1.6 }}>
            A complete architectural map of all public pages, literary works, audio series, cinematic projects, social platforms, and search engine endpoints for Kobir Sahabuddin.
          </p>
        </div>

        {/* Directory Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          
          {/* 1. Core Web Destinations */}
          <div style={{ background: 'var(--paper-2)', padding: '28px', borderRadius: '16px', border: '1px solid var(--border-soft)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--gold-deep)' }}>
              <Globe size={22} />
              <h2 style={{ fontSize: '1.25rem', fontFamily: 'Playfair Display, serif', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                Primary Pages
              </h2>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <li>
                <Link to="/" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--ink)', textDecoration: 'none', fontWeight: 600 }}>
                  <span>Main Portfolio (Home)</span>
                  <span style={{ fontSize: '0.8rem', background: 'var(--cream)', padding: '2px 8px', borderRadius: '10px', color: 'var(--ink-muted)' }}>/</span>
                </Link>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', margin: '4px 0 0' }}>Author bio, books, audio stories, film presentation &amp; contact.</p>
              </li>
              <li>
                <Link to="/gallery" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--ink)', textDecoration: 'none', fontWeight: 600 }}>
                  <span>Photo &amp; Lyrics Gallery</span>
                  <span style={{ fontSize: '0.8rem', background: 'var(--cream)', padding: '2px 8px', borderRadius: '10px', color: 'var(--ink-muted)' }}>/gallery</span>
                </Link>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', margin: '4px 0 0' }}>Interactive visual gallery, poetry excerpts, and wallpapers.</p>
              </li>
              <li>
                <Link to="/post" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--ink)', textDecoration: 'none', fontWeight: 600 }}>
                  <span>Community Posts &amp; Quotes</span>
                  <span style={{ fontSize: '0.8rem', background: 'var(--cream)', padding: '2px 8px', borderRadius: '10px', color: 'var(--ink-muted)' }}>/post</span>
                </Link>
                <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', margin: '4px 0 0' }}>Live stream of literary quotes, reflections, and thoughts.</p>
              </li>
            </ul>
          </div>

          {/* 2. Portfolio Story Sections */}
          <div style={{ background: 'var(--paper-2)', padding: '28px', borderRadius: '16px', border: '1px solid var(--border-soft)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--gold-deep)' }}>
              <BookOpen size={22} />
              <h2 style={{ fontSize: '1.25rem', fontFamily: 'Playfair Display, serif', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                Portfolio Sections
              </h2>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <a href="/#about" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
                  <span style={{ color: 'var(--gold-deep)', fontWeight: 700, fontSize: '0.85rem' }}>01</span>
                  <span>Biography &amp; Artistic Profile</span>
                </a>
              </li>
              <li>
                <a href="/#books" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
                  <span style={{ color: 'var(--gold-deep)', fontWeight: 700, fontSize: '0.85rem' }}>02</span>
                  <span>Published Books (Durotto, Iti Jibashma)</span>
                </a>
              </li>
              <li>
                <a href="/#audio" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
                  <span style={{ color: 'var(--gold-deep)', fontWeight: 700, fontSize: '0.85rem' }}>03</span>
                  <span>Audio Stories, Podcasts &amp; Voice Works</span>
                </a>
              </li>
              <li>
                <a href="/#film" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
                  <span style={{ color: 'var(--gold-deep)', fontWeight: 700, fontSize: '0.85rem' }}>04</span>
                  <span>Film &amp; Direction (Hotath Dekha 2026)</span>
                </a>
              </li>
              <li>
                <a href="/#press" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
                  <span style={{ color: 'var(--gold-deep)', fontWeight: 700, fontSize: '0.85rem' }}>05</span>
                  <span>Press, Interviews &amp; Milestones</span>
                </a>
              </li>
              <li>
                <a href="/#gallery-preview" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
                  <span style={{ color: 'var(--gold-deep)', fontWeight: 700, fontSize: '0.85rem' }}>06</span>
                  <span>Visual Showcase Preview</span>
                </a>
              </li>
              <li>
                <a href="/#connect" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
                  <span style={{ color: 'var(--gold-deep)', fontWeight: 700, fontSize: '0.85rem' }}>07</span>
                  <span>Direct Connect &amp; Representation</span>
                </a>
              </li>
            </ul>
          </div>

          {/* 3. Industry & Media Verification */}
          <div style={{ background: 'var(--paper-2)', padding: '28px', borderRadius: '16px', border: '1px solid var(--border-soft)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--gold-deep)' }}>
              <Film size={22} />
              <h2 style={{ fontSize: '1.25rem', fontFamily: 'Playfair Display, serif', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                Verified Profiles
              </h2>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <a href="https://www.imdb.com/name/nm18636329/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
                  <span>IMDb Profile</span>
                  <ExternalLink size={14} color="var(--ink-muted)" />
                </a>
              </li>
              <li>
                <a href="https://orcid.org/0009-0000-4424-5825" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
                  <span>ORCID Researcher ID</span>
                  <ExternalLink size={14} color="var(--ink-muted)" />
                </a>
              </li>
              <li>
                <a href="https://open.spotify.com/artist/2E9PU7M6cmaO9blLud06ro" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
                  <span>Spotify Artist Profile</span>
                  <ExternalLink size={14} color="var(--ink-muted)" />
                </a>
              </li>
              <li>
                <a href="https://youtube.com/@heartbeat9903" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
                  <span>YouTube Channel</span>
                  <ExternalLink size={14} color="var(--ink-muted)" />
                </a>
              </li>
              <li>
                <a href="https://musicbrainz.org/artist/3675651e-e20b-4b73-869c-219b4781bb87" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
                  <span>MusicBrainz Artist Directory</span>
                  <ExternalLink size={14} color="var(--ink-muted)" />
                </a>
              </li>
            </ul>
          </div>

          {/* 4. Crawler & Machine Endpoints */}
          <div style={{ background: 'var(--paper-2)', padding: '28px', borderRadius: '16px', border: '1px solid var(--border-soft)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--gold-deep)' }}>
              <Code2 size={22} />
              <h2 style={{ fontSize: '1.25rem', fontFamily: 'Playfair Display, serif', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                Machine &amp; SEO Endpoints
              </h2>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
                  <span>sitemap.xml (XML Index)</span>
                  <ExternalLink size={14} color="var(--ink-muted)" />
                </a>
                <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', margin: '2px 0 0' }}>Google Image, Video, and multilingual schema feed.</p>
              </li>
              <li>
                <a href="/robots.txt" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
                  <span>robots.txt (Crawl Policy)</span>
                  <ExternalLink size={14} color="var(--ink-muted)" />
                </a>
              </li>
              <li>
                <a href="/manifest.json" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
                  <span>manifest.json (PWA Manifest)</span>
                  <ExternalLink size={14} color="var(--ink-muted)" />
                </a>
              </li>
              <li>
                <a href="/google1c8e41d2e3f09e50.html" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--ink)', textDecoration: 'none', fontWeight: 500 }}>
                  <span>Google Search Console Token</span>
                  <ExternalLink size={14} color="var(--ink-muted)" />
                </a>
              </li>
            </ul>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-brand">
          <span className="brand-mark">KS</span>
          <span>
            Kobir<b>Sahabuddin</b>
          </span>
        </div>
        <p>Bengali Voice Actor · Author · Poet · Storyteller</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: '8px' }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          <span>·</span>
          <Link to="/gallery" style={{ color: 'inherit', textDecoration: 'none' }}>Gallery</Link>
          <span>·</span>
          <Link to="/post" style={{ color: 'inherit', textDecoration: 'none' }}>Feed</Link>
          <span>·</span>
          <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>XML Sitemap</a>
        </div>
        <span style={{ marginTop: '12px' }}>© {new Date().getFullYear()} Kobir Sahabuddin. All rights reserved.</span>
      </footer>
    </div>
  );
}
