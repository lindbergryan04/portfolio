// global.js

const BASE_PATH =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "/portfolio/" // Local dev base path
    : "/portfolio/"; // GitHub Pages base path (adjust this if your repo name is different)

// Apply saved or system theme ASAP (before rendering)
function applyInitialTheme() {
  const saved = localStorage.colorScheme;

  if (saved === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else if (saved === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }
}

applyInitialTheme();

let pages = [
  { url: "", title: "Home" },
  { url: "projects/", title: "Projects" },
  { url: "contact/", title: "Contact" },
  { url: "CV/", title: "CV" },
  { url: "https://github.com/lindbergryan04", title: "GitHub", external: true }
];

let nav = document.createElement("nav");
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  // Adjust internal URLs using BASE_PATH
  url = !url.startsWith("http") ? BASE_PATH + url : url;

  // Create <a> element
  let a = document.createElement("a");
  a.href = url;
  a.textContent = title;

  // Open in new tab if it's external
  if (url.startsWith("http")) {
    a.target = "_blank";
    a.rel = "noopener noreferrer"; // optional security best practice
  }

  // Highlight current page
  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add("current");
  }

  nav.appendChild(a);
}

document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select id="theme-select">
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
);

// Grab select element
const select = document.querySelector('#theme-select');

// On page load: set saved color scheme preference (if exists)
if ("colorScheme" in localStorage) {
  const savedScheme = localStorage.colorScheme;
  select.value = savedScheme;

  if (savedScheme === "light dark") {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  } else {
    document.documentElement.setAttribute("data-theme", savedScheme);
  }
}

// event listener for color scheme switch
select.addEventListener('input', function (event) {
  const mode = event.target.value;
  console.log('color scheme changed to', mode);
  localStorage.colorScheme = mode;

  if (mode === "light dark") {
    // Dynamically apply based on system preference
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  } else {
    // Apply manual override
    document.documentElement.setAttribute("data-theme", mode);
  }
});

function setupContactForm() {
  const form = document.querySelector("form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const params = [];

    for (let [name, value] of data) {
      params.push(`${name}=${encodeURIComponent(value)}`);
    }

    const url = `${form.action}?${params.join("&")}`;
    location.href = url;
  });
}

setupContactForm();

// Project page:

// Fetch JSON data from a URL
// Fetch JSON data from a URL
export async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

// Render projects into the container
export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!Array.isArray(projects)) {
    console.error('Projects must be an array');
    return;
  }

  if (!(containerElement instanceof Element)) {
    console.error('Invalid container element');
    return;
  }

  // Clear the container before adding new elements
  containerElement.innerHTML = '';

  projects.forEach(project => {
    const article = document.createElement('article');

    // Fallback handling for missing data
    const title = project.title || 'Untitled Project';
    const image = project.image || '';
    const description = project.description || 'No description available.';

    article.innerHTML = `
      <${headingLevel}>${title}</${headingLevel}>
      ${image ? `<img src="${image}" alt="${title}">` : ''}
      <p>${description}</p>
    `;

    containerElement.appendChild(article);
  });
}
// Fetch JSON data from a URL
export async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

// Render projects into the container
export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!Array.isArray(projects)) {
    console.error('Projects must be an array');
    return;
  }

  if (!(containerElement instanceof Element)) {
    console.error('Invalid container element');
    return;
  }

  // Clear the container before adding new elements
  containerElement.innerHTML = '';

  projects.forEach(project => {
    const article = document.createElement('article');

    // Fallback handling for missing data
    const title = project.title || 'Untitled Project';
    const image = project.image || '';
    const description = project.description || 'No description available.';

    article.innerHTML = `
      <${headingLevel}>${title}</${headingLevel}>
      ${image ? `<img src="${image}" alt="${title}">` : ''}
      <p>${description}</p>
    `;

    containerElement.appendChild(article);
  });
}
// Fetch JSON data from a URL
export async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

// Render projects into the container
export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!Array.isArray(projects)) {
    console.error('Projects must be an array');
    return;
  }

  if (!(containerElement instanceof Element)) {
    console.error('Invalid container element');
    return;
  }

  // Clear the container before adding new elements
  containerElement.innerHTML = '';

  projects.forEach(project => {
    const article = document.createElement('article');

    // Fallback handling for missing data
    const title = project.title || 'Untitled Project';
    const image = project.image || '';
    const description = project.description || 'No description available.';

    article.innerHTML = `
      <${headingLevel}>${title}</${headingLevel}>
      ${image ? `<img src="${image}" alt="${title}">` : ''}
      <p>${description}</p>
    `;

    containerElement.appendChild(article);
  });
}

  

  