// global.js — Y2K portfolio navigation, status bar, and shared utilities

import { windowControls } from './icons.js';

const BASE_PATH =
    location.hostname === "localhost" || location.hostname === "127.0.0.1"
        ? "/"
        : "/portfolio/";

let pages = [
    { url: "", title: "Home" },
    { url: "projects/", title: "Projects" },
    { url: "contact/", title: "Contact" },
    { url: "CV/", title: "CV" },
    { url: "meta/", title: "Meta" },
    { url: "blog/", title: "Blog" },
    { url: "https://github.com/lindbergryan04", title: "GitHub", external: true }
];

// Only create navigation if we're not on a blog post page
if (!document.body.classList.contains('blog-page') || !window.location.pathname.includes('/posts/')) {
    // --- Navigation Toolbar ---
    let nav = document.createElement("nav");
    document.body.prepend(nav);

    // Prefix label
    const prefix = document.createElement("span");
    prefix.className = "nav-prefix";
    prefix.textContent = "RL://";
    nav.appendChild(prefix);

    for (let p of pages) {
        let url = p.url;
        url = !url.startsWith("http") ? BASE_PATH + url : url;

        let a = document.createElement("a");
        a.href = url;
        a.textContent = p.title;

        if (url.startsWith("http")) {
            a.target = "_blank";
            a.rel = "noopener noreferrer";
        }

        if (a.host === location.host && a.pathname === location.pathname) {
            a.classList.add("current");
        }

        nav.appendChild(a);
    }

    // Version label
    const ver = document.createElement("span");
    ver.className = "nav-version";
    ver.textContent = "v2.0";
    nav.appendChild(ver);

    // --- Status Bar Footer ---
    const statusBar = document.createElement("footer");
    statusBar.className = "status-bar";

    // Current page name
    const currentPage = pages.find(p => {
        const fullUrl = !p.url.startsWith("http") ? BASE_PATH + p.url : p.url;
        try {
            const u = new URL(fullUrl, location.origin);
            return u.pathname === location.pathname;
        } catch { return false; }
    });
    const pageName = currentPage ? currentPage.title.toUpperCase() : "UNKNOWN";

    statusBar.innerHTML = `
        <span class="status-cell accent">${pageName}</span>
        <span class="status-cell" id="status-clock">--:--:--</span>
        <span class="status-cell">VISITORS: ${Math.floor(Math.random() * 9000 + 1000)}</span>
        <span class="status-spacer"></span>
        <span class="status-cell">32.8801°N, 117.2340°W</span>
        <span class="status-cell">SYS:OK</span>
    `;
    document.body.appendChild(statusBar);

    // Live clock
    function updateClock() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        const el = document.getElementById('status-clock');
        if (el) el.textContent = `${h}:${m}:${s}`;
    }
    updateClock();
    setInterval(updateClock, 1000);
}

// --- Shared Utilities ---

export async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}

// Render projects as Y2K window panels
export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    if (!Array.isArray(projects)) {
        console.error('Projects must be an array');
        return;
    }
    if (!(containerElement instanceof Element)) {
        console.error('Invalid container element');
        return;
    }

    containerElement.innerHTML = '';

    projects.forEach(project => {
        const title = project.title || 'Untitled Project';
        const image = project.image || '';
        const description = project.description || 'No description available.';
        const year = project.year || '';
        const link = project.link || '';

        const article = document.createElement('article');

        let imageHTML = '';
        if (image) {
            imageHTML = link
                ? `<a href="${link}" target="_blank"><img class="project-img" src="${image}" alt="${title}"></a>`
                : `<img class="project-img" src="${image}" alt="${title}">`;
        }

        article.innerHTML = `
        <div class="window">
            <div class="window-titlebar">
                ${windowControls}
                <span class="window-title">${title}</span>
            </div>
            <div class="window-body">
                ${imageHTML}
                <p class="project-desc">${description}</p>
            </div>
            <div class="window-statusbar">${year ? `YEAR: ${year}` : ''}${link ? ` // <a href="${link}" target="_blank">VIEW PROJECT</a>` : ''}</div>
        </div>
        `;

        containerElement.appendChild(article);
    });
}

export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
}
