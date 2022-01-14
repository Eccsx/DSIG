/* ######################## */
/* ### Global variables ### */
/* ######################## */

const UNIVERSE_WIDTH = 10;
const UNIVERSE_HEIGHT = 10;

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
                this.cells.push(new Cell(x, y))
            }
        }

        // Assign cells neighbours
        this.cells.forEach(cell => {
            // Indices (Problem)
            const leftX = (cell.x - 1 + this.dimX) % this.dimX;
            const rightX = (cell.x + 1) % this.dimX;
            const aboveY = (cell.y - 1 + this.dimY) % this.dimY;
            const ddbelowY = (cell.y + 1) % this.dimY;

            // Neighbours
            cell.neighbourUp = this.getCell(cell.x, aboveY);
            cell.neighbourUpRight = this.getCell(rightX, aboveY);
            cell.neighbourRight = this.getCell(rightX, cell.y);
            cell.neighbourDownRight = this.getCell(rightX, ddbelowY);
            cell.neighbourDown = this.getCell(cell.x, ddbelowY);
            cell.neighbourDownLeft= this.getCell(leftX, ddbelowY);
            cell.neighbourLeft= this.getCell(leftX, cell.y);
            cell.neighbourUpLeft= this.getCell(leftX, aboveY);
        });
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
}

/* ############ */
/* ### Cell ### */
/* ############ */

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.isAlive = false;
    }

    getNeighbours() {
        return [
            this.neighbourUp,
            this.neighbourUpRight,
            this.neighbourRight,
            this.neighbourDownRight,
            this.neighbourDown,
            this.neighbourDownLeft,
            this.neighbourLeft,
            this.neighbourUpLeft
        ];
    }

    live() {
        this.isAlive = true;
    }

    die() {
        this.isAlive = false;
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
    for (let y = 0; y <UNIVERSE_WIDTH; y++) {
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