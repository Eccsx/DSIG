/* ######################## */
/* ### Global variables ### */
/* ######################## */

const UNIVERSE_WIDTH = 20;
const UNIVERSE_HEIGHT = 20;

let universe, coloredUniverse;

let run = false;
let frameSpeed = 5;

/* ###################### */
/* ### User Interface ### */
/* ###################### */

const NAV_HEIGHT = 40;

/* ####################### */
/* ### P5.js functions ### */
/* ####################### */

// Classic universe
new p5(function (p5) {
    p5.setup = function () {
        const size = p5.min(p5.windowWidth, p5.windowHeight - NAV_HEIGHT);
        const classic = p5.createCanvas(size, size);

        classic.parent('universe-grid');
        p5.cursor(p5.HAND);

        p5.background(0);
        p5.frameRate(frameSpeed);

        universe = new Universe(UNIVERSE_WIDTH, UNIVERSE_HEIGHT, 0.3);
    }

    p5.draw = function () {
        if (run) universe.nextGeneration();
        universe.show(p5);
    }

    p5.mousePressed = function () {
        // Grid dimensions
        const GRID_LINE_DIM = p5.width / UNIVERSE_WIDTH;
        const GRID_COLUMN_DIM = p5.width / UNIVERSE_HEIGHT;

        // Check if mouse is over a cell
        for (let y = 0; y < UNIVERSE_WIDTH; y++) {
            for (let x = 0; x < UNIVERSE_HEIGHT; x++) {
                if (
                    p5.mouseY > y * GRID_LINE_DIM &&
                    p5.mouseY < y * GRID_LINE_DIM + GRID_LINE_DIM &&
                    p5.mouseX > x * GRID_COLUMN_DIM &&
                    p5.mouseX < x * GRID_COLUMN_DIM + GRID_COLUMN_DIM
                ) {
                    // Update cell state
                    const cell = universe.getCell(x, y);
                    cell.isAlive ^= true;

                    // Update color
                    cell.color = cell.isAlive ? chroma.random().hex() : chroma('white').hex();

                    universe.show(p5);
                }
            }
        }
    }

    p5.keyPressed = function () {
        if (p5.key == 'p') {
            run ^= true;
        } else if (p5.key == 's' && !run) {
            p5.saveCanvas('simulation');
        } else if (p5.key == '+') {
            p5.frameRate(++frameSpeed);
        } else if (p5.key == '-') {
            p5.frameRate(--frameSpeed);
        }
    }
});

// Colored universe
new p5(function (p5) {
    p5.setup = function () {
        const size = p5.min(p5.windowWidth, p5.windowHeight - NAV_HEIGHT);
        const colored = p5.createCanvas(
            p5.windowWidth - size,
            p5.windowWidth - size
        );

        colored.parent('colored-universe-grid');
        p5.cursor(p5.HAND);

        p5.background(0);
        p5.frameRate(frameSpeed);
    }

    p5.draw = function () {
        universe.show(p5, colorize = true);
    }
});


/* ################ */
/* ### Universe ### */
/* ################ */

class Universe {
    constructor(dimX, dimY, lifeProbability) {
        this.dimX = dimX;
        this.dimY = dimY;
        this.cells = [];

        // Create cells
        for (let y = 0; y < this.dimY; y++) {
            for (let x = 0; x < this.dimX; x++) {
                const state = (Math.random() < lifeProbability);
                this.cells.push(
                    new Cell(
                        this, x, y, state,
                        state ? chroma.random().hex() : chroma('white').hex()
                    )
                );
            }
        }
    }

    getCell(x, y) {
        return this.cells[y * this.dimX + x];
    }


    show(p5, colorize = false) {
        p5.strokeWeight(0.2);
        for (let y = 0; y < this.dimY; y++) {
            for (let x = 0; x < this.dimX; x++) {
                // Current cell
                const cell = this.getCell(x, y);
                const cellColor = cell.color;

                // Color
                if (colorize) {
                    p5.fill(cellColor);
                } else {
                    p5.fill(cell.isAlive ? 'black' : 'white');
                }

                p5.rect(
                    x * (p5.width / this.dimX),
                    y * (p5.height / this.dimY),
                    p5.width / this.dimX,
                    p5.height / this.dimY
                );
            }
        }
    }

    nextGeneration() {
        const nextGen = [];

        // Apply game of life rules
        // https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life#Rules
        this.cells.forEach(cell => {
            // Current cell specs
            const x = cell.x;
            const y = cell.y;
            const alive = this.getCell(x, y).isAlive;
            const aliveNeighbours = this.getCell(x, y).getLiveNeighboursCount(this);
            const color = cell.color;
            const aliveNeighboursColors = cell.getLiveNeighboursColors();

            // Next cell state
            let nextState;
            if (alive) {
                // Any live cell with two or three live neighbours survives
                nextState = (aliveNeighbours == 2 || aliveNeighbours == 3);
            } else {
                // Any dead cell with three live neighbours becomes a live cell
                nextState = (aliveNeighbours == 3)
            }

            // Next cell color
            let nextColor = color;
            if (alive && nextState) {
                // A cell who is still alive average its color with the ones of its live neighbours
                nextColor = chroma.average(aliveNeighboursColors).hex();
            }
            else if (!alive && nextState) {
                // A cell who's born get assign a random color
                nextColor = chroma.random().hex();
            }
            else {
                nextColor = chroma('white').hex();
            }

            // Create newt generation cell
            nextGen.push(new Cell(this, x, y, nextState, nextColor))
        });

        // Save next generation
        this.cells = nextGen;
    }

    clear() {
        this.cells.forEach(cell => {
            cell.die();
        });

        this.show();
    }
}

/* ############ */
/* ### Cell ### */
/* ############ */

class Cell {
    constructor(universe, x, y, isAlive, color) {
        this.universe = universe;
        this.x = x;
        this.y = y;
        this.isAlive = isAlive;
        this.color = color;

        // Assign neighbours indices
        const leftX = (this.x - 1 + this.universe.dimX) % this.universe.dimX;
        const rightX = (this.x + 1) % this.universe.dimX;
        const aboveY = (this.y - 1 + this.universe.dimY) % this.universe.dimY;
        const belowY = (this.y + 1) % this.universe.dimY;

        this.IndexUp = [this.x, aboveY];
        this.IndexUpRight = [rightX, aboveY];
        this.IndexRight = [rightX, this.y];
        this.IndexDownRight = [rightX, belowY];
        this.IndexDown = [this.x, belowY];
        this.IndexDownLeft = [leftX, belowY];
        this.IndexLeft = [leftX, this.y];
        this.IndexUpLeft = [leftX, aboveY];
    }

    getNeighbours() {
        return [
            this.universe.getCell(this.IndexUp[0], this.IndexUp[1]),
            this.universe.getCell(this.IndexUpRight[0], this.IndexUpRight[1]),
            this.universe.getCell(this.IndexRight[0], this.IndexRight[1]),
            this.universe.getCell(this.IndexDownRight[0], this.IndexDownRight[1]),
            this.universe.getCell(this.IndexDown[0], this.IndexDown[1]),
            this.universe.getCell(this.IndexDownLeft[0], this.IndexDownLeft[1]),
            this.universe.getCell(this.IndexLeft[0], this.IndexLeft[1]),
            this.universe.getCell(this.IndexUpLeft[0], this.IndexUpLeft[1])
        ];
    }

    getNeighboursState() {
        const states = [];
        this.getNeighbours().forEach(cell => {
            states.push(cell.isAlive);
        });

        return states;
    }

    getLiveNeighboursColors() {
        const colors = [];
        this.getNeighbours().forEach(cell => {
            if (cell.isAlive) {
                colors.push(cell.color);
            }
        });

        return colors;
    }

    die() {
        this.isAlive = false;
    }

    getLiveNeighboursCount() {
        return this.getNeighboursState().filter(Boolean).length;
    }
}