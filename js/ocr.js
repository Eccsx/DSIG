/* ######################## */
/* ### Global variables ### */
/* ######################## */

const NUMBER_MATRIX_DIM = {
    'lines': 10,
    'columns': 10
};

const NUMBER_TRAINING_SAMPLES = 5;

let numberMatrix = [];
let trainingSet = [];

let currentTrainingNumber = 0;
let currentTrainingSamples = 1;

const NN = new brain.NeuralNetwork();

/* ###################### */
/* ### User Interface ### */
/* ###################### */

const NAV_HEIGHT = 40;

// Training buttons
let resetMatrixButton;
let storeMatrixButton;

// NN button
let guessNNButton;

// Text element
let matrixText = document.getElementById('matrix-text');

/* ####################### */
/* ### P5.js functions ### */
/* ####################### */

function setup() {
    const dim = (windowHeight - NAV_HEIGHT < windowWidth) ? windowHeight - NAV_HEIGHT : windowWidth;
    createCanvas(dim, dim);
    cursor(HAND);

    // Setup buttons
    resetMatrixButton = createButton('Clear');
    resetMatrixButton.position(0, NAV_HEIGHT + height + 50);
    resetMatrixButton.mousePressed(clearDrawingMatrix);

    storeMatrixButton = createButton('Submit');
    storeMatrixButton.position(50, NAV_HEIGHT + height + 50);
    storeMatrixButton.mousePressed(storeDrawingMatrixData);

    guessNNButton = createButton('Predict');
    guessNNButton.position(250, NAV_HEIGHT + height + 50);
    guessNNButton.mousePressed(predict);

    initialization();
}

function draw() {
    numberDrawingMatrix();
}

function initialization() {
    clearDrawingMatrix();

    // Matrix text
    matrixText.textContent = 'Training set --> "0" (1\/' + NUMBER_TRAINING_SAMPLES + ')';
}

/* ##################### */
/* ### Number Matrix ### */
/* ##################### */

function numberDrawingMatrix() {
    // Dimensions
    const LINE_DIM = width / NUMBER_MATRIX_DIM['lines'];
    const COLUMN_DIM = height / NUMBER_MATRIX_DIM['columns'];

    // Display
    for (let line = 0; line < NUMBER_MATRIX_DIM['lines']; line++) {
        for (let column = 0; column < NUMBER_MATRIX_DIM['columns']; column++) {
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

function clearDrawingMatrix() {
    // Clear matrix
    numberMatrix = [];

    for (let line = 0; line < NUMBER_MATRIX_DIM['lines']; line++) {
        // Initialize cells with Os
        numberMatrix.push(new Array(NUMBER_MATRIX_DIM['columns']).fill(0));
    }
}

function storeDrawingMatrixData() {
    // Format matrix data
    // https://stackoverflow.com/a/10865042/11060940
    const data = [].concat.apply([], numberMatrix);

    // Create training pattern
    const tp = {
        input: data,
        output: {
            0: int(currentTrainingNumber === 0),
            1: int(currentTrainingNumber === 1),
            2: int(currentTrainingNumber === 2),
            3: int(currentTrainingNumber === 3),
            4: int(currentTrainingNumber === 4),
            5: int(currentTrainingNumber === 5),
            6: int(currentTrainingNumber === 6),
            7: int(currentTrainingNumber === 7),
            8: int(currentTrainingNumber === 8),
            9: int(currentTrainingNumber === 9)
        }
    };

    // Store pattern
    trainingSet.push(tp);

    // Clear matrix
    clearDrawingMatrix();

    // Update training values
    if (currentTrainingSamples === NUMBER_TRAINING_SAMPLES) {
        currentTrainingNumber++;
        currentTrainingSamples = 1;
    } else {
        currentTrainingSamples++;
    }

    // Update matrix text
    matrixText.textContent = 'Training set --> \'' + currentTrainingNumber + '\' (' + currentTrainingSamples + '\/' + NUMBER_TRAINING_SAMPLES + ')';

    // Check if training set is filled
    if (currentTrainingNumber === 10) {
        // Hide submit buttons
        resetMatrixButton.hide();

        // Update text
        matrixText.textContent = 'Training set filled :)';

        // Train neural network
        trainNN();
    }
}

function matrixDataToNNTrainingPattern() {

}

/* ################ */
/* ### Controls ### */
/* ################ */

// Draw number within the matrix
function mouseDragged() {
    // Matrix dimensions
    const MATRIX_LINE_DIM = width / NUMBER_MATRIX_DIM['lines'];
    const MATRIX_COLUMN_DIM = width / NUMBER_MATRIX_DIM['columns'];

    // Check if mouse is over a cell
    for (let line = 0; line < NUMBER_MATRIX_DIM['lines']; line++) {
        for (let column = 0; column < NUMBER_MATRIX_DIM['columns']; column++) {
            if (
                mouseY > line * MATRIX_LINE_DIM &&
                mouseY < line * MATRIX_LINE_DIM + MATRIX_LINE_DIM &&
                mouseX > column * MATRIX_COLUMN_DIM &&
                mouseX < column * MATRIX_COLUMN_DIM + MATRIX_COLUMN_DIM
            ) {
                // Set cell to 1
                numberMatrix[line][column] = 1;
            }
        }
    }
}

/* ###################### */
/* ### Neural network ### */
/* ###################### */

function trainNN() {
    NN.train(trainingSet);
}

function predict() {
    // Format matrix data
    // https://stackoverflow.com/a/10865042/11060940
    const input = [].concat.apply([], numberMatrix);

    const output = NN.run(input);

    console.log(output);
}