async function fetchRepos(topic) {
    try {
        const response = await fetch(`https://api.github.com/search/repositories?q=topic:${topic}+org:belux-open-source-clinic`);
        if (!response.ok) {
            throw new Error(`Failed to fetch repositories for topic: ${topic}`);
        }
        const data = await response.json();
        console.log(`Fetched data for topic ${topic}:`, data); // Debugging statement
        return data.items;
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function displayRepos(topic = 'all') {
    const topics = ['infra', 'data', 'ai', 'app-innovation'];
    const reposContainer = document.getElementById('repos');
    reposContainer.innerHTML = ''; // Clear previous content

    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading';
    loadingIndicator.textContent = 'Loading repositories...';
    reposContainer.appendChild(loadingIndicator);

    const filteredTopics = topic === 'all' ? topics : [topic];

    for (const filteredTopic of filteredTopics) {
        const repos = await fetchRepos(filteredTopic);
        const topicHeader = document.createElement('h2');
        topicHeader.textContent = `${filteredTopic} repositories:`;
        reposContainer.appendChild(topicHeader);

        const repoList = document.createElement('ul');
        if (repos.length === 0) {
            const noReposItem = document.createElement('li');
            noReposItem.textContent = 'No repositories found.';
            repoList.appendChild(noReposItem);
        } else {
            repos.forEach(repo => {
                const repoItem = document.createElement('li');
                repoItem.innerHTML = `<a href="${repo.html_url}" target="_blank">${repo.name}</a>`;
                repoList.appendChild(repoItem);
            });
        }
        reposContainer.appendChild(repoList);
    }

    reposContainer.removeChild(loadingIndicator);
}

document.addEventListener('DOMContentLoaded', () => {
    displayRepos();

    const topicSelect = document.getElementById('topic-select');
    topicSelect.addEventListener('change', (event) => {
        const selectedTopic = event.target.value;
        displayRepos(selectedTopic);
    });
});