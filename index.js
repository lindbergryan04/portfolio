import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';


// Render top 3 projects:
const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);
const projectsContainer = document.querySelector('.projects');

renderProjects(latestProjects, projectsContainer, 'h2');


// Render GitHub stats:
const githubData = await fetchGitHubData('lindbergryan04');
const profileStats = document.querySelector('#profile-stats');

if (profileStats) {
    profileStats.innerHTML = `
    <dl class="stats-grid">
      <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
      <dt>Followers:</dt><dd>${githubData.followers}</dd>
      <dt>Following:</dt><dd>${githubData.following}</dd>
      <dt>Gists:</dt><dd>${githubData.public_gists}</dd>
    </dl>
  `;
}