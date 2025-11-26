const GRID_SIZE = 4;
let grid = [];
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;

// 初期化
function init() {
    document.getElementById('best').textContent = bestScore;
    createGrid();
    addRandomTile();
    addRandomTile();
    updateDisplay();
}

// グリッドの作成
function createGrid() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    grid = [];

    for (let i = 0; i < GRID_SIZE; i++) {
        const row = document.createElement('div');
        row.className = 'grid-row';
        grid[i] = [];

        for (let j = 0; j < GRID_SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            row.appendChild(cell);
            grid[i][j] = 0;
        }
        gameBoard.appendChild(row);
    }
}

// ランダムな位置にタイルを追加
function addRandomTile() {
    const emptyCells = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] === 0) {
                emptyCells.push({row: i, col: j});
            }
        }
    }

    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
    }
}

// 表示を更新
function updateDisplay() {
    const gameBoard = document.getElementById('game-board');
    const existingTiles = gameBoard.querySelectorAll('.tile');
    existingTiles.forEach(tile => tile.remove());

    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] !== 0) {
                const tile = document.createElement('div');
                tile.className = `tile tile-${grid[i][j]}`;
                tile.textContent = grid[i][j];
                tile.style.left = (j * 90 + 10) + 'px';
                tile.style.top = (i * 90 + 10) + 'px';
                gameBoard.appendChild(tile);
            }
        }
    }

    document.getElementById('score').textContent = score;
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
        document.getElementById('best').textContent = bestScore;
    }
}

// 行を左に移動
function moveRowLeft(row) {
    const filtered = row.filter(val => val !== 0);
    const merged = [];
    let i = 0;

    while (i < filtered.length) {
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
            merged.push(filtered[i] * 2);
            score += filtered[i] * 2;
            i += 2;
        } else {
            merged.push(filtered[i]);
            i++;
        }
    }

    while (merged.length < GRID_SIZE) {
        merged.push(0);
    }

    return merged;
}

// グリッドを回転
function rotateGrid() {
    const newGrid = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        newGrid[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            newGrid[i][j] = grid[GRID_SIZE - 1 - j][i];
        }
    }
    grid = newGrid;
}

// 左に移動
function moveLeft() {
    let moved = false;
    for (let i = 0; i < GRID_SIZE; i++) {
        const originalRow = [...grid[i]];
        grid[i] = moveRowLeft(grid[i]);
        if (JSON.stringify(originalRow) !== JSON.stringify(grid[i])) {
            moved = true;
        }
    }
    return moved;
}

// 右に移動
function moveRight() {
    rotateGrid();
    rotateGrid();
    const moved = moveLeft();
    rotateGrid();
    rotateGrid();
    return moved;
}

// 上に移動
function moveUp() {
    rotateGrid();
    rotateGrid();
    rotateGrid();
    const moved = moveLeft();
    rotateGrid();
    return moved;
}

// 下に移動
function moveDown() {
    rotateGrid();
    const moved = moveLeft();
    rotateGrid();
    rotateGrid();
    rotateGrid();
    return moved;
}

// ゲームオーバー判定
function isGameOver() {
    // 空きマスがあるかチェック
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] === 0) return false;
        }
    }

    // 隣接する同じ数字があるかチェック
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const current = grid[i][j];
            if (
                (i < GRID_SIZE - 1 && grid[i + 1][j] === current) ||
                (j < GRID_SIZE - 1 && grid[i][j + 1] === current)
            ) {
                return false;
            }
        }
    }

    return true;
}

// 新しいゲーム
function newGame() {
    score = 0;
    document.getElementById('game-over').classList.remove('show');
    init();
}

// 移動処理の共通関数
function handleMove(direction) {
    if (document.getElementById('game-over').classList.contains('show')) {
        return;
    }

    let moved = false;
    switch(direction) {
        case 'left':
            moved = moveLeft();
            break;
        case 'right':
            moved = moveRight();
            break;
        case 'up':
            moved = moveUp();
            break;
        case 'down':
            moved = moveDown();
            break;
    }

    if (moved) {
        addRandomTile();
        updateDisplay();

        if (isGameOver()) {
            document.getElementById('game-over').classList.add('show');
        }
    }
}

// キーボードイベント
document.addEventListener('keydown', (e) => {
    let direction = null;
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            direction = 'left';
            break;
        case 'ArrowRight':
            e.preventDefault();
            direction = 'right';
            break;
        case 'ArrowUp':
            e.preventDefault();
            direction = 'up';
            break;
        case 'ArrowDown':
            e.preventDefault();
            direction = 'down';
            break;
    }
    
    if (direction) {
        handleMove(direction);
    }
});

// タッチイベント（スワイプ操作対応）
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

const gameBoard = document.getElementById('game-board');

gameBoard.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

gameBoard.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 30; // 最小スワイプ距離
    
    // スワイプの方向を判定
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 横方向のスワイプ
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                handleMove('right');
            } else {
                handleMove('left');
            }
        }
    } else {
        // 縦方向のスワイプ
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                handleMove('down');
            } else {
                handleMove('up');
            }
        }
    }
}, { passive: true });

// 初期化
init();