const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Настройки поля 12x12
const mapSize = 12; 
const screenWidth = window.innerWidth * 0.9;
const tile = Math.floor(screenWidth / mapSize);
canvas.width = tile * mapSize;
canvas.height = tile * mapSize;

let map = [];
let player = {x: 1, y: 1};
let hearts = 0;

function generateLevel() {
    map = [];
    for (let y = 0; y < mapSize; y++) {
        map[y] = [];
        for (let x = 0; x < mapSize; x++) {
            // Края - стены, внутри - розовый фон
            if (x === 0 || y === 0 || x === mapSize - 1 || y === mapSize - 1) {
                map[y][x] = 1;
            } else {
                map[y][x] = 0;
            }
        }
    }

    // Выход в углу
    map[mapSize - 2][mapSize - 2] = 3;

    // Добавляем препятствия
    for (let i = 0; i < 22; i++) {
        let rx = Math.floor(Math.random() * (mapSize - 2)) + 1;
        let ry = Math.floor(Math.random() * (mapSize - 2)) + 1;
        if ((rx === 1 && ry === 1) || (rx === mapSize - 2 && ry === mapSize - 2)) continue;
        if ((rx === 1 && ry === 2) || (rx === 2 && ry === 1)) continue;
        map[ry][rx] = 1;
    }

    // Расставляем сердечки (8 штук)
    let placed = 0;
    while (placed < 8) {
        let rx = Math.floor(Math.random() * (mapSize - 2)) + 1;
        let ry = Math.floor(Math.random() * (mapSize - 2)) + 1;
        if (map[ry][rx] === 0 && (rx !== 1 || ry !== 1)) {
            map[ry][rx] = 2;
            placed++;
        }
    }
    player = {x: 1, y: 1};
    countHearts();
}

function countHearts() {
    hearts = 0;
    for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
            if (map[y][x] === 2) hearts++;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
            const v = map[y][x];
            // Фон клеток (темно-вишневый)
            ctx.fillStyle = '#5e2a42';
            ctx.fillRect(x * tile, y * tile, tile, tile);
            
            if (v === 1) { // Препятствия
                ctx.fillStyle = '#8a3a61';
                ctx.fillRect(x * tile + 2, y * tile + 2, tile - 4, tile - 4);
            } else if (v === 2) { // Сердечки
                ctx.font = `${tile * 0.6}px serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText('❤️', x * tile + tile / 2, y * tile + tile / 2);
            } else if (v === 3) { // Финиш
                ctx.font = `${tile * 0.6}px serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(hearts === 0 ? '🎁' : '🔒', x * tile + tile / 2, y * tile + tile / 2);
            }
        }
    }
    // Панда
    ctx.font = `${tile * 0.8}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText('🐼', player.x * tile + tile / 2, player.y * tile + tile / 2);
}

window.move = function(dx, dy) {
    const nx = player.x + dx;
    const ny = player.y + dy;
    if (ny < 0 || ny >= mapSize || nx < 0 || nx >= mapSize) return;
    if (map[ny][nx] === 1) return;

    player.x = nx;
    player.y = ny;

    if (map[ny][nx] === 2) {
        map[ny][nx] = 0;
        countHearts();
    }

    if (map[ny][nx] === 3 && hearts === 0) {
        tg.showAlert('💖 Панда донесла все сердечки! Ты чудо! 💖', () => {
            tg.close();
        });
    }
    draw();
};

generateLevel();
draw();
