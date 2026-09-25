var SCREEN_WIDTH;
var SCREEN_HEIGHT;
var planetInstance;
var isSpace;
var spaceInstance;

/**
 * Class representing the space part of the experience
 */
class Space {
    /**
     * Constant representing the acceleration per second squared
     */
    MOVE_ACCELERATION;
    /**
     * Constant representing radians pers second squared
     */
    ROTATION_ACCELERATION;
    /**
     * Constant representing rotation kept per second
     */
    ROTATION_DAMPENING

    /**
     * Vector2D containing the position of the camera
     */
    camPos;
    /**
     * number representing the zoom level
     */
    scale;
    /**
     * Array containing all the objects in the world
     */
    objects;

    /**
     * Index of the object that the player is probably most obviously orbiting around
     */
    parentIndex;
    /**
     * Index of the player
     */
    playerIndex;

    /**
     * Creates an instance of the space portion
     * @param {number} orbitBody Body to start the player orbiting. Equal to the index minus one
     */
    constructor(orbitBody) {
        this.MOVE_ACCELERATION = 5;
        this.ROTATION_ACCELERATION = 2.5;
        this.ROTATION_DAMPENING = 0.3;
        this.camPos = new Vector2D(0, 0);
        this.scale = 1;
        this.state = 0;

        let sun =     new Body(0,   null,               0,     0,  0);
        let mercury = new Body(1,    sun, 0.8252 * TWO_PI, 15000,  1);
        let venus =   new Body(2,    sun, 0.4291 * TWO_PI, 20000,  1);
        let earth =   new Body(3,    sun, 0.1623 * TWO_PI, 26000,  1);
        let moon =    new Body(4,  earth, 0.4649 * TWO_PI,  1000,  1);
        let mars =    new Body(5,    sun, 0.6229 * TWO_PI, 33000,  1);
        let jupiter = new Body(6,    sun, 0.0167 * TWO_PI, 48000,  1);
        let saturn =  new Body(7,    sun, 0.8520 * TWO_PI, 64000,  1);
        let uranus =  new Body(8,    sun, 0.9198 * TWO_PI, 81000,  1);
        let neptune = new Body(9,    sun, 0.2881 * TWO_PI, 98000,  1);

        this.objects = [null, sun, mercury, venus, earth, moon, mars, jupiter, saturn, uranus, neptune];
        
        
        this.playerIndex = 0;
        this.parentIndex = 1;

        this.teleportPlayer(orbitBody + 1);
    }

    /**
     * Teleports the player into an orbit around the selected body
     * @param {number} objectIndex Index of the body to teleport to
     */
    teleportPlayer(objectIndex) {
        this.objects[this.playerIndex] = new Player(this.objects[objectIndex], 0, this.objects[objectIndex].getRadius() + 50, 1);
    }
    
    /**
     * Updates the scale
     * @param {number} scrollDistance Distance scrolled
     * @param {number} delta Time it took the last frame
     */
    updateScale(scrollDistance, delta) {
        this.scale = min(this.scale * pow(2, scrollDistance * delta * -0.1), 10);
    }

    /**
     * Displays the orbital path of the orbiter around the orbited. This function is just alot of math
     * @param {Body} orbiter Satellite orbiting
     * @param {Body} orbited Body the sattelite is orbiting around
     * @param {number} lineWidth Line width of the orbit display
     * @param {Color} color Color of the orbit display
     */
    displayOrbit(orbiter, orbited, lineWidth, color) {
        noFill();
        color.setStroke();
        strokeWeight(lineWidth);
        let sgp = orbited.mass; // Standard Gravitiational Parameter
        let isgp = 1 / sgp; // Inverse Standard Gravitiational Parameter
        let seperationVec = new Vector2D(orbiter.pos.x - orbited.pos.x, orbiter.pos.y - orbited.pos.y);
        let relativeVelocityVec = orbiter.vel.copy().sub(orbited.vel);
        let relativeVelocityMagnitude = relativeVelocityVec.magnitude();
        let seperationInverseMagnitude = 1 / seperationVec.magnitude();
        let semiMajorAxis = 1 / (2 * seperationInverseMagnitude - relativeVelocityMagnitude * relativeVelocityMagnitude * isgp);
        if (semiMajorAxis > 0) { // Is in orbit
            let specificRelativeAngularMomentum = seperationVec.x * relativeVelocityVec.y - seperationVec.y * relativeVelocityVec.x;
            let semiMinorAxis = sqrt(specificRelativeAngularMomentum * specificRelativeAngularMomentum * semiMajorAxis * isgp);
            let eccentricityVec = new Vector2D(relativeVelocityVec.y * specificRelativeAngularMomentum * isgp - seperationVec.x * seperationInverseMagnitude, 
                                          -1 * relativeVelocityVec.x * specificRelativeAngularMomentum * isgp - seperationVec.y * seperationInverseMagnitude);
            let orbitalAngle = atan2(-1 * eccentricityVec.y, eccentricityVec.x);
            let eccentricity = eccentricityVec.magnitude();
            let focusOffset = -1 * semiMajorAxis * eccentricity;
            
            push();
            translate(orbited.pos.x, -orbited.pos.y);
            rotate(orbitalAngle);
            translate(focusOffset, 0);
            ellipse(0, 0, 2 * semiMajorAxis, 2 * semiMinorAxis);
            pop();
        } else {
            line(orbiter.pos.x, -orbiter.pos.y, orbiter.pos.x + orbiter.vel.x * 100, -orbiter.pos.y - orbiter.vel.y * 100); // I hope that 100 is large enough
        }
    }

    /**
     * Handles player movement and updates all objects
     * @param {number} delta Time it took the last frame
     */
    process(delta) {
        if (keyIsDown('Slash')) {
            if (keyIsDown('Digit0')) {
                this.teleportPlayer(1);
            } else if (keyIsDown('Digit1')) {
                this.teleportPlayer(2);
            } else if (keyIsDown('Digit2')) {
                this.teleportPlayer(3);
            } else if (keyIsDown('Digit3')) {
                this.teleportPlayer(4);
            } else if (keyIsDown('Digit4')) {
                this.teleportPlayer(5);
            } else if (keyIsDown('Digit5')) {
                this.teleportPlayer(6);
            } else if (keyIsDown('Digit6')) {
                this.teleportPlayer(7);
            } else if (keyIsDown('Digit7')) {
                this.teleportPlayer(8);
            } else if (keyIsDown('Digit8')) {
                this.teleportPlayer(9);
            } else if (keyIsDown('Digit9')) {
                this.teleportPlayer(10);
            }
        }
        
        let player = this.objects[this.playerIndex];
        if (keyIsDown('KeyW')) {
            player.vel.x += this.MOVE_ACCELERATION * delta * cos(player.angle);
            player.vel.y += this.MOVE_ACCELERATION * delta * sin(player.angle);
        }
        if (keyIsDown('KeyS')) {
            player.vel.x -= this.MOVE_ACCELERATION * delta * cos(player.angle);
            player.vel.y -= this.MOVE_ACCELERATION * delta * sin(player.angle);
        }
        if (keyIsDown('KeyA')) {
            player.rotVel += this.ROTATION_ACCELERATION * delta;
        }
        if (keyIsDown('KeyD')) {
            player.rotVel -= this.ROTATION_ACCELERATION * delta;
        }
        if (keyIsDown('Space')) {
            player.rotVel = player.rotVel * pow(this.ROTATION_DAMPENING, delta);
        }

        let prevVel = player.vel.copy();

        let maxPull = null;
        for (let i = this.playerIndex + 1; i < this.objects.length; i++) {
            let pull = player.addGravitationalPull(this.objects[i], delta);

            if (maxPull == null || pull > maxPull) {
                maxPull = pull;
                this.parentIndex = i;
            }
        }

        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].tick(delta);
        }

        let parent = this.objects[this.parentIndex];
        
        if (player.pos.copy().sub(parent.pos).magnitude() < parent.getRadius() + 10) {
            planetInstance = new Planet(90, this.parentIndex - 1);
            isSpace = false;
            this.teleportPlayer(this.parentIndex);
        }

        let currVel = player.vel.copy().sub(parent.vel);

        prevVel.sub(parent.prevVel);

        let prevAngle = atan2(prevVel.y, prevVel.x);
        let currAngle = atan2(currVel.y, currVel.x);

        player.angle += currAngle - prevAngle;

    }

    /**
     * Draws stars to the screen. This could do with a rewrite but I don't want to touch it
     * @param {num} numStars Number of stars generated (not all are always shown)
     * @param {Vector2D} screenCenter Vector representing the center of the screen
     */
    drawStars(numStars, screenCenter) {
        noStroke();
        randomSeed(0);

        for (let i = 0; i < numStars; i++) {
            let paralax = random(0.01, 0.4)
            let brightness = random(100,255);
            let temp = (min(random(), random()) + min(random(), random())) * 0.5;
            let size = random(2, 4);
            
            if (size > 4 - 2 * this.scale * this.scale) {
                if (temp < 0.1) {
                    fill(brightness * (0.8 + temp) , brightness * (0.4 + temp * 1.8), brightness * (0.3 + temp * 2));
                    size *= temp * 10;
                } else if (temp < 0.8) {
                    fill(brightness);
                } else {
                    fill(brightness * (0.6 - temp * 0.4) , brightness * (1 - temp * 0.5), brightness * (0.8 + temp * 0.2));
                    size *= temp + 2;
                }
                size *= paralax * 2.5;

                let x = (random(0, SCREEN_WIDTH) - this.camPos.x * paralax) % SCREEN_WIDTH - screenCenter.x;
                let y = (random(0, SCREEN_HEIGHT) + this.camPos.y * paralax) % SCREEN_HEIGHT - screenCenter.y;
                let v = 1 / this.scale;
                for (let j = floor(v * -0.5); j <= ceil(v * 0.5) + 1; j++) {
                    if (abs((x + SCREEN_WIDTH * j) * this.scale) < SCREEN_WIDTH * 0.5) {
                        for (let k = floor(v * -0.5); k <= ceil(v * 0.5) + 1; k++) {
                            if (abs((y + SCREEN_HEIGHT * k) * this.scale) < SCREEN_HEIGHT * 0.5) {
                                circle((x + j * SCREEN_WIDTH) * this.scale + screenCenter.x, (y + k * SCREEN_HEIGHT) * this.scale + screenCenter.y, size * this.scale);
                            }
                        }
                    }
                }
            } else {
                random();
                random();
            }
        }
    }

    /**
     * Draws all the celestial bodies
     */
    drawObjects() {
        for (let i = this.objects.length - 1; i > 0; i--) {
            this.objects[i].display();
        }
    }

    /**
     * Does one fram of the game
     * @param {number} delta Time it took the last frame
     * @param {Vector2D} screenCenter Vector representing the center of the screen
     * @param {number} numStars Number of stars to generate (not all are always shown)
     */
    run(delta, screenCenter, numStars) {
        background(0);

        this.process(delta);

        this.camPos = this.objects[this.playerIndex].pos;

        this.drawStars(numStars, screenCenter);

        push();
        translate(screenCenter.x, screenCenter.y);
        scale(this.scale);
        translate(-this.camPos.x, this.camPos.y);

        for (let i = 2; i < this.objects.length; i++) {
            this.displayOrbit(this.objects[i], this.objects[i].parent, 3 / sqrt(this.scale), new Color(255, 255, 255, 100));
        }
        
        this.drawObjects();
        
        this.displayOrbit(this.objects[this.playerIndex], this.objects[this.parentIndex], 4 / sqrt(this.scale), new Color(0, 255, 255, 150));
      
        this.objects[0].display(this.objects[this.parentIndex], 5 / sqrt(this.scale));
        pop();
        
    }
}

/**
 * Class representing a player
 */
class Player {
    /**
     * Position of the player
     */
    pos;
    /**
     * Velocity of the player
     */
    vel;
    /**
     * Angle the player is facing
     */
    angle;
    /**
     * Rotational velocity of the player
     */
    rotVel;
    /**
     * Mass of the player
     */
    mass;
    /**
     * Creates a new player
     * @param {Body} parent Body that the player starts out orbiting
     * @param {number} startAngle Angle of the orbit that the player starts at
     * @param {number} dist Distance to orbit the body
     * @param {number} dir Direction to orbit (1 for counter-clockwise, -1 for clockwise)
     */
    constructor(parent, startAngle, dist, dir) {
        this.mass = 2;

        this.pos = new Vector2D(cos(startAngle), sin(startAngle));
        this.vel = new Vector2D(-this.pos.y, this.pos.x); // Rotate pos by 90 degrees
        this.pos.mult(dist).add(parent.pos);

        let oribitalVelocity = sqrt(parent.mass / abs(this.pos.copy().sub(parent.pos).magnitude()));
        this.vel.mult(oribitalVelocity * dir).add(parent.vel);

        this.angle = startAngle + PI / 2 * dir;
        this.rotVel = 0;
    }

    /**
     * Does a physics tick
     * @param {number} delta Time it took the last frame
     */
    tick(delta) {
        this.pos.add(this.vel.copy().mult(delta));
        this.angle += this.rotVel * delta;
    }

    /**
     * Draws the player and velocity vector to the screen
     * @param {Body} parent Body the player is orbiting
     * @param {number} lineWidth Width of the velocity line
     */
    display(parent, lineWidth) {
        push();
        translate(this.pos.x, -this.pos.y);
        let relVel = this.vel.copy().sub(parent.vel).mult(2);
        stroke(0, 255, 0);
        strokeWeight(lineWidth);
        line(0, 0, relVel.x, -relVel.y)
        rotate(-this.angle);

        rectMode(CENTER);
        fill(100);
        noStroke();
        rect(0, 0, 15, 11);

        fill(255, 0, 0);
        triangle(7.5, -7, 7.5, 7, 20, 0);

        fill(0, 0, 255);
        triangle(-2.5, 5.5, -13, 5.5, -13, 10);
        triangle(-2.5, -5.5, -13, -5.5, -13, -10);

        // fill(0, 255, 255);
        // rect(2, 0, 3)

        // fill(200);
        // rect(-4.5, 0, 6, 3)

        pop();
    }

    /**
     * Adds the pull felt on the player by the input body
     * @param {Body} object Body that is applying the force
     * @param {number} delta Time it took the last frame
     * @returns A number where the maximum is probably the best option for what body the player is orbiting (force / distance)
     */
    addGravitationalPull(object, delta) {
        let seperation = this.pos.copy().sub(object.pos);
        let inverseMagnitude = 1 / seperation.magnitude();
        seperation.mult(inverseMagnitude); // Normalize
        let force = this.mass * object.mass * inverseMagnitude * inverseMagnitude;

        this.vel.sub(seperation.mult(force / this.mass * delta));
        
        return force * inverseMagnitude;
    }
}

/**
 * Class representing a celestial body
 */
class Body {
    /**
     * Position of the body
     */
    pos;
    /**
     * Velocity vector of the body
     */
    vel;
    /**
     * Angle of the current position of the orbit
     */
    orbitalAngle;
    /**
     * Distance between this and its parent's center of mass
     */
    orbitDistance;
    /**
     * Radians roated per second
     */
    orbitSpeed;
    /**
     * Units moved per second
     */
    orbitalSpeed;
    /**
     * The celestial body represented as a number
     */
    bodyEnum;
    /**
     * The mass of the object
     */
    mass;
    /**
     * Object this body is orbiting, or null if it isn't orbiting anything
     */
    parent;

    /**
     * Angle the planet has rotated about it's north pole
     */
    angle;
    /**
     * Roatational velocity the planet has about it's north pole
     */
    rotVel;
    /**
     * The velocity in the previous tick
     */
    prevVel;

    /**
     * Creates a new celestial body
     * @param {number} bodyEnum Number representing the celestial body. 0-Sun 1-Mercury ... 3-Earth 4-Moon 5-Mars ... 9-Neptune
     * @param {Body} parent Body it is orbiting
     * @param {number} startAngle Angle that the body starts with relative to its parent
     * @param {number} dist Distance of the orbit
     * @param {number} dir Direction of the orbit (1 for counter-clockwise, -1 for clockwise)
     */
    constructor(bodyEnum, parent, startAngle, dist, dir) {
        this.bodyEnum = bodyEnum;
        this.parent = parent;
        this.orbitalAngle = startAngle;
        this.orbitDistance = dist;
        
        if (this.parent != null) {
            this.pos = new Vector2D(cos(this.orbitalAngle), sin(this.orbitalAngle)).mult(this.orbitDistance).add(this.parent.pos);
            this.orbitSpeed = dir * sqrt(this.parent.mass / (this.orbitDistance * this.orbitDistance * this.orbitDistance));
            this.orbitalSpeed = sqrt(this.parent.mass / abs(this.pos.copy().sub(this.parent.pos).magnitude())) * dir;
            this.vel = new Vector2D(-sin(this.orbitalAngle), cos(this.orbitalAngle)).mult(this.orbitalSpeed).add(this.parent.vel);
        } else {
            this.pos = new Vector2D(0, 0);
            this.vel = new Vector2D(0, 0);
            this.orbitSpeed = 0;
            this.orbitalSpeed = 0;
        }

        this.angle = startAngle + PI;
        this.prevVel = this.vel.copy();

        switch (this.bodyEnum) {
            case 0: 
                this.mass = 10000000000;
                this.rotVel = 0.35;
                break;
            case 1: 
                this.mass = 3000000;
                this.rotVel = this.orbitSpeed * 1.5;
                break;
            case 2: 
                this.mass = 6000000;
                this.rotVel = this.orbitSpeed * -0.924;
                break;
            case 3: 
                this.mass = 6001000;
                this.rotVel = this.orbitSpeed * 366.355;
                break;
            case 4: 
                this.mass = 1000000;
                this.rotVel = this.orbitSpeed;
                break;
            case 5: 
                this.mass = 4000000;
                this.rotVel = 8.55; // Lined up with earths rotation speed instead of its orbit speed
                break;
            case 6: 
                this.mass = 10000000;
                this.rotVel = this.orbitSpeed * 1791.7; // Not accurate
                break;
            case 7: 
                this.mass = 9000000;
                this.rotVel = 16.01; // Innacuratly lined up with jupiters rotation speed instead of its orbit speed
                break;
            case 8: 
                this.mass = 7000000;
                this.rotVel = -10.09;
                break;
            case 9: 
                this.mass = 7500000;
                this.rotVel = 10.46; // Innacuratly lined up with jupiters rotation speed instead of its orbit speed
                break;
        }

    }

    /**
     * Does a physics tick
     * @param {number} delta Time it took the last frame
     */
    tick(delta) {
        this.orbitalAngle += this.orbitSpeed * delta;
        this.pos = new Vector2D(cos(this.orbitalAngle), sin(this.orbitalAngle)).mult(this.orbitDistance);
        this.angle += this.rotVel * delta;
        if (this.parent != null) {
            this.pos.add(this.parent.pos);
            this.prevVel = this.vel;
            this.vel = new Vector2D(-sin(this.orbitalAngle), cos(this.orbitalAngle)).mult(this.orbitalSpeed).add(this.parent.vel);
        }
    }

    /**
     * Displays the body
     */
    display() {
        push();
        translate(this.pos.x, -this.pos.y);
        if (this.bodyEnum != 8) {
            rotate(-this.angle);
        }
        switch (this.bodyEnum) {
            case 0: 
                {
                    push();
                    const R  = 8700;     // ~2913
                    const px = 0;
                    const py = 0;

                    // ---------- Corona glow (3 circles) ----------
                    // Drawn first, so the disc sits on top.
                    // [diameter factor, alpha]
                    const corona = [
                        [1.40, 18],
                        [1.22, 26],
                        [1.08, 40],
                    ];
                    noStroke();
                    for (const c of corona) {
                        fill(255, 210, 110, c[1]);
                        circle(px, py, R * 2 * c[0]);
                    }

                    // ---------- Photosphere: concentric bands (5 circles) ----------
                    // Slightly deeper orange at the edge, brighter yellow toward the centre.
                    // [radius factor, r, g, b]  (largest first, so smaller ones draw on top)
                    const bands = [
                        [1.00, 246, 150,  40],
                        [0.92, 249, 168,  52],
                        [0.80, 251, 185,  66],
                        [0.62, 253, 202,  86],
                        [0.35, 254, 218, 110],
                    ];
                    noStroke();
                    for (const b of bands) {
                        fill(b[1], b[2], b[3]);
                        circle(px, py, R * 2 * b[0]);
                    }

                    // ---------- Convection swirls (31 arcs) ----------
                    // The frame already turns with the Sun at its equatorial rate, so each ring only needs
                    // the difference: -this.angle * (rel - 1), where rel is that ring's rotation rate
                    // divided by the equator's. Seen from above the pole, the equator is the rim, so
                    // inner rings lag behind outer ones. Adding the offset to the arc angles avoids
                    // a push/rotate/pop per arc. this.angle can be any size.
                    const diffScale = 1;   // 1 = real solar rotation profile, 2-3 = exaggerated, 0 = fixed to the surface
                    const drift     = 0;   // extra multiple of this.angle applied to every ring (e.g. 0.1 to make all swirls creep forward)

                    // [radius factor, thickness factor, number of arcs]
                    const swirlRings = [
                    [0.955, 0.035, 4],
                    [0.900, 0.040, 4],
                    [0.845, 0.040, 4],
                    [0.780, 0.045, 3],
                    [0.710, 0.045, 3],
                    [0.635, 0.045, 3],
                    [0.555, 0.045, 3],
                    [0.470, 0.040, 2],
                    [0.380, 0.040, 2],
                    [0.280, 0.035, 2],
                    [0.170, 0.030, 1],
                    ];
                    noFill();
                    strokeCap(ROUND);
                    for (let j = 0; j < swirlRings.length; j++) {
                    const rf = swirlRings[j][0];
                    const th = swirlRings[j][1];
                    const n  = swirlRings[j][2];

                    // Real solar rotation profile. In a pole-on view, sin^2(latitude) = 1 - rf^2.
                    const s2  = 1 - rf * rf;
                    const rel = (14.713 - 2.396 * s2 - 2.787 * s2 * s2) / 14.713;
                    const off = (-this.angle * ((rel - 1) * diffScale + drift)) % TWO_PI;

                    const slot = TWO_PI / n;                 // each arc gets its own slot, so arcs in a ring never overlap
                    strokeWeight(th * R);
                    for (let i = 0; i < n; i++) {
                        // deterministic pseudo-random values (no flicker between frames)
                        const seed = j * 20 + i;
                        let h2 = Math.sin(seed * 269.5 + 183.3) * 43758.5453; h2 -= Math.floor(h2);
                        let h1 = Math.sin(seed * 127.1 + 311.7) * 43758.5453; h1 -= Math.floor(h1);
                        let h3 = Math.sin(seed * 419.2 + 371.9) * 43758.5453; h3 -= Math.floor(h3);

                        const len   = slot * (0.35 + 0.45 * h2);          // arc length
                        const start = i * slot + (slot - len) * h1 + off; // position inside its slot

                        if ((i + j) % 2 === 0) stroke(255, 226, 130, (90 + 40 * h3) * 0.5);   // light
                        else                   stroke(205, 100,  28, (80 + 30 * h3) * 0.3);   // dark
                        arc(0, 0, rf * R * 2, rf * R * 2, start, start + len);
                    }
                    }

                    pop();
                    break;
                    }
            case 1: 
                {
                    push();
                    const R  = 250;            // planet radius (Mercury is ~0.042x Saturn's 1400)
                    const px = 0;
                    const py = 0;

                    // ---------- Planet base (1 circle) ----------
                    noStroke();
                    fill(138, 128, 118);
                    circle(px, py, R * 2);

                    // ---------- Caloris Basin (2 circles) ----------
                    fill(122, 111, 100);                              // darker rim
                    circle(px + R * 0.30, py - R * 0.25, R * 0.44);
                    fill(170, 148, 114);                              // lighter, smooth floor
                    circle(px + R * 0.30, py - R * 0.25, R * 0.34);

                    // ---------- Bright ray crater: rays (6 lines) ----------
                    // [angle, length factor]  (all rays stay inside the disc)
                    const bx = px - R * 0.28;
                    const by = py + R * 0.32;
                    const rays = [
                        [0.3, 0.42], [1.2, 0.50], [2.1, 0.36],
                        [3.0, 0.48], [4.1, 0.40], [5.2, 0.50],
                    ];
                    stroke(215, 205, 190, 110);
                    strokeWeight(R * 0.02);
                    strokeCap(ROUND);
                    for (const ry of rays) {
                        line(bx, by, bx + Math.cos(ry[0]) * ry[1] * R, by + Math.sin(ry[0]) * ry[1] * R);
                    }

                    // ---------- Craters (12 x 2 = 24 circles) ----------
                    // [x offset, y offset, diameter]  (all as fractions of R)
                    const craters = [
                        // original 7
                        [-0.45, -0.30, 0.16],
                        [-0.10, -0.62, 0.12],
                        [-0.62,  0.15, 0.20],
                        [ 0.10,  0.45, 0.22],
                        [ 0.55,  0.30, 0.14],
                        [-0.25,  0.62, 0.10],
                        [ 0.70, -0.05, 0.10],
                        // new 5 (four of them near the edge)
                        [-0.78, -0.35, 0.14],   // left edge
                        [ 0.62, -0.58, 0.16],   // upper-right edge
                        [ 0.35,  0.80, 0.12],   // lower-right edge
                        [-0.55,  0.68, 0.14],   // lower-left edge
                        [ 0.05, -0.88, 0.10],   // top edge
                    ];
                    noStroke();
                    for (const c of craters) {
                        const cx = px + c[0] * R;
                        const cy = py + c[1] * R;
                        fill(168, 158, 145);                            // lit rim
                        circle(cx, cy, c[2] * R);
                        fill(100, 92, 86);                              // shadowed floor, nudged off-centre
                        circle(cx + c[2] * R * 0.05, cy + c[2] * R * 0.05, c[2] * R * 0.70);
                    }

                    // ---------- Bright ray crater itself (2 circles) ----------
                    fill(235, 228, 215);
                    circle(bx, by, R * 0.10);
                    fill(190, 180, 165);
                    circle(bx, by, R * 0.05);

                    pop();
                    break;
                    }
            case 2: 
                {
                    push();
                    const R  = 400;            // planet radius (Venus is ~0.104x Saturn's 1400)
                    const px = 0;
                    const py = 0;

                    // ---------- Atmosphere (1 circle) ----------
                    noStroke();
                    fill(255, 225, 150, 30);            // pale sulfur-yellow, almost transparent
                    circle(px, py, R * 2 * 1.05);       // extends 10% beyond the planet's radius

                    // ---------- Cloud bands (7 circles, includes the planet base) ----------
                    // Seen from above the pole, latitude bands become concentric rings.
                    // [radius factor, r, g, b]  (largest first, so smaller ones draw on top)
                    const bands = [
                        [1.00, 226, 196, 128],
                        [0.88, 238, 214, 152],
                        [0.76, 229, 200, 132],
                        [0.64, 242, 222, 165],
                        [0.52, 230, 203, 138],
                        [0.40, 244, 226, 172],
                        [0.30, 226, 196, 128],
                    ];
                    noStroke();
                    for (const b of bands) {
                        fill(b[1], b[2], b[3]);
                        circle(px, py, R * 2 * b[0]);
                    }

                    // ---------- Cloud swirls (8 arcs) ----------
                    // Partial rings at different radii suggest the fast-rotating cloud deck.
                    // [radius factor, start angle, stop angle, thickness factor, r, g, b, alpha]
                    const swirls = [
                        [0.94, 0.2, 1.3, 0.035, 252, 238, 190, 130],
                        [0.94, 3.4, 4.3, 0.035, 214, 180, 112, 110],
                        [0.82, 1.8, 3.0, 0.030, 214, 180, 112, 110],
                        [0.82, 4.6, 5.8, 0.030, 252, 238, 190, 130],
                        [0.70, 0.6, 1.9, 0.028, 252, 238, 190, 130],
                        [0.70, 3.6, 4.7, 0.028, 214, 180, 112, 110],
                        [0.58, 2.2, 3.4, 0.025, 252, 238, 190, 120],
                        [0.58, 5.0, 6.1, 0.025, 214, 180, 112, 100],
                    ];
                    noFill();
                    strokeCap(ROUND);
                    for (const s of swirls) {
                        stroke(s[4], s[5], s[6], s[7]);
                        strokeWeight(s[3] * R);
                        arc(px, py, s[0] * R * 2, s[0] * R * 2, s[1], s[2]);
                    }

                    // ---------- Polar vortex (3 circles) ----------
                    // Venus's pole has a double-lobed vortex, drawn as a dark collar with two bright lobes.
                    noStroke();
                    fill(196, 160, 96);
                    circle(px, py, R * 0.40);                         // dark collar
                    fill(250, 238, 190);
                    circle(px - R * 0.06, py - R * 0.02, R * 0.14);   // lobe 1
                    circle(px + R * 0.06, py + R * 0.02, R * 0.14);   // lobe 2

                    pop();
                    break;
                    }
            case 3: 
                {
                    push();
                    const R  = 500;     // ~449
                    const px = 0;
                    const py = 0;

                    // Screen angle of the prime meridian (Greenwich) in degrees:
                    // 0 = right, 90 = down, 180 = left, 270 = up.
                    // To spin Earth counter-clockwise like the real one, use e.g. 270 - frameCount * 0.2
                    const rot  = 270;
                    const d2r  = Math.PI / 180;
                    const k    = 0.95;                                // pulls features inward so equatorial ones stay inside the disc
                    const spin = (rot - 270) * d2r;                   // carries the clouds along with the surface

                    // ---------- Atmosphere (2 circles) ----------
                    noStroke();
                    fill(130, 190, 255, 20);
                    circle(px, py, R * 2 * 1.12);
                    fill(130, 190, 255, 34);
                    circle(px, py, R * 2 * 1.05);

                    // ---------- Ocean (3 circles, includes the planet base) ----------
                    // [radius factor, r, g, b]  (largest first, so smaller ones draw on top)
                    const oceans = [
                        [1.00,  24,  74, 152],   // deep tropical ocean
                        [0.88,  32,  94, 174],   // mid-latitude ocean
                        [0.45,  60, 118, 186],   // paler Arctic Ocean
                    ];
                    for (const o of oceans) {
                        fill(o[1], o[2], o[3]);
                        circle(px, py, R * 2 * o[0]);
                    }

                    // ---------- Big continents (7 arcs) ----------
                    // Each is a thick arc, like Saturn's rings: the radial span comes from its
                    // latitude range and the angular span from its longitude range.
                    // [lat low, lat high, lon start, lon stop, r, g, b]  (east longitude positive)
                    const land = [
                        [ 12, 32,  -15,   35, 204, 172, 112],   // Sahara + North Africa
                        [ 40, 56,   -9,   32,  92, 148,  74],   // Europe
                        [ 32, 54,   38,   88, 150, 150,  92],   // Central Asia (steppe and deserts)
                        [ 22, 42,   95,  128, 100, 150,  80],   // China
                        [ 28, 53, -124,  -70,  92, 148,  74],   // USA
                        [ 55, 71,   25,  178,  78, 116,  78],   // Siberia (boreal forest)
                        [ 52, 70, -166,  -58,  78, 116,  78],   // Canada + Alaska
                    ];
                    noFill();
                    strokeCap(ROUND);
                    for (const l of land) {
                        const rIn  = k * Math.cos(l[1] * d2r);
                        const rOut = k * Math.cos(l[0] * d2r);
                        const mid  = (rIn + rOut) / 2;
                        stroke(l[4], l[5], l[6]);
                        strokeWeight((rOut - rIn) * R);
                        arc(px, py, mid * R * 2, mid * R * 2, (rot - l[3]) * d2r, (rot - l[2]) * d2r);
                    }

                    // ---------- Smaller landmasses (11 circles) ----------
                    // [latitude, longitude, diameter factor, r, g, b]
                    const spots = [
                        [ 72,  -40, 0.15, 240, 244, 248],   // Greenland (ice sheet)
                        [ 20, -102, 0.16, 204, 172, 112],   // Mexico
                        [ 10,  -85, 0.06,  44, 116,  60],   // Central America
                        [  5,  -65, 0.07,  44, 116,  60],   // northern South America
                        [ 24,   45, 0.16, 204, 172, 112],   // Arabia
                        [ 20,   78, 0.14, 120, 150,  80],   // India
                        [ 14,  102, 0.10,  44, 116,  60],   // Southeast Asia
                        [  1,  112, 0.06,  44, 116,  60],   // Borneo and Sumatra
                        [ 37,  138, 0.05,  92, 148,  74],   // Japan
                        [ 10,    0, 0.07, 160, 156,  84],   // Sahel
                        [  8,   40, 0.07, 160, 156,  84],   // Horn of Africa
                    ];
                    noStroke();
                    for (const s of spots) {
                        const rr = k * R * Math.cos(s[0] * d2r);
                        const a  = (rot - s[1]) * d2r;
                        fill(s[3], s[4], s[5]);
                        circle(px + rr * Math.cos(a), py + rr * Math.sin(a), s[2] * R);
                    }

                    // ---------- North polar ice (3 circles) ----------
                    // [radius factor, r, g, b, alpha]
                    const cap = [
                        [0.27, 236, 240, 246, 150],   // thin sea-ice fringe (translucent)
                        [0.20, 244, 247, 250, 255],   // main pack ice
                        [0.10, 255, 255, 255, 255],   // permanent ice core
                    ];
                    for (const c of cap) {
                        fill(c[1], c[2], c[3], c[4]);
                        circle(px, py, R * 2 * c[0]);
                    }

                    // ---------- Clouds (6 circles) ----------
                    // [radius factor, angle (deg), diameter factor]
                    const clouds = [
                        [0.62,  20, 0.20],
                        [0.55, 140, 0.16],
                        [0.72, 250, 0.22],
                        [0.40, 310, 0.14],
                        [0.85, 100, 0.12],
                        [0.80, 200, 0.14],
                    ];
                    fill(255, 255, 255, 110);
                    for (const c of clouds) {
                        const a = c[1] * d2r + spin;
                        circle(px + Math.cos(a) * c[0] * R, py + Math.sin(a) * c[0] * R, c[2] * R);
                    }

                    // ---------- Tropical cloud belt (1 circle) ----------
                    noFill();
                    stroke(255, 255, 255, 38);
                    strokeWeight(R * 0.05);
                    circle(px, py, R * 2 * 0.93);

                    // ---------- Storm swirls (3 arcs) ----------
                    // [radius factor, start angle, stop angle (radians), thickness factor, alpha]
                    const swirls = [
                        [0.66, 0.4, 1.7, 0.05, 90],
                        [0.50, 3.2, 4.4, 0.04, 90],
                        [0.80, 4.8, 5.9, 0.05, 80],
                    ];
                    strokeCap(ROUND);
                    for (const s of swirls) {
                        stroke(255, 255, 255, s[4]);
                        strokeWeight(s[3] * R);
                        arc(px, py, s[0] * R * 2, s[0] * R * 2, s[1] + spin, s[2] + spin);
                    }

                    pop();
                    break;
                    }
            case 4: 
                {
  push();
  const R  = 200     // ~159
  const px = 0;
  const py = 0;

  // Screen direction of the Earth-facing (near) side, in degrees:
  // 0 = right, 90 = down, 180 = left, 270 = up.
  const earthDir = 0;
  const d2r = Math.PI / 180;

  // ---------- Highland base (1 circle) ----------
  noStroke();
  fill(172, 168, 160);
  circle(px, py, R * 2);

  // ---------- Maria (8 arcs) ----------
  // Each mare is a thick arc, like Saturn's rings: the radial span comes from
  // its latitude range and the angular span from its longitude range.
  // Radius factors already include the 0.95 * cos(latitude) mapping.
  // [inner radius factor, outer radius factor, start lon, stop lon]
  const maria = [
    [0.868, 0.936,   53,   65],   // Mare Crisium
    [0.904, 0.950,   24,   42],   // Mare Tranquillitatis
    [0.749, 0.903,    9,   27],   // Mare Serenitatis
    [0.636, 0.881,  -30,   -6],   // Mare Imbrium
    [0.706, 0.945,  -70,  -42],   // Oceanus Procellarum
    [0.475, 0.572,  -35,   40],   // Mare Frigoris
    [0.489, 0.545,   74,   88],   // Mare Humboldtianum
    [0.806, 0.875,  142,  154],   // Mare Moscoviense (far side)
  ];
  noFill();
  stroke(88, 90, 96);
  strokeCap(ROUND);
  for (const m of maria) {
    const mid = (m[0] + m[1]) / 2;
    strokeWeight((m[1] - m[0]) * R);
    arc(px, py, mid * R * 2, mid * R * 2,
        (earthDir - m[3]) * d2r, (earthDir - m[2]) * d2r);
  }

  // ---------- Copernicus rays (7 lines) ----------
  // Copernicus sits almost on the limb, so its rays fan inward toward the pole.
  // [angle offset from the inward direction (radians), length factor]
  const cLat = 9.7;
  const cLon = -20;
  const cr = 0.95 * R * Math.cos(cLat * d2r);
  const ca = (earthDir - cLon) * d2r;
  const kx = px + cr * Math.cos(ca);
  const ky = py + cr * Math.sin(ca);
  const inward = Math.atan2(py - ky, px - kx);
  const rays = [
    [-1.2, 0.20], [-0.8, 0.34], [-0.4, 0.30], [0.0, 0.45],
    [ 0.4, 0.32], [ 0.8, 0.38], [ 1.2, 0.22],
  ];
  stroke(240, 238, 230, 90);
  strokeWeight(R * 0.015);
  strokeCap(ROUND);
  for (const ry of rays) {
    line(kx, ky,
         kx + Math.cos(inward + ry[0]) * ry[1] * R,
         ky + Math.sin(inward + ry[0]) * ry[1] * R);
  }

  // ---------- Craters (10 x 2 = 20 circles) ----------
  // [latitude, longitude (east +), diameter as a fraction of R]
  const craters = [
    [ 51.6,   -9, 0.06],   // Plato
    [ 63.5,  -63, 0.08],   // Pythagoras
    [ 62.0,  -31, 0.08],   // J. Herschel
    [ 88.6,   33, 0.07],   // Peary (right at the pole)
    [ 53.6,   57, 0.07],   // Endymion
    [ 55.9,  104, 0.10],   // Compton (far side)
    [ 42.3,  119, 0.11],   // Landau (far side)
    [ 45.3,  153, 0.12],   // Campbell (far side)
    [ 57.4,  194, 0.10],   // Rowland (far side)
    [ 58.7, -146, 0.16],   // Birkhoff (far side)
  ];
  noStroke();
  for (const c of craters) {
    const rr = 0.95 * R * Math.cos(c[0] * d2r);
    const a  = (earthDir - c[1]) * d2r;
    const cx = px + rr * Math.cos(a);
    const cy = py + rr * Math.sin(a);
    fill(198, 194, 186);                            // lit rim
    circle(cx, cy, c[2] * R);
    fill(122, 120, 118);                            // shadowed floor, nudged off-centre
    circle(cx + c[2] * R * 0.05, cy + c[2] * R * 0.05, c[2] * R * 0.70);
  }

  // ---------- Bright young craters (3 x 2 = 6 circles) ----------
  // [latitude, longitude (east +), diameter as a fraction of R]
  const bright = [
    [cLat,  cLon, 0.06],   // Copernicus
    [23.7,   -47, 0.05],   // Aristarchus
    [16.1,    47, 0.04],   // Proclus
  ];
  for (const b of bright) {
    const rr = 0.95 * R * Math.cos(b[0] * d2r);
    const a  = (earthDir - b[1]) * d2r;
    const bx = px + rr * Math.cos(a);
    const by = py + rr * Math.sin(a);
    fill(240, 238, 230);                            // bright ejecta
    circle(bx, by, b[2] * R);
    fill(165, 162, 156);                            // floor
    circle(bx + b[2] * R * 0.03, by + b[2] * R * 0.03, b[2] * R * 0.45);
  }

  pop();
  break;
}
            case 5: 
                {
                    push();
                    const R  = 350;
                    const px = 0;
                    const py = 0;

                    // ---------- Thin atmosphere haze (1 circle) ----------
                    noStroke();
                    fill(230, 160, 120, 33);
                    circle(px, py, R * 2 * 1.05);

                    // ---------- Terrain bands (6 circles, includes the planet base) ----------
                    // Seen from above the pole, latitude bands become concentric rings.
                    // [radius factor, r, g, b]  (largest first, so smaller ones draw on top)
                    const bands = [
                        [1.00, 198, 104,  60],   // equatorial rust
                        [0.88, 212, 128,  84],   // bright dusty plains
                        [0.74, 186,  96,  58],
                        [0.60, 170,  88,  54],
                        [0.48, 128,  72,  50],   // dark northern plains
                        [0.40,  84,  52,  42],   // very dark dune sea ringing the cap
                    ];
                    for (const b of bands) {
                        fill(b[1], b[2], b[3]);
                        circle(px, py, R * 2 * b[0]);
                    }

                    // ---------- Dark albedo patches (4 circles) ----------
                    // Semi-transparent dark regions near the edge (Syrtis Major and friends).
                    // [x offset, y offset, diameter]  (all as fractions of R)
                    const patches = [
                        [-0.60,  0.50, 0.30],
                        [ 0.15,  0.78, 0.26],
                        [-0.80, -0.20, 0.22],
                        [ 0.72,  0.36, 0.20],
                    ];
                    fill(96, 58, 44, 140);
                    for (const p of patches) {
                        circle(px + p[0] * R, py + p[1] * R, p[2] * R);
                    }

                    // ---------- Volcanoes (4 x 2 = 8 circles) ----------
                    // Olympus Mons plus the three Tharsis Montes, clustered near the upper-right edge.
                    // [x offset, y offset, diameter]  (all as fractions of R)
                    const volcanoes = [
                        [ 0.061, -0.858, 0.15],   // Olympus Mons
                        [ 0.418, -0.729, 0.10],   // Ascraeus Mons
                        [ 0.585, -0.603, 0.10],   // Pavonis Mons
                        [ 0.716, -0.439, 0.10],   // Arsia Mons
                    ];
                    for (const v of volcanoes) {
                        const vx = px + v[0] * R;
                        const vy = py + v[1] * R;
                        fill(150, 84, 54);                              // broad shield
                        circle(vx, vy, v[2] * R);
                        fill(96, 54, 40);                               // caldera
                        circle(vx, vy, v[2] * R * 0.35);
                    }

                    // ---------- North polar ice cap (3 circles) ----------
                    // [radius factor, r, g, b, alpha]
                    const cap = [
                        [0.32, 236, 228, 222, 170],   // seasonal frost fringe (translucent)
                        [0.24, 238, 240, 244, 255],   // main cap (slightly blue-white)
                        [0.13, 255, 255, 255, 255],   // bright residual water-ice core
                    ];
                    for (const c of cap) {
                        fill(c[1], c[2], c[3], c[4]);
                        circle(px, py, R * 2 * c[0]);
                    }

                    // ---------- Cap detail (3 arcs + 1 line) ----------
                    // Spiral troughs: partial rings in the ice.
                    // [radius factor, start angle, stop angle]
                    const troughs = [
                        [0.21, 0.3, 1.6],
                        [0.185, 2.6, 4.0],
                        [0.16, 4.4, 5.9],
                    ];
                    noFill();
                    stroke(150, 165, 185, 120);
                    strokeWeight(R * 0.012);
                    strokeCap(ROUND);
                    for (const t of troughs) {
                        arc(px, py, t[0] * R * 2, t[0] * R * 2, t[1], t[2]);
                    }

                    // Chasma Boreale: the big canyon notched into the cap
                    const cb = 0.9;                                   // angle around the pole
                    stroke(140, 126, 124);
                    strokeWeight(R * 0.03);
                    line(px + Math.cos(cb) * R * 0.10, py + Math.sin(cb) * R * 0.10,
                        px + Math.cos(cb) * R * 0.24, py + Math.sin(cb) * R * 0.24);

                    pop();
                    break;
                    }
            case 6: 
                {
                    push();
                    const R  = 1500;            // planet radius (Jupiter is ~1.19x Saturn's 1400)
                    const px = 0;
                    const py = 0;

                    // ---------- Atmosphere glow (1 circle) ----------
                    noStroke();
                    fill(230, 200, 160, 25);
                    circle(px, py, R * 2 * 1.06);

                    // ---------- Planet: concentric cloud bands (10 circles) ----------
                    // Seen from above the pole, latitude bands become concentric rings:
                    // the equator is at the edge and the pole is at the centre.
                    // [radius factor, r, g, b]  (largest first, so smaller ones draw on top)
                    const bands = [
                        [1.00, 232, 214, 178],  // Equatorial Zone (cream)
                        [0.91, 168, 108,  66],  // North Equatorial Belt (dark brown)
                        [0.82, 226, 201, 162],  // North Tropical Zone (light)
                        [0.73, 188, 128,  82],  // North Temperate Belt (orange-brown)
                        [0.64, 230, 208, 172],  // North Temperate Zone (cream)
                        [0.55, 162, 118,  88],  // North North Temperate Belt
                        [0.45, 214, 192, 160],  // light zone
                        [0.34, 152, 124, 104],  // polar belt (greyer)
                        [0.22, 128, 108, 100],  // polar haze
                        [0.10, 100,  90,  92],  // pole
                    ];
                    for (const b of bands) {
                        fill(b[1], b[2], b[3]);
                        circle(px, py, R * 2 * b[0]);
                    }

                    // ---------- Cloud swirls (10 arcs) ----------
                    // [radius factor, start angle, stop angle, thickness factor, r, g, b, alpha]
                    const swirls = [
                    [0.940, 0.3, 1.4, 0.030, 150, 100,  66, 110],   // dark, in the cream equatorial zone
                    [0.940, 3.5, 4.8, 0.030, 150, 100,  66, 110],
                    [0.865, 1.0, 2.4, 0.030, 236, 212, 170, 120],   // light, in the dark north equatorial belt
                    [0.865, 4.0, 5.3, 0.030, 236, 212, 170, 120],
                    [0.775, 2.6, 3.7, 0.025, 165, 110,  72, 110],   // dark, in the light tropical zone
                    [0.685, 0.2, 1.5, 0.028, 232, 208, 168, 120],   // light, in the orange-brown belt
                    [0.685, 3.3, 4.6, 0.028, 232, 208, 168, 120],
                    [0.595, 1.8, 3.0, 0.025, 160, 108,  72, 110],   // dark, in the cream temperate zone
                    [0.500, 0.8, 2.1, 0.025, 226, 202, 164, 110],   // light, in the dark belt
                    [0.395, 3.0, 4.2, 0.022, 140, 100,  78, 100],   // dark, in the light polar zone
                    ];
                    noFill();
                    strokeCap(ROUND);
                    for (const s of swirls) {
                    stroke(s[4], s[5], s[6], s[7]);
                    strokeWeight(s[3] * R);
                    arc(px, py, s[0] * R * 2, s[0] * R * 2, s[1], s[2]);
                    }

                    // ---------- Stroked circles (2 circles) ----------
                    // [inner factor, outer factor, r, g, b, alpha]
                    const rings = [
                        [0.92, 1.00, 100,  70,  40,  50],  // limb darkening
                        [1.72, 1.81, 150, 120, 100,  30],  // Jupiter's very faint main ring
                    ];
                    noFill();
                    for (const rg of rings) {
                        stroke(rg[2], rg[3], rg[4], rg[5]);
                        strokeWeight((rg[1] - rg[0]) * R);
                        circle(px, py, (rg[0] + rg[1]) * R);   // diameter = 2 * mid radius
                    }

                    pop();
                    break;
                    }
            case 7: 
                {
                    push();
                    const R  = 1400;            // planet radius
                    const px = 0;
                    const py = 0;

                    // ---------- Atmosphere glow (1 circle) ----------
                    noStroke();
                    fill(220, 190, 90, 28);
                    circle(px, py, R * 2 * 1.08);

                    // ---------- Planet: concentric latitude bands (7 circles) ----------
                    // [radius factor, r, g, b]  (largest first, so smaller ones draw on top)
                    const bands = [
                        [1.00, 200, 168,  70],
                        [0.85, 225, 195, 115],
                        [0.70, 203, 170,  78],
                        [0.55, 220, 188, 100],
                        [0.40, 195, 160,  70],
                    ];
                    for (const b of bands) {
                        fill(b[1], b[2], b[3]);
                        circle(px, py, R * 2 * b[0]);
                    }

                    // ---------- Cloud swirls (8 arcs) ----------
                    // [radius factor, start angle, stop angle, thickness factor, r, g, b, alpha]
                    const swirls = [
                    [0.925, 0.4, 1.6, 0.035, 165, 125,  55,  90],   // dark
                    //[0.925, 3.6, 4.7, 0.035, 245, 222, 150, 100],   // light
                    [0.775, 1.9, 3.1, 0.035, 245, 222, 150, 100],
                    //[0.775, 4.9, 6.0, 0.035, 165, 125,  55,  90],
                    [0.625, 0.7, 1.9, 0.030, 165, 125,  55,  90],
                    //[0.475, 3.0, 4.3, 0.030, 245, 222, 150, 100],
                    [0.325, 5.0, 6.2, 0.025, 165, 125,  55,  90],
                    //[0.175, 1.2, 2.5, 0.020, 245, 222, 150, 100],
                    ];
                    noFill();
                    strokeCap(ROUND);
                    for (const s of swirls) {
                    stroke(s[4], s[5], s[6], s[7]);
                    strokeWeight(s[3] * R);
                    arc(px, py, s[0] * R * 2, s[0] * R * 2, s[1], s[2]);
                    }

                    // ---------- North polar hexagon, 2012-2013 (3 hexagons + 2 circles) ----------
                    // In these years the polar region looked blue, unlike the golden look of 2016-2017.
                    // Each side is ~14,500 km, which equals the circumradius of a regular hexagon:
                    // 14,500 / 58,232 = ~0.25R
                    const hexR = R * 0.25;
                    // [scale, fill r, g, b, a, stroke r, g, b, a, stroke weight factor]
                    const hexLayers = [
                    [1.00, 100, 144 * 1.2, 162, 110,  70, 108 * 1.2, 124, 115, 0.020],   // teal-grey hexagon with dark teal jet-stream edge
                    [0.90,   0,   0,   0,   0, 146, 184 * 1.2, 194,  45, 0.010],   // faint pale inner ridge
                    [0.62, 118, 158 * 1.2, 174, 82.5,   0,   0,   0,   0, 0.000],   // slightly lighter inner collar
                    ];
                    strokeJoin(ROUND);
                    for (const h of hexLayers) {
                    fill(h[1], h[2], h[3], h[4]);
                    stroke(h[5], h[6], h[7], h[8]);
                    strokeWeight(h[9] * R);
                    beginShape();
                    for (let i = 0; i < 6; i++) {
                        const a = -HALF_PI + i * TWO_PI / 6;          // one vertex points up
                        vertex(Math.cos(a) * hexR * h[0], Math.sin(a) * hexR * h[0]);
                    }
                    endShape(CLOSE);
                    }

                    // Polar vortex: pale eyewall with a dark blue eye
                    noStroke();
                    fill(172, 204, 208);          // pale teal eyewall
                    circle(0, 0, R * 2 * 0.065);
                    fill(52, 86, 102);            // dark teal eye
                    circle(0, 0, R * 2 * 0.032);

                    // ---------- Main rings (10 circles) ----------
                    // Full circles look the same at any rotation, so they need no extra spin.
                    // [inner factor, outer factor, r, g, b, alpha]
                    const rings = [
                    [0.92, 1.00, 100,  70,  20,  55],  // limb darkening
                    [1.11, 1.24, 150, 120,  80,  40],  // D ring (faint)
                    [1.24, 1.53, 150, 125,  90,  95],  // C ring
                    [1.36, 1.42, 130, 105,  75,  70],  // C ringlet (dark stripe)
                    [1.53, 1.72, 215, 185, 120, 215],  // B ring, inner
                    [1.72, 1.82, 235, 205, 140, 235],  // B ring, bright core
                    [1.82, 1.95, 220, 190, 125, 220],  // B ring, outer
                    // 1.95 - 2.03 is left empty: Cassini Division
                    [2.03, 2.21, 200, 170, 110, 200],  // A ring
                    [2.22, 2.27, 200, 170, 110, 190],  // A ring, outer (after Encke Gap)
                    [2.32, 2.335, 235, 210, 155, 170], // F ring
                    ];
                    noFill();
                    for (const rg of rings) {
                    stroke(rg[2], rg[3], rg[4], rg[5]);
                    strokeWeight((rg[1] - rg[0]) * R);
                    circle(0, 0, (rg[0] + rg[1]) * R);
                    }

                    // ---------- Density clumps (9 arcs) ----------
                    // Brighter and darker partial arcs inside the C, B and A rings.
                    // The frame already turns at Saturn's spin (ratio 1), so each arc only needs
                    // the difference: -this.angle * (ratio - 1).
                    // Each arc's ratio comes from Kepler's third law: ratio = ringSpeed * (1.74 / r)^1.5,
                    // where 1.74 is the B ring's middle and ringSpeed is the ratio there.
                    // Inner arcs run ahead of the planet and outer arcs fall behind it.
                    const ringSpeed = 1.11;   // B ring orbital speed / Saturn spin (9.5 h vs 10.6 h)
                    // [radius factor, start angle, stop angle, thickness factor, r, g, b, alpha]
                    const clumps = [
                    [1.30, 0.4, 1.9, 0.05, 105,  85,  60,  70],   // C ring, dark
                    //[1.45, 3.4, 5.0, 0.05, 185, 160, 118,  70],   // C ring, light
                    [1.60, 0.9, 2.6, 0.08, 245, 222, 160, 120],   // B ring, light
                    //[1.70, 3.9, 5.6, 0.08, 170, 135,  85, 110],   // B ring, dark
                    [1.80, 1.6, 3.2, 0.08, 250, 232, 175, 120],   // B ring, light
                    //[1.89, 4.6, 6.1, 0.07, 165, 130,  80, 100],   // B ring, dark
                    [2.07, 0.2, 1.6, 0.06, 225, 198, 140, 110],   // A ring, light
                    //[2.12, 2.8, 4.4, 0.06, 150, 118,  75, 100],   // A ring, dark
                    [2.25, 5.0, 6.2, 0.04, 225, 198, 140, 100],   // A ring, outer band, light
                    ];
                    strokeCap(ROUND);
                    for (const c of clumps) {
                    const ratio = ringSpeed * Math.pow(1.74 / c[0], 1.5);
                    push();
                    rotate(-this.angle * (ratio - 1));
                    stroke(c[4], c[5], c[6], c[7]);
                    strokeWeight(c[3] * R);
                    arc(0, 0, c[0] * R * 2, c[0] * R * 2, c[1], c[2]);
                    pop();
                    }

                    // ---------- B ring spokes (6 lines) ----------
                    // Spokes follow Saturn's magnetic field, so they turn with the planet.
                    // The frame already does that, so they need no rotation of their own.
                    // [angle, inner radius factor, outer radius factor]
                    const spokes = [
                    [0.5, 1.68, 1.84],
                    //[1.4, 1.74, 1.86],
                    [2.3, 1.70, 1.80],
                    //[3.9, 1.66, 1.84],
                    [4.8, 1.72, 1.86],
                    //[5.6, 1.70, 1.82],
                    ];
                    stroke(105, 80, 55, 110);
                    strokeWeight(R * 0.03);
                    for (const sp of spokes) {
                    push();
                    rotate(sp[0]);
                    line(sp[1] * R, 0, sp[2] * R, 0);
                    pop();
                    }

                    pop();
                    break;
                    }
            case 8: 
               {
                    push();
                    const R        = 900;      // planet radius (Uranus is ~0.42x Saturn's 1400)
                    const tilt     = PI;        // extra rotation in radians (0 = poles left/right)
                    const ringOpen = 0.135;    // sin of ring opening angle (~7.8 deg, from the 97.8 deg axial tilt)

                    rotate(tilt);

                    // ---------- Atmosphere glow ----------
                    noStroke();
                    fill(150, 225, 235, 22);
                    circle(0, 0, R * 2 * 1.07);

                    // ---------- Ring data ----------
                    // [radius factor, thickness factor, r, g, b, alpha]
                    const rings = [
                        [1.65, 0.030, 150, 150, 150,  55],  // 6, 5, 4 rings
                        [1.77, 0.020, 165, 165, 165,  65],  // alpha + beta
                        [1.86, 0.035, 175, 175, 175,  80],  // eta, gamma, delta
                        [1.96, 0.012, 170, 170, 170,  70],  // lambda
                        [2.00, 0.030, 215, 215, 215, 200],  // epsilon (brightest)
                        [2.63, 0.060, 170, 175, 185,  22],  // nu (faint, broad)
                        [3.82, 0.200, 140, 165, 220,  14],  // mu (very faint, bluish)
                    ];

                    // ---------- Far half of the rings (drawn first, planet hides part of it) ----------
                    noFill();
                    for (const rg of rings) {
                        stroke(rg[2], rg[3], rg[4], rg[5]);
                        strokeWeight(rg[1] * R);
                        arc(0, 0, rg[0] * R * 2 * ringOpen, rg[0] * R * 2, -HALF_PI, HALF_PI);
                    }

                    // ---------- Planet base ----------
                    noStroke();
                    fill(118, 186, 202);            // darker southern hemisphere (left)
                    circle(0, 0, R * 2);

                    // ---------- Cloud bands (vertical stripes, curved by the tilt) ----------
                    // Each row paints everything to the RIGHT of one latitude line.
                    // [axis position (-1 = south pole ... +1 = north pole), r, g, b]
                    const bands = [
                        [-0.80, 132, 198, 212],
                        [-0.55, 142, 207, 220],
                        [-0.30, 152, 214, 226],
                        [-0.05, 160, 220, 231],
                        [ 0.20, 168, 226, 235],
                        [ 0.42, 176, 230, 238],
                        [ 0.55, 186, 236, 242],
                        [ 0.68, 158, 218, 230],   // darker polar collar
                        [ 0.78, 205, 245, 249],   // bright polar cap
                    ];

                    push();
                    drawingContext.beginPath();
                    drawingContext.arc(0, 0, R, 0, TWO_PI);
                    drawingContext.clip();          // keep the stripes inside the disc

                    const cosO = Math.sqrt(1 - ringOpen * ringOpen);
                    for (const b of bands) {
                        const x0 = b[0] * R;                        // position along the spin axis
                        const r  = Math.sqrt(R * R - x0 * x0);      // radius of that latitude circle
                        fill(b[1], b[2], b[3]);
                        beginShape();
                        vertex(x0 * cosO, 2 * R);
                        for (let i = 0; i <= 24; i++) {             // near-side arc of the latitude line
                        const t = PI * i / 24;
                        vertex(x0 * cosO - r * ringOpen * Math.sin(t), r * Math.cos(t));
                        }
                        vertex(x0 * cosO, -2 * R);
                        vertex(2 * R, -2 * R);
                        vertex(2 * R, 2 * R);
                        endShape(CLOSE);
                    }
                    pop();                                        // releases the clip

                    // ---------- Cloud swirls (18 curved lines) ----------
                    push();
                    drawingContext.beginPath();
                    drawingContext.arc(0, 0, R, 0, TWO_PI);
                    drawingContext.clip();            // trims line ends exactly at the planet's edge
                    {
                    // Each swirl is an arc of a latitude circle (radius r, at axis position x0).
                    // For a point at angle t on that circle:
                    //   screen x = x0 * cO - r * sin(t) * ringOpen
                    //   screen y = r * cos(t)
                    //   view depth = x0 * ringOpen + r * sin(t) * cO   (> 0 = facing us, 0 = exactly on the limb)
                    // Solving depth = 0 gives the exact visible window: t from u to PI - u, where
                    // u = asin(-x0 * ringOpen / (r * cO)). Swirls are cut at those exact angles.
                    const cO      = Math.sqrt(1 - ringOpen * ringOpen);
                    const stepLen = 0.1;            // radians per line segment

                    // [axis position (-1 south ... +1 north), length (radians around the axis), start angle,
                    //  thickness factor, r, g, b, alpha, speed multiple of this.angle]
                    const swirls = [
                        [-0.86, 1.6, 0.5, 0.012,  76, 138, 158, 100, 1.06],   // dark
                        [-0.72, 1.8, 2.0, 0.014, 226, 248, 250, 110, 1.06],   // light
                        [-0.58, 1.4, 4.1, 0.014,  76, 138, 158, 100, 1.04],
                        [-0.44, 1.6, 0.9, 0.016, 226, 248, 250, 110, 1.02],
                        [-0.44, 1.2, 3.6, 0.014,  76, 138, 158, 100, 1.02],
                        [-0.30, 1.8, 2.6, 0.016,  76, 138, 158, 100, 0.99],
                        [-0.16, 1.5, 5.0, 0.016, 226, 248, 250, 110, 0.96],
                        [-0.16, 1.3, 1.6, 0.014,  76, 138, 158, 100, 0.96],
                        [-0.04, 1.7, 3.2, 0.018, 226, 248, 250, 110, 0.94],   // equatorial
                        [ 0.08, 1.4, 0.2, 0.018,  76, 138, 158, 100, 0.94],
                        [ 0.20, 1.6, 4.4, 0.016, 226, 248, 250, 110, 0.96],
                        [ 0.20, 1.2, 2.2, 0.014,  76, 138, 158, 100, 0.96],
                        [ 0.34, 1.8, 1.2, 0.016,  76, 138, 158, 100, 0.99],
                        [ 0.48, 1.4, 5.4, 0.016, 226, 248, 250, 110, 1.02],
                        [ 0.48, 1.6, 3.0, 0.014,  76, 138, 158, 100, 1.02],
                        [ 0.60, 1.5, 0.7, 0.014, 226, 248, 250, 110, 1.04],
                        [ 0.72, 1.7, 3.9, 0.014, 226, 248, 250, 120, 1.06],
                        [ 0.86, 1.5, 2.4, 0.012,  76, 138, 158, 100, 1.06],
                    ];

                    noFill();
                    strokeCap(ROUND);
                    strokeJoin(ROUND);
                    for (const s of swirls) {
                        const x0 = s[0] * R;                         // position along the spin axis
                        const r  = Math.sqrt(R * R - x0 * x0);       // radius of that latitude circle
                        const ph = s[2] - this.angle * s[8];         // rotation about the spin axis (any size is fine)

                        // Exact visible window, measured from u
                        const c   = Math.max(-1, Math.min(1, x0 * ringOpen / (r * cO)));
                        const u   = Math.asin(-c);
                        const W   = PI - 2 * u;                                  // width of the visible window
                        const rel = (((ph - u) % TWO_PI) + TWO_PI) % TWO_PI;     // swirl start, in [0, 2PI)

                        // The swirl (rel to rel + length) can overlap the window twice: [0, W] and [2PI, 2PI + W]
                        const segs = [
                        [rel,     Math.min(rel + s[1], W)],
                        [TWO_PI,  Math.min(rel + s[1], TWO_PI + W)],
                        ];

                        stroke(s[4], s[5], s[6], s[7]);
                        strokeWeight(s[3] * R * 2);
                        for (const sg of segs) {
                        if (sg[1] - sg[0] <= 0.001) continue;                  // nothing visible in this window
                        const n = Math.max(2, Math.ceil((sg[1] - sg[0]) / stepLen));
                        beginShape();
                        for (let i = 0; i <= n; i++) {
                            const t = u + sg[0] + (sg[1] - sg[0]) * i / n;
                            const d = r * Math.sin(t);
                            vertex(x0 * cO - d * ringOpen, r * Math.cos(t));
                        }
                        endShape();
                        }
                    }
                    }
                    pop();                            // releases the clip

                    // ---------- Near half of the rings (drawn last, passes in front of the planet) ----------
                    noFill();
                    for (const rg of rings) {
                        stroke(rg[2], rg[3], rg[4], rg[5]);
                        strokeWeight(rg[1] * R);
                        arc(0, 0, rg[0] * R * 2 * ringOpen, rg[0] * R * 2, HALF_PI, PI + HALF_PI);
                    }

                    pop();
                    break;
                    }
            case 9: 
                {
                    push();
                    const R  = 900;             // planet radius (Neptune is ~0.42x Saturn's 1400)
                    const px = 0;
                    const py = 0;

                    // ---------- Atmosphere glow (1 circle) ----------
                    noStroke();
                    fill(100, 150, 255, 25);
                    circle(px, py, R * 2 * 1.07);

                    // ---------- Planet: concentric cloud bands (8 circles) ----------
                    // Seen from above the pole, latitude bands become concentric rings:
                    // the equator is at the edge and the pole is at the centre.
                    // [radius factor, r, g, b]  (largest first, so smaller ones draw on top)
                    const bands = [
                        [1.00,  58,  92, 190],  // equatorial band (deep azure)
                        [0.88,  78, 128, 220],  // light band
                        [0.76,  50,  86, 176],  // dark band
                        [0.64,  72, 120, 214],  // light band
                        [0.52,  46,  80, 168],  // dark band
                        [0.40,  86, 138, 228],  // light band
                        [0.28,  66, 110, 204],  // high-latitude band
                        [0.14, 104, 158, 236],  // bright, warm polar region
                    ];
                    for (const b of bands) {
                        fill(b[1], b[2], b[3]);
                        circle(px, py, R * 2 * b[0]);
                    }

                    // ---------- Cloud swirls (8 arcs) ----------
                    // [radius factor, start angle, stop angle, thickness factor, r, g, b, alpha]
                    const swirls = [
                    [0.940, 0.5, 1.3, 0.025, 240, 248, 255, 150],   // white cirrus streak
                    [0.940, 3.2, 4.6, 0.025,  28,  50, 130, 120],   // dark blue
                    [0.820, 1.8, 2.6, 0.022, 240, 248, 255, 140],
                    [0.820, 4.8, 6.0, 0.022,  28,  50, 130, 110],
                    [0.700, 0.2, 1.5, 0.022,  28,  50, 130, 110],
                    [0.580, 2.9, 3.6, 0.020, 240, 248, 255, 130],
                    [0.460, 5.1, 6.2, 0.020,  28,  50, 130, 100],
                    [0.340, 1.0, 1.7, 0.018, 240, 248, 255, 120],
                    ];
                    noFill();
                    strokeCap(ROUND);
                    for (const s of swirls) {
                    stroke(s[4], s[5], s[6], s[7]);
                    strokeWeight(s[3] * R);
                    arc(px, py, s[0] * R * 2, s[0] * R * 2, s[1], s[2]);
                    }

                    // ---------- Stroked circles (4 circles) ----------
                    // [inner factor, outer factor, r, g, b, alpha]
                    const rings = [
                        [0.92, 1.00,  15,  25,  70,  55],  // limb darkening
                        [1.65, 1.73, 140, 160, 190,  28],  // Galle ring (faint, broad)
                        [2.15, 2.31, 130, 150, 185,  32],  // Le Verrier + Lassell/Arago (faint, broad)
                        [2.53, 2.55, 170, 190, 220,  70],  // Adams ring (thin, brightest)
                    ];
                    noFill();
                    for (const rg of rings) {
                        stroke(rg[2], rg[3], rg[4], rg[5]);
                        strokeWeight((rg[1] - rg[0]) * R);
                        circle(px, py, (rg[0] + rg[1]) * R);   // diameter = 2 * mid radius
                    }

                    pop();
                    break;
                    }
        }
        pop();
    }

    /**
     * Returns the radius of the celestial body
     * @returns The radius of the celestial body
     */
    getRadius() {
        switch (this.bodyEnum) {
            case 0: return 8700;
            case 1: return 250;
            case 2: return 400;
            case 3: return 500;
            case 4: return 200;
            case 5: return 350;
            case 6: return 1500;
            case 7: return 1400;
            case 8: return 900;
            case 9: return 900;
            default: return -1;
        }
    }
}

/**
 * Class representing an instance of the planet part of the experience
 */
class Planet {
    /**
     * Vertical field of view in degrees
     */
    FOV;
    /**
     * Inverse focal length I believe
     */
    IFL;
    /**
     * Focal length I believe
     */
    FL;
    /**
     * Z position in camera space that all triangle must be infront of to render
     */
    NEAR_PLANE;

    /**
     * Player's move speed
     */
    SPEED;
    /**
     * Multplier to multiply the mouse movement by when updating the camera's rotation
     */
    LOOK_ROT;
    /**
     * Upwards acceleration due gravity (This should be negative)
     */
    GRAVITY;
    /**
     * Maximum slope the player can walk up
     */
    MAX_SLOPE;

    /**
     * Height of the player
     */
    PLAYER_HEIGHT;
    /**
     * Half the length of the players bounding box in the x and z direction. The player is an axis-aligned bounding box not a cylinder like this variables name suggests
     */
    PLAYER_RADIUS
    /**
     * Value between 0-1 representing the percentage of the body below the camera
     */
    CAMERA_HEIGHT

    /**
     * Time left to jump
     */
    coyoteTime;
    /**
     * Camera's position. Also the position of the player but offset
     */
    pos;
    /**
     * Rotation of the camera
     */
    rot;
    /**
     * Vertical velocity
     */
    vVel;

    /**
     * Stores the y position of the rocket
     */
    ROCKET_Y_POS;

    /**
     * Color of the fog
     */
    FOG_COLOR;
    /**
     * Direction the sun is coming from
     */
    SUN_ANGLE;
    /**
     * Color of the ground
     */
    GROUND_COLOR;

    /**
     * Array containing the scales for the perlin noise of the ground
     */
    NOISE_SCALES;
    /**
     * Array containing the weights for the perlin noise of the ground
     */
    NOISE_WEIGHTS;
    /**
     * Max height of the terrain
     */
    TERRAIN_HEIGHT;

    /**
     * Creates an instance of the planet portion
     * @param {number} FOV Vertical field of view in degrees
     * @param {number} bodyEnum Number representing the celestial body the player is on
     */
    constructor(FOV, bodyEnum) {
        this.FOV = FOV;
        this.IFL = SCREEN_HEIGHT * tan((180 - this.FOV) * PI / 360);
        this.FL = 1 / this.IFL;
        this.NEAR_PLANE = 0.1;

        this.SPEED = 6.3;
        this.LOOK_ROT = PI / 180;
        switch (bodyEnum) {
            case 0: // Sun
                this.SUN_ANGLE = null;
                this.GROUND_COLOR = new Color(255, 174, 66);
                this.FOG_COLOR = new Color(255, 220, 130);
                this.NOISE_SCALES = [25, 10, 4, 1.5];
                this.NOISE_WEIGHTS = [0.3, 0.3, 0.25, 0.15];
                this.TERRAIN_HEIGHT = 120;
                this.GRAVITY = -558;
                break;
            case 1: // Mercury
                this.SUN_ANGLE = new Rotation(2, 0.3, 0);
                this.GROUND_COLOR = new Color(112, 102, 94);
                this.FOG_COLOR = new Color(90, 85, 82);
                this.NOISE_SCALES = [35, 12, 4, 1];
                this.NOISE_WEIGHTS = [0.4, 0.3, 0.2, 0.1];
                this.TERRAIN_HEIGHT = 135;
                this.GRAVITY = -7.5;
                break;
            case 2: // Venus
                this.SUN_ANGLE = new Rotation(2, 0.3, 0);
                this.GROUND_COLOR = new Color(194, 150, 80);
                this.FOG_COLOR = new Color(214, 184, 124);
                this.NOISE_SCALES = [60, 20, 8, 2];
                this.NOISE_WEIGHTS = [0.65, 0.2, 0.1, 0.05];
                this.TERRAIN_HEIGHT = 90;
                this.GRAVITY = -18.1;
                break;
            case 3: // Earth
                this.SUN_ANGLE = new Rotation(2, 0.3, 0);
                this.GROUND_COLOR = new Color(86, 128, 53);
                this.FOG_COLOR = new Color(180, 198, 235);
                this.NOISE_SCALES = [50, 18, 6, 2];
                this.NOISE_WEIGHTS = [0.45, 0.25, 0.2, 0.1];
                this.TERRAIN_HEIGHT = 150;
                this.GRAVITY = -20;
                break;
            case 4: // Moon
                this.SUN_ANGLE = new Rotation(2, 0.3, 0);
                this.GROUND_COLOR = new Color(130, 128, 125);
                this.FOG_COLOR = new Color(100, 98, 95);
                this.NOISE_SCALES = [30, 10, 3.5, 1];
                this.NOISE_WEIGHTS = [0.35, 0.3, 0.2, 0.15];
                this.TERRAIN_HEIGHT = 105;
                this.GRAVITY = -3.3;
                break;
            case 5: // Mars
                this.SUN_ANGLE = new Rotation(2, 0.3, 0);
                this.GROUND_COLOR = new Color(173, 78, 34);
                this.FOG_COLOR = new Color(205, 145, 105);
                this.NOISE_SCALES = [40, 15, 5, 1.5];
                this.NOISE_WEIGHTS = [0.5, 0.25, 0.15, 0.1];
                this.TERRAIN_HEIGHT = 150;
                this.GRAVITY = -7.6;
                break;
            case 6: // Jupiter
                this.SUN_ANGLE = new Rotation(2, 0.3, 0);
                this.GROUND_COLOR = new Color(200, 165, 120);
                this.FOG_COLOR = new Color(230, 200, 160);
                this.NOISE_SCALES = [45, 20, 8, 3];
                this.NOISE_WEIGHTS = [0.4, 0.3, 0.2, 0.1];
                this.TERRAIN_HEIGHT = 75;
                this.GRAVITY = -50.6;
                break;
            case 7: // Saturn
                this.SUN_ANGLE = new Rotation(2, 0.3, 0);
                this.GROUND_COLOR = new Color(216, 196, 150);
                this.FOG_COLOR = new Color(235, 222, 180);
                this.NOISE_SCALES = [55, 22, 8, 3];
                this.NOISE_WEIGHTS = [0.5, 0.25, 0.15, 0.1];
                this.TERRAIN_HEIGHT = 60;
                this.GRAVITY = -21.3;
                break;
            case 8: // Uranus
                this.SUN_ANGLE = new Rotation(2, 0.3, 0);
                this.GROUND_COLOR = new Color(170, 220, 220);
                this.FOG_COLOR = new Color(200, 235, 235);
                this.NOISE_SCALES = [70, 25, 10, 3];
                this.NOISE_WEIGHTS = [0.6, 0.2, 0.15, 0.05];
                this.TERRAIN_HEIGHT = 30;
                this.GRAVITY = -18.1;
                break;
            case 9: // Neptune
                this.SUN_ANGLE = new Rotation(2, 0.3, 0);
                this.GROUND_COLOR = new Color(60, 90, 180);
                this.FOG_COLOR = new Color(90, 120, 200);
                this.NOISE_SCALES = [50, 20, 8, 3];
                this.NOISE_WEIGHTS = [0.45, 0.25, 0.2, 0.1];
                this.TERRAIN_HEIGHT = 45;
                this.GRAVITY = -22.7;
                break;
        }
        this.MAX_SLOPE = 1;

        this.PLAYER_HEIGHT = 2;
        this.PLAYER_RADIUS = 0.5;
        this.CAMERA_HEIGHT = 0.8;

        let n = new PerlinNoise(this.NOISE_SCALES, new Vector3D(0, 0, 0), 50, 50, this.NOISE_WEIGHTS);
        this.ROCKET_Y_POS = n.getValue(new Vector3D(25, 0, 25)) * this.TERRAIN_HEIGHT;

        this.coyoteTime = 0;
        this.pos = new Vector3D(0, this.ROCKET_Y_POS + this.PLAYER_HEIGHT * this.CAMERA_HEIGHT + 2.5, 0);
        this.rot = new Rotation(0, PI, 0);
        this.vVel = 0;
    }

    /**
     * Draws the triangles in tris to the screen
     * @param {Triangle3D[]} tris Array of triangles to draw
     * @param {Vector3D} camPos Position of the camera
     * @param {Rotation} camRot ROtation of the camera
     */
    drawWorld(tris, camPos, camRot) {
        noStroke();
        let pQueue = new PriorityQueue();

        for (let i = 0; i < tris.length; i++) {
            let cosYaw = cos(camRot.yaw);
            let sinYaw = sin(camRot.yaw);
            let cosPitch = cos(camRot.pitch);
            let sinPitch = sin(camRot.pitch);
            let cosRoll = cos(camRot.roll);
            let sinRoll = sin(camRot.roll);
            let rotMat = [cosYaw * cosRoll + sinYaw * sinPitch * sinRoll, -1 * cosPitch * sinRoll,      cosYaw * sinPitch * sinRoll - sinYaw * cosRoll, 
                          cosYaw * sinRoll - sinYaw * sinPitch * cosRoll,      cosPitch * cosRoll, -1 * sinYaw * sinRoll - cosYaw * sinPitch * cosRoll, 
                                                       sinYaw * cosPitch,                sinPitch,                                   cosYaw * cosPitch];
                                        
            let newTri = tris[i].translate(camPos, rotMat); // Changes to camera space

            if (new AABB([newTri.v1, newTri.v2, newTri.v3]).isInView(this.FL, SCREEN_WIDTH, SCREEN_HEIGHT)) {
                if (newTri.v1.copy().sub(newTri.v2).cross(newTri.v1.copy().sub(newTri.v3)).dot(newTri.v1) < 0) { // If triangle is facing the camera
                    let correctedTris = newTri.corrected(this.NEAR_PLANE);
                    for (let j = 0; j < correctedTris.length; j++) {
                        pQueue.enqueue(correctedTris[j].project(this.IFL), correctedTris[j].distance); // Changes to screen space
                    }
                }
            }
        }

        push();
        translate(SCREEN_WIDTH * 0.5, SCREEN_HEIGHT * 0.5);
        while (!pQueue.isEmpty()) {
            let tri = pQueue.dequeue();

            let d;
            if (this.SUN_ANGLE == null) {
                d = 1;
            } else {
                let s = new Vector3D(sin(this.SUN_ANGLE.yaw), sin(this.SUN_ANGLE.pitch), cos(this.SUN_ANGLE.yaw) * cos(this.SUN_ANGLE.pitch));
                s.normalize();
                d = (max(0, tri.normal.dot(s)) * 0.7) + 0.3;
            }

            let f = max(min((500 - sqrt(tri.distance)) * 0.002, 1), 0);

            let color = tri.color.copy().mult(d).mult(f).add(this.FOG_COLOR.copy().mult(1 - f));
            color.setFill();

            triangle(tri.v1.x, tri.v1.y, tri.v2.x, tri.v2.y, tri.v3.x, tri.v3.y);
        }
        pop();
    }

    /**
     * Returns if the AABB is inside the triangle
     * @param {AABB} aabb AABB to check collision with
     * @param {Triangle3D} tri Triangle to check collision with
     * @returns If the triangle and AABB are colliding
     */
    checkCollision(aabb, tri) {
        if (aabb.isAABBColliding(tri.aabb)) { // Check the three AABB axes
            if (aabb.isNormalColliding(tri)) { // Check the triangle normal axis
                if (aabb.isEdgeColliding(tri)) { // Check cross product of triangle edges with three AABB axes for a total of 9 remaining
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Returns if the AABB is colliding with any of the triangles in tri
     * @param {AABB} aabb AABB to check collision with
     * @param {Triangle3D[]} tris Array of triangles to check collision with
     * @returns If the AABB is inside a triangle in tris
     */
    isColliding(aabb, tris) {
        for (let i = 0; i < tris.length; i++) {
            if (this.checkCollision(aabb, tris[i])) {
                return true;
            }
        }
        return false;
    }

    /**
     * Handles the player movement
     * @param {number} delta Time it took the last frame
     * @param {Triangle3D[]} tris Array of triangles to collide with
     */
    processMovement(delta, tris) {
        if (keyIsDown('KeyE')) {
            isSpace = true;
        }

        if (this.coyoteTime > 0) {
            this.coyoteTime -= delta;
        }

        this.vVel += this.GRAVITY * delta;
        if (keyIsDown('Space') && this.coyoteTime > 0) {
            this.vVel = 10;
            this.coyoteTime = 0;
        }
        let dPos = new Vector3D(0, this.vVel * delta, 0).mult(0.1);
        for (let i = 0; i < 10; i++) {
            this.pos.add(dPos);
            let aabb = new AABB([new Vector3D(this.pos.x - this.PLAYER_RADIUS, this.pos.y - this.PLAYER_HEIGHT * this.CAMERA_HEIGHT, this.pos.z - this.PLAYER_RADIUS), 
                           new Vector3D(this.pos.x + this.PLAYER_RADIUS, this.pos.y + this.PLAYER_HEIGHT * (1 - this.CAMERA_HEIGHT), this.pos.z + this.PLAYER_RADIUS)]);
            if (this.isColliding(aabb, tris)) {
                this.pos.sub(dPos);
                if (this.vVel < 0) {
                    this.coyoteTime = 0.3;
                }
                this.vVel = 0;
                break;
            }
        }

        if (mouseIsPressed) {
            this.rot.yaw += (mouseX - pmouseX) * 0.6 * delta;
            this.rot.pitch -= (mouseY - pmouseY) * 0.6 * delta;
            if (this.rot.pitch > PI * 0.5) {
                this.rot.pitch = PI * 0.5;
            } else if (this.rot.pitch < PI * -0.5) {
                    this.rot.pitch = PI * -0.5;
            }
        }

        let lookVec = new Vector2D(cos(this.rot.yaw), sin(this.rot.yaw));
        let md = this.SPEED * delta;
        let moveDir = new Vector2D(0, 0);
        if (keyIsDown('KeyW')) {
            moveDir.y += 1;
        }
        if (keyIsDown('KeyS')) {
            moveDir.y -= 1;
        }
        if (keyIsDown('KeyD')) {
            moveDir.x += 1;
        }
        if (keyIsDown('KeyA')) {
            moveDir.x -= 1;
        }

        moveDir.normalize();

        dPos = new Vector3D((lookVec.x * moveDir.x + lookVec.y * moveDir.y) * md, 0, (lookVec.x * moveDir.y - lookVec.y * moveDir.x) * md);
        dPos.mult(0.1);

        for (let i = 0; i < 10; i++) {
            this.pos.add(dPos);
            let aabb = new AABB([new Vector3D(this.pos.x - this.PLAYER_RADIUS, this.pos.y - this.PLAYER_HEIGHT * this.CAMERA_HEIGHT, this.pos.z - this.PLAYER_RADIUS), 
                           new Vector3D(this.pos.x + this.PLAYER_RADIUS, this.pos.y + this.PLAYER_HEIGHT * (1 - this.CAMERA_HEIGHT), this.pos.z + this.PLAYER_RADIUS)]);
            if (this.isColliding(aabb, tris)) {
                this.pos.y += this.SPEED * this.MAX_SLOPE * delta * 0.1;
                let aabb2 = new AABB([new Vector3D(this.pos.x - this.PLAYER_RADIUS, this.pos.y - this.PLAYER_HEIGHT * this.CAMERA_HEIGHT, this.pos.z - this.PLAYER_RADIUS), 
                           new Vector3D(this.pos.x + this.PLAYER_RADIUS, this.pos.y + this.PLAYER_HEIGHT * (1 - this.CAMERA_HEIGHT), this.pos.z + this.PLAYER_RADIUS)]);
                    if (this.isColliding(aabb2, tris)) {
                        this.pos.y -= this.SPEED * this.MAX_SLOPE * delta * 0.1;
                        this.pos.sub(dPos);
                        break;
                    }
            }
        }
    }

    /**
     * Adds a triangle to the input array
     * @param {Vector3D} v1 Vertex one of the triangle
     * @param {Vector3D} v2 Vertex two of the triangle
     * @param {Vector3D} v3 Vertex three of the triangle
     * @param {Color} color Color of the triangle
     * @param {Triangle3D[]} tris Array of triangles to add to
     * @returns The updated triangle array
     */
    addTri(v1, v2, v3, color, tris) {
        tris.push(new Triangle3D(v1, v2, v3, color, null, null));
        return tris;
    }

    /**
     * Adds a rocket to the input triangle array
     * @param {Vector3D} pos Position of the bottom center of the rocket
     * @param {Triangle3D[]} tris Triangle array to add the rocket to
     */
    createRocket(pos, tris) {
        let gray = new Color(100, 100, 100);
        let red = new Color(255, 0, 0);
        let blue = new Color(0, 0, 255);

        let v1 = new Vector3D(-2.75 + pos.x, 2.5 + pos.y, -2.75 + pos.z);
        let v2 = new Vector3D(-2.75 + pos.x, 2.5 + pos.y, 2.75 + pos.z);
        let v3 = new Vector3D(2.75 + pos.x, 2.5 + pos.y, -2.75 + pos.z);
        let v4 = new Vector3D(2.75 + pos.x, 2.5 + pos.y, 2.75 + pos.z);
        let v5 = new Vector3D(-2.75 + pos.x, 11.339 + pos.y, -2.75 + pos.z);
        let v6 = new Vector3D(-2.75 + pos.x, 11.339 + pos.y, 2.75 + pos.z);
        let v7 = new Vector3D(2.75 + pos.x, 11.339 + pos.y, -2.75 + pos.z);
        let v8 = new Vector3D(2.75 + pos.x, 11.339 + pos.y, 2.75 + pos.z);

        let v9 = new Vector3D(-3.5 + pos.x, 10 + pos.y, -3.5 + pos.z);
        let v10 = new Vector3D(3.5 + pos.x, 10 + pos.y, -3.5 + pos.z);
        let v11 = new Vector3D(-3.5 + pos.x, 10 + pos.y, 3.5 + pos.z);
        let v12 = new Vector3D(3.5 + pos.x, 10 + pos.y, 3.5 + pos.z);
        let v13 = new Vector3D(pos.x, 16.25 + pos.y, pos.z);

        let v14 = new Vector3D(-0.75 + pos.x, 2.5 + pos.y, -2.75 + pos.z);
        let v15 = new Vector3D(-0.75 + pos.x, 5.5 + pos.y, -2.75 + pos.z);
        let v16 = new Vector3D(0.75 + pos.x, 5.5 + pos.y, -2.75 + pos.z);
        let v17 = new Vector3D(0.75 + pos.x, 2.5 + pos.y, -2.75 + pos.z);

        let v18 = new Vector3D(-0.75 + pos.x, -1.24 + pos.y, -6.99 + pos.z);
        let v19 = new Vector3D(0.75 + pos.x, -1.24 + pos.y, -6.99 + pos.z);

        let v20 = new Vector3D(-2.75 + pos.x, 5.25 + pos.y, -2.75 + pos.z);
        let v21 = new Vector3D(-2.75 + pos.x, 0 + pos.y, -2.75 + pos.z);
        let v22 = new Vector3D(-5 + pos.x, 0 + pos.y, -5 + pos.z);

        let v23 = new Vector3D(-2.75 + pos.x, 5.25 + pos.y, 2.75 + pos.z);
        let v24 = new Vector3D(-2.75 + pos.x, 0 + pos.y, 2.75 + pos.z);
        let v25 = new Vector3D(-5 + pos.x, 0 + pos.y, 5 + pos.z);

        let v26 = new Vector3D(2.75 + pos.x, 5.25 + pos.y, 2.75 + pos.z);
        let v27 = new Vector3D(2.75 + pos.x, 0 + pos.y, 2.75 + pos.z);
        let v28 = new Vector3D(5 + pos.x, 0 + pos.y, 5 + pos.z);
        
        let v29 = new Vector3D(2.75 + pos.x, 5.25 + pos.y, -2.75 + pos.z);
        let v30 = new Vector3D(2.75 + pos.x, 0 + pos.y, -2.75 + pos.z);
        let v31 = new Vector3D(5 + pos.x, 0 + pos.y, -5 + pos.z);

        this.addTri(v1, v2, v3, gray, tris);
        this.addTri(v3, v2, v1, gray, tris);
        this.addTri(v4, v2, v3, gray, tris);
        this.addTri(v3, v2, v4, gray, tris);
        this.addTri(v1, v2, v5, gray, tris);
        this.addTri(v5, v2, v1, gray, tris);
        this.addTri(v6, v2, v5, gray, tris);
        this.addTri(v5, v2, v6, gray, tris);
        this.addTri(v2, v4, v6, gray, tris);
        this.addTri(v6, v4, v2, gray, tris);
        this.addTri(v8, v4, v6, gray, tris);
        this.addTri(v6, v4, v8, gray, tris);
        this.addTri(v3, v4, v8, gray, tris);
        this.addTri(v8, v4, v3, gray, tris);
        this.addTri(v3, v7, v8, gray, tris);
        this.addTri(v8, v7, v3, gray, tris);

        this.addTri(v9, v10, v13, red, tris);
        this.addTri(v13, v10, v9, red, tris);
        this.addTri(v9, v11, v13, red, tris);
        this.addTri(v13, v11, v9, red, tris);
        this.addTri(v12, v11, v13, red, tris);
        this.addTri(v13, v11, v12, red, tris);
        this.addTri(v12, v10, v13, red, tris);
        this.addTri(v13, v10, v12, red, tris);

        this.addTri(v1, v14, v5, gray, tris);
        this.addTri(v5, v14, v1, gray, tris);
        this.addTri(v15, v14, v5, gray, tris);
        this.addTri(v5, v14, v15, gray, tris);
        this.addTri(v15, v16, v5, gray, tris);
        this.addTri(v5, v16, v15, gray, tris);
        this.addTri(v7, v16, v5, gray, tris);
        this.addTri(v5, v16, v7, gray, tris);
        this.addTri(v7, v16, v3, gray, tris);
        this.addTri(v3, v16, v7, gray, tris);
        this.addTri(v17, v16, v3, gray, tris);
        this.addTri(v3, v16, v17, gray, tris);

        this.addTri(v14, v17, v18, gray, tris);
        this.addTri(v18, v17, v14, gray, tris);
        this.addTri(v17, v18, v19, gray, tris);
        this.addTri(v19, v18, v17, gray, tris);

        this.addTri(v20, v21, v22, blue, tris);
        this.addTri(v22, v21, v20, blue, tris);

        this.addTri(v23, v24, v25, blue, tris);
        this.addTri(v25, v24, v23, blue, tris);

        this.addTri(v26, v27, v28, blue, tris);
        this.addTri(v28, v27, v26, blue, tris);

        this.addTri(v29, v30, v31, blue, tris);
        this.addTri(v31, v30, v29, blue, tris);
    }

    /**
     * Adds a plane to the input triangle array
     * @param {number[]} yPos Y positions of the vertecies
     * @param {Vector3D} pos Position of the -x, -z corner of the plane
     * @param {number} scale Size of the triangles in the plane
     * @param {Color} color Color of the plane
     * @param {Triangle3D[]} tris Triangle array to add the plane to
     */
    createPlane(yPos, pos, scale, color, tris) {
        for (let z = 0; z < yPos.length - 1; z++) {
            for (let x = 0; x < yPos[z].length - 1; x++) {
                let v1 = new Vector3D(pos.x + scale * x, pos.y + yPos[z][x], pos.z + scale * z);
                let v2 = new Vector3D(pos.x + scale * x, pos.y + yPos[z + 1][x], pos.z + scale * (z + 1));
                let v3 = new Vector3D(pos.x + scale * (x + 1), pos.y + yPos[z][x + 1], pos.z + scale * z);
                let v4 = new Vector3D(pos.x + scale * (x + 1), pos.y + yPos[z + 1][x + 1], pos.z + scale * (z + 1));
                if ((x + z) % 2) { // Alternates orientation of diagonal seam in the square
                    this.addTri(v1, v2, v3, color, tris);
                    this.addTri(v2, v4, v3, color, tris);
                } else {
                    this.addTri(v1, v2, v4, color, tris);
                    this.addTri(v4, v3, v1, color, tris);
                }
            }
        }
    }

    /**
     * Does one frame of the game
     * @param {number} delta Time it took the last frame;
     */
    run(delta) {
        let world = [];

        let sc = 10;

        let rppx = floor(this.pos.x / (2 * sc)) * 2;
        let rppz = floor(this.pos.z / (2 * sc)) * 2;

        let noise = new PerlinNoise(this.NOISE_SCALES, new Vector3D(rppx, 0, rppz), 50, 50, this.NOISE_WEIGHTS);
        let yPos = []
        for (let z = 0; z < 50; z++) {
            yPos.push([]);
            for (let x = 0; x < 50; x++) {
                yPos[z].push(noise.getValue(new Vector3D(x + rppx, 0, z + rppz)) * this.TERRAIN_HEIGHT * sc / 10);
            }
        }

        this.createPlane(yPos, new Vector3D(-25 * sc + rppx * sc, 0, -25 * sc + rppz * sc), sc, this.GROUND_COLOR, world);
        this.createRocket(new Vector3D(0, this.ROCKET_Y_POS, 0), world);

        background(this.FOG_COLOR.r, this.FOG_COLOR.g, this.FOG_COLOR.b);

        this.processMovement(delta, world);

        this.drawWorld(world, this.pos, this.rot);
    }
}

/**
 * Class representing a priority queue
 */
class PriorityQueue {
    /**
     * Max heap containing all the objects
     */
    heap;
    /**
     * Initializes a priority queue
     */
    constructor() {
        this.heap = [];
    }

    /**
     * Adds an element to the queue
     * @param {*} obj Object to add
     * @param {number} pri Priority of the object
     */
    enqueue(obj, pri) {
        this.heap.push([pri, obj]);

        let i = this.heap.length - 1;
        let pi = Math.floor((i - 1) / 2);
        while (pi >= 0 && this.heap[i][0] > this.heap[pi][0]) {
            let temp = this.heap[i];
            this.heap[i] = this.heap[pi];
            this.heap[pi] = temp;
            i = pi;
            pi = Math.floor((i - 1) / 2);
        }
    }

    /**
     * Returns the element with the highest priority
     * @returns Object with the highest priority
     */
    dequeue() {
        let res = this.heap[0][1];
        this.heap[0] = this.heap[this.heap.length - 1];
        this.heap.pop();
        
        let i = 0;
        while ((i * 2) + 1 < this.heap.length) {
            let largerChildIndex = i * 2 + 1;
            if ((i * 2) + 2 < this.heap.length && this.heap[(i * 2) + 2][0] > this.heap[(i * 2) + 1][0]) {
                largerChildIndex = (i * 2) + 2;
            }
            if (this.heap[largerChildIndex][0] > this.heap[i][0]) {
                let temp = this.heap[i];
                this.heap[i] = this.heap[largerChildIndex];
                this.heap[largerChildIndex] = temp;
                i = largerChildIndex;
            } else {
                break;
            }
        }
        return res;
    }

    /**
     * Returns if the queue is empty
     * @returns If there are no elements in the queue
     */
    isEmpty() {
        return this.heap.length == 0;
    }
}

/**
 * Class representing a 3D vector
 */
class Vector3D {
    /**
     * Distance in the x direction
     */
    x;
    /**
     * Distance in the y direction
     */
    y;
    /**
     * Distance in the z direction
     */
    z;
    /**
     * Creates a 3D vector
     * @param {number} x Distance in the x direction
     * @param {number} y Distance in the y direction
     * @param {number} z Distance in the z direction
     */
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Calculates the magnitude of the vector
     * @returns Magnitude of the vector
     */
    magnitude() {
        return sqrt(this.magnitudeSquared());
    }

    /**
     * Calculates the magnitude of the vector squared
     * @returns Magnitude squared
     */
    magnitudeSquared() {
        return (this.x * this.x) + (this.y * this.y) + (this.z * this.z);
    }

    /**
     * Calculates the dot product of this vector and the input vector
     * @param {Vector3D} vec Vector to calculate the dot product with
     * @returns Dot product of this vector and the input vector
     */
    dot(vec) {
        return this.x * vec.x + this.y * vec.y + this.z * vec.z;
    }

    /**
     * Calculates the cross product of this vector and the input vector
     * @param {Vector3D} vec Vector to calculate the cross product with
     * @returns Cross product of this vector and the input vector
     */
    cross(vec) {
        return new Vector3D(this.y * vec.z - this.z * vec.y,
                            this.z * vec.x - this.x * vec.z,
                            this.x * vec.y - this.y * vec.x);
    }

    /**
     * Returns a point that is offset then with a rotation matrix applied
     * @param {Vector3D} vec Vector to offset by
     * @param {number[]} rotMat Rotation matrix to apply
     * @returns Point after all transformations
     */
    translate(vec, rotMat) {
        let x = this.x - vec.x;
        let y = this.y - vec.y;
        let z = this.z - vec.z;
        return new Vector3D(x * rotMat[0] + y * rotMat[1] + z * rotMat[2],
                            x * rotMat[3] + y * rotMat[4] + z * rotMat[5], 
                            x * rotMat[6] + y * rotMat[7] + z * rotMat[8]);
    }

    /**
     * Normalizes the vector
     * @returns Itself
     */
    normalize() {
        return this.mult(1 / this.magnitude());
    }

    /**
     * Returns the point where the z position is zPos on the line containing itself and vec
     * @param {Vector3D} vec Point to move itself towards
     * @param {number} zPos Z position of the new point
     * @returns Point along the line containing itself and vec where the z position is zPos
     */
    correctPoint(vec, zPos) {
        let iDZPos = 1 / (vec.z - this.z);
        return new Vector3D((vec.x - this.x) * iDZPos * (zPos - this.z) + this.x, 
                            (vec.y - this.y) * iDZPos * (zPos - this.z) + this.y, 
                             zPos);
    }

    /**
     * Multiplies the x, y, & z componenets by the input number
     * @param {number} n Number to multiply the vector by
     * @returns Itself
     */
    mult(n) {
        this.x *= n;
        this.y *= n;
        this.z *= n;
        return this;
    }

    /**
     * Creates an identical copy
     * @returns An identical copy
     */
    copy() {
        return new Vector3D(this.x, this.y, this.z);
    }

    /**
     * Subtracts the input vector
     * @param {Vector3D} vec 
     * @returns Itself
     */
    sub(vec) {
        this.x -= vec.x;
        this.y -= vec.y;
        this.z -= vec.z;
        return this;
    }

    /**
     * Adds the input vector to itself
     * @param {Vector3D} vec Vector to add
     * @returns Itself
     */
    add(vec) {
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
        return this;
    }
}

/**
 * Class represnting a rotation
 */
class Rotation {
    /**
     * Pitch (up/down) of the rotation
     */
    pitch;
    /**
     * Yaw (left/right) of the rotation
     */
    yaw;
    /**
     * Roll (Spin) of the rotation
     */
    roll;
    /**
     * Creates a rotation with pitch, yaw, & roll
     * @param {number} pitch 
     * @param {number} yaw 
     * @param {number} roll 
     */
    constructor(pitch, yaw, roll) {
        this.pitch = pitch;
        this.yaw = yaw;
        this.roll = roll;
    }
}

/**
 * Class representing a 2D vector
 */
class Vector2D {
    /**
     * Distance in the x direction
     */
    x;
    /**
     * Distance in the y direction
     */
    y;
    /**
     * Creates a 2D vector
     * @param {number} x Distance in the x direction
     * @param {number} y Distance in the y direction
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Calculates and returns the magnitude of the vector
     * @returns The magnitude of the vector
     */
    magnitude() {
        return sqrt((this.x * this.x) + (this.y * this.y));
    }

    /**
     * Creates a copy of the vector
     * @returns An identical copy of the vector
     */
    copy() {
        return new Vector2D(this.x, this.y);
    }
    
    /**
     * Adds the input vector from itself
     * @param {Vector2D} vec Vector to add
     * @returns Itself
     */
    add(vec) {
        this.x += vec.x;
        this.y += vec.y;
        return this;
    }

    /**
     * Subtracts the input vector from itself
     * @param {Vector2D} vec Vector to subtract
     * @returns Itself
     */
    sub(vec) {
        this.x -= vec.x;
        this.y -= vec.y;
        return this;
    }

    /**
     * Multiplies the vector by the input number
     * @param {number} n 
     * @returns Itself
     */
    mult(n) {
        this.x *= n;
        this.y *= n;
        return this;
    }

    /**
     * Normalizes the vector
     * @returns Itself
     */
    normalize() {
    if (this.x == 0 && this.y == 0) {
        return this;
    }
    return this.mult(1 / sqrt((this.x * this.x) + (this.y * this.y)));
    }

    /**
     * Returns the dot product of the vectors
     * @param {Vector2D} vec Vector to dot with
     * @returns Dot product
     */
    dot(vec) {
        return this.x * vec.x + this.y * vec.y;
    }
}

/**
 * Class representing a color
 */
class Color {
    /**
     * Amount of red in the color
     */
    r;
    /**
     * Amount of green in the color
     */
    g;
    /**
     * Amount of blue in the color
     */
    b;
    /**
     * Alpha of the color
     */
    a;
    /**
     * Creates a color
     * @param {number} r Red in the color
     * @param {number} g Green in the color
     * @param {number} b Blue in the color
     * @param {number} a Alpha of the color (leave blank for an alpha of 255)
     */
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        if (a == null) {
            this.a = 255;
        } else {
            this.a = a;
        }
    }

    /**
     * Sets the fill color to this color
     */
    setFill() {
        fill(this.r, this.g, this.b, this.a);
    }

    /**
     * Sets the stroke color to this color
     */
    setStroke() {
        stroke(this.r, this.g, this.b, this.a);
    }

    /**
     * Multiplies the r, g, & b componenets by the input number
     * @param {number} n Number to multiply the vector by
     * @returns A refrence to itself
     */
    mult(n) {
        this.r *= n;
        this.g *= n;
        this.b *= n
        return this;
    }

    /**
     * Adds the r, g, & b component of the input vector to itself
     * @param {Color} color Color to add
     * @returns Itself
     */
    add(color) {
        this.r += color.r;
        this.g += color.g;
        this.b += color.b;
        return this;
    }

    /**
     * Creates an identical copy
     * @returns An identical copy
     */
    copy() {
        return new Color(this.r, this.g, this.b);
    }
}

/**
 * Class representing an axis-aligned bounding box
 */
class AABB {
    /**
     * Minimum x position
     */
    minX;
    /**
     * Maximum x position
     */
    maxX;
    /**
     * Minimum y position
     */
    minY;
    /**
     * Maximum y position
     */
    maxY;
    /**
     * Minimum z position
     */
    minZ;
    /**
     * Maximum z position
     */
    maxZ;

    /**
     * Corner of the AABB that is in the negitive x, y, & z directions
     */
    min;
    /**
     * Corner of the AABB that is in the positive x, y, & z directions
     */
    max;
    /**
     * Creates an Axis-aligned bounding box from an array of verticies
     * @param {Vector3D[]} verts Array of verticies to contain in the AABB
     */
    constructor(verts) {
        this.minX = verts[0].x;
        this.maxX = verts[0].x;
        this.minY = verts[0].y;
        this.maxY = verts[0].y;
        this.minZ = verts[0].z;
        this.maxZ = verts[0].z;
        for (let i = 1; i < verts.length; i++) {
            if (verts[i].x < this.minX) {
                this.minX = verts[i].x;
            } else if (verts[i].x > this.maxX) {
                this.maxX = verts[i].x;
            }
            if (verts[i].y < this.minY) {
                this.minY = verts[i].y;
            } else if (verts[i].y > this.maxY) {
                this.maxY = verts[i].y;
            }
            if (verts[i].z < this.minZ) {
                this.minZ = verts[i].z;
            } else if (verts[i].z > this.maxZ) {
                this.maxZ = verts[i].z;
            }
        }
        this.min = new Vector3D(this.minX, this.minY, this.minZ);
        this.max = new Vector3D(this.maxX, this.maxY, this.maxZ);
    }

    /**
     * Returns if the Axis-aligned bounding box is in the view pyramid
     * @param {number} fl Focal length I believe
     * @param {number} sW Screen width
     * @param {number} sH Screen height
     * @returns If it is in the view pyramid
     */
    isInView(fl, sW, sH) {
        let uf = 0.5 * fl * this.maxZ;
        return ((!((this.minX > sW * uf) || (this.maxX < -1 * sW * uf))) && 
                (!((this.minY > sH * uf) || (this.maxY < -1 * sH * uf))));
    }

    /**
     * Returns if it is colliding with the input Axis-aligned bounding box
     * @param {AABB} aabb Axis-aligned bounding box to check collision against
     * @returns If it is colliding
     */
    isAABBColliding(aabb) {
        return (this.minX <= aabb.maxX &&
            this.maxX >= aabb.minX &&
            this.minY <= aabb.maxY &&
            this.maxY >= aabb.minY &&
            this.minZ <= aabb.maxZ &&
            this.maxZ >= aabb.minZ);
    }

    /**
     * Returns an array containing all corners of the AABB
     * @returns Array containing all 8 vertices of the AABB
     */
    getPoints() {
        return [new Vector3D(this.minX, this.minY, this.minZ), 
                new Vector3D(this.maxX, this.maxY, this.maxZ), 
                new Vector3D(this.minX, this.minY, this.maxZ), 
                new Vector3D(this.maxX, this.maxY, this.minZ), 
                new Vector3D(this.minX, this.maxY, this.minZ), 
                new Vector3D(this.maxX, this.minY, this.maxZ), 
                new Vector3D(this.maxX, this.minY, this.minZ), 
                new Vector3D(this.minX, this.maxY, this.maxZ)];
    }

    /**
     * Returns if it is colliding with the plane of the input triangle
     * @param {Triangle3D} tri Triangle to check collision with
     * @returns If it is colliding
     */
    isNormalColliding(tri) {
        let nor = tri.normal;
        let t = tri.v1.dot(nor);

        let corners = this.getPoints();
        let min = corners[0].dot(nor);
        let max = min;
        for (let i = 1; i < 8; i++) {
            let p = corners[i].dot(nor);
            if (p < min) {
                min = p;
            } else if (p > max){
                max = p;
            }
            if (min < t && max > t) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns if it is colliding with the triangle when projected along the input vector
     * @param {Vector3D} vec Vector to project the AABB and triangle onto
     * @param {Triangle3D} tri Triangle to compare against
     * @returns If it is colliding with the triangle along the input vector
     */
    compare(vec, tri) {
        if (vec.magnitudeSquared() == 0) {
            return true;
        }
        let minT = tri.v1.dot(vec);
        let maxT = minT;
        let p = tri.v2.dot(vec);
        if (p < minT) {
            minT = p;
        } else if (p > maxT) {
            maxT = p;
        }
        p = tri.v3.dot(vec);
        if (p < minT) {
            minT = p;
        } else if (p > maxT) {
            maxT = p;
        }

        let corners = this.getPoints();
        let minB = corners[0].dot(vec);
        let maxB = minB;
        for (let i = 1; i < 8; i++) {
            p = corners[i].dot(vec);
            if (p < minB) {
                minB = p;
            } else if (p > maxB){
                maxB = p;
            }
            if (minB < maxT && maxB > minT) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns if it is colliding wwithin the edges of the triangle
     * @param {Triangle3D} tri Triangle to check collision with
     * @returns If it is colliding
     */
    isEdgeColliding(tri) {
        let a1 = new Vector3D(1, 0, 0);
        let a2 = new Vector3D(0, 1, 0);
        let a3 = new Vector3D(0, 0, 1);
        let e1 = tri.v1.copy().sub(tri.v2);
        let e2 = tri.v2.copy().sub(tri.v3);
        let e3 = tri.v3.copy().sub(tri.v1);

        return this.compare(a1.copy().cross(e1), tri) &&
               this.compare(a1.copy().cross(e2), tri) &&
               this.compare(a1.copy().cross(e3), tri) &&
               this.compare(a2.copy().cross(e1), tri) &&
               this.compare(a2.copy().cross(e2), tri) &&
               this.compare(a2.copy().cross(e3), tri) &&
               this.compare(a3.copy().cross(e1), tri) &&
               this.compare(a3.copy().cross(e2), tri) &&
               this.compare(a3.copy().cross(e3), tri);
    }
}

/**
 * Class representing a triangle in 3D space
 */
class Triangle3D {
    /**
     * Position of vertex 1
     */
    v1;
    /**
     * Position of vertex 2
     */
    v2;
    /**
     * Position of vertex 3
     */
    v3;

    /**
     * Color of the triangle
     */
    color;
    /**
     * Normal vector of the triangle
     */
    normal;
    /**
     * Axis-aligned bounding box of the triangle
     */
    aabb;
    /**
     * A number representing the distance to the camera (Equal to the distance squared times nine)
     */
    distance;

    /**
     * Creates a triangle from 3 verticies in 3D space
     * @param {Vector3D} v1 Position of vertex 1
     * @param {Vector3D} v2 Position of vertex 2
     * @param {Vector3D} v3 Position of vertex 3
     * @param {Color} color Color of the triangle
     * @param {Vector3D} normal Normal vector in world space (Leave blank to calculate)
     * @param {AABB} aabb Axis-aligned bounding box Leave blank to calculate)
     */
    constructor(v1, v2, v3, color, normal, aabb) {
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;
        this.color = color;
        if (normal == null) {
            this.normal = this.v1.copy().sub(this.v2).cross(this.v1.copy().sub(this.v3)).normalize();
        } else {
            this.normal = normal;
        }
        if (aabb == null) {
            this.aabb = new AABB([v1, v2, v3]);
        } else {
            this.aabb = aabb;
        }
        this.distance = new Vector3D(this.v1.x + this.v2.x + this.v3.x,
                                this.v1.y + this.v2.y + this.v3.y,
                                this.v1.z + this.v2.z + this.v3.z).magnitudeSquared();
    }

    /**
     * Projects the triangle to screen space
     * @param {number} ifl Inverse focal length I believe
     * @returns Triangle in screen space
     */
    project(ifl) {
        let v1 = new Vector2D(this.v1.x, this.v1.y * -1);
        v1.mult(ifl / this.v1.z);
        let v2 = new Vector2D(this.v2.x, this.v2.y * -1);
        v2.mult(ifl / this.v2.z);
        let v3 = new Vector2D(this.v3.x, this.v3.y * -1);
        v3.mult(ifl / this.v3.z);
        return new Triangle2D(v1, v2, v3, this.color, this.normal, this.distance);
    }

    /**
     * Returns an array of triangle(s) that together cover all the space of the triangle when the z position is greater than zPos
     * @param {number} zPos Z position the point must be infront of
     * @returns Array of the corrected triangle(s)
     */
    corrected(zPos) {
        let v1Corr = this.v1.z > zPos;
        let v2Corr = this.v2.z > zPos;
        let v3Corr = this.v3.z > zPos;
        if (!v1Corr) {
            if (!v2Corr) {
                if (!v3Corr) { // f f f
                    return []; // Behind Camera
                } else { // f f t
                    return [new Triangle3D(this.v1.correctPoint(this.v3, zPos),
                                           this.v2.correctPoint(this.v3, zPos),
                                           this.v3, 
                                           this.color, this.normal, this.aabb)];
                }
            } else {
                if (!v3Corr) { // f t f
                    return [new Triangle3D(this.v1.correctPoint(this.v2, zPos),
                                           this.v2, 
                                           this.v3.correctPoint(this.v2, zPos), 
                                           this.color, this.normal, this.aabb)];
                } else { // f t t
                    let v11 = this.v1.correctPoint(this.v3, zPos);
                    let v12 = this.v1.correctPoint(this.v2, zPos);
                    return [new Triangle3D(this.v3, v11, v12, this.color, this.normal, this.aabb), 
                            new Triangle3D(v12, this.v2, this.v3, this.color, this.normal, this.aabb)];
                }
            }
        } else {
            if (!v2Corr) {
                if (!v3Corr) { // t f f
                    return [new Triangle3D(this.v1, 
                                           this.v2.correctPoint(this.v1, zPos), 
                                           this.v3.correctPoint(this.v1, zPos),
                                           this.color, this.normal, this.aabb)];
                } else { // t f t
                    let v21 = this.v2.correctPoint(this.v1, zPos);
                    let v22 = this.v2.correctPoint(this.v3, zPos);
                    return [new Triangle3D(this.v1, v21, v22, this.color, this.normal, this.aabb), 
                            new Triangle3D(v22, this.v3, this.v1, this.color, this.normal, this.aabb)];
                }
            } else {
                if (!v3Corr) { // t t f
                    let v31 = this.v3.correctPoint(this.v2, zPos);
                    let v32 = this.v3.correctPoint(this.v1, zPos);
                    return [new Triangle3D(this.v2, v31, v32, this.color, this.normal, this.aabb), 
                            new Triangle3D(v32, this.v1, this.v2, this.color, this.normal, this.aabb)];
                } else { // t t t
                    return [this];
                }
            }
        }
    }

    /**
     * Returns a triangle offset then with a rotation matrix applied
     * @param {Vector3D} vec Vector to offset by
     * @param {number[]} rotMat Rotation matrix to apply
     * @returns Triangle after all transformations
     */
    translate(vec, rotMat) {
        return new Triangle3D(this.v1.translate(vec, rotMat), 
                              this.v2.translate(vec, rotMat), 
                              this.v3.translate(vec, rotMat),
                              this.color, 
                              this.normal,
                              this.aabb);
    }
}

/**
 * Class representing a triangle in 2D space
 */
class Triangle2D {
    /**
     * Position of vertex 1
     */
    v1;
    /**
     * Position of vertex 2
     */
    v2;
    /**
     * Position of vertex 3
     */
    v3;

    /**
     * Color of the triangle
     */
    color;
    /**
     * Normal vector of the triangle in world space
     */
    normal;
    /**
     * Distance from the camera
     */
    distance;
    /**
     * Creates a triangle from 3 verticies in 2D space
     * @param {Vector2D} v1 Position of vertex 1
     * @param {Vector2D} v2 Position of vertex 2
     * @param {Vector2D} v3 Position of vertex 3
     * @param {Color} color Color of the triangle
     * @param {Vector3D} normal Normal vector in world space
     * @param {number} distance Distance from the camera in world space
     */
    constructor(v1, v2, v3, color, normal, distance) {
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;
        this.color = color;
        this.normal = normal;
        this.distance = distance;
    }
}

function mouseWheel(event) {
    if (isSpace) {
        spaceInstance.updateScale(event.delta, 1 / frameRate());
    }
}

function setup() {
    SCREEN_HEIGHT = windowHeight - 4;
    SCREEN_WIDTH = windowWidth;
    
    createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);

    isSpace = true;
    spaceInstance = new Space(3);

    frameRate(30);

}

function draw() {
    let delta = 1 / frameRate();
    if (frameRate() < 5) {
        delta = 1 / 30;
    }

    if (isSpace) {
        spaceInstance.run(delta, new Vector2D(SCREEN_WIDTH, SCREEN_HEIGHT).mult(0.5), 1000);
    } else {
        planetInstance.run(delta);
    }
}

/**
 * Class representing a layer of perlin noise
 */
class PerlinLayer {
    /**
     * Size between each vertex of the perlin noise
     */
    scale;
    /**
     * 2D array containing the angles of each vertex
     */
    values;
    /**
     * Position of the corner in the negitive x & z and minimum y value
     */
    pos;

    /**
     * Creates a layer of perlin noise
     * @param {Vector3D} pos Position of the layer
     * @param {number} w Width of the layer
     * @param {number} h Height of the layer
     * @param {number} scale Size between each vertex
     */
    constructor(pos, w, h, scale) {
        let posx = floor(pos.x / scale) * scale;
        let posz = floor(pos.z / scale) * scale;
        this.pos = new Vector3D(posx, 0, posz);
        this.scale = scale;
        this.values = [];

        let row = 0;
        for (let i = this.pos.z; i < (ceil((pos.z + h) / this.scale) + 1) * this.scale; i+=this.scale) {
            this.values.push([]);
            for (let j = this.pos.x; j < (ceil((pos.x + w) / this.scale) + 1) * this.scale; j+=this.scale) {
                let angle = this.hash(j, i, scale);
                this.values[row].push(new Vector2D(cos(angle), sin(angle)));
            }
            row++;
        }
    }

    /**
     * Returns a deterministically random number based on the three input values
     * @param {number} x Number 1
     * @param {number} z Number 2
     * @param {number} seed Number 3
     * @returns A deterministic random number
     */
    hash(x, z, seed = 0) {
        let h = seed ^ Math.imul(x, 0x27d4eb2d) ^ Math.imul(z, 0x165667b1);
        h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
        h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
        return ((h ^ (h >>> 16)) >>> 0) % TWO_PI;
    }

    /**
     * Returns the value of the perlin noise 
     * @param {Vector3D} pos 
     * @returns Value between 0 and 1
     */
    getValue(pos) {
        let x = (pos.x - this.pos.x) / this.scale;
        let z = (pos.z - this.pos.z) / this.scale;
        let x0 = floor(x);
        let z0 = floor(z);

        let sx = x - x0;
        let sz = z - z0;

        let left = this.dotGridGradient(x0, z0, x, z);
        let right = this.dotGridGradient(x0 + 1, z0, x, z);
        let h1 = this.interpolate(left, right, sx);

        left = this.dotGridGradient(x0, z0 + 1, x, z);
        right = this.dotGridGradient(x0 + 1, z0 + 1, x, z);
        let h2 = this.interpolate(left, right, sx);

        let v = this.interpolate(h1, h2, sz);
        
        return (v + 1) * 0.5;
    }

    /**
     * Returns a value somwhere between a0 and a1
     * @param {number} a0 Value from point 1
     * @param {number} a1 Value from point 2
     * @param {number} w Distance from a0 where 1 is at a1
     * @returns 
     */
    interpolate(a0, a1, w) {
        return (a1 - a0) * (3 - w * 2) * w * w + a0;
    }

    /**
     * Returns the dot product of the corner (ix,iz) and the relative position to (x,z)
     * @param {number} ix X value of the corner
     * @param {number} iz Z value of the corner
     * @param {number} x X value to calculate for
     * @param {number} z Z value to calculate for
     * @returns Dot product of the vector for point (ix, iz) and the vector to position (x, y)
     */
    dotGridGradient(ix, iz, x, z) {
        let gradient = this.values[iz][ix];
        let dx = x - ix;
        let dz = z - iz;

        return dx * gradient.x + dz * gradient.y;
    }
}

/**
 * Class representing perlin noise
 */
class PerlinNoise {
    /**
     * Array containing the layers of perlin noise
     */
    layers;
    /**
     * Array containing the weights of each layer of perlin noise
     */
    weights;

    constructor(scales, pos, w, h, weights) {
        this.weights = weights
        this.layers = [];
        for (let i = 0; i < scales.length; i++) {
            this.layers.push(new PerlinLayer(pos, w, h, scales[i]));
        }
    }

    getValue(pos) {
        let sum = 0;
        for (let i = 0; i < this.layers.length; i++) {
            sum += this.layers[i].getValue(pos) * this.weights[i];
        }
        return sum;
    }
}