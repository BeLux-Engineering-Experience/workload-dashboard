async function fetchRepos(topic) {
    try {
        const response = await fetch(`https://api.github.com/search/repositories?q=topic:${topic}+org:BeLux-Open-Source-Clinic`);
        if (!response.ok) {
            throw new Error(`Failed to fetch repositories for topic: ${topic}`);
        }
        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function displayRepos() {
    const topics = ['infra', 'data', 'ai', 'app-innovation'];
    const reposContainer = document.getElementById('repos');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading';
    loadingIndicator.textContent = 'Loading repositories...';
    reposContainer.appendChild(loadingIndicator);

    for (const topic of topics) {
        const repos = await fetchRepos(topic);
        const topicHeader = document.createElement('h2');
        topicHeader.textContent = `Repositories for topic: ${topic}`;
        reposContainer.appendChild(topicHeader);

        const repoList = document.createElement('ul');
        if (repos.length === 0) {
            const noReposItem = document.createElement('li');
            noReposItem.textContent = 'No repositories found.';
            repoList.appendChild(noReposItem);
        } else {
            repos.forEach(repo => {
                const repoItem = document.createElement('li');
                repoItem.innerHTML = `<a href="${repo.html_url}">${repo.name}</a>`;
                repoList.appendChild(repoItem);
            });
        }
        reposContainer.appendChild(repoList);
    }

    reposContainer.removeChild(loadingIndicator);
}

document.addEventListener('DOMContentLoaded', () => {
    displayRepos();
});