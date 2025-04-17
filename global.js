console.log('IT’S ALIVE!');
/*
function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const navLinks = $$("nav a");

let currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname,
  );

currentLink?.classList.add("current");
*/

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
