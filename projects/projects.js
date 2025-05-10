import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');



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
    let selectedYear = pieData[selectedIndex]?.label;

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
            .attr('class', data[idx].label === selectedYear ? 'selected' : null) // handle initial render
            .on('click', () => {
                const clickedYear = data[idx].label;
                const wasSelected = clickedYear === pieData[selectedIndex]?.label;
                selectedIndex = wasSelected ? -1 : pieData.findIndex(p => p.label === clickedYear);
              
                let filtered = filterProjects();
                renderProjects(filtered, projectsContainer, 'h2');
                renderPieChart(projects); // full dataset for full pie
                updateProjectCount();
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

function updateProjectCount() {
    const projectTitle = document.querySelector('.projects-title');
    const projectArticles = document.querySelectorAll('.projects article');
    const projectsAmount = projectArticles.length;
    if (projectTitle) {
        projectTitle.textContent = `${projectsAmount} Projects`;
    }
}

// initial render
renderProjects(projects, projectsContainer, 'h2');
updateProjectCount();

renderPieChart(projects);

// input listener for search bar
searchInput.addEventListener('input', (event) => {
    query = event.target.value;
    let filtered = filterProjects();
    renderProjects(filtered, projectsContainer, 'h2');
    renderPieChart(projects);
    updateProjectCount();

  });
  
