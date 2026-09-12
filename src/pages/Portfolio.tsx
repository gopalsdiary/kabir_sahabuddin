import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { portfolioService, PortfolioData } from '../lib/portfolioService';
import { Photo, fetchAllPhotos } from '../lib/gallery';
import { useSEO } from '../lib/useSEO';
import '../styles/portfolio.css';

export default function Portfolio() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useSEO({
    title: data?.site_metadata?.title || 'Kobir Sahabuddin — Bengali Voice Actor, Author & Storyteller',
    description: data?.site_metadata?.description || 'Official portfolio of Bengali author, poet, voice actor and storyteller Kobir Sahabuddin (কবির সাহাবুদ্দিন).',
    keywords: data?.site_metadata?.keywords || 'Kobir Sahabuddin, কবির সাহাবুদ্দিন, Kabir Sahabuddin, Bengali voice actor, Bengali author, Bengali poet',
    canonical: '/',
    ogImage: data?.site_metadata?.og_image || '/assets/kobir-sahabuddin-portrait.webp',
    ogType: 'profile'
  });

  useEffect(() => {
    let isMounted = true;
    portfolioService.getPortfolioData().then((fetchedData) => {
      if (isMounted) {
        if (fetchedData) {
          setData(fetchedData);
        } else {
          setError('ডাটাবেজ থেকে পোর্টফোলিও তথ্য পাওয়া যায়নি।');
        }
        setLoading(false);
      }
    });

    fetchAllPhotos().then((photoList) => {
      if (isMounted && photoList) {
        setPhotos(photoList);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // IntersectionObserver for reveal animations
  useEffect(() => {
    if (!data) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    const elements = containerRef.current?.querySelectorAll(
      '.hero-copy, .hero-visual, .about-grid, .identity-strip, .book-card, .audio-card, .film-poster, .film-copy, .press-item, .connect-links'
    );

    elements?.forEach((el, index) => {
      el.classList.add('reveal');
      (el as HTMLElement).style.transitionDelay = `${Math.min(index * 35, 280)}ms`;
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [data]);

  const closeMenu = () => setMenuOpen(false);

  if (loading) {
    return (
      <div className="portfolio-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <div className="brand-mark" style={{ width: 64, height: 64, margin: '0 auto 20px', fontSize: '1.4rem', animation: 'pulse 1.8s infinite' }}>KS</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: 'var(--ink)', margin: 0 }}>Kobir Sahabuddin</h2>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem', marginTop: '8px' }}>ডাটাবেস থেকে পোর্টফোলিও লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="portfolio-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px', background: 'var(--paper-2)', padding: '40px 32px', borderRadius: '24px', border: '1px solid var(--border-soft)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: 'var(--ink)', margin: '0 0 12px' }}>ডাটাবেজ কানেকশন সমস্যা</h2>
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
            {error || 'kabirdatabase_home টেবিল থেকে কোনো রেকর্ড পাওয়া যায়নি।'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => window.location.reload()} className="btn-gallery-pill" style={{ cursor: 'pointer' }}>
              পুনরায় চেষ্টা করুন 🔄
            </button>
            <Link to="/gallery" className="btn-secondary" style={{ padding: '10px 20px', borderRadius: '999px', textDecoration: 'none' }}>
              গ্যালারিতে যান ↗
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-page" ref={containerRef}>
      <div className="site-noise" aria-hidden="true" />

      {/* Header */}
      <header className="site-header">
        <a href="#top" className="brand" aria-label="Kobir Sahabuddin home" onClick={closeMenu}>
          <span className="brand-mark">{data.footer.brand_mark || 'KS'}</span>
          <span>
            {data.footer.brand_name_prefix}
            <b>{data.footer.brand_name_bold}</b>
          </span>
        </a>

        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          Menu <span>{menuOpen ? '✕' : '☰'}</span>
        </button>

        <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Primary navigation">
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#books" onClick={closeMenu}>Books</a>
          <a href="#audio" onClick={closeMenu}>Audio</a>
          <a href="#film" onClick={closeMenu}>Film</a>
          <a href="#press" onClick={closeMenu}>Press</a>
          <Link to="/gallery" className="nav-gallery-btn" onClick={closeMenu}>
            Gallery <span>↗</span>
          </Link>
          <Link to="/post" onClick={closeMenu}>Posts</Link>
          <a href="#connect" className="nav-cta" onClick={closeMenu}>
            Connect <span>↗</span>
          </a>
        </nav>
      </header>

      <main id="top">
        {/* Hero Section */}
        <section className="hero section-shell">
          <div className="hero-copy reveal">
            <p className="eyebrow">
              <span className="dot" /> {data.hero.eyebrow}
            </p>
            <h1>
              {data.hero.title_prefix}
              <em>{data.hero.title_emphasis}</em>
              {data.hero.title_suffix}
            </h1>
            <p className="hero-lede">{data.hero.lede}</p>
            <div className="hero-actions">
              <a className="button button-primary" href={data.hero.cta_primary.url}>
                {data.hero.cta_primary.text} <span>↗</span>
              </a>
              <Link to="/gallery" className="button button-gallery">
                Gallery <span>↗</span>
              </Link>
              <a
                className="text-link"
                href={data.hero.cta_secondary.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {data.hero.cta_secondary.text} <span>↗</span>
              </a>
            </div>
            <div className="hero-proof">
              <span className="proof-line" />
              <span>{data.hero.location}</span>
              <span className="proof-sep">·</span>
              <span>{data.hero.birth_date}</span>
            </div>
          </div>

          <div className="hero-visual reveal">
            <div className="hero-frame">
              <img
                src={data.hero.portrait_image || '/assets/kobir-sahabuddin-portrait.webp'}
                alt="Kobir Sahabuddin (কবির সাহাবুদ্দিন) — Bengali Voice Actor, Author & Storyteller"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                width="640"
                height="800"
              />
              <span className="image-tag">{data.hero.image_tag}</span>
            </div>
            <div className="hero-orbit">✦</div>
            <div className="hero-caption">
              <span>{data.hero.caption_number}</span>
              <span>{data.hero.caption_text}</span>
            </div>
          </div>
        </section>

        {/* Marquee Section */}
        <section className="marquee" aria-label="Creative disciplines">
          <div className="marquee-track">
            {data.marquee.concat(data.marquee).map((item, idx) => (
              <React.Fragment key={idx}>
                {item} <span>✦</span>
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="section-shell about section-pad">
          <div className="section-kicker">
            <span>{data.about.kicker_number}</span>
            <span>{data.about.kicker_text}</span>
          </div>
          <div className="about-grid">
            <div>
              <h2>
                {data.about.heading}
                <em>{data.about.heading_emphasis}</em>
              </h2>
            </div>
            <div className="about-copy">
              {data.about.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <a className="text-link" href={data.about.link.url}>
                {data.about.link.text} <span>↗</span>
              </a>
            </div>
          </div>

          <div className="identity-strip">
            {data.about.identity_strip.map((strip, idx) => (
              <div key={idx}>
                <span className="identity-label">{strip.label}</span>
                <strong>{strip.value}</strong>
              </div>
            ))}
          </div>
        </section>

        {/* Books Section */}
        <section id="books" className="section-shell section-pad books">
          <div className="section-heading">
            <div>
              <div className="section-kicker">
                <span>{data.books.kicker_number}</span>
                <span>{data.books.kicker_text}</span>
              </div>
              <h2>{data.books.heading}</h2>
            </div>
            <p>{data.books.description}</p>
          </div>

          <div className="book-grid">
            {data.books.items.map((book) => (
              <article key={book.id} className={`book-card ${book.card_class || ''}`}>
                <div className={`book-cover ${book.cover_class}`}>
                  <span>{book.title_bn}</span>
                  <small>{book.title_en}</small>
                  <i>{book.author}</i>
                </div>
                <div className="book-meta">
                  <span>{book.category}</span>
                  <h3>{book.display_title}</h3>
                  <a href={book.url} target="_blank" rel="noopener noreferrer">
                    {book.action_label}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Audio Section */}
        <section id="audio" className="section-shell section-pad">
          <div className="section-heading">
            <div>
              <div className="section-kicker">
                <span>{data.audio.kicker_number}</span>
                <span>{data.audio.kicker_text}</span>
              </div>
              <h2>
                {data.audio.heading_prefix}
                <em>{data.audio.heading_emphasis}</em>
              </h2>
            </div>
            <a
              className="button button-gallery"
              href={data.audio.channel_cta.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {data.audio.channel_cta.text}
            </a>
          </div>

          <div className="audio-grid">
            {data.audio.items.map((audio) => (
              <article
                key={audio.id}
                className={`audio-card ${audio.is_featured ? 'feature-audio' : ''}`}
              >
                <div className={`audio-art ${audio.art_class}`}>
                  <span>{audio.number}</span>
                  <strong>
                    {audio.title_bn || audio.title}
                  </strong>
                  <small>{audio.subtitle}</small>
                </div>
                <div>
                  <span className="card-type">{audio.category}</span>
                  <h3>{audio.title}</h3>
                  {audio.description && <p>{audio.description}</p>}
                  <a
                    className="text-link"
                    href={audio.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {audio.action_label} <span>↗</span>
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="audio-bottom-links">
            {data.audio.bottom_links.map((link, idx) => (
              <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer">
                {link.text}
              </a>
            ))}
          </div>
        </section>

        {/* Film Section */}
        <section id="film" className="section-shell section-pad film">
          <div className="film-grid">
            <div className="film-poster">
              <div className="poster-copy">
                <span>{data.film.poster.tag}</span>
                <strong>{data.film.poster.title_bn}</strong>
                <small>{data.film.poster.title_en}</small>
                <i>{data.film.poster.studio}</i>
              </div>
              <div className="poster-mark">{data.film.poster.mark}</div>
            </div>

            <div className="film-copy">
              <div className="section-kicker">
                <span>{data.film.kicker_number}</span>
                <span>{data.film.kicker_text}</span>
              </div>
              <h2>
                {data.film.headline_lines.map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
                <em>{data.film.headline_emphasis}</em>
              </h2>
              <p>{data.film.description}</p>
              <div className="film-details">
                {data.film.details.map((detail, idx) => (
                  <span key={idx}>
                    <b>{detail.label}</b>
                    {detail.value}
                  </span>
                ))}
              </div>
              <a
                className="button button-primary"
                href={data.film.cta.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {data.film.cta.text} <span>↗</span>
              </a>
            </div>
          </div>
        </section>

        {/* Press Section */}
        <section id="press" className="section-shell section-pad press">
          <div className="section-heading">
            <div>
              <div className="section-kicker">
                <span>{data.press.kicker_number}</span>
                <span>{data.press.kicker_text}</span>
              </div>
              <h2>{data.press.heading}</h2>
            </div>
            <p>{data.press.description}</p>
          </div>

          <div className="press-list">
            {data.press.items.map((item) => (
              <a
                key={item.id}
                className="press-item"
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="press-no">{item.no}</span>
                <div>
                  <small>{item.source}</small>
                  <h3>{item.title}</h3>
                </div>
                <span className="press-arrow">↗</span>
              </a>
            ))}
          </div>
        </section>

        {/* Photo Gallery Preview Section */}
        {photos.length > 0 && (
          <section id="gallery" className="section-shell section-pad">
            <div className="section-heading">
              <div>
                <div className="section-kicker">
                  <span>06</span>
                  <span>PHOTO &amp; LYRICS GALLERY</span>
                </div>
                <h2>Stories in <em>frames.</em></h2>
              </div>
              <Link to="/gallery" className="button button-gallery">
                Explore Full Gallery ({photos.length}) <span>↗</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {photos.slice(0, 8).map((photo) => (
                <Link
                  key={photo.image_iid}
                  to="/gallery"
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-200 block shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <img
                    src={photo.thumbnail_url || photo.image_url}
                    alt={`${photo.title || 'Kobir Sahabuddin'} — Bengali poetry & aesthetic visual`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <span className="text-white text-xs font-bold line-clamp-1">
                      {photo.title || 'View visual'}
                    </span>
                    {photo.section && (
                      <span className="text-amber-300 text-[10px] uppercase font-semibold tracking-wider">
                        {photo.section}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link to="/gallery" className="button button-primary">
                Explore all {photos.length} visuals &amp; lyrics <span>↗</span>
              </Link>
            </div>
          </section>
        )}

        {/* Connect Section */}
        <section id="connect" className="section-shell connect">
          <div className="connect-grid">
            <div>
              <div className="section-kicker">
                <span>{data.connect.kicker_number === '06' ? '07' : data.connect.kicker_number}</span>
                <span>{data.connect.kicker_text}</span>
              </div>
              <h2>
                {data.connect.heading_prefix}
                <br />
                <em>{data.connect.heading_emphasis}</em>
              </h2>
              <p>{data.connect.description}</p>
            </div>

            <div className="connect-links">
              {data.connect.links.map((link, idx) => (
                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer">
                  <span>{link.platform}</span>
                  <b>{link.action}</b>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-brand">
          <span className="brand-mark">{data.footer.brand_mark}</span>
          <span>
            {data.footer.brand_name_prefix}
            <b>{data.footer.brand_name_bold}</b>
          </span>
        </div>
        <p>{data.footer.tagline}</p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--ink-muted)', margin: '8px 0 12px' }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          <span>·</span>
          <Link to="/gallery" style={{ color: 'inherit', textDecoration: 'none' }}>Gallery</Link>
          <span>·</span>
          <Link to="/post" style={{ color: 'inherit', textDecoration: 'none' }}>Feed</Link>
          <span>·</span>
          <Link to="/sitemap" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>Sitemap</Link>
          <span>·</span>
          <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>XML</a>
        </div>
        <span>{data.footer.copyright}</span>
      </footer>
    </div>
  );
}
