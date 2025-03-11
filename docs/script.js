async function fetchRepos(topic) {
    const response = await fetch(`https://api.github.com/search/repositories?q=topic:${topic}+org:your-organization`);
    const data = await response.json();
    return data.items;
}

async function displayRepos() {
    const topics = ['infra', 'data', 'ai', 'app-innovation'];
    const reposContainer = document.getElementById('repos');

    for (const topic of topics) {
        const repos = await fetchRepos(topic);
        const topicHeader = document.createElement('h2');
        topicHeader.textContent = `Repositories for topic: ${topic}`;
        reposContainer.appendChild(topicHeader);

        const repoList = document.createElement('ul');
        repos.forEach(repo => {
            const repoItem = document.createElement('li');
            repoItem.innerHTML = `<a href="${repo.html_url}">${repo.name}</a>`;
            repoList.appendChild(repoItem);
        });
        reposContainer.appendChild(repoList);
    }
}

displayRepos();
