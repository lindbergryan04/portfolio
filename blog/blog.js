import { fetchJSON } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const blog = await fetchJSON('../lib/blog.json');
const blogContainer = document.querySelector('.blog-posts');

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
    });
}

function renderBlogPosts() {
    blogContainer.innerHTML = '';

    blog.forEach(post => {
        const postElement = document.createElement('article');
        postElement.classList.add('blog-post');

        // Create title with link
        const title = document.createElement('h2');
        const titleLink = document.createElement('a');
        titleLink.href = post.link;
        titleLink.textContent = post.title;
        title.appendChild(titleLink);

        // Create excerpt
        const excerpt = document.createElement('div');
        excerpt.classList.add('excerpt');
        excerpt.textContent = post.summary;

        // Create category chips container
        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');

        // Create category chips for each genre
        post.genres.forEach(genre => {
            const categoryChip = document.createElement('span');
            categoryChip.classList.add('category-chip');
            categoryChip.textContent = genre;
            categoryContainer.appendChild(categoryChip);
        });

        // Create meta with formatted dates
        const meta = document.createElement('div');
        meta.classList.add('meta');
        const createdDate = formatDate(post.created);
        const updatedDate = formatDate(post.updated);
        meta.textContent = `Created: ${createdDate}  Updated: ${updatedDate}`;

        // Append all elements
        postElement.appendChild(title);
        postElement.appendChild(excerpt);
        postElement.appendChild(categoryContainer);
        postElement.appendChild(meta);

        blogContainer.appendChild(postElement);
    });
}   

renderBlogPosts();  