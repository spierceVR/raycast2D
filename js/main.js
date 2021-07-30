(() => {
    const canvas = document.querySelector('#canvas');
    // get context
    const ctx = canvas.getContext('2d');
    console.log(ctx);
    console.log(canvas);
    console.log("Canvas Found");
    setup(800, 600);
    // generate random barriers
    let barriers = []
    for (let i = 0; i < 5; i++) {
        let b1 = new Barrier(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * canvas.width, Math.random() * canvas.height);
        barriers.push(b1);
    }
    window.addEventListener('mousemove',(e) => draw(e, barriers, ctx, canvas), false);
})();

function draw(e, barriers, ctx, canvas) {
    //create point 
    let point = getMousePos(canvas, e);

    // create rays
    let rays = []
    for (let i = 0; i < 32; i++) {
        let r1 = new Ray(point.x, point.y, i * (Math.PI / 16));
        rays.push(r1)
    }



    //draw background 
    drawRectangle(ctx, canvas.width, canvas.height);

    // draw barriers
    for (let barrier of barriers) {
        drawLine(ctx, barrier.p1, barrier.p2);
    }

    // draw rays from MousePos to intersection with closest barrier
    for (let ray of rays) {
        let closestP = null; // closest point of intersection so far
        let minDist = Infinity; // smallest distance between mousepos and a barrier
        for (let barrier of barriers) {
            let intersect = calculateIntersection(ray.p1, ray.p2, barrier.p1, barrier.p2); // current poi for current ray, barrier pair
            if (intersect) { // if intersection found between this current ray barrier pair
                let dist = pointDistance(ray.p1, intersect);
                if (dist < minDist) {
                    minDist = dist;
                    closestP = intersect; // make closest point the current point
                }
            }
        }
        if (closestP) { // if any intersection was found
            drawLine(ctx, ray.p1, closestP);
        }
        else { // if no intersection found
            drawLine(ctx, ray.p1, ray.p2);
        }
    }
}

function setup(width, height) {
    canvas.width = width;
    canvas.height = height;

}

function pointDistance(p1, p2) {
    return Math.hypot((p1.x - p2.x), (p1.y - p2.y))
}

function drawRectangle(ctx, width, height, color = "black") {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.fillRect(0, 0, width, height); // x, y, w, h
    ctx.strokeRect(0, 0, width, height);
}

function drawLine(ctx, p1, p2, color = 'white') {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

calculateIntersection = function (p0, p1, p2, p3) {
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

function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}