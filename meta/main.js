import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Meta Page js
// Run npx elocuent -d . -o meta/loc.csv --spaces 2 in terminal to refresh the loc.csv file

async function loadData() {
    const data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: Number(row.line),
        depth: Number(row.depth),
        length: Number(row.length),
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
    }));
    return data;
}

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
                hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                totalLines: lines.length,
            };
            Object.defineProperty(ret, 'lines', {
                value: lines,
                enumerable: false,
                writable: false,
                configurable: false,
            });
            return ret;
        });
}

function updateCommitInfo(data, commits) {
    d3.select('#stats').html('');
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

    dl.append('dt').text('Commits');
    dl.append('dd').text(commits.length);

    dl.append('dt').text('Lines of code');
    dl.append('dd').text(data.length);

    const fileLengths = d3.rollups(
        data,
        (v) => d3.max(v, (v) => v.line),
        (d) => d.file,
    );

    const maxFileLength = d3.greatest(fileLengths, (d) => d[1])?.[1];
    const averageFileLength = d3.mean(fileLengths, (d) => d[1]);

    dl.append('dt').text('Max lines in file');
    dl.append('dd').text(maxFileLength);

    dl.append('dt').text('Average LOC');
    dl.append('dd').text(Math.round(averageFileLength));

    dl.append('dt').text('Files');
    dl.append('dd').text(new Set(data.map(d => d.file)).size);

    dl.append('dt').text('Days worked');
    dl.append('dd').text(new Set(commits.map(c => c.date.toISOString().split('T')[0])).size);
}

let colors = d3.scaleOrdinal(["#cc0000", "#888888", "#aaaaaa", "#cccccc"]);

function updateFileDisplay(commits) {
    let lines = commits.flatMap((d) => d.lines);

    let files = d3
        .groups(lines, (d) => d.file)
        .map(([name, fileLines]) => ({ name, lines: fileLines }))
        .sort((a, b) => b.lines.length - a.lines.length);

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
                        dt.append('small');
                        div.append('dd');
                    }),
        );

    filesContainer.select('dt > code').html((d) => d.name);
    filesContainer.select('dt > small').html((d) => `${d.lines.length} lines`);

    filesContainer.select('dd')
        .each(function (dFile) {
            d3.select(this)
                .selectAll('div.loc')
                .data(dFile.lines)
                .join('div')
                .attr('class', 'loc')
                .attr('style', (dLine) => `--color: ${colors(dLine.type)}`);
        });
}

// Init
const data = await loadData();
const commits = processCommits(data);

updateCommitInfo(data, commits);
updateFileDisplay(commits);
