const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const GRAVITY = 0.5;
const FLOOR = canvas.height - 20;
let rugCollapse = false;

class Player {
    constructor(x, color, controls) {
        this.x = x;
        this.y = FLOOR;
        this.vx = 0;
        this.vy = 0;
        this.color = color;
        this.controls = controls;
        this.width = 20;
        this.height = 20;
        this.onGround = true;
    }

    handleInput(keys) {
        if (keys[this.controls.left]) this.vx = -2;
        else if (keys[this.controls.right]) this.vx = 2;
        else this.vx = 0;

        if (keys[this.controls.jump] && this.onGround) {
            this.vy = -10; // Pepe Hop
            this.onGround = false;
        }
        if (keys[this.controls.dash]) {
            this.vx *= 3; // Doge Rocket
        }
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

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y - this.height, this.width, this.height);
    }
}

const keys = {};
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

const players = [
    new Player(100, 'cyan', {left: 'a', right: 'd', jump: 'w', dash: 's'}),
    new Player(600, 'orange', {left: 'ArrowLeft', right: 'ArrowRight', jump: 'ArrowUp', dash: 'ArrowDown'})
];

function update() {
    if (Math.random() < 0.001 && !rugCollapse) {
        rugCollapse = true; // Rug Alert!
    }

    players.forEach(p => {
        p.handleInput(keys);
        p.update();
        if (rugCollapse && p.y > FLOOR - 100) {
            p.y += 2; // simulate falling with rug collapse
        }
    });
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
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
