/* ######################## */
/* ### Global variables ### */
/* ######################## */

const CROSSOVER_PROBABILITY = 0.7;
const MUTATION_PROBABILITY = 0.01;
const FINAL_SOLUTION = [-0.48726236, 0.024799];

let bestSolution;

let bestFitnessPerGeneration = [];
let meanFitnessPerGeneration = [];
let worstFitnessPerGeneration = [];

let bestμPerGeneration = [];
let meanμPerGeneration = [];
let worstμPerGeneration = [];

let bestλPerGeneration = [];
let meanλPerGeneration = [];
let worstλPerGeneration = [];

let fitnessCanvas;
let μCanvas;
let λCanvas;

let sf = 32; // Scale factor

/* ###################### */
/* ### User Interface ### */
/* ###################### */

const NAV_HEIGHT = 40;

/* ####################### */
/* ### P5.js functions ### */
/* ####################### */

function setup() {
    let fractal = createCanvas(windowWidth / 2, windowHeight - NAV_HEIGHT);
    fractal.parent('genetic-container');

    setupStatistics();

    noLoop();
}

function draw() {
    // Genetic
    bestSolution = genetic(1000, 100, 2, CROSSOVER_PROBABILITY, MUTATION_PROBABILITY);

    print(bestSolution);

    background(0);
    translate(width / 2, height / 2);
    scale(sf);
    strokeWeight(4 / sf);
    stroke('#f13030ff');

    bestSolution.draw(1000);

    // Statistics
    plotStatistics();
}

/* ############### */
/* ### Genetic ### */
/* ############### */

function genetic(populationSize, generationMax, numberElites, crossoverProbability, mutationProbability) {
    // Initialize population
    let population = new Population(populationSize);

    // Evolution
    for (let i = 0; i < generationMax; i++) {
        // Store population data
        populationDataStorage(population);

        // Elitism
        let nextPopulation = population.elites(numberElites);

        // Next population
        while (nextPopulation.length < populationSize) {
            // Selection
            let parent1 = population.chromosomes[floor(random(populationSize))];
            let parent2 = population.chromosomes[floor(random(populationSize))];

            // Crossover
            if (random() < crossoverProbability) {
                nextPopulation = nextPopulation.concat(parent1.crossover(parent2));
            } else {
                nextPopulation = nextPopulation.concat([parent1, parent2]);
            }
        }

        // Mutation
        nextPopulation.forEach(chromosome => {
            if (random() < mutationProbability) {
                chromosome.mutate();
            }
        });

        // New generation
        population = new Population(population, nextPopulation);
    }

    print(population);

    // Best chromosome
    return population.elite();
}

/* ################## */
/* ### Population ### */
/* ################## */

class Population {
    constructor(size, chromosomes = null) {
        if (chromosomes == null) {
            this.chromosomes = [];

            // Generate population
            for (let i = 0; i < size; i++) {
                this.chromosomes.push(new Chromosome(random(-100, 100), random(-100, 100)));
            }
        } else {
            this.chromosomes = chromosomes;
        }
    }

    elite() {
        let sort = this.chromosomes.sort((c1, c2) => {
            let fit1 = c1.fitness();
            let fit2 = c2.fitness();

            if (fit1 != fit2) {
                return (fit1 > fit2) ? 1 : -1;
            } else {
                return 0
            }
        });

        return sort[0];
    }

    elites(n) {
        let sort = this.chromosomes.sort((c1, c2) => {
            let fit1 = c1.fitness();
            let fit2 = c2.fitness();

            if (fit1 != fit2) {
                return (fit1 > fit2) ? 1 : -1;
            } else {
                return 0
            }
        });

        return sort.slice(0, n);
    }

    meanFitness() {
        let meanFit = 0;

        this.chromosomes.forEach(chromosome => {
            meanFit += chromosome.fitness();
        });

        return meanFit / this.chromosomes.length;
    }

    worstFitness() {
        let sort = this.chromosomes.sort((c1, c2) => {
            let fit1 = c1.fitness();
            let fit2 = c2.fitness();

            if (fit1 != fit2) {
                return (fit1 > fit2) ? -1 : 1;
            } else {
                return 0
            }
        });

        return sort[0].fitness();
    }

    meanμ() {
        let meanμ = 0;

        this.chromosomes.forEach(chromosome => {
            meanμ += chromosome.μ;
        });

        return meanμ / this.chromosomes.length;
    }

    worstμ() {
        let sort = this.chromosomes.sort((c1, c2) => {
            let μ1 = c1.μ;
            let μ2 = c2.μ;

            if (μ1 != μ2) {
                return (μ1 > μ2) ? -1 : 1;
            } else {
                return 0
            }
        });

        return sort[0].μ;
    }

    meanλ() {
        let meanλ = 0;

        this.chromosomes.forEach(chromosome => {
            meanλ += chromosome.λ;
        });

        return meanλ / this.chromosomes.length;
    }

    worstλ() {
        let sort = this.chromosomes.sort((c1, c2) => {
            let λ1 = c1.λ;
            let λ2 = c2.λ;

            if (λ1 != λ2) {
                return (λ1 > λ2) ? -1 : 1;
            } else {
                return 0
            }
        });

        return sort[0].λ;
    }
}

function populationDataStorage(p) {
    // Fitness
    bestFitnessPerGeneration.push(p.elite().fitness());
    meanFitnessPerGeneration.push(p.meanFitness());
    worstFitnessPerGeneration.push(p.worstFitness());

    // μ
    bestμPerGeneration.push(p.elite().μ);
    meanμPerGeneration.push(p.meanμ());
    worstμPerGeneration.push(p.worstμ());

    // λ
    bestλPerGeneration.push(p.elite().λ);
    meanλPerGeneration.push(p.meanλ());
    worstλPerGeneration.push(p.worstλ());
}

/* ################## */
/* ### Chromosome ### */
/* ################## */

class Chromosome {
    constructor(μ, λ) {
        this.μ = μ;
        this.λ = λ;
    }

    fitness() {
        return dist(FINAL_SOLUTION[0], FINAL_SOLUTION[1], this.μ, this.λ);
    }

    crossover(c) {
        if (random() < 0.5) {
            return [new Chromosome(this.μ, c.λ), new Chromosome(this.λ, c.μ)];
        } else {
            return [new Chromosome(this.μ, c.μ), new Chromosome(this.λ, c.λ)];
        }
    }

    mutate() {
        [this.μ, this.λ] = [this.λ, this.μ];
    }

    draw(pointLength) {
        // Starting point
        let xn1 = 0,
            yn1 = 0;

        // f(x)
        let f = (x) => (x * this.μ) + (2 * (1 - x) * this.μ * this.μ) / (1 - this.μ + (this.μ * this.μ));

        for (let i = 0; i < pointLength; i++) {
            // Get next point
            let xn = yn1 + (this.λ * (1 - 0.05 * yn1 * yn1) * yn1) + f(xn1);
            let yn = f(xn) - xn1;

            xn1 = xn;
            yn1 = yn;

            point(xn, yn);
        }
    }
}

/* ############################ */
/* ### Evolution statistics ### */
/* ############################ */

function setupStatistics() {
    // Retieve canvas element
    fitnessCanvas = document.getElementById('fitness-canvas');
    μCanvas = document.getElementById('μ-canvas');
    λCanvas = document.getElementById('λ-canvas');

    // Dimensions
    fitnessCanvas.style.width = windowWidth / 2 + 'px';
    μCanvas.style.width = windowWidth / 4 + 'px';
    λCanvas.style.width = windowWidth / 4 + 'px';

    fitnessCanvas.style.height = (windowHeight / 2) - NAV_HEIGHT + 'px';
    μCanvas.style.height = (windowHeight / 2) + 'px';
    λCanvas.style.height = (windowHeight / 2) + 'px';

    // Background color
    fitnessCanvas.style.backgroundColor = 'black';
    μCanvas.style.backgroundColor = 'black';
    λCanvas.style.backgroundColor = 'black';
}

function plotStatistics() {
    // Settings
    Chart.defaults.font.size = 15;
    Chart.defaults.color = 'white';

    // Fitness
    const fitnessChart = new Chart(fitnessCanvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: [...Array(bestFitnessPerGeneration.length).keys()],
            datasets: [{
                    label: 'Best',
                    data: bestFitnessPerGeneration,
                    fill: false,
                    borderColor: '#06d6a0',
                    cubicInterpolationMode: 'monotone'
                },
                {
                    label: 'Mean',
                    data: meanFitnessPerGeneration,
                    fill: false,
                    borderColor: '#ffd166',
                    cubicInterpolationMode: 'monotone'
                },
                {
                    label: 'Worst',
                    data: worstFitnessPerGeneration,
                    fill: false,
                    borderColor: '#ef476f',
                    cubicInterpolationMode: 'monotone'
                }
            ]
        },
        options: {
            responsive: false,
            elements: {
                point: {
                    radius: 0
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Fitness evolution'
                }
            }
        }
    });

    // μ
    const μChart = new Chart(μCanvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: [...Array(bestμPerGeneration.length).keys()],
            datasets: [{
                    label: 'Best',
                    data: bestμPerGeneration,
                    fill: false,
                    borderColor: '#06d6a0',
                    cubicInterpolationMode: 'monotone'
                },
                {
                    label: 'Mean',
                    data: meanμPerGeneration,
                    fill: false,
                    borderColor: '#ffd166',
                    cubicInterpolationMode: 'monotone'
                },
                {
                    label: 'Worst',
                    data: worstμPerGeneration,
                    fill: false,
                    borderColor: '#ef476f',
                    cubicInterpolationMode: 'monotone'
                }
            ]
        },
        options: {
            responsive: false,
            elements: {
                point: {
                    radius: 0
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'μ evolution'
                }
            }
        }
    });

    // λ
    const λChart = new Chart(λCanvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: [...Array(bestλPerGeneration.length).keys()],
            datasets: [{
                    label: 'Best',
                    data: bestλPerGeneration,
                    fill: false,
                    borderColor: '#06d6a0',
                    cubicInterpolationMode: 'monotone'
                },
                {
                    label: 'Mean',
                    data: meanλPerGeneration,
                    fill: false,
                    borderColor: '#ffd166',
                    cubicInterpolationMode: 'monotone'
                },
                {
                    label: 'Worst',
                    data: worstλPerGeneration,
                    fill: false,
                    borderColor: '#ef476f',
                    cubicInterpolationMode: 'monotone'
                }
            ]
        },
        options: {
            responsive: false,
            elements: {
                point: {
                    radius: 0
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'λ evolution'
                }
            }
        }
    });
}