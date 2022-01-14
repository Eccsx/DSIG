/* ######################## */
/* ### Global variables ### */
/* ######################## */

const COLORS = [
    '#fbf8cc',
    '#fde4cf',
    '#ffcfd2',
    '#f1c0e8',
    '#cfbaf0',
    '#a3c4f3',
    '#90dbf4',
    '#8eecf5',
    '#98f5e1',
    '#b9fbc0'
]

/* ###################### */
/* ### User Interface ### */
/* ###################### */

const NAV_HEIGHT = 40;

/* ####################### */
/* ### P5.js functions ### */
/* ####################### */

function setup() {
    createCanvas(windowWidth, windowHeight - NAV_HEIGHT);

    // Color superposition blending
    blendMode(DIFFERENCE);

    background(0);
    noLoop();
}

function draw() {
    // Tiling
    createTiling(
        50,
        7,
        15, 15, 25, 15
    );
}

/* ############## */
/* ### Tiling ### */
/* ############## */

function createTiling(rosetteLength, rosettePetalNumber, b1, b2, b3, b4) {
    // Number of rosettes to fit canvas
    const xTile = int(width / rosetteLength) + (width % rosetteLength);
    const yTile = int(height / rosetteLength) + (height % rosetteLength);

    // Origin rosette
    const rosette = new Rosette(
        rosetteLength,
        createVector(0, 0),
        rosettePetalNumber,
        b1, b2, b3, b4
    );

    // Generate tiling pattern
    for (let i = 0; i < xTile; i++) {
        // Draw first column rosette
        rosette.draw();

        for (let j = 0; j < yTile; j++) {
            if (i % 2 == 0) {
                rosette.translateRight();
            } else {
                rosette.translateLeft();
            }

            rosette.axialSymmetryY();
            rosette.draw();
        }

        // Move rosette to next row
        rosette.translateDown();
        rosette.axialSymmetryX();
    }
}

/* ############### */
/* ### Rosette ### */
/* ############### */

class Rosette {
    constructor(
        sideLength,
        center,
        petalNumber,
        b1, b2, b3, b4
    ) {
        this.center = center;
        this.sideLength = sideLength;
        this.petals = [];

        // Fundamental region
        const fundamentalRegionPoints = createFundamentalRegion(
            sideLength,
            center.x, center.y,
            b1, b2, b3, b4
        );

        // Rosette's petals
        this.petals.push(fundamentalRegionPoints);

        // Petal rotation angle
        const theta = 2 * PI / petalNumber;

        // Compute petals
        let a = fundamentalRegionPoints[0];
        let b = fundamentalRegionPoints[1];
        let c = fundamentalRegionPoints[2];
        let d = fundamentalRegionPoints[3];
        let e = fundamentalRegionPoints[4];

        // Max x and y values to compute space between rosette tiles
        this.maxX = max(a.x, b.x, c.x, d.x, e.x);
        this.maxY = max(a.y, b.y, c.y, d.y, e.y);

        for (let i = 0; i < petalNumber; i++) {
            // Rotate points to next petal
            a = rotationSymmetry(a, center, theta);
            b = rotationSymmetry(b, center, theta);
            c = rotationSymmetry(c, center, theta);
            d = rotationSymmetry(d, center, theta);
            e = rotationSymmetry(e, center, theta);

            this.petals.push([a, b, c, d, e]);

            // Update max values
            this.maxX = max(this.maxX, max(a.x, b.x, c.x, d.x, e.x));
            this.maxY = max(this.maxY, max(a.y, b.y, c.y, d.y, e.y));
        }

        // Max x and y values on center coordinates
        this.maxX -= center.x;
        this.maxY -= center.y;

        // Dimension
        this.maxRight = this.maxX;
        this.maxLeft = -this.maxY; //+ abs(this.maxX - this.maxY);
    }

    translateLeft() {
        this.center.x -= this.maxX * 2;

        this.petals.forEach(points => {
            points.forEach(p => {
                p.x -= this.maxX * 2;
            });
        });
    }

    translateRight() {
        this.center.x += this.maxX * 2;

        this.petals.forEach(points => {
            points.forEach(p => {
                p.x += this.maxX * 2;
            });
        });
    }

    translateDown() {
        this.center.y += this.maxY * 2;

        this.petals.forEach(points => {
            points.forEach(p => {
                p.y += this.maxY * 2;
            });
        });
    }

    axialSymmetryX() {
        this.petals.forEach(points => {
            points.forEach(p => {
                p.y = (2 * this.center.y) - p.y;
            });
        });
    }

    axialSymmetryY() {
        this.petals.forEach(points => {
            points.forEach(p => {
                p.x = (2 * this.center.x) - p.x;
            });
        });
    }

    draw() {
        push();

        // Line style
        noStroke();
        strokeWeight(1);

        let petalIndex = 0;

        this.petals.forEach(points => {
            beginShape();

            // Petal coloration
            const c = color(COLORS[petalIndex++]);
            fill(c);

            points.forEach(p => {
                vertex(p.x, p.y);
            });

            endShape(CLOSE);
        });

        pop();
    }

    drawBox() {
        push();

        strokeWeight(1)
        stroke(255, 0, 0);
        rectMode(CENTER);
        noFill();

        rect(
            this.center.x,
            this.center.y,
            this.sideLength * 2,
            this.sideLength * 2,
        )

        pop();
    }
}

/* ########################## */
/* ### Fundamental region ### */
/* ########################## */

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

/* ########################## */
/* ### Rotation ### */
/* ########################## */

function rotationSymmetry(point, origin, theta) {
    // Translate point to rotation's origin
    let xTmp = point.x - origin.x;
    let yTmp = -point.y + origin.y;

    // Rotate point of theta angle
    const pointR = createVector(
        xTmp * cos(theta) - yTmp * sin(theta),
        yTmp * cos(theta) + xTmp * sin(theta)
    );

    // Restore point offset from origin
    return createVector(
        pointR.x + origin.x,
        -pointR.y + origin.y
    );
}