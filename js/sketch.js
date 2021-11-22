/* ######################## */
/* ### Global variables ### */
/* ######################## */

// Scale factor
let sf = 32;

// Origin point
let origin;

/* ###################### */
/* ### User Interface ### */
/* ###################### */

// Sliders
let μSlider, λSlider, nSlider;

// Text
let μText, λText, nText;
let originText;

let NAV_HEIGHT = 40;

/* ####################### */
/* ### P5.js functions ### */
/* ####################### */

function setup() {
    createCanvas(windowWidth, windowHeight - NAV_HEIGHT);

    // Setup sliders
    μSlider = createSlider(0, 1, 0.5, 0.0001);
    μSlider.position(10, windowHeight - 70 - NAV_HEIGHT);
    μSlider.addClass('slider');

    λSlider = createSlider(0, 1, 0.5, 0.0001);
    λSlider.position(10, windowHeight - 40 - NAV_HEIGHT);
    λSlider.addClass('slider');

    nSlider = createSlider(0, 10000, 1000, 100);
    nSlider.position(10, windowHeight - 10 - NAV_HEIGHT);
    nSlider.addClass('slider');

    // Origin point
    origin = createVector(0, 0);
}

function draw() {
    background(0);

    // Sliders text
    textSize(15);
    fill(255);
    textFont('Courier New');
    textAlign(LEFT, CENTER);

    μText = text('μ = ' + μSlider.value(), 250, windowHeight - 100 - NAV_HEIGHT);
    λText = text('λ = ' + λSlider.value(), 250, windowHeight - 70 - NAV_HEIGHT);
    nText = text('n = ' + nSlider.value(), 250, windowHeight - 40 - NAV_HEIGHT);

    // Drag origin
    if (dragging) {
        origin.x = (mouseX - width / 2) / sf;
        origin.y = (mouseY - height / 2) / sf;
    }

    push();

    // Move draw point to screen center
    translate(width / 2, height / 2);

    // Handle zoom
    scale(sf);
    strokeWeight(4 / sf);

    // Color
    stroke('#f13030ff');

    // Draw shape
    system(μSlider.value(), λSlider.value(), nSlider.value(), origin).forEach(
        p => point(p.x, p.y)
    );

    // Draw origin point
    strokeWeight(10 / sf);
    stroke('#0075ffff');
    point(origin.x, origin.y);

    pop();

    // Origin text
    originText = text(
        'x : ' + origin.x + '\n' + 'y : ' + origin.y,
        origin.x * sf + width / 2 + 15,
        origin.y * sf + height / 2 - 10
    );

    // Manage cursor
    if (dist(origin.x, origin.y, (mouseX - width / 2) / sf, (mouseY - height / 2) / sf) < 10 / sf) {
        cursor(HAND);
    }
    else {
        cursor(ARROW);
    }
}

/* ################ */
/* ### Controls ### */
/* ################ */

// Zoom
window.addEventListener("wheel", e => {
    sf *= (e.deltaY < 0) ? 1.1 : 0.9;
});

// Draggable origin
let dragging = false;

function mousePressed() {
    // Check if mouse is over the origin
    if (dist(origin.x, origin.y, (mouseX - width / 2) / sf, (mouseY - height / 2) / sf) < 10 / sf) {
        dragging = true;
    }
}

function mouseReleased() {
    dragging = false;
}

/* ######################## */
/* ### Custom functions ### */
/* ######################## */

function system(μ, λ, n, starting_point) {
    let points = [];

    // Starting point
    let p = starting_point;

    // f(x)
    let f = (x, μ) => (μ * x) + (2 * (1 - μ) * x * x) / (1 - x + (x * x));

    // Iteration
    for (let i = 0; i < n; i++) {
        // Get new point
        xn = p.y + (λ * (1 - 0.05 * p.x * p.x)) + f(p.x, μ);
        yn = -p.x + f(xn, μ);

        // Store and set for next iteration
        p = createVector(xn, yn);
        points.push(p);
    }

    return points;
}