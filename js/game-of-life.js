/* ######################## */
/* ### Global variables ### */
/* ######################## */

const CELL_SIZE = 20;
const UNIVERSE_LIFE_PROBABILITY = 0.3;

let universe;
let universeWidth, universeHeight;
let frameSpeed = 8;
let isRunning = false;

const COLOR_MODE = {
    'BLACK_AND_WHITE': 0,
    'COLOR': 1,
    'HEATMAP': 2
};
let mode = 0;

const COLOR_SCALE = chroma.scale(['2d82b7', '42e2b8']);
const COLOR_LIGHTNESS_THRESHOLD = 0.05;
const COLOR_FADE = 0.15;

const HEATMAP_SCALE = chroma.scale(['black', 'purple', 'red', 'ivory']);

/* ###################### */
/* ### User Interface ### */
/* ###################### */

const NAV_HEIGHT = 40;

/* ####################### */
/* ### P5 js functions ### */
/* ####################### */

function setup() {
    const life = createCanvas(windowWidth, windowHeight - NAV_HEIGHT)
    life.parent('universe-grid');
    cursor(HAND);

    background(0);
    noStroke();
    frameRate(frameSpeed);

    // Create universe
    universeWidth = Math.floor(width / CELL_SIZE);
    universeHeight = Math.floor(height / CELL_SIZE);
    universe = new Universe(universeWidth, universeHeight);
}

function draw() {
    if (isRunning) universe.nextGeneration();
    universe.show(mode);
}

/* ################ */
/* ### Controls ### */
/* ################ */

function mousePressed() {
    if (mouseButton == LEFT) {
        // Grid dimensions
        const GRID_LINE_DIM = height / universeHeight;
        const GRID_COLUMN_DIM = width / universeWidth;

        // Check if mouse is over a cell
        for (let y = 0; y < universeHeight; y++) {
            for (let x = 0; x < universeWidth; x++) {
                if (
                    mouseY > y * GRID_LINE_DIM &&
                    mouseY < y * GRID_LINE_DIM + GRID_LINE_DIM &&
                    mouseX > x * GRID_COLUMN_DIM &&
                    mouseX < x * GRID_COLUMN_DIM + GRID_COLUMN_DIM
                ) {
                    // Update cell state
                    const cell = universe.getCell(x, y);
                    cell.isAlive ^= true;

                    // Update color
                    if (cell.isAlive) {
                        // Assign a random color within the scale
                        cell.color = COLOR_SCALE(Math.random()).hex();
                        cell.occurence = 1;
                    } else {
                        // Delete into black
                        cell.color = chroma('black').hex();
                        cell.occurence = 0;
                    }

                    universe.show();
                }
            }
        }
    }
}

function keyPressed() {
    if (key == 'p') {
        isRunning ^= true;
    } else if (key == 's' && !isRunning) {
        saveCanvas(universe.getStateTitle());
    } else if (key == '+') {
        if (frameSpeed < 60) frameRate(++frameSpeed);
    } else if (key == '-') {
        if (frameSpeed > 1) frameRate(--frameSpeed);
    } else if (key == 'b') {
        mode = COLOR_MODE.BLACK_AND_WHITE;
    } else if (key == 'h') {
        mode = COLOR_MODE.HEATMAP;
    } else if (key == 'c') {
        mode = COLOR_MODE.COLOR;
    } else if (key == 'd') {
        universe.clear();
    } else if (key == 'r') {
        universe.random(UNIVERSE_LIFE_PROBABILITY);
    }
}

/* ################ */
/* ### Universe ### */
/* ################ */

class Universe {
    constructor(dimX, dimY) {
        this.dimX = dimX;
        this.dimY = dimY;
        this.generation = 0;

        // Create cells
        this.random(UNIVERSE_LIFE_PROBABILITY);

        this.maxCellOcurrence = this.getMaxCellOccurence();
    }

    getCell(x, y) {
        return this.cells[y * this.dimX + x];
    }

    show(colorMode) {
        for (let y = 0; y < this.dimY; y++) {
            for (let x = 0; x < this.dimX; x++) {
                // Current cell
                const cell = this.getCell(x, y);
                const cellColor = cell.color;
                const cellOccurence = cell.occurence;

                // Color
                switch (colorMode) {
                    case COLOR_MODE.BLACK_AND_WHITE:
                        fill(cell.isAlive ? 'white' : 'black');
                        break;

                    case COLOR_MODE.COLOR:
                        fill(cellColor);
                        break;

                    case COLOR_MODE.HEATMAP:
                        // Find right color in scale
                        const colorMap = map(
                            cellOccurence,
                            0, this.maxCellOcurrence,
                            0, 1
                        );

                        fill(
                            HEATMAP_SCALE(colorMap).hex()
                        );

                        break;
                }

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
            const color = cell.color;
            const aliveNeighboursColors = cell.getLiveNeighboursColors();
            const occurence = cell.occurence;

            // Next cell state
            let nextState;
            if (alive) {
                // Any live cell with two or three live neighbours survives
                nextState = (aliveNeighbours == 2 || aliveNeighbours == 3);

            } else {
                // Any dead cell with three live neighbours becomes a live cell
                nextState = (aliveNeighbours == 3);
            }

            let nextOccurence = nextState ? occurence + 1 : occurence;

            // Next cell color
            let nextColor;
            if (alive && nextState) {
                // A cell who is alive average its color with the ones of its live neighbours
                nextColor = chroma.average(aliveNeighboursColors).hex();
            } else if (!alive && nextState) {
                // A cell who is born get assign a random color within the scale
                nextColor = COLOR_SCALE(Math.random()).hex();
            } else {
                // The color of a dead cell will fade away until a reach a threshold
                nextColor = chroma(color).darken(COLOR_FADE).hex();

                if (chroma(color).hsl()[2] < COLOR_LIGHTNESS_THRESHOLD) {
                    nextColor = color;
                }
            }

            // Create next generation cell
            nextGen.push(new Cell(this, x, y, nextState, nextColor, nextOccurence))
        });

        // Save next generation
        this.cells = nextGen;
        this.generation++;

        // Get the maximum occurence of a cell
        this.maxCellOcurrence = this.getMaxCellOccurence();
    }

    clear() {
        this.random(0);
        isRunning = false;
    }

    random(lifeProbability) {
        // Clear cells
        this.cells = [];

        for (let y = 0; y < this.dimY; y++) {
            for (let x = 0; x < this.dimX; x++) {
                const isAlive = Math.random() < lifeProbability;
                this.cells.push(
                    new Cell(
                        this, x, y, isAlive,
                        isAlive ? COLOR_SCALE(Math.random()).hex() : chroma('black').hex(),
                        isAlive ? 1 : 0
                    )
                );
            }
        }

        this.generation = 0;
        this.generateHashId();
    }

    generateHashId() {
        this.id = '';

        // Retrieved cells state
        this.cells.forEach(cell => {
            this.id += cell.isAlive ? '1' : '0';
        });

        // Hash
        // https://blog.trannhat.xyz/generate-a-hash-from-string-in-javascript/
        const hashCode = s => s.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);

        this.id = hashCode(this.id);
    }

    // Does not take into accoutn modification due to mouse presses
    getStateTitle() {

        return 'S' + this.id + 'G' + this.generation + 'C' + (isColored ? '1' : '0');
    }

    getMaxCellOccurence() {
        let occ = 0;
        this.cells.forEach(cell => {
            occ = max(occ, cell.occurence);
        });

        return occ;
    }
}

/* ############ */
/* ### Cell ### */
/* ############ */

class Cell {
    constructor(universe, x, y, isAlive, color, occurence) {
        this.universe = universe;
        this.x = x;
        this.y = y;
        this.isAlive = isAlive;
        this.color = color;
        this.occurence = occurence;

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