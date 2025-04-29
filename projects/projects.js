import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const projectTitle = document.querySelector('.projects-title');

const projectArticles = document.querySelectorAll('.projects article');
const projectsAmount = projectArticles.length;

if (projectTitle) {
  projectTitle.textContent = `${projectsAmount} Projects`;
}

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let data = [1, 2];
let total = d3.sum(data);
let angle = 0;
let arcData = [];

for (let d of data) {
  let endAngle = angle + (d / total) * 2 * Math.PI;
  arcData.push({ startAngle: angle, endAngle });
  angle = endAngle;
}

let arcs = arcData.map((d) => arcGenerator(d));
let colors = ['gold', 'purple'];

let svg = d3.select('#projects-pie-plot')

arcs.forEach((arc, i) => {
    svg.append('path')
    .attr('d',arc)
    .attr('fill', colors[i]);
  });
