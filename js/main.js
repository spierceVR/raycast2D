(() => {
    // get canvas elements and resize them
    const canvas1 = document.querySelector('#canvas');
    resize(canvas1);
    const canvas2 = document.querySelector('#canvas2');
    resize(canvas2);

    // get context
    const ctx1 = canvas1.getContext('2d');
    const ctx2 = canvas2.getContext('2d');

    // draw canvas backgrounds on page load
    drawRectangle(ctx1, canvas1.width, canvas1.height);
    drawRectangle(ctx2, canvas2.width, canvas2.height);


    // I/O from sliders for ray count, ray length, and FOV
    const rayCount = document.getElementById("sliderCount").value;
    const fov = document.getElementById("sliderFov").value;
    const rayLen = document.getElementById("sliderLen").value;

    const fovLabel = document.getElementById("fovLabel");
    const countLabel = document.getElementById("countLabel");


    // generate random barriers
    const barriers = genBarriers(canvas1);

    //create singleton camera
    const camera = new Camera(canvas1.width / 2, canvas1.height / 2, fov, 0, rayCount, rayLen);

    // stores which keys are pressed
    const controller = {
        "a": { pressed: false },
        "d": { pressed: false },
        "w": { pressed: false },
        "s": { pressed: false }
    }

    //manage keys up / down
    window.addEventListener("keydown", (e) => {
        if (controller[e.key]) {
            controller[e.key].pressed = true;
        }
    });
    document.addEventListener("keyup", (e) => {
        if (controller[e.key]) {
            controller[e.key].pressed = false;
        }
    })
    
    // new camera from slider values on click button
    document.getElementById("apply").addEventListener("click", () => { handleApplySettings(camera, fovLabel, countLabel) });

    window.requestAnimationFrame((timestamp) => animate(camera, barriers, ctx1, ctx2, controller));
})();

// called each frame to draw the scene
animate = (camera, barriers, ctx1, ctx2, controller) => {
    // update cameras position in the scene based on keys pressed
    camera.updatePos(controller);

    // non-ray drawing
    setup2D(ctx1, barriers);
    setup3D(ctx2);

    // do raycasting and show results on 2D and 3D views
    camera.look(ctx1, ctx2, barriers);

    // request next frame
    window.requestAnimationFrame((timestamp) => animate(camera, barriers, ctx1, ctx2, controller));
}

function handleApplySettings(camera, fovLabel, countLabel) {
    // get fresh slider values
    const fov = document.getElementById("sliderFov").value;
    const rayCount = document.getElementById("sliderCount").value;
    const rayLen = document.getElementById("sliderLen").value;

    setLabels(fovLabel, countLabel, fov, rayCount);
    camera.updateSettings(fov, rayCount, rayLen);
}

//update page labels for ray count and length
function setLabels(fovLabel, countLabel, fov, rayCount) {
    countLabel.innerHTML = "Ray Count : " + rayCount;
    fovLabel.innerHTML = "FOV : " + fov;
}


function pointDistance(p1, p2) {
    return Math.hypot((p1.x - p2.x), (p1.y - p2.y))
}

function drawRectangle(ctx, x1, y1, width, height, color = "black") {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.fillRect(x1, y1, width, height);
    ctx.strokeRect(x1, y1, width, height);
}

function drawLine(ctx, p1, p2, color = 'white') {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

calculateIntersection = (p0, p1, p2, p3) => {
    var s, s1_x, s1_y, s2_x, s2_y, t;

    s1_x = p1.x - p0.x;
    s1_y = p1.y - p0.y;
    s2_x = p3.x - p2.x;
    s2_y = p3.y - p2.y;
    s = (-s1_y * (p0.x - p2.x) + s1_x * (p0.y - p2.y)) / (-s2_x * s1_y + s1_x * s2_y);
    t = (s2_x * (p0.y - p2.y) - s2_y * (p0.x - p2.x)) / (-s2_x * s1_y + s1_x * s2_y);
    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        return {
            x: p0.x + (t * s1_x),
            y: p0.y + (t * s1_y)
        };
    }
    return null;
};

//draw a vertical slice of the wall
function drawSlice(ctx, x, rayDist, rayCount, rayLen) {
    const colorVal = (1 - (rayDist / rayLen)) * 255;
    const wallHeight =  ctx.canvas.height * (1 - (rayDist / rayLen));
    const gray = `rgb(${colorVal}, ${colorVal}, ${colorVal})`;
    const sliceWidth = ctx.canvas.width / rayCount;
    drawRectangle(ctx, x * sliceWidth, (ctx.canvas.height - wallHeight) * 0.5, sliceWidth, wallHeight, gray);
}

//set size of canvas
function resize(canvas) {
    canvas.width = window.innerWidth * .45;
    canvas.height = window.innerHeight * .7;
}

// create array of randomly generated barriers
function genBarriers(canvas) {
    const barriers = [];
    for (let i = 0; i < 5; i++) {
        let b1 = new Barrier(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * canvas.width, Math.random() * canvas.height);
        barriers.push(b1);
    }
    return barriers;
}

// convert degrees to radians
function radians(degrees) {
    return degrees * Math.PI / 180;
}

// draw background and walls on 2D scene
function setup2D(ctx, barriers) {
    //draw backgrounds 
    drawRectangle(ctx, 0, 0, ctx.canvas.width, ctx.canvas.height);

    // draw barriers
    for (let barrier of barriers) {
        drawLine(ctx, barrier.p1, barrier.p2);
    }
}

// draw background and floor plane on 3D scene
function setup3D(ctx) {
    let h = ctx.canvas.height;
    let w = ctx.canvas.width;
    //draw background
    drawRectangle(ctx, 0, 0, w, h);

    //draw floor
    // Create gradient
    let grd = ctx.createLinearGradient(w, h, w, h * 0.45);
    grd.addColorStop(0, "gray");
    grd.addColorStop(1, "black");

    // Fill with gradient
    ctx.fillStyle = grd;
    ctx.fillRect(0, h * 0.5, w, h)
}