// ============================================
// SUPABASE CONFIGURATION
// ============================================
const SUPABASE_URL = 'https://vbfckjroisrhplrpqzkd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiZmNranJvaXNyaHBscnBxemtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDQzODYsImV4cCI6MjA3NzQyMDM4Nn0.nIbdwysoW2dp59eqPh3M9axjxR74rGDkn8OdZciue4Y';

// ============================================
// IMAGE OPTIMIZATION UTILITY
// ============================================
class ImageOptimizer {
    static isMobile() { return window.innerWidth <= 768; }

    static getOptimizedUrl(originalUrl, options = {}) {
        if (!originalUrl) return '';
        const { width = 800, quality = 75, format = 'webp' } = options;
        if (originalUrl.includes('supabase.co/storage')) {
            const url = new URL(originalUrl);
            url.searchParams.set('width', width);
            url.searchParams.set('quality', quality);
            if (format) url.searchParams.set('format', format);
            return url.toString();
        }
        return originalUrl;
    }

    static getThumbnailUrl(originalUrl) {
        const width = this.isMobile() ? 180 : 320;
        return this.getOptimizedUrl(originalUrl, { width, quality: 55, format: 'webp' });
    }

    static getGalleryUrl(originalUrl) {
        const width = this.isMobile() ? 600 : 800;
        return this.getOptimizedUrl(originalUrl, { width, quality: 75, format: 'webp' });
    }

    static getLightboxUrl(originalUrl) {
        const width = this.isMobile() ? 1200 : 1920;
        return this.getOptimizedUrl(originalUrl, { width, quality: 85, format: 'webp' });
    }
}

// ============================================
// SUPABASE CLIENT CLASS
// ============================================
class SupabaseClient {
    constructor(url, anonKey) {
        this.url = url;
        this.anonKey = anonKey;
    }

    async request(method, path, options = {}) {
        const url = `${this.url}/rest/v1${path}`;
        const headers = {
            'Content-Type': 'application/json',
            'apikey': this.anonKey,
            'Authorization': `Bearer ${this.anonKey}`,
            'Prefer': 'return=representation',
            ...options.headers
        };
        const config = { method, headers };
        if (options.body) config.body = JSON.stringify(options.body);

        const response = await fetch(url, config);
        if (!response.ok) throw new Error('Query failed');
        const data = await response.json();
        return options.returnFullResponse ? { data, response } : data;
    }

    async getPhotos(limit = 60, offset = 0, tableName, sectionFilter) {
        const rangeStart = offset;
        const rangeEnd = offset + limit - 1;

        // Build path with section filter
        let path = `/${tableName}?select=image_iid,title,description,image_url,thumbnail_url,section,created_at&order=image_iid.asc`;
        if (sectionFilter) {
            path += `&section=eq.${sectionFilter}`;
        }

        const result = await this.request('GET', path, {
            headers: { 'Range': `${rangeStart}-${rangeEnd}`, 'Prefer': 'count=exact' },
            returnFullResponse: true
        });

        const contentRange = result.response.headers.get('Content-Range');
        let totalCount = 0;
        if (contentRange) {
            const match = contentRange.match(/\/(\d+)$/);
            if (match) totalCount = parseInt(match[1], 10);
        }

        return { photos: result.data, totalCount };
    }
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Intersection Observer for Lazy Loading
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src && img.src.includes('data:image')) {
                const thumb = img.dataset.thumbnail;
                const gallery = img.dataset.gallery;

                img.src = thumb;
                img.style.opacity = '1';
                
                const highRes = new Image();
                highRes.onload = () => {
                    requestAnimationFrame(() => {
                        img.src = gallery || img.dataset.src;
                        img.style.filter = 'none';
                        img.classList.add('loaded');
                    });
                };
                highRes.src = gallery || img.dataset.src;
                observer.unobserve(img);
            }
        }
    });
}, { rootMargin: '200px' });

// ============================================
// STATE & CORE LOGIC
// ============================================
let currentPage = 1;
let totalPhotos = 0;
let currentPhotosData = [];
let currentIdx = 0;

document.addEventListener('DOMContentLoaded', () => {
    loadPhotos();
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (prevBtn) prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; loadPhotos(); window.scrollTo(0,0); } };
    if (nextBtn) nextBtn.onclick = () => { if (currentPage < Math.ceil(totalPhotos/window.PHOTOS_PER_PAGE)) { currentPage++; loadPhotos(); window.scrollTo(0,0); } };
});

async function loadPhotos() {
    const gallery = document.getElementById('gallery');
    const loading = document.getElementById('loading');
    const pagination = document.getElementById('pagination');
    
    loading.style.display = 'block';
    if (currentPage === 1) gallery.innerHTML = '';
    pagination.style.display = 'none';

    try {
        const offset = (currentPage - 1) * window.PHOTOS_PER_PAGE;
        const result = await supabase.getPhotos(window.PHOTOS_PER_PAGE, offset, window.TABLE_NAME, window.SECTION_FILTER);

        totalPhotos = result.totalCount || 0;
        currentPhotosData = result.photos;

        if (result.photos.length === 0) {
            gallery.innerHTML = '<div class="no-data">✨ This collection is empty for now. Check back soon!</div>';
        } else {
            result.photos.forEach((photo, index) => {
                const card = createPhotoCard(photo, index);
                gallery.appendChild(card);
            });
            updatePagination();
            pagination.style.display = 'flex';
        }
    } catch (error) {
        gallery.innerHTML = `<div class="no-data">Oops! Something went wrong while loading.</div>`;
    } finally {
        loading.style.display = 'none';
    }
}

function createPhotoCard(photo, index) {
    const card = document.createElement('div');
    card.className = 'photo-card';
    
    const previewUrl = photo.thumbnail_url || photo.image_url;
    const thumb = ImageOptimizer.getThumbnailUrl(previewUrl);
    const gallery = ImageOptimizer.getGalleryUrl(previewUrl);

    card.innerHTML = `
        <div class="photo-image">
            <img data-src="${photo.image_url}" 
                 data-thumbnail="${thumb}" 
                 data-gallery="${gallery}" 
                 alt="${photo.title || 'Photo'}" 
                 class="photo-image-img" 
                 style="opacity: 0; filter: blur(5px); transition: all 0.6s ease;"
                 src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
        </div>
        <div class="photo-info">
            <h3>${photo.title || 'Untitled'}</h3>
            <p>${photo.description || 'No description available'}</p>
        </div>
    `;

    const img = card.querySelector('img');
    imageObserver.observe(img);

    card.onclick = () => openLightbox(index);
    return card;
}

// Lightbox
function openLightbox(index) {
    currentIdx = index;
    const photo = currentPhotosData[index];
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImage');
    
    img.src = ImageOptimizer.getLightboxUrl(photo.image_url);
    document.getElementById('lightboxTitle').textContent = photo.title || 'Kobir Lyrics';
    document.getElementById('lightboxDescription').textContent = photo.description || '-';
    document.getElementById('imageCounter').textContent = index + 1;
    document.getElementById('totalCounter').textContent = currentPhotosData.length;

    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function nextImage() {
    if (currentIdx < currentPhotosData.length - 1) openLightbox(currentIdx + 1);
}

function prevImage() {
    if (currentIdx > 0) openLightbox(currentIdx - 1);
}

function updatePagination() {
    const pages = Math.ceil(totalPhotos / window.PHOTOS_PER_PAGE);
    const container = document.getElementById('pageNumbers');
    container.innerHTML = '';
    
    for(let i=1; i<=pages; i++) {
        const btn = document.createElement('button');
        btn.className = `btn-pagination ${i === currentPage ? 'active' : ''}`;
        btn.textContent = i;
        btn.onclick = () => { currentPage = i; loadPhotos(); window.scrollTo(0,0); };
        container.appendChild(btn);
    }
}

async function downloadImage() {
    const photo = currentPhotosData[currentIdx];
    const url = photo.image_url;
    const name = (photo.title || 'photo').replace(/\s+/g, '_').toLowerCase();
    
    try {
        const resp = await fetch(url);
        const blob = await resp.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${name}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (e) {
        window.open(url, '_blank');
    }
}

// Global handlers
window.closeLightbox = closeLightbox;
window.nextImage = nextImage;
window.prevImage = prevImage;
window.downloadImage = downloadImage;
