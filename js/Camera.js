class Camera {
    constructor(x, y, fov, theta, rayCount, rayLen) {
        this.x = x;
        this.y = y;
        this.fov = fov;
        this.theta = theta;
        this.rayCount = rayCount;
        this.rayLen = rayLen;

        this.rays = [];
        for (let i = 0; i < rayCount; i++) {
            let rayTheta = (i * (fov / rayCount)) - (fov / 2) + theta;
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
                    let dist = pointDistance(ray.p1, intersect) * (Math.cos(Math.abs(this.theta - ray.theta)));
                    if (dist < minDist) {
                        minDist = dist;
                        closestP = intersect; // make closest point the current point
                    }
                }
            }
            if (closestP) { // if any intersection was found
                drawLine(ctx2D, ray.p1, closestP);
                // remove fisheye effect
                drawSlice(ctx3D, i, minDist, this.rayCount, this.rayLen);
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
            this.theta -= 0.01;
        } else if (controller["d"].pressed) {
            this.theta += 0.01;
        }

        if (controller["w"].pressed) {
            this.x += Math.cos(this.theta) * 1;
            this.y += Math.sin(this.theta) * 1;
        } else if (controller["s"].pressed) {
            this.x -= Math.cos(this.theta) * 1;
            this.y -= Math.sin(this.theta) * 1;
        }

        //update rays based on new camera position
        let rays = [];
        for (let i = 0; i < this.rayCount; i++) {
            let rayTheta = (i * (radians(this.fov) / this.rayCount)) - (radians(this.fov) / 2) + this.theta; // cast half of rays left of theta, half to the right
            let r1 = new Ray(this.x, this.y, rayTheta, this.rayLen);
            rays.push(r1);
        }
        this.rays = rays;
    }
}