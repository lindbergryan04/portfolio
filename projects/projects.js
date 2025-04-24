import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

const projectTitle = document.querySelector('projects-title');

const projectArticles = document.querySelectorAll('.projects article');
const projectsAmount = projectArticles.length;

projectTitle.textContent = `${count} Projects`;

projectTitle.textContent = `${projectsAmount} Projects`;
