// async function fetchRepos(topic) {
//     try {
//         const response = await fetch(`https://api.github.com/search/repositories?q=topic:${topic}+org:belux-open-source-clinic`);
//         if (!response.ok) {
//             throw new Error(`Failed to fetch repositories for topic: ${topic}`);
//         }
//         const data = await response.json();
//         console.log(`Fetched data for topic ${topic}:`, data); // Debugging statement
//         return data.items;
//     } catch (error) {
//         console.error(error);
//         return [];
//     }
// }

// async function fetchContributors(repoFullName) {
//     try {
//         const response = await fetch(`https://api.github.com/repos/${repoFullName}/contributors`);
//         if (!response.ok) {
//             throw new Error(`Failed to fetch contributors for repository: ${repoFullName}`);
//         }
//         const data = await response.json();
//         return data;
//     } catch (error) {
//         console.error(error);
//         return [];
//     }
// }

// async function displayRepos(topic = 'all') {
//     const topics = ['infra', 'data', 'ai', 'app-innovation'];
//     const reposContainer = document.getElementById('repos');
//     reposContainer.innerHTML = ''; // Clear previous content

//     const loadingIndicator = document.createElement('div');
//     loadingIndicator.className = 'loading';
//     loadingIndicator.textContent = 'Loading repositories...';
//     reposContainer.appendChild(loadingIndicator);

//     const filteredTopics = topic === 'all' ? topics : [topic];

//     for (const filteredTopic of filteredTopics) {
//         const repos = await fetchRepos(filteredTopic);
//         const topicHeader = document.createElement('h2');
//         topicHeader.textContent = `${filteredTopic} repositories:`;
//         reposContainer.appendChild(topicHeader);

//         const repoList = document.createElement('ul');
//         if (repos.length === 0) {
//             const noReposItem = document.createElement('li');
//             noReposItem.textContent = 'No repositories found.';
//             repoList.appendChild(noReposItem);
//         } else {
//             for (const repo of repos) {
//                 const repoItem = document.createElement('li');
//                 const contributors = await fetchContributors(repo.full_name);
//                 const contributorNames = contributors.map(contributor => contributor.login).join(', ');

//                 repoItem.innerHTML = `
//                     <a href="${repo.html_url}" target="_blank">${repo.name}</a>
//                     <span> - Contributors: ${contributorNames}</span>
//                 `;
//                 repoList.appendChild(repoItem);
//             }
//         }
//         reposContainer.appendChild(repoList);
//     }

//     reposContainer.removeChild(loadingIndicator);
// }

// document.addEventListener('DOMContentLoaded', () => {
//     displayRepos();

//     const topicSelect = document.getElementById('topic-select');
//     topicSelect.addEventListener('change', (event) => {
//         const selectedTopic = event.target.value;
//         displayRepos(selectedTopic);
//     });
// });

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

async function fetchContributors(repoFullName) {
    try {
        const response = await fetch(`https://api.github.com/repos/${repoFullName}/contributors`);
        if (!response.ok) {
            throw new Error(`Failed to fetch contributors for repository: ${repoFullName}`);
        }
        const data = await response.json();
        return data;
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
    const topicCounts = { 'infra': 0, 'data': 0, 'ai': 0, 'app-innovation': 0 };

    for (const filteredTopic of filteredTopics) {
        const repos = await fetchRepos(filteredTopic);
        topicCounts[filteredTopic] += repos.length;
        const topicHeader = document.createElement('h2');
        topicHeader.textContent = `${filteredTopic} repositories:`;
        reposContainer.appendChild(topicHeader);

        const repoList = document.createElement('ul');
        if (repos.length === 0) {
            const noReposItem = document.createElement('li');
            noReposItem.textContent = 'No repositories found.';
            repoList.appendChild(noReposItem);
        } else {
            for (const repo of repos) {
                const repoItem = document.createElement('li');
                const contributors = await fetchContributors(repo.full_name);
                const contributorNames = contributors.map(contributor => contributor.login).join(', ');

                repoItem.innerHTML = `
                    <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                    <span> - Contributors: ${contributorNames}</span>
                `;
                repoList.appendChild(repoItem);
            }
        }
        reposContainer.appendChild(repoList);
    }

    reposContainer.removeChild(loadingIndicator);
    updateChart(topicCounts);
}

function updateChart(topicCounts) {
    const ctx = document.getElementById('topicChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Infra', 'Data', 'AI', 'App Innovation'],
            datasets: [{
                data: [topicCounts['infra'], topicCounts['data'], topicCounts['ai'], topicCounts['app-innovation']],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    displayRepos();

    const topicSelect = document.getElementById('topic-select');
    topicSelect.addEventListener('change', (event) => {
        const selectedTopic = event.target.value;
        displayRepos(selectedTopic);
    });
});