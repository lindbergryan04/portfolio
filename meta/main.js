import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import scrollama from 'https://cdn.jsdelivr.net/npm/scrollama@3.2.0/+esm';


// Meta Page js
// Run npx elocuent -d . -o meta/loc.csv --spaces 2 in terminal to refresh the loc.csv file

async function loadData() {
    // Loads and parses line-level git log data from loc.csv
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
 * Groups data by commit and calculates commit-level statistics.
 * @param {Array} data - Array of line-level git log data from loadData().
 * @returns {Array} Array of commit objects with aggregated data.
 * Each commit includes metadata, hourFrac for time analysis, totalLines,
 * and a non-enumerable 'lines' property holding the raw line data for that commit.
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
        })
        .sort((a, b) => a.datetime - b.datetime); // Sort commits chronologically
}

// Tooltip visibility
function updateTooltipVisibility(isVisible) {
    // Shows or hides the commit tooltip.
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
}

// Tooltip position
function updateTooltipPosition(event) {
    // Positions the tooltip near the mouse cursor.
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
}

// Scatter plot of commits by time of day

/**
 * Renders or updates the scatter plot of commits.
 * @param {Array} data - Original line-level git log data (used by other functions).
 * @param {Array} currentCommits - Array of processed commit objects to display.
 * 
 * Plot details:
 * - X-axis: Date of commit (time set to noon to avoid timezone issues).
 * - Y-axis: Time of day (0-24 hours).
 * - Dots: Represent individual commits. Size based on lines changed.
 *         Color uses theme's accent color.
 * - Transitions: Dots, axes, and gridlines transition smoothly on updates.
 *   Dot radius transitions at a speed proportional to its change in size.
 */
const width = 1000;
const height = 600;
const margin = { top: 10, right: 10, bottom: 30, left: 20 };
const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
};
let xScale; // Keep as global, updated by updateScatterPlot
let yScale; // Keep as global, updated by updateScatterPlot
const TRANSITION_DURATION = 300; // Duration for all transitions

function updateScatterPlot(data, currentCommits) {
    let svg = d3.select('#chart').select('svg');

    // Initialize SVG and persistent groups if this is the first render.
    if (svg.empty()) {
        svg = d3.select('#chart')
            .attr('width', width)
            .attr('height', height)
            .append('svg')
            .attr('viewBox', [0, 0, width, height])
            .style('overflow', 'visible');

        svg.append('g').attr('class', 'gridlines');
        svg.append('g').attr('class', 'x-axis axis') // Add class 'axis' for common styling if any
            .attr('transform', `translate(0, ${usableArea.bottom})`);
        svg.append('g').attr('class', 'y-axis axis') // Add class 'axis'
            .attr('transform', `translate(${usableArea.left}, 0)`);
        svg.append('g').attr('class', 'dots'); // Dots group should be appended last or raised
    }

    // X-axis scale: Time-based, mapping commit dates to horizontal position.
    xScale = d3
        .scaleTime()
        .domain(d3.extent(currentCommits, (d) => {
            const date = new Date(d.datetime);
            date.setHours(12, 0, 0, 0);
            return date;
        }))
        .range([usableArea.left, usableArea.right])
        .nice();

    // Y-axis scale: Linear, mapping hour of day (0-24) to vertical position.
    yScale = d3
        .scaleLinear()
        .domain([0, 24])
        .range([usableArea.bottom, usableArea.top]);

    // Update gridlines with transition.
    const gridlinesGroup = svg.select('g.gridlines')
        .attr('transform', `translate(${usableArea.left}, 0)`);

    gridlinesGroup.transition().duration(TRANSITION_DURATION)
        .call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    // Radius scale for dots: Square root scale based on total lines in commit.
    const [minLines, maxLines] = d3.extent(currentCommits, (d) => d.totalLines);
    const rScale = d3
        .scaleSqrt()
        .domain([minLines !== undefined ? minLines : 0, maxLines !== undefined ? maxLines : 1])
        .range([5, 15]);

    // Sort commits by total lines (desc) so smaller dots render on top of larger ones.
    const sortedCommits = d3.sort(currentCommits, (d) => -d.totalLines);

    const dotsGroup = svg.select('g.dots');
    const radiusTransitionMultiplier = 30; // ms per pixel for radius transition speed.

    dotsGroup
        .selectAll('circle')
        .data(sortedCommits, d => d.id) // Key by commit ID for object constancy.
        .join(
            enter => enter.append('circle')
                .attr('cx', (d) => { // Initial horizontal position.
                    const date = new Date(d.datetime);
                    date.setHours(12, 0, 0, 0);
                    return xScale(date);
                })
                .attr('cy', (d) => yScale(d.hourFrac)) // Initial vertical position.
                .attr('r', 0)
                .style('--r', '0px') // Initial CSS variable for radius animation.
                .attr('fill', 'var(--color-accent)')
                .style('fill-opacity', 0)
                .style('cursor', 'pointer')
                // CSS transition: fixed for cx, cy, opacity; dynamic for radius via var(--r).
                .style('transition', `cx ${TRANSITION_DURATION}ms, cy ${TRANSITION_DURATION}ms, fill-opacity ${TRANSITION_DURATION}ms, r calc(var(--r) * ${radiusTransitionMultiplier}ms)`)
                .on('mouseenter', (event, commit) => { // Tooltip and hover effects.
                    renderTooltipContent(commit);
                    updateTooltipVisibility(true);
                    updateTooltipPosition(event);
                })
                .on('mouseleave', () => { // Hide tooltip.
                    console.log('Mouse left dot (circle mouseleave event)'); // Diagnostic log
                    updateTooltipVisibility(false);
                })
                .on('click', (_, commit) => { // Open commit URL on click.
                    window.open(commit.url, '_blank');
                })
                .call(sel => sel.transition() // D3 transition to set final styles for enter.
                    .duration(TRANSITION_DURATION)
                    .style('fill-opacity', 0.8)
                    // Set target CSS variable --r and SVG attribute r for CSS transition.
                    .style('--r', (d) => rScale(d.totalLines) + 'px')
                    .attr('r', (d) => rScale(d.totalLines))
                ),
            update => update // Update existing circles.
                .call(sel => sel.transition().duration(TRANSITION_DURATION)
                    .attr('cx', (d) => {
                        const date = new Date(d.datetime);
                        date.setHours(12, 0, 0, 0);
                        return xScale(date);
                    })
                    .attr('cy', (d) => yScale(d.hourFrac))
                    .style('fill-opacity', 0.8)
                    // Update target CSS variable and SVG attribute for radius transition.
                    .style('--r', (d) => rScale(d.totalLines) + 'px')
                    .attr('r', (d) => rScale(d.totalLines))
                ),
            exit => exit // Remove circles that are no longer in the data.
                .call(sel => sel.transition().duration(TRANSITION_DURATION)
                    .style('fill-opacity', 0)
                    .style('--r', '0px') // Trigger CSS shrink animation for radius.
                    .attr('r', 0)
                    .remove())
        );

    // Define X and Y axes.
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
        .axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

    // Add/update X axis with transition.
    svg.select('g.x-axis')
        .transition().duration(TRANSITION_DURATION)
        .call(xAxis);

    // Add/update Y axis with transition.
    svg.select('g.y-axis')
        .transition().duration(TRANSITION_DURATION)
        .call(yAxis);

    dotsGroup.raise(); // Ensure dots are rendered on top of axes and gridlines.
}

// Initializes or updates the brush selector on the scatter plot.
function createBrushSelector(svg) { // svg parameter is the d3 selection of the main svg
    let brushGroup = svg.select('g.brush');
    if (brushGroup.empty()) {
        brushGroup = svg.append('g').attr('class', 'brush');
    }

    const brush = d3.brush()
        .extent([[usableArea.left, usableArea.top], [usableArea.right, usableArea.bottom]]) // Define brushable area.
        .on('start brush end', brushed); // Event listener for brush actions.

    brushGroup.call(brush);
    // Ensure the brush overlay is on top of dots for interaction.
    brushGroup.raise();
}


// Commit info stats
/**
 * Updates the statistics display about the repository and commits.
 * @param {Array} data - Original line-level git log data.
 * @param {Array} currentCommits - Currently displayed/filtered commit objects.
 * 
 * Shows stats like total commits, LOC, file stats, days worked, common work time.
 */
function updateCommitInfo(data, currentCommits) {
    // Clear existing content
    d3.select('#stats').html('');

    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

    // Add total commits
    dl.append('dt').text('Commits');
    dl.append('dd').text(currentCommits.length);

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
    dl.append('dd').text(new Set(currentCommits.map(c => c.date.toISOString().split('T')[0])).size);

    const workByPeriod = d3.rollups(
        currentCommits.flatMap(c => c.lines),
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

// Populates the tooltip with details of a given commit.
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

// Callback for brush events ('start', 'brush', 'end').
function brushed(event) {
    const selection = event.selection; // Coordinates of the brush selection rectangle.

    const currentDisplayCommits = d3.selectAll('#chart svg .dots circle').data(); // Get data from currently rendered circles.

    // Highlight selected circles.
    d3.selectAll('#chart svg .dots circle').classed('selected', (d) =>
        isCommitSelected(selection, d),
    );
    // Update UI elements based on the brush selection.
    renderSelectionCount(selection, currentDisplayCommits);
    updateLanguageBreakdown(selection, currentDisplayCommits);
}

// Updates the text displaying the number of selected commits.
function renderSelectionCount(selection, currentCommitsToConsider) {
    const selectedCommits = selection
        ? currentCommitsToConsider.filter((d) => isCommitSelected(selection, d))
        : [];

    const countElement = document.querySelector('#selection-count');
    countElement.textContent = `${selectedCommits.length || 'No'
        } commits selected`;

    return selectedCommits;
}

// Checks if a commit dot is within the brush selection area.
function isCommitSelected(selection, commit) {
    if (!selection) {
        return false; // No active brush selection.
    }
    // selection provides [[x0,y0], [x1,y1]] in screen coordinates.
    // xScale and yScale map data values to screen coordinates.
    const [x0, x1] = selection.map((d) => d[0]);
    const [y0, y1] = selection.map((d) => d[1]);
    // Create a date object for xScale, ensuring time is set to noon like in the plot.
    const commitDateForScale = new Date(commit.datetime);
    commitDateForScale.setHours(12, 0, 0, 0);

    const x = xScale(commitDateForScale); // Use the consistent date for scaling.
    const y = yScale(commit.hourFrac);
    return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

// Updates the language breakdown display based on selected commits.
function updateLanguageBreakdown(selection, currentCommitsToConsider) {
    const selectedCommits = selection
        ? currentCommitsToConsider.filter((d) => isCommitSelected(selection, d))
        : [];
    const container = document.getElementById('language-breakdown');

    if (selectedCommits.length === 0) {
        container.innerHTML = '';
        container.hidden = true;
        return;
    }

    container.hidden = false;
    // If there are selected commits, use them; otherwise, use all currentCommitsToConsider for the breakdown
    const commitsForBreakdown = selectedCommits.length > 0 ? selectedCommits : currentCommitsToConsider;
    const lines = commitsForBreakdown.flatMap((d) => d.lines);

    // Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
        lines,
        (v) => v.length,
        (d) => d.type,
    );

    // Update DOM with breakdown
    container.innerHTML = '';

    for (const [language, count] of breakdown) {
        const proportion = count / lines.length;
        const formatted = d3.format('.1~%')(proportion);

        container.innerHTML += `
              <dt>${language}</dt>
              <dd>${count} lines (${formatted})</dd>
          `;
    }
}


// Slider logic: Filters commits by date and updates the visualization.
let data = await loadData();
let commits = processCommits(data);

// commitProgress: Percentage representing the point in time on the slider (0-100).
let commitProgress = 100;

// timeScale: Maps commit datetimes to slider progress (0-100) and vice-versa.
let timeScale = d3.scaleTime(
    [d3.min(commits, (d) => d.datetime), d3.max(commits, (d) => d.datetime)],
    [0, 100],
);
// Use d3.scaleOrdinal to map line types to the specified array of colors.
let colors = d3.scaleOrdinal(["#51127c", "#b73779", "#fc8961", "#fcfdbf"]);
let commitMaxTime = timeScale.invert(commitProgress); // The latest commit datetime to include.

let filteredCommits = []; // Stores commits that are earlier than commitMaxTime.

// Filters the global 'commits' array based on the current 'commitMaxTime'.
function filterCommitsByTime() {
    commitMaxTime = timeScale.invert(commitProgress);
    filteredCommits = commits.filter(commit => commit.datetime < commitMaxTime);
}

// Display the selected time from the slider.
const selectedTime = d3.select('#selectedTime');
selectedTime.text(timeScale.invert(commitProgress).toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short'
}));

// Event listener for the commit time slider.
const slider = document.getElementById('commit-slider');
slider.addEventListener('input', (e) => {
    commitProgress = parseInt(e.target.value);
    selectedTime.text(timeScale.invert(commitProgress).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' }));

    filterCommitsByTime();
    updateScatterPlot(data, filteredCommits);

    // Clear any existing brush selection when the time range changes.
    const brushGroup = d3.select('#chart svg g.brush');
    if (!brushGroup.empty()) {
        d3.brush().move(brushGroup, null);
    }

    updateCommitInfo(data, filteredCommits);

    // Update language breakdown and selection count for the new (cleared) brush state.
    updateLanguageBreakdown(null, filteredCommits);
    renderSelectionCount(null, filteredCommits);
    updateFileDisplay(filteredCommits); // Update the file display
});

// Function to update the file display based on filtered commits
function updateFileDisplay(currentFilteredCommits) {
    // Get all lines from the currently filtered commits
    let lines = currentFilteredCommits.flatMap((d) => d.lines);

    // Group lines by file name and count lines per file

    let files = d3
        .groups(lines, (d) => d.file)
        .map(([name, fileLines]) => {
            return { name, lines: fileLines };
        })
        .sort((a, b) => b.lines.length - a.lines.length);

    // D3 join to create/update divs for each file in the #files container.
    let filesContainer = d3
        .select('#files')
        .selectAll('div.file-entry')
        .data(files, (d) => d.name)
        .join(
            (enter) =>
                enter.append('div')
                    .attr('class', 'file-entry')
                    .call((div) => {
                        const dt = div.append('dt');
                        dt.append('code');
                        dt.append('small'); // Add small for line count text
                        div.append('dd');
                    }),
        );

    // Update filename and line count text for all file entries.
    filesContainer.select('dt > code').html((d) => d.name);
    filesContainer.select('dt > small').html((d) => `${d.lines.length} lines`);

    // For each file entry, create/update the unit visualization dots in its <dd>.
    filesContainer.select('dd')
        .each(function (dFile) { // dFile is a file object: { name, lines: [...] }
            d3.select(this) // 'this' is the <dd> element for the current file.
                .selectAll('div.loc')
                .data(dFile.lines)
                .join('div')
                .attr('class', 'loc')
                .attr('style', (dLine) => `--color: ${colors(dLine.type)}`); // Set CSS custom property for color based on line type.
        });
}

// Initial setup when the script loads.
filterCommitsByTime(); // Perform initial filtering based on default slider position.
updateScatterPlot(data, filteredCommits); // Render initial scatter plot.
updateCommitInfo(data, filteredCommits);   // Render initial commit stats.
createBrushSelector(d3.select('#chart svg')); // Initialize the brush selector.
d3.select('#chart svg g.dots').raise(); // Ensure dots are on top of the brush overlay after initial setup

// Initialize brush-dependent UI elements (no selection initially).
updateLanguageBreakdown(null, filteredCommits);
updateFileDisplay(filteredCommits); // Initial file display

// Generate filler text for scrollytelling steps
d3.select('#scatter-story')
    .selectAll('.step')
    .data(commits)
    .join('div')
    .attr('class', 'step')
    .html(
        (d, i) => `
		On ${d.datetime.toLocaleString('en', {
            dateStyle: 'full',
            timeStyle: 'short',
        })},
		I made <a href="${d.url}" target="_blank">${i > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'
            }</a>.
		I edited ${d.totalLines} lines across ${d3.rollups(
                d.lines,
                (D) => D.length,
                (d) => d.file,
            ).length
            } files.
		Then I looked over all I had made, and I saw that it was very good.
	`,
    );

function onStepEnter(response) {
  // response.element is the DOM element of the step that was entered
  // response.index is the index of the step
  // response.direction is the direction of scroll ('up' or 'down')

  const stepCommitData = response.element.__data__;
  if (!stepCommitData) {
    console.warn('No data found for step element:', response.element);
    return;
  }

  const stepCommitDatetime = stepCommitData.datetime;
  // console.log('Step entered, commit datetime:', stepCommitDatetime);

  commitProgress = timeScale(stepCommitDatetime);

  // Update slider to reflect the current commit's time
  const slider = document.getElementById('commit-slider'); // Ensure slider is accessible
  if (slider) {
    slider.value = commitProgress;
  }

  // Update time display
  const selectedTime = d3.select('#selectedTime'); // Ensure selectedTime is accessible
  selectedTime.text(stepCommitDatetime.toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short'
  }));

  filterCommitsByTime(); // This uses global commitProgress to set filteredCommits
  updateScatterPlot(data, filteredCommits);

  // Clear any existing brush selection as the time context changes
  const brushGroup = d3.select('#chart svg g.brush');
  if (!brushGroup.empty() && d3.brushSelection(brushGroup.node())) { // Check if brush is active
    brushGroup.call(d3.brush().move, null);
  }

  updateCommitInfo(data, filteredCommits);
  updateLanguageBreakdown(null, filteredCommits); // Pass null for selection to reset
  renderSelectionCount(null, filteredCommits);   // Pass null for selection to reset
  updateFileDisplay(filteredCommits);
}

const scroller = scrollama();
scroller
    .setup({
        container: '#scrolly-1',
        step: '#scrolly-1 .step',
    })
    .onStepEnter(onStepEnter);

