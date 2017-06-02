namespace Flow {
    export class PhysicsHandler {
        private physicsSettings: Flow.IPhysicsSettings;

        public constructor(physicsSettings: Flow.IPhysicsSettings) {
            this.physicsSettings = physicsSettings;
        }

        /**
         * Calculates spring forces for repelling/attracting nodes
         * 
         * @param {Node} n1 first node
         * @param {Node} n2 second node
         * @param {number} [direction=0] directions which are relevant. 0 = both, 1 = repel only, -1 = attract only
         * @returns {Flow.Vector} a force vector
         * 
         * @memberOf PhysicsHandler
         */
        public CalculateSpring(n1: ChartNode, n2: ChartNode, direction: number = 0): Flow.Vector {
            let dx = n1.getPos().x - n2.getPos().x;
            let dy = n1.getPos().y - n2.getPos().y;
            let d = Math.sqrt(dx**2 + dy**2);

            if (d === 0) {
                d = 1;
                dx = 1;
                dy = 0;
            }

            d = Math.abs(d);

            let f = 0;

            if (!(this.physicsSettings.springLength - d > 0 && direction === -1) && !(this.physicsSettings.springLength - d < 0 && direction === 1)) {
                f = (this.physicsSettings.springLength - d) * this.physicsSettings.springStrength;
            }

            let fx = ((dx / d) * f) / 2;
            let fy = ((dy / d) * f) / 2;

            return new Flow.Vector(fx, fy);
        }

        public beforeDraw(objects: Flow.IObjects) {
            if (this.physicsSettings.springEnabled) {
                let springForces: Flow.Vector;

                // connected nodes attract
                for (var i = 0; i < objects.edges.length; i++) {
                    springForces = this.CalculateSpring(
                        objects.edges[i].getNodes()[0],
                        objects.edges[i].getNodes()[1],
                        -1 // attract only
                    );
                    objects.edges[i].getNodes()[0].move(springForces.x, springForces.y);
                    objects.edges[i].getNodes()[1].move(-springForces.x, -springForces.y);
                }

                let keys = Object.keys(objects.nodes);

                // all nodes repel
                for (var i = 0; i < keys.length; i++) {
                    for (var j = i+1; j < keys.length; j++) {
                        springForces = this.CalculateSpring(
                            objects.nodes[keys[i]],
                            objects.nodes[keys[j]],
                            1 // repel only
                        );
                        objects.nodes[keys[i]].move(springForces.x, springForces.y);
                        objects.nodes[keys[j]].move(-springForces.x, -springForces.y);
                    }
                }
            }
        }

        // returns whether rectangles r1 and r2 collide using seperating axis theorem
        public getCollision(r1: Flow.Rect, r2: Flow.Rect): boolean {
            
            return true;
        }

        public setSettings(physicsSettings: IPhysicsSettings): void {
            this.physicsSettings = physicsSettings;
        }
    }
}
