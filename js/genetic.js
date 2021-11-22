/* ######################## */
/* ### Global variables ### */
/* ######################## */

let bestSolution;

const CROSSOVER_PROBABILITY = 0.7;
const MUTATION_PROBABILITY = 0.01;
const FINAL_SOLUTION = [-0.48726236, 0.024799];

/* ###################### */
/* ### User Interface ### */
/* ###################### */

const NAV_HEIGHT = 40;

/* ####################### */
/* ### P5.js functions ### */
/* ####################### */

function setup() {
    createCanvas(windowWidth / 2, windowHeight - NAV_HEIGHT);
    noLoop();

    bestSolution = genetic(1000, 100, 2, CROSSOVER_PROBABILITY, MUTATION_PROBABILITY);
}

function draw() {
    background(0);
}

/* ############### */
/* ### Genetic ### */
/* ############### */

function genetic(populationSize, generationMax, numberElites, crossoverProbability, mutationProbability, ) {
    // Initialize population
    let population = new Population(populationSize);

    // Evolution
    for (let i = 0; i < generationMax; i++) {
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

        // debug
        // population.chromosomes.forEach(c => {
        //     print(c.fitness());
        // });

        // print('mean --> ' + population.meanFitness());
        print('best --> ' + population.elite().fitness());
    }

    // Best chromosome
    let best = population.elite();

    return [best.μ, best.λ];
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
                this.chromosomes.push(new Chromosome(random(-1, 1), random(-1, 1)));
            }
        } else {
            this.chromosomes = chromosomes;
        }
    }

    meanFitness() {
        let meanFit = 0;

        this.chromosomes.forEach(chromosome => {
            meanFit += chromosome.fitness();
        });

        return meanFit;
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
        return abs(FINAL_SOLUTION[0] - this.μ) + abs(FINAL_SOLUTION[1] - this.λ);
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
}