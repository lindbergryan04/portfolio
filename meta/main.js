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

function renderCommitInfo(data, commits) {
    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
    // Add total commits
    dl.append('dt').text('Commits');
    dl.append('dd').text(commits.length);

    // Add total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
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
    dl.append('dd').text(commits.map(c => c.lines.length).reduce((a, b) => a + b, 0));
    
    //Number of days worked on site
    dl.append('dt').text('Days worked on site');
    dl.append('dd').text(commits.map(c => c.date).reduce((a, b) => Math.max(a, b), 0));

    const workByPeriod = d3.rollups(
        data,
        (v) => v.length,
        (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' }),
    );

    const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];

    //Max period worked on site
    dl.append('dt').text('Max period worked on site');
    dl.append('dd').text(maxPeriod);
}
  

let data = await loadData();
let commits = processCommits(data);

renderCommitInfo(data, commits);