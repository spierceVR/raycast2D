class Ray {
    constructor(x1, y1, theta, len = 1000) {
        this.p1 = {
            x:x1,
            y:y1
            };
        this.p2 = {
            x: (len * (Math.cos(theta))) + x1,
            y: (len * (Math.sin(theta))) + y1
            };
        this.theta = theta;
    }
}