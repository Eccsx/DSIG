/* ######################## */
/* ### Global variables ### */
/* ######################## */

const NUMBER_GRID_DIM = {
    "lines": 20,
    "columns": 10
};

let numberMatrix = [];

/* ###################### */
/* ### User Interface ### */
/* ###################### */

const NAV_HEIGHT = 40;

/* ####################### */
/* ### P5.js functions ### */
/* ####################### */

function setup() {
    const dim = (windowHeight - NAV_HEIGHT < windowWidth) ? windowHeight - NAV_HEIGHT : windowWidth;
    createCanvas(dim, dim);

    initialization();
}

function draw() {
    numberDrawingGrid();
}

function initialization() {
    // Matrix representation of number in grid
    for (let line = 0; line < NUMBER_GRID_DIM["lines"]; line++) {
        // Initialize cells with Os
        numberMatrix.push(new Array(NUMBER_GRID_DIM["columns"]).fill(0));
    }

    console.log(numberMatrix)
}

/* ################### */
/* ### Number grid ### */
/* ################### */

function numberDrawingGrid() {
    // Dimensions
    const LINE_DIM = width / NUMBER_GRID_DIM["lines"];
    const COLUMN_DIM = height / NUMBER_GRID_DIM["columns"];

    // Display
    for (let line = 0; line < NUMBER_GRID_DIM["lines"]; line++) {
        for (let column = 0; column < NUMBER_GRID_DIM["columns"]; column++) {
            // Is the cell selected ?
            fill(numberMatrix[line][column] === 1 ? 'red' : 'white');

            rect(
                column * COLUMN_DIM,
                line * LINE_DIM,
                COLUMN_DIM,
                LINE_DIM
            );
        }
    }
}

/* ################ */
/* ### Controls ### */
/* ################ */

// Draw number within the grid
function mouseDragged() {
    // Grid dimensions
    const GRID_LINE_DIM = width / NUMBER_GRID_DIM["lines"];
    const GRID_COLUMN_DIM = width / NUMBER_GRID_DIM["columns"];

    // Check if mouse is over a cell
    for (let line = 0; line < NUMBER_GRID_DIM["lines"]; line++) {
        for (let column = 0; column < NUMBER_GRID_DIM["columns"]; column++) {
            if (
                mouseY > line * GRID_LINE_DIM &&
                mouseY < line * GRID_LINE_DIM + GRID_LINE_DIM &&
                mouseX > column * GRID_COLUMN_DIM &&
                mouseX < column * GRID_COLUMN_DIM + GRID_COLUMN_DIM
            ) {
                // Set cell to 1
                numberMatrix[line][column] = 1;
            }
        }
    }
}


// for (a = 0; a < width / 10; a++) {
//     for (b = 0; b < height / 10; b++) {
//         if (
//             mouseX > a * width / 10 &&
//             mouseX < a * width / 10 + width / 10 &&
//             mouseY > b * width / 10 &&
//             mouseY < b * width / 10 + width / 10
//         ) {
//             fill(255, 0, 0);
//             rect(a * width / 10, b * height / 10, width / 10, height / 10);
//         }
//     }
// }