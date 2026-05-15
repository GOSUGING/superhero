$(document).ready(function () {
    const heroForm = $('#heroForm');
    const heroNumber = $('#heroNumber');
    const heroResult = $('#heroResult');
    const chartWrapper = $('#chartWrapper');
    let myChart = null;

    heroForm.on('submit', function (event) {
        event.preventDefault();
        heroNumber.removeClass('is-valid is-invalid');
        searchHero();
    });

    const searchHero = () => {
        const val = parseInt(heroNumber.val());
        if (isNaN(val) || val < 1 || val > 731) {
            heroNumber.addClass('is-invalid');
            return;
        }
        heroNumber.addClass('is-valid');
        getHero(val);
    };

    const parseStatValue = (v) => {
        const n = parseInt(v);
        return isNaN(n) ? 0 : Math.min(n, 100);
    };

    const getStatColor = (value) => {
        if (value >= 80) return '#e63946';
        if (value >= 55) return '#f4d03f';
        if (value >= 30) return '#2ecc71';
        return '#3498db';
    };

    const renderPowerBars = (stats) => {
        return Object.entries(stats).map(([key, val]) => {
            const num = parseStatValue(val);
            const display = parseInt(val) >= 0 ? parseInt(val) : 'N/A';
            const color = getStatColor(num);
            return `
                <div class="stat-bar">
                    <div class="stat-bar-header">
                        <span class="stat-bar-label">${key}</span>
                        <span class="stat-bar-value">${display}</span>
                    </div>
                    <div class="stat-progress">
                        <div class="stat-progress-bar" style="width:${num}%; background:${color};"></div>
                    </div>
                </div>`;
        }).join('');
    };

    const renderCard = (hero) => {
        const height = Array.isArray(hero.height) ? (hero.height[1] || hero.height[0] || 'N/A') : hero.height;
        const weight = Array.isArray(hero.weight) ? (hero.weight[1] || hero.weight[0] || 'N/A') : hero.weight;
        const publisherBadge = hero.publisher
            ? `<span class="hero-publisher-badge">${hero.publisher}</span>` : '';

        return `
        <div class="hero-card">
            <div class="hero-image-wrapper">
                <img src="${hero.image}" alt="${hero.name}" onerror="this.src='assets/img/sh2.jpg'">
                <div class="hero-image-overlay">
                    <h2 class="hero-name">${hero.name}</h2>
                    ${publisherBadge}
                </div>
            </div>
            <div class="hero-info">
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Ocupación</span>
                        <span class="info-value" title="${hero.occupation}">${hero.occupation || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Primera aparición</span>
                        <span class="info-value" title="${hero.firstappearance}">${hero.firstappearance || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Altura</span>
                        <span class="info-value">${height}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Peso</span>
                        <span class="info-value">${weight}</span>
                    </div>
                    <div class="info-item info-full">
                        <span class="info-label">Afiliación</span>
                        <span class="info-value" title="${hero.groupaffiliation}">${hero.groupaffiliation || 'N/A'}</span>
                    </div>
                </div>
            </div>
            <div class="power-stats-section">
                <p class="power-stats-title">Power Stats</p>
                ${renderPowerBars(hero.stats)}
            </div>
        </div>`;
    };

    const renderChart = (hero) => {
        if (myChart) {
            myChart.destroy();
            myChart = null;
        }

        chartWrapper.html(`
            <div class="chart-section">
                <p class="chart-title">Radar de poder — ${hero.name}</p>
                <canvas id="powerStatsChart"></canvas>
            </div>`);

        const labels = Object.keys(hero.stats).map(k => k.charAt(0).toUpperCase() + k.slice(1));
        const values = Object.values(hero.stats).map(parseStatValue);

        const ctx = document.getElementById('powerStatsChart').getContext('2d');
        myChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels,
                datasets: [{
                    label: hero.name,
                    data: values,
                    backgroundColor: 'rgba(230, 57, 70, 0.18)',
                    borderColor: '#e63946',
                    pointBackgroundColor: '#f4d03f',
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    borderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        ticks: {
                            stepSize: 25,
                            color: '#8892b0',
                            backdropColor: 'transparent',
                            font: { size: 9 }
                        },
                        grid: { color: 'rgba(255,255,255,0.08)' },
                        angleLines: { color: 'rgba(255,255,255,0.08)' },
                        pointLabels: {
                            color: '#e0e0e0',
                            font: { size: 11, weight: '500' }
                        }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#e0e0e0', font: { size: 12 } } },
                    title: { display: false }
                }
            }
        });
    };

    const getHero = (id) => {
        heroResult.html(`
            <div class="loading-spinner">
                <div class="spinner-border" role="status"></div>
                <span>Buscando héroe...</span>
            </div>`);
        chartWrapper.empty();

        $.ajax({
            url: `https://www.superheroapi.com/api.php/4905856019427443/${id}`,
            method: 'GET',
            success(data) {
                if (data.response === 'error') {
                    heroResult.html(`<div class="error-msg">No se encontró el héroe con ID ${id}.</div>`);
                    return;
                }
                const hero = {
                    image: data.image.url,
                    publisher: data.biography.publisher,
                    occupation: data.work.occupation,
                    name: data.name,
                    firstappearance: data.biography['first-appearance'],
                    height: data.appearance.height,
                    weight: data.appearance.weight,
                    groupaffiliation: data.connections['group-affiliation'],
                    stats: data.powerstats
                };
                heroResult.html(renderCard(hero));
                renderChart(hero);
            },
            error(xhr, status, error) {
                heroResult.html(`<div class="error-msg">Error al conectar con la API. Intente nuevamente.</div>`);
                console.error('API error:', error);
            }
        });
    };
});
