/* ######################## */
/* ### Global variables ### */
/* ######################## */

let gap = 3;

/* ###################### */
/* ### User Interface ### */
/* ###################### */

const NAV_HEIGHT = 40;

// Sliders
let lengthSlider, petalSlider, b1Slider, b2Slider, b3Slider, b4Slider;

// Text
let lengthText, petalText, b1Text, b2Text, b3Text, b4Text;

/* ####################### */
/* ### P5.js functions ### */
/* ####################### */

function setup() {
    createCanvas(windowWidth, windowHeight - NAV_HEIGHT);

    // Setup sliders
    petalSlider = createSlider(2, 10, 5, 1);
    petalSlider.position(10, windowHeight - 130 - NAV_HEIGHT);
    petalSlider.addClass('slider');

    b1Slider = createSlider(0, 90, 0, 1);
    b1Slider.position(10, windowHeight - 100 - NAV_HEIGHT);
    b1Slider.addClass('slider');

    b2Slider = createSlider(0, 90, 33, 1);
    b2Slider.position(10, windowHeight - 70 - NAV_HEIGHT);
    b2Slider.addClass('slider');

    b3Slider = createSlider(0, 90, 15, 1);
    b3Slider.position(10, windowHeight - 40 - NAV_HEIGHT);
    b3Slider.addClass('slider');

    b4Slider = createSlider(0, 90, 60, 1);
    b4Slider.position(10, windowHeight - 10 - NAV_HEIGHT);
    b4Slider.addClass('slider');
}

function draw() {
    background(0);

    // Sliders text
    textSize(15);
    fill(255);
    textFont('Courier New');
    textAlign(LEFT, CENTER);

    petalText = text('p = ' + petalSlider.value(), 250, windowHeight - 160 - NAV_HEIGHT);
    b1Text = text('b1 = ' + b1Slider.value(), 250, windowHeight - 130 - NAV_HEIGHT);
    b2Text = text('b2 = ' + b2Slider.value(), 250, windowHeight - 100 - NAV_HEIGHT);
    b3Text = text('b3 = ' + b3Slider.value(), 250, windowHeight - 70 - NAV_HEIGHT);
    b4Text = text('b4 = ' + b4Slider.value(), 250, windowHeight - 40 - NAV_HEIGHT);

    push();

    // Tiling
    stroke(255);
    strokeWeight(1);

    createTiling(
        50,
        petalSlider.value(),
        b1Slider.value(), b2Slider.value(), b3Slider.value(), b4Slider.value()
    );

    pop();
}

/* ############## */
/* ### Tiling ### */
/* ############## */

function createTiling(rosetteLength, rosettePetalNumber, b1, b2, b3, b4) {
    // Number of rosettes to fit canvas
    const xTile = int(width / rosetteLength) + ( width % rosetteLength);
    const yTile = int(height / rosetteLength) + ( height % rosetteLength);

    console.log(xTile, yTile)

    // Generate tiling pattern
    for (let i = 0; i < xTile; i++) {
        for (let j = 0; j < yTile; j++) {
            // Rosette center
            const center = createVector(
                i * rosetteLength * gap,
                j * rosetteLength * gap
            );

            createRosette(
                rosetteLength,
                center,
                rosettePetalNumber,
                b1, b2, b3, b4
            );
        }
    }
}

/* ############### */
/* ### Rosette ### */
/* ############### */

function createRosette(sideLength, center, petalNumber, b1, b2, b3, b4) {
    // Petal rotation angle
    const theta = 2 * PI / petalNumber;

    // Compute fundamental region's points
    let fundamentalRegionPoints = createFundamentalRegion(
        sideLength,
        center.x, center.y,
        b1, b2, b3, b4
    );

    // Compute rosette's points
    let a = fundamentalRegionPoints[0];
    let b = fundamentalRegionPoints[1];
    let c = fundamentalRegionPoints[2];
    let d = fundamentalRegionPoints[3];
    let e = fundamentalRegionPoints[4];

    for (let i = 0; i < petalNumber; i++) {
        console.log('draw')

        // Draw petal
        line(a.x, a.y, b.x, b.y);
        line(b.x, b.y, c.x, c.y);
        line(c.x, c.y, d.x, d.y);
        line(d.x, d.y, e.x, e.y);

        // Rotate points to next petal
        a = rotateSymmetry(a, center, theta);
        b = rotateSymmetry(b, center, theta);
        c = rotateSymmetry(c, center, theta);
        d = rotateSymmetry(d, center, theta);
        e = rotateSymmetry(e, center, theta);
    }
}

function rotateSymmetry(point, origin, θ) {
    // Translate point to rotation's origin
    let xTmp = point.x - origin.x;
    let yTmp = -point.y + origin.y;

    // Rotate point of θ angle
    const pointR = rotateO(xTmp, yTmp, θ);

    // Restore point offset from origin
    return createVector(
        pointR.x + origin.x,
        -pointR.y + origin.y
    );
}

function rotateO(x, y, θ) {
    return createVector(
        x * cos(θ) - y * sin(θ),
        y * cos(θ) + x * sin(θ)
    );
}

function createFundamentalRegion(x, x0, y0, b1, b2, b3, b4) {
    // Fundamental region vertices
    const a0 = createVector(
        x0 + b1 - b2,
        y0 + b2
    );
    const b0 = createVector(
        x0 + b4,
        y0 - b3
    );
    const c0 = createVector(
        x0 + (x / 2),
        y0 - (x / 2)
    );
    const d0 = createVector(
        x0 + b3,
        y0 - b4
    );
    const e0 = createVector(
        x0 - b2,
        y0 - b1 + b2
    );

    return [a0, b0, c0, d0, e0];
}