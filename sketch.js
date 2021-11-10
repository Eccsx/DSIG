/* ######################## */
/* ### Global variables ### */
/* ######################## */

// Scale factor
let sf = 20;

// Origin point
let origin;

/* ###################### */
/* ### User Interface ### */
/* ###################### */

// Sliders
let μSlider, λSlider, nSlider;

// Text
let μText, λText, nText;

/* ####################### */
/* ### P5.js functions ### */
/* ####################### */

function setup() {
    createCanvas(windowWidth, windowHeight);

    // Setup sliders
    μSlider = createSlider(0, 1, 0.5, 0.0001);
    μSlider.position(10, 10);
    μSlider.addClass('slider');

    λSlider = createSlider(0, 1, 0.5, 0.0001);
    λSlider.position(10, 40);
    λSlider.addClass('slider');

    nSlider = createSlider(0, 10000, 1000, 100);
    nSlider.position(10, 70);
    nSlider.addClass('slider');

    // Origin point
    origin = createVector(0, 0);
}

function draw() {
    background(0);

    // Sliders text
    strokeWeight(1);
    stroke(255);
    textSize(20);
    fill(255);
    textAlign(LEFT, CENTER);
    μText = text('μ = ' + μSlider.value(), 250, 15);
    λText = text('λ = ' + λSlider.value(), 250, 50);
    nText = text('n = ' + nSlider.value(), 250, 80);

    if(dragging) {
        origin.x = (mouseX - width / 2) / sf;
        origin.y = (mouseY - height / 2) / sf;
    }

    // Move draw point to screen center
    translate(width / 2, height / 2);

    // Handle zoom
    scale(sf);
    strokeWeight(3 / sf);

    // Color
    stroke(124, 131, 253);

    // Draw shape
    system(μSlider.value(), λSlider.value(), nSlider.value(), origin).forEach(
        p => point(p.x, p.y)
    );

    // Draw origin point
    strokeWeight(10 / sf);
    stroke(253, 131, 124);
    point(origin.x, origin.y);
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
    if(dist(origin.x, origin.y, (mouseX - width / 2) / sf, (mouseY - height / 2) / sf) < 10) {
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