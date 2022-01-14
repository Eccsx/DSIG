/* ######################## */
/* ### Global variables ### */
/* ######################## */

const UNIVERSE_WIDTH = 6;
const UNIVERSE_HEIGHT = 6;

let universe;

/* ###################### */
/* ### User Interface ### */
/* ###################### */

const NAV_HEIGHT = 40;

/* ####################### */
/* ### P5.js functions ### */
/* ####################### */

function setup() {
    createCanvas(500, 500);
    background(0);
    noLoop();
}

function draw() {
    universe = new Universe(UNIVERSE_WIDTH, UNIVERSE_HEIGHT);
    universe.show();
}

/* ################ */
/* ### Universe ### */
/* ################ */

class Universe {
    constructor(dimX, dimY) {
        this.dimX = dimX;
        this.dimY = dimY;
        this.cells = [];

        // Create cells
        for (let y = 0; y < this.dimY; y++) {
            for (let x = 0; x < this.dimX; x++) {
                this.cells.push(new Cell(this, x, y, false))
            }
        }
    }

    getCell(x, y) {
        return this.cells[y * this.dimX + x];
    }


    show() {
        strokeWeight(0.5);
        for (let y = 0; y < this.dimY; y++) {
            for (let x = 0; x < this.dimX; x++) {
                // Cell state
                fill(this.getCell(x, y).isAlive ? 'black' : '#white');

                rect(
                    x * (width / this.dimX),
                    y * (height / this.dimY),
                    width / this.dimX,
                    height / this.dimY
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

            // Next generation cell state
            let state;
            if (alive) {
                // Any live cell with two or three live neighbours survives
                state = (aliveNeighbours == 2 ||aliveNeighbours == 3);
            }
            else {
                // Any dead cell with three live neighbours becomes a live cell
                state = (aliveNeighbours == 3)
            }

            // Create newt generation cell
            nextGen.push(new Cell(this, x, y, state))
        });

        // Save next generation
        this.cells = nextGen;

        // Update universe
        this.show();
    }
}

/* ############ */
/* ### Cell ### */
/* ############ */

class Cell {
    constructor(universe, x, y, isAlive) {
        this.universe = universe;
        this.x = x;
        this.y = y;
        this.isAlive = isAlive;

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

    getNeighboursState() {
        return [
            this.universe.getCell(this.IndexUp[0], this.IndexUp[1]).isAlive,
            this.universe.getCell(this.IndexUpRight[0], this.IndexUpRight[1]).isAlive,
            this.universe.getCell(this.IndexRight[0], this.IndexRight[1]).isAlive,
            this.universe.getCell(this.IndexDownRight[0], this.IndexDownRight[1]).isAlive,
            this.universe.getCell(this.IndexDown[0], this.IndexDown[1]).isAlive,
            this.universe.getCell(this.IndexDownLeft[0], this.IndexDownLeft[1]).isAlive,
            this.universe.getCell(this.IndexLeft[0], this.IndexLeft[1]).isAlive,
            this.universe.getCell(this.IndexUpLeft[0], this.IndexUpLeft[1]).isAlive
        ];
    }

    live() {
        this.isAlive = true;
    }

    die() {
        this.isAlive = false;
    }

    getLiveNeighboursCount() {
        return this.getNeighboursState().filter(Boolean).length;
    }
}

/* ################ */
/* ### Controls ### */
/* ################ */

// Draw number within the matrix
function mousePressed() {
    // Matrix dimensions
    const MATRIX_LINE_DIM = width / UNIVERSE_WIDTH;
    const MATRIX_COLUMN_DIM = width / UNIVERSE_HEIGHT;

    // Check if mouse is over a cell
    for (let y = 0; y < UNIVERSE_WIDTH; y++) {
        for (let x = 0; x < UNIVERSE_HEIGHT; x++) {
            if (
                mouseY > y * MATRIX_LINE_DIM &&
                mouseY < y * MATRIX_LINE_DIM + MATRIX_LINE_DIM &&
                mouseX > x * MATRIX_COLUMN_DIM &&
                mouseX < x * MATRIX_COLUMN_DIM + MATRIX_COLUMN_DIM
            ) {
                // Update cell state
                universe.getCell(x, y).isAlive ^= true;
                universe.show();
            }
        }
    }
}