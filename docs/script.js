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
//     const loadingSpinner = document.getElementById('loading-spinner');
//     reposContainer.innerHTML = ''; // Clear previous content

//     loadingSpinner.style.display = 'block'; // Show loading spinner

//     const filteredTopics = topic === 'all' ? topics : [topic];
//     const topicCounts = { 'infra': 0, 'data': 0, 'ai': 0, 'app-innovation': 0 };

//     for (const filteredTopic of filteredTopics) {
//         const repos = await fetchRepos(filteredTopic);
//         topicCounts[filteredTopic] += repos.length;
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
//                     <a href="${repo.html_url}" target="_blank" title="View repository on GitHub">${repo.name}</a>
//                     <span> - Contributors: ${contributorNames}</span>
//                 `;
//                 repoList.appendChild(repoItem);
//             }
//         }
//         reposContainer.appendChild(repoList);
//     }

//     loadingSpinner.style.display = 'none'; // Hide loading spinner
//     updateChart(topicCounts);
// }

// function updateChart(topicCounts) {
//     const ctx = document.getElementById('topicChart').getContext('2d');
//     const chart = new Chart(ctx, {
//         type: 'pie',
//         data: {
//             labels: ['Infra', 'Data', 'AI', 'App Innovation'],
//             datasets: [{
//                 data: [topicCounts['infra'], topicCounts['data'], topicCounts['ai'], topicCounts['app-innovation']],
//                 backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//                 datalabels: {
//                     formatter: (value, ctx) => {
//                         let sum = 0;
//                         let dataArr = ctx.chart.data.datasets[0].data;
//                         dataArr.map(data => {
//                             sum += data;
//                         });
//                         let percentage = (value * 100 / sum).toFixed(2) + "%";
//                         return percentage;
//                     },
//                     color: '#fff',
//                 }
//             },
//             onClick: (event, elements) => {
//                 if (elements.length > 0) {
//                     const chartElement = elements[0];
//                     const topic = chart.data.labels[chartElement.index].toLowerCase().replace(' ', '-');
//                     displayRepos(topic);
//                 }
//             }
//         },
//         plugins: [ChartDataLabels]
//     });
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

async function fetchOverviewData() {
    try {
        const response = await fetch(`https://api.github.com/orgs/belux-open-source-clinic`);
        if (!response.ok) {
            throw new Error(`Failed to fetch overview data for the organization`);
        }
        const data = await response.json();
        return {
            commits: data.public_repos, // Replace with actual data if available
            pullRequests: data.public_gists, // Replace with actual data if available
            issues: data.followers // Replace with actual data if available
        };
    } catch (error) {
        console.error(error);
        return {
            commits: 0,
            pullRequests: 0,
            issues: 0
        };
    }
}

async function displayRepos(topic = 'all') {
    const topics = ['infra', 'data', 'ai', 'app-innovation'];
    const reposContainer = document.getElementById('repos');
    const loadingSpinner = document.getElementById('loading-spinner');
    reposContainer.innerHTML = ''; // Clear previous content

    loadingSpinner.style.display = 'block'; // Show loading spinner

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
                    <a href="${repo.html_url}" target="_blank" title="View repository on GitHub">${repo.name}</a>
                    <span> - Contributors: ${contributorNames}</span>
                `;
                repoList.appendChild(repoItem);
            }
        }
        reposContainer.appendChild(repoList);
    }

    loadingSpinner.style.display = 'none'; // Hide loading spinner
    updateChart(topicCounts);
    updateOverviewChart();
}

function updateChart(topicCounts) {
    const ctx = document.getElementById('topicChart').getContext('2d');
    const chart = new Chart(ctx, {
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
            maintainAspectRatio: false,
            plugins: {
                datalabels: {
                    formatter: (value, ctx) => {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        let percentage = (value * 100 / sum).toFixed(2) + "%";
                        return percentage;
                    },
                    color: '#fff',
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const chartElement = elements[0];
                    const topic = chart.data.labels[chartElement.index].toLowerCase().replace(' ', '-');
                    displayRepos(topic);
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

async function updateOverviewChart() {
    const overviewData = await fetchOverviewData();
    const ctx = document.getElementById('overviewChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Commits', 'Pull Requests', 'Issues'],
            datasets: [{
                label: 'Overview',
                data: [overviewData.commits, overviewData.pullRequests, overviewData.issues],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
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