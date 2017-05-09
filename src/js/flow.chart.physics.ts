namespace Flow {
    export class PhysicsHandler {
        public static SpringFriction = 1;
        public static SpringStrength = 0.5;
        public static SpringLength = 250;

        public static CalculateSpring(n1: Node, n2: Node, repelOnly = false): number[] {
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
            let fx = 0;
            let fy = 0;

            if (!(repelOnly && PhysicsHandler.SpringLength - d < 0)) {
                f = (PhysicsHandler.SpringLength - d) * PhysicsHandler.SpringStrength;
                fx = ((dx / d) * f) / 2;
                fy = ((dy / d) * f) / 2;
            }


            return [f, fx, fy];
        }

        public beforeDraw(objects: Flow.Objects) {
            var springForces: number[];
            for (var i = 0; i < objects.edges.length; i++) {
                springForces = PhysicsHandler.CalculateSpring(
                    objects.edges[i].getNodes()[0],
                    objects.edges[i].getNodes()[1]
                );
                objects.edges[i].getNodes()[0].move(springForces[1], springForces[2]);
                objects.edges[i].getNodes()[1].move(-springForces[1], -springForces[2]);
            }

            for (var i = 0; i < objects.nodes.length; i++) {
                for (var j = i+1; j < objects.nodes.length; j++) {
                    springForces = PhysicsHandler.CalculateSpring(
                        objects.nodes[i],
                        objects.nodes[j],
                        true
                    );
                    objects.nodes[i].move(springForces[1], springForces[2]);
                    objects.nodes[j].move(-springForces[1], -springForces[2]);
                }
            }
        }
    }
}