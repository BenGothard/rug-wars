const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const GRAVITY = 0.5;
const FLOOR = canvas.height - 20;
let rugCollapse = false;

class Player {
    constructor(x, color, controls, ai = false) {
        this.x = x;
        this.y = FLOOR;
        this.vx = 0;
        this.vy = 0;
        this.color = color;
        this.controls = controls;
        this.width = 20;
        this.height = 20;
        this.onGround = true;
        this.facing = 1;
        this.ai = ai;
        this.cooldown = 0;
        this.hp = 3;
    }

    handleInput(keys, target) {
        if (this.ai) {
            // Simple AI: move towards target and occasionally jump or shoot
            if (target.x < this.x) {
                this.vx = -2;
                this.facing = -1;
            } else {
                this.vx = 2;
                this.facing = 1;
            }
            if (this.onGround && Math.random() < 0.01) {
                this.vy = -10;
                this.onGround = false;
            }
            if (this.cooldown <= 0 && Math.random() < 0.03) {
                this.shoot();
                this.cooldown = 30; // frames
            }
        } else {
            if (keys[this.controls.left]) {
                this.vx = -2;
                this.facing = -1;
            } else if (keys[this.controls.right]) {
                this.vx = 2;
                this.facing = 1;
            } else {
                this.vx = 0;
            }

            if (keys[this.controls.jump] && this.onGround) {
                this.vy = -10; // Pepe Hop
                this.onGround = false;
            }
            if (keys[this.controls.dash]) {
                this.vx *= 3; // Doge Rocket
            }
            if (keys[' '] && this.cooldown <= 0) {
                this.shoot();
                this.cooldown = 20;
            }
        }
        if (this.cooldown > 0) this.cooldown--;
    }

    update() {
        this.vy += GRAVITY;
        this.x += this.vx;
        this.y += this.vy;

        if (this.y >= FLOOR) {
            this.y = FLOOR;
            this.vy = 0;
            this.onGround = true;
        }
    }

    shoot() {
        const projX = this.facing === 1 ? this.x + this.width : this.x - 5;
        projectiles.push(new Projectile(projX, this.y - this.height / 2, this.facing * 5, this));
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y - this.height, this.width, this.height);
        ctx.fillStyle = 'white';
        ctx.font = '12px sans-serif';
        ctx.fillText('HP: ' + this.hp, this.x - 5, this.y - this.height - 5);
    }
}

class Projectile {
    constructor(x, y, vx, owner) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.owner = owner;
        this.width = 5;
        this.height = 5;
    }

    update() {
        this.x += this.vx;
    }

    draw() {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

const keys = {};
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

const projectiles = [];

const players = [
    new Player(100, 'cyan', {left: 'a', right: 'd', jump: 'w', dash: 's'}),
    new Player(600, 'orange', {left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp', dash: 'ArrowDown'}, true)
];

function update() {
    if (Math.random() < 0.001 && !rugCollapse) {
        rugCollapse = true; // Rug Alert!
    }

    players.forEach((p, idx) => {
        const target = players[1 - idx];
        p.handleInput(keys, target);
        p.update();
        if (rugCollapse && p.y > FLOOR - 100) {
            p.y += 2; // simulate falling with rug collapse
        }
    });

    // update projectiles and handle collisions
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        proj.update();

        // remove if off screen
        if (proj.x < 0 || proj.x > canvas.width) {
            projectiles.splice(i, 1);
            continue;
        }

        players.forEach(p => {
            if (p !== proj.owner &&
                proj.x < p.x + p.width &&
                proj.x + proj.width > p.x &&
                proj.y < p.y &&
                proj.y + proj.height > p.y - p.height) {
                projectiles.splice(i, 1);
                p.hp -= 1;
                if (p.hp < 0) p.hp = 0;
            }
        });
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'red';
    if (rugCollapse) {
        ctx.fillRect(0, FLOOR - 80, canvas.width, 100); // collapse area
    } else {
        ctx.fillRect(0, FLOOR, canvas.width, 20);
    }
    players.forEach(p => p.draw());
    projectiles.forEach(p => p.draw());
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
