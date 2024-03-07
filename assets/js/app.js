$(document).ready(function(){
    const heroForm = $('#heroForm');
    const heroNumber = $('#heroNumber');
    const heroResult = $('#heroResult');
    let myChart = null;

    heroForm.on('submit', function (event) {
        event.preventDefault();
        heroNumber.removeClass('is-valid is-invalid');
        searchHero();
    });

    $('#searchAgainBtn').on('click', function() {
        heroResult.empty();
        searchHero();
    });

    const searchHero = () => {
        const heroNumberUser = parseInt(heroNumber.val());

        if (!isNaN(heroNumberUser)) {
            if (heroNumberUser > 0 && heroNumberUser <= 731) {
                heroNumber.addClass('is-valid');
                getHero(heroNumberUser);
            } else {
                alert('Por favor, ingrese un número entre 1 y 731.');
                heroNumber.addClass('is-invalid');
            }
        } else {
            alert('Por favor, ingrese un número válido.');
            heroNumber.addClass('is-invalid');
        }
    };

    const getHero = (id) => {
        $.ajax({
            url: `https://www.superheroapi.com/api.php/4905856019427443/${id}`,
            method: 'GET',
            success(data) {
                console.log(data);

                const myHero = {
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

                
                const labels = Object.keys(myHero.stats);
                const values = Object.values(myHero.stats);

                
                if (myChart !== null) {
                    myChart.destroy();
                }

               
                const ctx = document.getElementById('powerStatsChart').getContext('2d');
                myChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Power Stats',
                            data: values,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.5)',
                                'rgba(54, 162, 235, 0.5)',
                                'rgba(255, 206, 86, 0.5)',
                                'rgba(75, 192, 192, 0.5)',
                                'rgba(153, 102, 255, 0.5)',
                                'rgba(255, 159, 64, 0.5)'
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        plugins: {
                            title: {
                                display: true,
                                text: 'Power Stats del Héroe'
                            }
                        }
                    }
                });

                
                heroResult.html(`<div class="card">
                    <img src="${myHero.image}" alt="" class="card-img-top">
                    <div class="card-body">
                        <h5>Nombre: ${myHero.name}</h5>
                    </div>
                    <ul class="list-group list-group-flush">
                        <li class="list-group-item">Publicado por: ${myHero.publisher}</li>
                        <li class="list-group-item">Ocupación: ${myHero.occupation}</li>
                        <li class="list-group-item">Primera publicación: ${myHero.firstappearance}</li>
                        <li class="list-group-item">Altura: ${myHero.height}</li>
                        <li class="list-group-item">Peso: ${myHero.weight}</li>
                        <li class="list-group-item">Alianza: ${myHero.groupaffiliation}</li>
                    </ul>
                </div>`);
            },
            error(xhr, status, error) {
                console.error('Error al obtener datos de la API:', error);
            }
        });
    };
});
