import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Meta Page js
// Run npx elocuent -d . -o meta/loc.csv --spaces 2 in terminalto refresh the loc.csv file

async function loadData() {
    const data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: Number(row.line), // or just +row.line
        depth: Number(row.depth),
        length: Number(row.length),
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
    }));

    return data;
}
/**
 * Groups data by commit and calculates commit-level statistics
 * @param {Array} data - Array of line-level git log data
 * @returns {Array} Array of commit objects with metadata and statistics
 * Each commit object contains:
 * - id: Commit hash
 * - url: GitHub commit URL 
 * - author: Commit author
 * - date: Commit date
 * - time: Commit time
 * - timezone: Commit timezone
 * - datetime: JavaScript Date object
 * - hourFrac: Hour of day as decimal (e.g. 14.5 = 2:30 PM)
 * - totalLines: Number of lines modified in commit
 */
function processCommits(data) {
    return d3
        .groups(data, (d) => d.commit)
        .map(([commit, lines]) => {
            let first = lines[0];
            let { author, date, time, timezone, datetime } = first;
            let ret = {
                id: commit,
                url: 'https://github.com/lindbergryan04/portfolio/commit/' + commit,
                author,
                date,
                time,
                timezone,
                datetime,
                // Calculate hour as a decimal for time analysis
                // e.g., 2:30 PM = 14.5
                hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                totalLines: lines.length,
            };

            Object.defineProperty(ret, 'lines', {
                value: lines,
                enumerable: false,   // Hides the property from `console.log`, `for...in`, and `Object.keys`
                writable: false,     // Makes the property read-only (optional)
                configurable: false  // Prevents the property from being redefined or deleted (optional)
            });

            return ret;
        });
}

// Tooltip visibility
function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
}

// Tooltip position
function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }

// Scatter plot of commits by time of day

/**
 * Renders a scatter plot visualization of commit times
 * @param {Array} data - Array of line-level git log data
 * @param {Array} commits - Array of processed commit objects
 * 
 * Creates a scatter plot where:
 * - X-axis: Date of commits (aligned to noon to avoid timezone issues)
 * - Y-axis: Time of day (0-24 hours)
 * - Dots: Individual commits, colored using the theme's accent color
 * - Gridlines: Horizontal lines for time reference
 * 
 * The plot includes:
 * - Margins for proper spacing
 * - Gridlines for better readability
 * - Formatted time axis (HH:00 format)
 * - Date axis with proper scaling
 */
const width = 1000;
const height = 600;
function renderScatterPlot(data, commits) {

    const svg = d3
        .select('#chart')
        .attr('width', width)
        .attr('height', height)
        .append('svg')
        .attr('viewBox', [0, 0, width, height])
        .style('overflow', 'visible');

    const margin = { top: 10, right: 10, bottom: 30, left: 20 };
    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };

    const xScale = d3
        .scaleTime()
        .domain(d3.extent(commits, (d) => {
            // Create a new date with just the date part (time set to noon to avoid timezone issues)
            const date = new Date(d.datetime);
            date.setHours(12, 0, 0, 0);
            return date;
        }))
        .range([usableArea.left, usableArea.right])
        .nice();

    const yScale = d3
        .scaleLinear()
        .domain([0, 24])
        .range([usableArea.bottom, usableArea.top]);

    // Add gridlines BEFORE the axes
    const gridlines = svg
        .append('g')
        .attr('class', 'gridlines')
        .attr('transform', `translate(${usableArea.left}, 0)`);

    // Create gridlines as an axis with no labels and full-width ticks
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    // Scale dots based on lines edited
    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3
    .scaleSqrt() 
    .domain([minLines, maxLines])
    .range([5, 15]);

    // Sort commits by total lines in descending order (so smaller dots are on top and can be hovered over)
  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

    const dots = svg.append('g').attr('class', 'dots');

    dots
        .selectAll('circle')
        .data(sortedCommits)
        .join('circle')
        .attr('cx', (d) => {
            const date = new Date(d.datetime);
            date.setHours(12, 0, 0, 0);
            return xScale(date);
        })
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', (d) => rScale(d.totalLines))
        .attr('fill', 'var(--color-accent)')
        .style('fill-opacity', 0.7) // transparency for overlapping dots
        .on('mouseenter', (event, commit) => {
            renderTooltipContent(commit);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
        })
        .on('mouseleave', () => {
            updateTooltipVisibility(false);
        });

    // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
        .axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

    // Add X axis
    svg
        .append('g')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .call(xAxis);

    // Add Y axis
    svg
        .append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yAxis);

}


// Commit info stats
/**
 * Renders statistics about the repository's commits and code
 * @param {Array} data - Array of line-level git log data
 * @param {Array} commits - Array of processed commit objects
 * 
 * Creates a statistics display showing:
 * - Total number of commits
 * - Total lines of code
 * - Maximum lines in a single file
 * - Average lines of code per file
 * - Total number of unique files
 * - Number of unique days worked
 * - Most common time of day for commits
 * 
 * Statistics are displayed in a grid layout with:
 * - Labels (dt elements) for each statistic
 * - Values (dd elements) formatted appropriately
 * - Accent-colored values for emphasis
 */
function renderCommitInfo(data, commits) {
    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

    // Add total commits
    dl.append('dt').text('Commits');
    dl.append('dd').text(commits.length);

    // Add total LOC
    dl.append('dt').html('Lines of code');
    dl.append('dd').text(data.length);

    const fileLengths = d3.rollups(
        data,
        (v) => d3.max(v, (v) => v.line),
        (d) => d.file,
    );

    const maxFileLength = d3.greatest(fileLengths, (d) => d[1])?.[1];
    const averageFileLength = d3.mean(fileLengths, (d) => d[1]);

    //Max Lines
    dl.append('dt').text('Max Lines');
    dl.append('dd').text(maxFileLength);

    //Average LOC
    dl.append('dt').text('Average LOC');
    dl.append('dd').text(averageFileLength);

    // Add total files
    dl.append('dt').text('Files');
    dl.append('dd').text(new Set(data.map(d => d.file)).size);

    //Number of days worked on site
    dl.append('dt').text('Days worked on site');
    dl.append('dd').text(new Set(commits.map(c => c.date.toISOString().split('T')[0])).size);

    const workByPeriod = d3.rollups(
        data,
        (v) => v.length,
        (d) => {
            const date = new Date(d.datetime);
            return date.getHours() + date.getMinutes() / 60;
        }
    );

    const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
    const formattedTime = maxPeriod ?
        new Date(2000, 0, 1, Math.floor(maxPeriod), Math.round((maxPeriod % 1) * 60))
            .toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }) : '';

    //Most common work time
    dl.append('dt').text('Most common work time');
    dl.append('dd').text(formattedTime);
}

// Add tooltip functionality
function renderTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const lines = document.getElementById('commit-lines');

    if (Object.keys(commit).length === 0) return;

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
        dateStyle: 'full',
    });
    time.textContent = commit.time;
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
}
let data = await loadData();
let commits = processCommits(data);

renderScatterPlot(data, commits);
renderCommitInfo(data, commits);


