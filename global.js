const BASE_PATH =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "/portfolio/" // Local dev base path
    : "/portfolio/"; // GitHub Pages base path (adjust this if your repo name is different)

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
document.documentElement.style.setProperty('color-scheme', savedScheme);
select.value = savedScheme; // Update <select> to match
}

// event listener for color scheme switch
select.addEventListener('input', function (event) {
  console.log('color scheme changed to', event.target.value);
  localStorage.colorScheme = event.target.value;
  document.documentElement.style.setProperty('color-scheme', event.target.value);
});