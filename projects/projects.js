import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');
const projectTitle = document.querySelector('.projects-title');
const projectArticles = document.querySelectorAll('.projects article');
const projectsAmount = projectArticles.length;

if (projectTitle) {
    projectTitle.textContent = `${projectsAmount} Projects`;
}

let query = '';
let selectedIndex = -1; // track which slice/legend is selected
let pieData = []; // holds year-wise pie chart data for filterProjects()

  function filterProjects() {
    return projects.filter((project) => {
      const projectText = Object.values(project).join('\n').toLowerCase();
      const matchesQuery = projectText.includes(query.toLowerCase());
  
      if (selectedIndex === -1) {
        return matchesQuery; // only query filter
      } else {
        const selectedYear = pieData[selectedIndex]?.label;
        const matchesYear = project.year == selectedYear;
        return matchesQuery && matchesYear; // both query and pie slice selection filters
      }
    });
  }
  

// pie chart and legend rendering
function renderPieChart(projectsGiven) {

    // roll up and format data
    let rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year,
    );

    let data = rolledData.map(([year, count]) => ({
        value: count,
        label: year,
    }));

    pieData = data;

    // only render if there's data
    if (data.length === 0) return;

    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => arcGenerator(d));
    let colors = d3.scaleOrdinal(["#0d0887", "#5302a3", "#8b0aa5", "#b83289", "#db5c68"]); // custom colors 

    // select and clear svg 
    let svg = d3.select('#projects-pie-plot');
    svg.selectAll('path').remove();

    // select and clear legend
    let legend = d3.select('.legend');
    legend.selectAll('li').remove();

    arcs.forEach((arc, idx) => {
        svg.append('path')
            .attr('d', arc)
            .attr('fill', colors(idx))
            .attr('class', idx === selectedIndex ? 'selected' : null) // handle initial render
            .on('click', () => {
                selectedIndex = selectedIndex === idx ? -1 : idx; // toggle selection

                svg
                    .selectAll('path')
                    .attr('class', (_, i) => (
                        i === selectedIndex ? 'selected' : null // highlight selected pie slice
                    ));

                legend
                    .selectAll('li')
                    .attr('class', (_, i) => (
                        i === selectedIndex ? 'legend-item selected' : 'legend-item' // highlight selected legend item
                    ));

                    // on click, filter projects to year of pie slice
                    let filtered = filterProjects();
                    renderProjects(filtered, projectsContainer, 'h2');
                    renderPieChart(filtered);
            });
    });

    // populate legend
    data.forEach((d, idx) => {
        legend.append('li')
            .attr('style', `--color:${colors(idx)}`)
            .attr('class', idx === selectedIndex ? 'legend-item selected' : 'legend-item')
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

// initial render
renderProjects(projects, projectsContainer, 'h2');
renderPieChart(projects);

// input listener
searchInput.addEventListener('input', (event) => {
    query = event.target.value;
    let filtered = filterProjects();
    renderProjects(filtered, projectsContainer, 'h2');
    renderPieChart(filtered);
  });
  
