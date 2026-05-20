import { fetchJSON } from '../global.js';

const posts = await fetchJSON('../lib/photos.json');
const grid = document.querySelector('.photo-grid');
const lightbox = document.querySelector('.photo-lightbox');
const lbTitle = lightbox.querySelector('[data-lightbox-title]');
const lbMedia = lightbox.querySelector('[data-media]');
const lbCaption = lightbox.querySelector('[data-caption]');
const lbCounter = lightbox.querySelector('[data-counter]');
const lbMeta = lightbox.querySelector('[data-meta]');

let activePost = null;
let activeIndex = 0;

function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function isVideo(path) {
    return /\.(mp4|m4v|mov|webm)$/i.test(path);
}

function resolveAsset(path) {
    return path.startsWith('http') ? path : `../${path}`;
}

function formatDate(d) {
    if (!d) return '';
    const trimmed = String(d).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
        const date = new Date(trimmed);
        if (!Number.isNaN(date.getTime())) {
            return date
                .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                .toUpperCase();
        }
    }
    return trimmed.toUpperCase();
}

function renderGrid() {
    grid.innerHTML = '';

    if (!Array.isArray(posts) || posts.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'no-posts';
        empty.textContent = 'No photo posts yet.';
        grid.appendChild(empty);
        return;
    }

    posts.forEach((post, i) => {
        const title = escapeHtml(post.title || post.slug || 'Untitled');
        const cover = escapeHtml(resolveAsset(post.cover || ''));
        const count = Array.isArray(post.media) ? post.media.length : 0;
        const hasVideo = Array.isArray(post.media) && post.media.some(isVideo);
        const date = formatDate(post.date);
        const location = escapeHtml(post.location || '');

        const statusBits = [];
        if (location) statusBits.push(location);
        if (date) statusBits.push(date);
        if (count) statusBits.push(`${count} ITEMS`);

        const card = document.createElement('article');
        card.className = 'photo-card';
        card.dataset.index = String(i);
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Open ${post.title || post.slug}`);
        card.innerHTML = `
            <div class="window">
                <div class="window-titlebar">
                    <span class="window-controls">
                        <span class="dot dot-close"></span>
                        <span class="dot dot-min"></span>
                        <span class="dot dot-max"></span>
                    </span>
                    <span class="window-title">${title}</span>
                </div>
                <div class="window-body photo-card-body">
                    <img class="photo-cover" src="${cover}" alt="${title}" loading="lazy">
                    ${hasVideo ? '<span class="photo-badge">VIDEO</span>' : ''}
                </div>
                <div class="window-statusbar">${statusBits.join(' // ') || '—'}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderActiveMedia() {
    if (!activePost) return;
    const media = activePost.media || [];
    if (media.length === 0) {
        lbMedia.innerHTML = '<p class="photo-lightbox-empty">No media in this post yet.</p>';
        lbCounter.textContent = '0 / 0';
        return;
    }

    activeIndex = ((activeIndex % media.length) + media.length) % media.length;
    const src = resolveAsset(media[activeIndex]);

    if (isVideo(src)) {
        lbMedia.innerHTML = `<video class="photo-lightbox-video" src="${escapeHtml(src)}" controls playsinline preload="metadata"></video>`;
    } else {
        lbMedia.innerHTML = `<img class="photo-lightbox-image" src="${escapeHtml(src)}" alt="">`;
    }

    lbCounter.textContent = `${activeIndex + 1} / ${media.length}`;
}

function openLightbox(post) {
    activePost = post;
    activeIndex = 0;
    lbTitle.textContent = (post.title || post.slug || 'Post').toUpperCase();
    lbCaption.innerHTML = post.caption
        ? escapeHtml(post.caption).replace(/\n\n/g, '</p><p>').replace(/^/, '<p>') + '</p>'
        : '<p class="photo-caption-empty">No caption yet.</p>';

    const metaBits = [];
    if (post.location) metaBits.push(escapeHtml(post.location));
    if (post.date) metaBits.push(escapeHtml(formatDate(post.date)));
    lbMeta.textContent = metaBits.join(' // ');

    renderActiveMedia();
    lightbox.hidden = false;
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
}

function closeLightbox() {
    lightbox.hidden = true;
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    lbMedia.innerHTML = '';
    activePost = null;
}

function step(delta) {
    if (!activePost || !activePost.media || activePost.media.length === 0) return;
    activeIndex += delta;
    renderActiveMedia();
}

grid.addEventListener('click', (event) => {
    const card = event.target.closest('.photo-card');
    if (!card) return;
    const idx = Number(card.dataset.index);
    if (Number.isInteger(idx) && posts[idx]) openLightbox(posts[idx]);
});

grid.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('.photo-card');
    if (!card) return;
    event.preventDefault();
    const idx = Number(card.dataset.index);
    if (Number.isInteger(idx) && posts[idx]) openLightbox(posts[idx]);
});

lightbox.addEventListener('click', (event) => {
    if (event.target.closest('[data-close]')) {
        closeLightbox();
        return;
    }
    if (event.target.closest('[data-prev]')) {
        step(-1);
        return;
    }
    if (event.target.closest('[data-next]')) {
        step(1);
    }
});

document.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    else if (event.key === 'ArrowLeft') step(-1);
    else if (event.key === 'ArrowRight') step(1);
});

renderGrid();
