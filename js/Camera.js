class Camera {
    constructor(x, y, fov, theta, rayCount, rayLen) {
        this.x = x;
        this.y = y;
        this.fov = fov;
        this.theta = theta;
        this.rayCount = rayCount;
        this.rayLen = rayLen;
        this.screenW = x*2;

        this.rays = [];

        for (let i = 0; i < this.screenW; i++){
            let rayTheta = i * (this.fov / this.screenW) - (this.fov / 2) + this.theta;
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
                const diffTheta = Math.abs(ray.theta - this.theta);
                const projectionPlaneDistance = (ctx3D.canvas.width / 2) / (Math.tan(this.fov / 2));
                const correctedDist = minDist * Math.cos(diffTheta);
                drawSlice(ctx3D, i, correctedDist, this.rayCount, this.rayLen, projectionPlaneDistance);
            }
            else { // if no intersection found
                drawLine(ctx2D, ray.p1, ray.p2);
            }
        }
    }

    updateSettings(fov, rayCount, rayLen) {
        this.rayCount = rayCount;
        this.rayLen = rayLen;
        this.fov = fov;
    }

    updatePos(controller) {
        //update camera position based on keys pressed
        if (controller["a"].pressed) {
            this.theta -= 0.02;
        } else if (controller["d"].pressed) {
            this.theta += 0.02;
        }

        if (controller["w"].pressed) {
            this.x += Math.cos(this.theta) * 0.5;
            this.y += Math.sin(this.theta) * 0.5;
        } else if (controller["s"].pressed) {
            this.x -= Math.cos(this.theta) * 0.5;
            this.y -= Math.sin(this.theta) * 0.5;
        }

        //update rays based on new camera position
        let rays = [];
        for (let i = 0; i < this.screenW; i++){
            let rayTheta = (i * this.fov) / this.screenW - (this.fov / 2) + this.theta;
            let r1 = new Ray(this.x, this.y, rayTheta, this.rayLen);
            rays.push(r1);
        }
        this.rays = rays;
    }

}