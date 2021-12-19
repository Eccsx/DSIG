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

const NN_100 = new brain.NeuralNetwork({
    activation: 'sigmoid',
    hiddenLayers: [100]
});
const NN_50 = new brain.NeuralNetwork({
    activation: 'sigmoid',
    hiddenLayers: [50]
});
const NN_25 = new brain.NeuralNetwork({
    activation: 'sigmoid',
    hiddenLayers: [25]
});
const NN_100_50 = new brain.NeuralNetwork({
    activation: 'sigmoid',
    hiddenLayers: [100, 50]
});
const NN_100_25 = new brain.NeuralNetwork({
    activation: 'sigmoid',
    hiddenLayers: [100, 25]
});
const NN_50_25 = new brain.NeuralNetwork({
    activation: 'sigmoid',
    hiddenLayers: [50, 25]
});
const NN_50_15 = new brain.NeuralNetwork({
    activation: 'sigmoid',
    hiddenLayers: [50, 15]
});
const NN_100_50_25 = new brain.NeuralNetwork({
    activation: 'sigmoid',
    hiddenLayers: [100, 50, 25]
});

let resultsCanvas, resultsChart;

const CHART_COLORS = [
    '#ffadad',
    '#ffd6a5',
    '#fdffb6',
    '#caffbf',
    '#9bf6ff',
    '#a0c4ff',
    '#bdb2ff',
    '#ffc6ff'
]

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
let matrixText = document.getElementById('pixel-matrix-title');

/* ####################### */
/* ### P5.js functions ### */
/* ####################### */

function setup() {
    const pixelMatrix = createCanvas(windowWidth / 3, windowWidth / 3);
    pixelMatrix.parent('left-container');
    cursor(HAND);

    // Setup buttons
    storeMatrixButton = createButton('SUBMIT');
    storeMatrixButton.parent('left-container')
    storeMatrixButton.id('store-button');
    storeMatrixButton.mousePressed(storeDrawingMatrixData);

    guessNNButton = createButton('GUESS');
    guessNNButton.parent('left-container')
    guessNNButton.id('guess-button');
    guessNNButton.mousePressed(predict);

    resetMatrixButton = createButton('CLEAR');
    resetMatrixButton.parent('left-container')
    resetMatrixButton.id('reset-button');
    resetMatrixButton.mousePressed(clearDrawingMatrix);

    initialization();
}

function draw() {
    numberDrawingMatrix();
}

function initialization() {
    clearDrawingMatrix();

    // Matrix text
    matrixText.textContent = 'Training set ↤ { 0 } \n 1 of ' + NUMBER_TRAINING_SAMPLES;

    // Plot statistics graph
    setupStatistics();
    plotStatistics();
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
            fill(numberMatrix[line][column] === 1 ? '#47e5bc' : '#343a40');

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
    matrixText.textContent = 'Training set ↤ {' + currentTrainingNumber + '} ' + currentTrainingSamples + ' of ' + NUMBER_TRAINING_SAMPLES;

    // Check if training set is filled
    if (currentTrainingNumber === 10) {
        // Hide submit buttons
        storeMatrixButton.hide();
        guessNNButton.show();

        // Update text
        matrixText.textContent = 'Training fulfilled 😎';

        // Train neural network
        trainNN();
    }
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
    NN_100.train(trainingSet);
    NN_50.train(trainingSet);
    NN_25.train(trainingSet);
    NN_100_50.train(trainingSet);
    NN_100_25.train(trainingSet);
    NN_50_25.train(trainingSet);
    NN_50_15.train(trainingSet);
    NN_100_50_25.train(trainingSet);
}

function predict() {
    // Format matrix data
    // https://stackoverflow.com/a/10865042/11060940
    const input = [].concat.apply([], numberMatrix);

    // Run neural network configurations
    let predictions = []
    predictions.push(['{100}', NN_100.run(input)]);
    predictions.push(['{50}', NN_50.run(input)]);
    predictions.push(['{25}', NN_25.run(input)]);
    predictions.push(['{100, 50}', NN_100_50.run(input)]);
    predictions.push(['{100, 25}', NN_100_25.run(input)]);
    predictions.push(['{50, 25}', NN_50_25.run(input)]);
    predictions.push(['{50, 15}', NN_50_15.run(input)]);
    predictions.push(['{100, 50, 25}', NN_100_50_25.run(input)]);

    // Clear chart
    resultsChart.data.datasets = [];

    // Update statistics plot
    for (let i = 0; i < predictions.length; i++) {
        // Create new dataset
        const newDataset = {
            label: predictions[i][0],
            data: Object.values(predictions[i][1]),
            borderWidth: 0,
            backgroundColor: CHART_COLORS[i]
        }

        resultsChart.data.datasets.push(newDataset);
    }

    resultsChart.update();
}

/* ################## */
/* ### Statistics ### */
/* ################## */

function setupStatistics() {
    // Retieve canvas element
    resultsCanvas = document.getElementById('nn-results-canvas');

    // Dimensions
    resultsCanvas.style.width = 2 * windowWidth / 3 - 25 + 'px';
    resultsCanvas.style.height = windowHeight - NAV_HEIGHT + 'px';

    // Background color
    resultsCanvas.style.backgroundColor = 'black';
}

function plotStatistics() {
    // Settings
    Chart.defaults.font.size = 15;
    Chart.defaults.color = 'white';

    // Fitness
    resultsChart = new Chart(resultsCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        options: {
            responsive: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Neural networks number matching'
                }
            }
        }
    });
}