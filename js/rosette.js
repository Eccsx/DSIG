/* ######################## */
/* ### Global variables ### */
/* ######################## */

let rosetteSideLength = 10;
let tilingOrigin;
let b1 = 24, b2 = 5, b3 = 18, b4 = 50;

/* ###################### */
/* ### User Interface ### */
/* ###################### */

const NAV_HEIGHT = 40;

/* ####################### */
/* ### P5.js functions ### */
/* ####################### */

function setup() {
    createCanvas(windowWidth, windowHeight - NAV_HEIGHT);
    noLoop();

    tilingOrigin = createVector(100, 100);
}

function draw() {
    background(0);
    stroke(255);
    strokeWeight(3);

    createRosette(rosetteSideLength, tilingOrigin, 4);
}

/* ############### */
/* ### Rosette ### */
/*################ */

function createRosette(sideLength, center, petalNumber) {
    // Petal rotation angle
    const theta = 2 * PI / petalNumber;

    console.log(theta)

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
        console.log(a, b, c, d, e);

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