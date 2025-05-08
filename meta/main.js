import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

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
                url: 'https://github.com/vis-society/lab-7/commit/' + commit,
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

let data = await loadData();
let commits = processCommits(data);
console.log(commits);
