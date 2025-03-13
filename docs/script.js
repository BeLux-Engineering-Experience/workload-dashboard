async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`Failed to fetch data from ${url}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Attempt ${i + 1} failed: ${error.message}`);
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
}

async function fetchRepos(topic) {
    try {
        const url = `https://api.github.com/search/repositories?q=topic:${topic}+org:belux-open-source-clinic`;
        const data = await fetchWithRetry(url);
        console.log(`Fetched data for topic ${topic}:`, data); // Debugging statement
        return data.items;
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function fetchContributors(repoFullName) {
    try {
        const url = `https://api.github.com/repos/${repoFullName}/contributors`;
        const data = await fetchWithRetry(url);
        return data;
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function fetchOverviewData() {
    try {
        const url = `https://api.github.com/orgs/belux-open-source-clinic/events`;
        const data = await fetchWithRetry(url);

        // Process data to get counts for the last 7 days
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            return date.toISOString().split('T')[0];
        }).reverse();

        const overviewData = {
            commits: Array(7).fill(0),
            pullRequests: Array(7).fill(0),
            issues: Array(7).fill(0)
        };

        data.forEach(event => {
            const eventDate = event.created_at.split('T')[0];
            const dayIndex = last7Days.indexOf(eventDate);
            if (dayIndex !== -1) {
                if (event.type === 'PushEvent') {
                    overviewData.commits[dayIndex] += event.payload.commits.length;
                } else if (event.type === 'PullRequestEvent') {
                    overviewData.pullRequests[dayIndex] += 1;
                } else if (event.type === 'IssuesEvent') {
                    overviewData.issues[dayIndex] += 1;
                }
            }
        });

        return { last7Days, ...overviewData };
    } catch (error) {
        console.error(error);
        return {
            last7Days: Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                return date.toISOString().split('T')[0];
            }).reverse(),
            commits: Array(7).fill(0),
            pullRequests: Array(7).fill(0),
            issues: Array(7).fill(0)
        };
    }
}

async function displayRepos(topic = 'all') {
    const topics = {
        'infra': 'Infrastructure',
        'data': 'Data',
        'ai': 'AI',
        'app-innovation': 'App-Innovation'
    };
    const reposContainer = document.getElementById('repos');
    const loadingSpinner = document.getElementById('loading-spinner');
    reposContainer.innerHTML = '<h2 class="overview-title">Overview</h2>'; // Clear previous content and add title

    loadingSpinner.style.display = 'block'; // Show loading spinner

    const filteredTopics = topic === 'all' ? Object.keys(topics) : [topic];
    const topicCounts = { 'infra': 0, 'data': 0, 'ai': 0, 'app-innovation': 0 };

    for (const filteredTopic of filteredTopics) {
        try {
            const repos = await fetchRepos(filteredTopic);
            topicCounts[filteredTopic] += repos.length;
            const topicHeader = document.createElement('h2');
            topicHeader.textContent = `${topics[filteredTopic]} repositories:`;
            reposContainer.appendChild(topicHeader);

            const repoList = document.createElement('ul');
            if (repos.length === 0) {
                const noReposItem = document.createElement('li');
                noReposItem.classList.add('no-repos'); // Add class for styling
                noReposItem.textContent = 'No repositories found.';
                repoList.appendChild(noReposItem);
            } else {
                for (const repo of repos) {
                    const repoItem = document.createElement('li');
                    const contributors = await fetchContributors(repo.full_name);
                    const contributorNames = contributors.map(contributor => contributor.login).join(', ');

                    repoItem.innerHTML = `
                        <div class="repo-item">
                            <a href="${repo.html_url}" target="_blank" title="View repository on GitHub">${repo.name}</a>
                            <p class="contributors">Contributors: ${contributorNames}</p>
                        </div>
                    `;
                    repoList.appendChild(repoItem);
                }
            }
            reposContainer.appendChild(repoList);
        } catch (error) {
            console.error(`Failed to fetch repositories for topic: ${filteredTopic}`, error);
            const errorItem = document.createElement('li');
            errorItem.textContent = `Failed to fetch repositories for topic: ${topics[filteredTopic]}`;
            reposContainer.appendChild(errorItem);
        }
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
            labels: ['Infrastructure', 'Data', 'AI', 'App-Innovation'],
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
        type: 'line',
        data: {
            labels: overviewData.last7Days,
            datasets: [
                {
                    label: 'Commits',
                    data: overviewData.commits,
                    borderColor: '#FF6384',
                    fill: false
                },
                {
                    label: 'Pull Requests',
                    data: overviewData.pullRequests,
                    borderColor: '#36A2EB',
                    fill: false
                },
                {
                    label: 'Issues',
                    data: overviewData.issues,
                    borderColor: '#FFCE56',
                    fill: false
                }
            ]
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