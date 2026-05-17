'use strict'

// TODO: split the js code into organized files: main.js, board.js, globals.js, button-clicks.js, helper-functions.js, 
//       buttons-active-state.js
// TODO: split css code into files: main.css, board.css, btns-special.css, header-footer.css, best-scores.css, 
//       face-and-data.css, dark-mode.css, lives-and-hints.css.

function onInit() {
    gStartTime = 0;
    gIsHintClicked = false;
    resetManualMode();
    resetMegaHint();
    clearInterval(gTimerIntervalId);
    clearTimeout(gHintTimeoutId);
    clearTimeout(gSafeClickTimeoutid);
    if (!gLevel) gLevel = LEVELS.BEGGINER;
    gGame = {
        isOn: false,
        revealedCount: 0,
        markedCount: 0,
        minesCount: 0,
        secsPassed: 0,
        lives: LIVES_AMOUNT,
        hints: HINTS_AMOUNT,
        safeClicks: SAFE_CLICKS_AMOUNT,
        moves: 0
    };
    gBoard = buildCleanBoard();
    gGameMoves = [];
    renderAll();
    handleButtonsActiveState();
}

function resetManualMode() {
    gIsManualModeOn = false;
    const elBtn = document.querySelector('.btn-manual-mode');
    elBtn.classList.remove('manual-mode');
}

function resetMegaHint() {
    gMegaHintMode = {locations: [], isOn: false, isUsed: false};
    const elBtn = document.querySelector('.btn-mega-hint');
    elBtn.classList.remove('mega-hint');
}

function renderAll() {
    renderBoard();
    updateMarkedMines(0);
    changeFace(FACE_SMILE_HTML);
    updateTime();
    updateLives(0);
    updateHints(0);
    renderBestScoresBoard();
    updateSafeClicks(0);
    updateUndoClicks();
}

function copyGame(game) {
    return {
        isOn: game.isOn,
        revealedCount: game.revealedCount,
        markedCount: game.markedCount,
        minesCount: game.minesCount,
        secsPassed: game.secsPassed,
        lives: game.lives,
        hints: game.hints,
        safeClicks: game.safeClicks,
        moves: game.moves
    };
}

function updateMarkedMines(markedMinesDiff) {
    gGame.markedCount += markedMinesDiff;
    const unmarkedMines = gGame.minesCount - gGame.markedCount;
    const elUnmarkedMines = document.querySelector('.unmarked-mines span');
    elUnmarkedMines.innerText = unmarkedMines;
}

function updateTime() {
    const time = gStartTime ? parseInt((Date.now() - gStartTime) / SECOND) : 0;
    const elTime = document.querySelector('.time span');
    elTime.innerText = time;
    gGame.secsPassed = time;
}

function updateLives(livesDiff) {
    gGame.lives += livesDiff;
    const elLives = document.querySelector('.lives');
    elLives.innerHTML = LIFE_HTML.repeat(gGame.lives);
}

function updateHints(hintsDiff) {
    gGame.hints += hintsDiff;
    const elHints = document.querySelector('.hints');
    elHints.innerHTML = HINT_OFF_HTML.repeat(gGame.hints);
}

function updateSafeClicks(safeClicksDiff) {
    gGame.safeClicks += safeClicksDiff;
    const elClicksAvailable = document.querySelector('.safe-click-container span');
    elClicksAvailable.innerText = gGame.safeClicks;
}

function updateUndoClicks() {
    const elClicksAvailable = document.querySelector('.undo-container span');
    elClicksAvailable.innerText = gGame.moves;
}

function updateGameMoves(gameMovesDiff) {
    if (gameMovesDiff >= 0) {
        gGameMoves.push({board: copyBoard(gBoard), game: copyGame(gGame)});
        gGame.moves += gameMovesDiff;
        updateUndoClicks();
        handleButtonsActiveState()
    } else {
        const gameMove = gGameMoves.pop();
        gBoard = gameMove.board;
        gGame = gameMove.game;
        renderAll();
        handleButtonsActiveState()
    }
}

function startGame(clickedCellLocation) {
    if (!gGame.minesCount) fillBoard(gBoard, clickedCellLocation);
    gStartTime = Date.now();
    gTimerIntervalId = setInterval(updateTime, TIMER_INTERVAL_TIMEOUT);
    gGame.isOn = true;
}

function checkGameFinished(elCell, clickedCell, isClickedMine) {
    if (isClickedMine) handleMineClick(elCell, clickedCell);
    else if (isGameWon()) handleGameWon();
}

function isGameFinished() {
    return !gGame.isOn && gStartTime > 0;
}

function isGameWon() {
    return gGame.revealedCount == Math.pow(gLevel.SIZE, 2) - gGame.minesCount;
}

function handleGameWon() {
    changeFace(FACE_WIN_HTML);
    markAllMines();
    clearInterval(gTimerIntervalId);
    gGame.isOn = false;
    handleBestScore();
    renderBestScoresBoard();
    handleButtonsActiveState();
}

function changeFace(faceHTML) {
    const elFace = document.querySelector('.face');
    elFace.innerHTML = faceHTML;
}