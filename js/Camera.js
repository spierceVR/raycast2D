class Camera {
    constructor(x, y, fov, theta, rayLen) {
        this.x = x;
        this.y = y;
        this.fov = fov;
        this.theta = theta;
        // this.rayCount = rayCount;
        this.rayLen = rayLen;
        this.screenW = x * 2;

        this.rays = [];

        // For now, each column of the window has its own ray 
        // TODO: use slider to adjust number of rays (sacrifice resolution for performance) 
        const angleBetweenRays = (this.fov / this.screenW); // degrees difference between each pixel's ray
        const numRays = this.screenW;  // number of total rays
        for (let i = 0; i < numRays; i++) {
            let rayTheta = this.theta + (i*angleBetweenRays) - (this.fov / 2);
            let r1 = new Ray(this.x, this.y, rayTheta, rayLen);
            this.rays.push(r1);
        }
    }

    //draw rays to nearest barrier, and draw 3d wall slices 
    look(ctx2D, ctx3D, barriers) {
        for (const [i, ray] of this.rays.entries()) {
            let closestP = null; // closest point of intersection so far
            let minDist = Infinity; // smallest distance between mousepos and a barrier

            for (let barrier of barriers) {
                let intersect = calculateIntersection(ray.p1, ray.p2, barrier.p1, barrier.p2); // current poi for current ray, barrier pair
                if (intersect) { // if intersection found between this current ray barrier pair
                    let dist = pointDistance(ray.p1, intersect); // distance between ray origin and poi
                    if (dist < minDist) {
                        minDist = dist;
                        closestP = intersect; // make closest point the current point
                    }
                }
            }
            if (closestP) { // if any intersection was found
                drawLine(ctx2D, ray.p1, closestP);
                // remove fisheye effect
                const diffTheta = ray.theta - this.theta;
                const projectionPlaneDistance = (ctx3D.canvas.width * 0.5) / Math.tan(this.fov / 2);
                let correctedDist = minDist * Math.cos(diffTheta); 
                    if (correctedDist < 0.1) correctedDist = 0.1;  
                const columnsPerSlice = this.screenW / this.fov;
                drawSlice(ctx3D, i, correctedDist, columnsPerSlice, this.rayLen, projectionPlaneDistance);
            }
            else { // if no intersection found
                drawLine(ctx2D, ray.p1, ray.p2);
            }
        }
    }

    updateSettings(fov, rayLen) {
        this.rayLen = rayLen;
        this.fov = fov;
    }

    updatePos(controller) {
        //update camera position based on keys pressed
        if (controller["a"].pressed) {
            this.theta -= 0.02;
        }
        else if (controller["d"].pressed) {
            this.theta += 0.02;
        }

        if (controller["w"].pressed) {
            this.x += Math.cos(this.theta) * 0.5;
            this.y += Math.sin(this.theta) * 0.5;
        }
        else if (controller["s"].pressed) {
            this.x -= Math.cos(this.theta) * 0.5;
            this.y -= Math.sin(this.theta) * 0.5;
        }

        //update rays based on new camera position
        let rays = [];
        const angleBetweenRays = (this.fov / this.screenW); // degrees difference between each pixel's ray
        const numRays = this.screenW;  // number of total rays
        for (let i = 0; i < numRays; i++) {
            let rayTheta = this.theta + (i*angleBetweenRays) - (this.fov / 2);
            let r1 = new Ray(this.x, this.y, rayTheta, this.rayLen);
            rays.push(r1);
        }
        this.rays = rays;
    }

}