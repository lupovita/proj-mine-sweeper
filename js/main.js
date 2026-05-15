'use strict'

const LEVELS = {
    BEGGINER: {SIZE: 4, MINES: 2},
    MEDIUM: {SIZE: 8, MINES: 14},
    EXPERT: {SIZE: 12, MINES: 32}
};

const CLASS_BEGGINER = 'btn-begginer', CLASS_MEDIUM = 'btn-medium', CLASS_EXPERT = 'btn-expert'

const SECOND = 1000;
const TIMER_INTERVAL_TIMEOUT = 500;
const MINE_CLICK_TIMEOUT = 500;
const HINT_CLICK_TIMEOUT = 1500;
const SAFE_CLICK_TIMEOUT = 1500;
const MEGA_HINT_CLICK_TIMEOUT = 2000;
const LIVES_AMOUNT = 3;
const HINTS_AMOUNT = 3;
const LEVELS_AMOUNT = 3;
const SAFE_CLICKS_AMOUNT = 3;
const EXTERMINATE_MINES_AMOUNT = 3;

const MINE_HTML = getImgHTML('mine', 'png');
const FLAG_HTML = getImgHTML('flag', 'png');
const FACE_CLICK_HTML = getImgHTML('face-click', 'png', 'onInit()');
const FACE_LOSE_HTML = getImgHTML('face-lose', 'png', 'onInit()');
const FACE_SMILE_HTML = getImgHTML('face-smile', 'png', 'onInit()');
const FACE_WIN_HTML = getImgHTML('face-win', 'png', 'onInit()');
const LIFE_HTML = getImgHTML('life', 'gif');
const CLOCK_HTML = getImgHTML('clock', 'png');
const EXPLOSION_HTML = getImgHTML('explosion', 'gif');
const HINT_ON_HTML = getImgHTML('hint-on', 'png', 'onHintClick(this)');
const HINT_OFF_HTML = getImgHTML('hint-off', 'png', 'onHintClick(this)');
const HINT_ON_SRC = 'images/hint-on.png';
const HINT_OFF_SRC = 'images/hint-off.png';
const DARK_MODE_SRC = 'images/dark-mode.png'
const LIGHT_MODE_SRC = 'images/light-mode.png'

var gStartTime;
var gTimerIntervalId;
var gLevel;
var gGame;
var gBoard;
var gElCellDownClicked;
var gIsHintClicked;
var gHintTimeoutId;
var gSafeClickTimeoutid;
var gGameMoves;
var gIsManualModeOn;
var gMegaHintMode;

// TODO: split the js code into organized files: main.js, board.js, globals.js, button-clicks.js, helper-functions.js, 
//       buttons-active-state.js
// TODO: split css code into files: main.css, board.css, btns-special.css, header-footer.css, best-scores.css, 
//       face-and-data.css, dark-mode.css, lives-and-hints.css.
// TODO: megaHintMode: when gMegaHintMode is on, when gMegaHintMode.locations.length > 0: add '.highlight' class to all the cells between the cell being hovered to the cell saved in locations in the function onCellHovered(this).
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

function handleButtonsActiveState() {
    // unclickable before game starts: hint, safe-click, undo, mega-hint, exterminate.
    if (!gGame.isOn && gStartTime === 0) handleButtonsActivateStateBeforeGameStarts();

    else if (gGame.isOn) handleButtonsActiveStateWhenGameIsOn();

    else if (isGameFinished()) handleButtonsActiveStateWhenGameIsFinished();
}

function handleButtonsActivateStateBeforeGameStarts() {
    for (const elHint of document.querySelectorAll('.hints img')) {
        elHint.classList.add('unclickable');
    }

    for (const elBtn of document.querySelectorAll('.btns-special .btn')) {
        if (elBtn.classList.contains('btn-dark-light-mode')) continue;
        else if (elBtn.classList.contains('btn-manual-mode')) elBtn.classList.remove('unclickable');
        else elBtn.classList.add('unclickable');
    }

    for (const elBtn of document.querySelectorAll('.btns-levels .btn')) {
        elBtn.classList.remove('unclickable');
    }
}

function handleButtonsActivationAfterGameStarts() {
    for (const elBtn of document.querySelectorAll('.btns-special .btn')) {
        if (elBtn.classList.contains('btn-dark-light-mode')) continue;
        else if (elBtn.classList.contains('btn-manual-mode')) elBtn.classList.add('unclickable');
        else elBtn.classList.remove('unclickable');
    }

    for (const elBtn of document.querySelectorAll('.btns-levels .btn')) {
        elBtn.classList.add('unclickable');
    }
}

function handleButtonsActiveStateWhenGameIsOn() {
    handleButtonsActivationAfterGameStarts();

    if (gIsHintClicked) {
        for (const elHint of document.querySelectorAll('.hints img')) {
            if (elHint.src.includes(HINT_OFF_SRC)) elHint.classList.add('unclickable');
        }
    }
    else {
        for (const elHint of document.querySelectorAll('.hints img')) {
            elHint.classList.remove('unclickable');
        }
    }

    if (gGame.safeClicks === 0) addUnclickable('.btn-safe-click');
    else removeUnclickable('.btn-safe-click');

    if (gGame.moves === 0) addUnclickable('.btn-undo');
    else removeUnclickable('.btn-undo');

    if (gMegaHintMode.isUsed) addUnclickable('.btn-mega-hint');

    if (gGame.minesCount === 0) addUnclickable('.btn-exterminate-mines');
}

function handleButtonsActiveStateWhenGameIsFinished() {
    for (const elHint of document.querySelectorAll('.hints img')) {
        elHint.classList.add('unclickable');
    }

    for (const elBtn of document.querySelectorAll('.btns-special .btn')) {
        if (elBtn.classList.contains('btn-dark-light-mode')) continue;
        elBtn.classList.add('unclickable');
    }

    for (const elBtn of document.querySelectorAll('.btns-levels .btn')) {
        elBtn.classList.remove('unclickable');
    }
}

function addUnclickable(selector) {
    document.querySelector(selector).classList.add('unclickable');
}

function removeUnclickable(selector) {
    document.querySelector(selector).classList.remove('unclickable');
}

function buildCleanBoard() {
    const board = [];

    for (let i = 0; i < gLevel.SIZE; i++) {
        board.push([]);
        for (let j = 0; j < gLevel.SIZE; j++) {
            const cell = {
                minesAroundCount: 0,
                isRevealed: false,
                isMine: false,
                isMarked: false
            };
            board[i].push(cell);
        }
    }
    return board;
}

function fillBoard(board, clickedCellLocation) {
    const isAvailableLocationFunc = (location, board) => 
                    !board[location.i][location.j].isMine &&
                    !(location.i === clickedCellLocation.i && location.j === clickedCellLocation.j);
    fillBoardWithMines(board, isAvailableLocationFunc, gLevel.MINES);
    setMinesNegsCount(board);
    renderBoard();
    updateMarkedMines(0);
}

function renderBoard() {
    let strHTML = '';
    
    for (let i = 0; i < gBoard.length; i++) {
        strHTML += `<tr>\n`;
        for (let j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j];
            const className = getClassName(cell);
            strHTML += `\t<td 
                            class="${className}" 
                            data-i="${i}" data-j="${j}"
                            onpointerdown="onCellDownClicked(this, ${i}, ${j}, event)"
                            onclick="onCellClicked(this, ${i}, ${j})"
                            oncontextmenu="onCellMarked(this, ${i}, ${j}); return false;" >\n
                            \t${getCellInnerHTML(cell)}\n
                         </td>\n`;
        }
        strHTML += `</tr>\n`;
    }

    const elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
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

function copyBoard(board) {
    const boardCopy = [];
    for (const row of board) {
        const rowCopy = [];
        for (const cell of row) {
            const cellCopy = {
                minesAroundCount: cell.minesAroundCount,
                isRevealed: cell.isRevealed,
                isMine: cell.isMine,
                isMarked: cell.isMarked
            };
            rowCopy.push(cellCopy);
        }
        boardCopy.push(rowCopy);
    }
    return boardCopy;
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

function getCellInnerHTML(cell) {
    if (cell.isRevealed) {
        if (cell.isMine) return MINE_HTML;
        if (cell.minesAroundCount > 0) return cell.minesAroundCount;
    }
    else if (cell.isMarked) return FLAG_HTML;

    return '';
}

function getClassName(cell) {
    const revealedClass = cell.isRevealed ? 'revealed' : '';
    const className = `cell mines-around-${cell.minesAroundCount} ${revealedClass}`;
    return className;
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

function onCellDownClicked(elCell, i, j, ev) {
    if (isGameFinished()) return;
    gElCellDownClicked = elCell;
    changeFace(FACE_CLICK_HTML);
    if (ev.button === 1) {
        showNegs(elCell, i, j);
        ev.preventDefault();
    }
}

function onKeyUpClicked(ev) {
    if (isGameFinished()) return;
    changeFace(FACE_SMILE_HTML);
    if (ev.button === 1) {
        unshowNegs(gElCellDownClicked, +gElCellDownClicked.dataset.i, +gElCellDownClicked.dataset.j);
        ev.preventDefault();
    }
}

function onCellClicked(elCell, i, j) {
    if (isGameFinished()) return;

    const clickedCell = gBoard[i][j];

    if (gIsManualModeOn) {
        setMine(elCell, clickedCell);
        return;
    }

    if (gMegaHintMode.isOn) {
        handleMegaHint({i, j});
        return;
    }

    if (clickedCell.isRevealed || clickedCell.isMarked) return;

    if (!gGame.isOn) {
        startGame({i, j});
        elCell = getCellElement({i, j});
    }

    updateGameMoves(1);

    revealCell(elCell, clickedCell);

    if (gIsHintClicked) {
        handleHint(elCell, clickedCell);
        return;
    }

    if (!clickedCell.isMine && clickedCell.minesAroundCount === 0) expandReveal(gBoard, elCell, i, j);

    checkGameFinished(elCell, clickedCell, clickedCell.isMine);
}

function setMine(elCell, clickedCell) {
    clickedCell.isMine = !clickedCell.isMine;
    gGame.minesCount += clickedCell.isMine ? 1 : -1;
    elCell.innerHTML = getCellInnerHTML(clickedCell);
    setMinesNegsCount(gBoard);
    renderBoard();
    updateMarkedMines(0);
}

function handleMegaHint(clickedCellLocation) {
    gMegaHintMode.locations.push(clickedCellLocation);
    if (gMegaHintMode.locations.length < 2) return;

    const location1 = gMegaHintMode.locations[0], location2 = gMegaHintMode.locations[1];
    const startRow = Math.min(location1.i, location2.i);
    const endRow = Math.max(location1.i, location2.i);
    const startCol = Math.min(location1.j, location2.j);
    const endCol = Math.max(location1.j, location2.j);

    updateGameMoves(0);

    const revealFunc = (cell, location) => revealCell(getCellElement(location), cell);
    forEach(gBoard, revealFunc, startRow, endRow, startCol, endCol);

    setTimeout(onUndoClick, MEGA_HINT_CLICK_TIMEOUT);

    gMegaHintMode.isOn = false;
    gMegaHintMode.isUsed = true;
    const elBtn = document.querySelector('.btn-mega-hint');
    elBtn.classList.toggle('mega-hint');
}

function onCellMarked(elCell, i, j) {
    if (isGameFinished()) return;

    const clickedCell = gBoard[i][j];

    if (clickedCell.isRevealed) return;
    if (clickedCell.isMarked) unmarkCell(elCell, clickedCell);
    else markCell(elCell, clickedCell);
}

function showNegs(elCell, i, j) {
    elCell.classList.add('revealed');
    forEachNeg(gBoard, i, j, (cell, location) => getCellElement(location).classList.add('revealed'));
}

function unshowNegs(elCell, i, j) {
    const cell = gBoard[i][j];
    if (!cell.isRevealed) elCell.classList.remove('revealed');
    forEachNeg(gBoard, i, j, (cell, location) => {
            if (!cell.isRevealed) getCellElement(location).classList.remove('revealed');
        });
}

function onLevelClick(elBtn) {
    if (gGame.isOn) return;
    if (elBtn.className.includes(CLASS_BEGGINER)) gLevel = LEVELS.BEGGINER;
    else if (elBtn.className.includes(CLASS_MEDIUM)) gLevel = LEVELS.MEDIUM;
    else gLevel = LEVELS.EXPERT;

    onInit();
}

function onHintClick(elHint) {
    if (!gGame.isOn) return;
    if (elHint.src.includes(HINT_ON_SRC)) {
        elHint.src = HINT_OFF_SRC;
        gIsHintClicked = false;
        handleButtonsActiveState();
        return;
    }
    if (gIsHintClicked) return;
    
    elHint.src = HINT_ON_SRC;
    gIsHintClicked = true;
    handleButtonsActiveState();
}

function onSafeClick() {
    if (!gGame.isOn || gGame.safeClicks === 0) return;
    updateGameMoves(1);
    updateSafeClicks(-1);
    const isSafeLocation = (location, board) => 
                    !board[location.i][location.j].isMine && !board[location.i][location.j].isRevealed;
    const safeLocation = getRandomSpecificLocation(gBoard, isSafeLocation);
    const cell = gBoard[safeLocation.i][safeLocation.j];
    const elCell = getCellElement(safeLocation);
    revealCell(elCell, cell);
    gSafeClickTimeoutid = setTimeout(unrevealCell, SAFE_CLICK_TIMEOUT, elCell, cell);
    handleButtonsActiveState();
}

function onUndoClick() {
    if (!gGame.isOn || gGame.moves === 0) return;
    updateGameMoves(-1);
}

function updateSafeClicks(safeClicksDiff) {
    gGame.safeClicks += safeClicksDiff;
    const elClicksAvailable = document.querySelector('.safe-click-container span');
    elClicksAvailable.innerText = gGame.safeClicks;
}

function onDarkLightModeClick(elBtn) {
    document.body.classList.toggle('dark-mode');
    document.querySelector('.unmarked-mines').classList.toggle('dark-mode');
    document.querySelector('.time').classList.toggle('dark-mode');
    const elImg = elBtn.querySelector('img');
    elImg.src = elImg.src.includes(DARK_MODE_SRC) ? LIGHT_MODE_SRC : DARK_MODE_SRC;
}

function onManualModeClick(elBtn) {
    if (gGame.isOn || isGameFinished()) return;
    gIsManualModeOn = !gIsManualModeOn;
    elBtn.classList.toggle('manual-mode');
    if (gIsManualModeOn) forEach(gBoard, (cell, location) => revealCell(getCellElement(location), cell));
    else forEach(gBoard, (cell, location) => unrevealCell(getCellElement(location), cell));
}

function onMegaHintClick(elBtn) {
    if (!gGame.isOn || gMegaHintMode.isUsed) return;
    gMegaHintMode.isOn = !gMegaHintMode.isOn;
    elBtn.classList.toggle('mega-hint');
}

function onExterminateMinesClick() {
    if (!gGame.isOn) return;
    for (let i = 0; i < EXTERMINATE_MINES_AMOUNT; i++) {
        const isMineLocationFunc = (location, board) => board[location.i][location.j].isMine;
        const mineLocation = getRandomSpecificLocation(gBoard, isMineLocationFunc);
        if (!mineLocation) break;
        gBoard[mineLocation.i][mineLocation.j].isMine = false;
        gGame.minesCount--;
    }
    setMinesNegsCount(gBoard);
    renderBoard();
    updateMarkedMines(0)
    handleButtonsActiveState();
}

function checkGameFinished(elCell, clickedCell, isClickedMine) {
    if (isClickedMine) handleMineClick(elCell, clickedCell);
    else if (isGameWon()) handleGameWon();
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

function updateUndoClicks() {
    const elClicksAvailable = document.querySelector('.undo-container span');
    elClicksAvailable.innerText = gGame.moves;
}

function countRevealedCells(board) {
    let count = 0;
    forEach(board, (cell) => count += cell.isRevealed ? 1 : 0);
    return count;
}

function countMarkedCells(board) {
    let count = 0;
    forEach(board, (cell) => count += cell.isMarked ? 1 : 0);
    return count;
}

function expandReveal(board, elCell, i, j) {
    let revealNegs = (cell, location) => {
            if (!cell.isRevealed && !cell.isMine && !cell.isMarked) {
                const elCell = getCellElement(location);
                revealCell(elCell, cell);
                if (cell.minesAroundCount === 0) expandReveal(board, elCell, location.i, location.j);
            }
        };
    forEachNeg(board, i, j, revealNegs);
}

function revealAllMines() {
    forEach(gBoard, (cell, location) =>
            (cell.isMine && !cell.isRevealed) ? revealCell(getCellElement(location), cell): null);
}

function markAllMines() {
    if (gGame.markedCount === gGame.minesCount) return;
    forEach(gBoard, (cell, location) =>
            (cell.isMine && !cell.isMarked) ? markCell(getCellElement(location), cell): null);
}

function revealCell(elCell, cell) {
    if (cell.isRevealed) return;
    cell.isRevealed = true;
    elCell.innerHTML = getCellInnerHTML(cell);
    elCell.classList.add('revealed');
    if (!gGame.isOn || !cell.isMine) gGame.revealedCount++;
}

function unrevealCell(elCell, cell) {
    if (!cell.isRevealed) return;
    cell.isRevealed = false;
    elCell.innerHTML = getCellInnerHTML(cell);
    elCell.classList.remove('revealed');
    if (!gGame.isOn || !cell.isMine) gGame.revealedCount--;
}

function markCell(elCell, cell) {
    if (cell.isMarked) return;
    cell.isMarked = true;
    elCell.innerHTML = getCellInnerHTML(cell);
    elCell.classList.add('marked');
    updateMarkedMines(1);
}

function unmarkCell(elCell, cell) {
    cell.isMarked = false;
    elCell.innerHTML = getCellInnerHTML(cell);
    elCell.classList.remove('marked');
    updateMarkedMines(-1);
}

function fillBoardWithMines(board, isAvailableLocationFunc, minesAmount) {
    for (let i = 0; i < minesAmount; i++) {
        const availableLocation = getRandomSpecificLocation(board, isAvailableLocationFunc);
        if (!availableLocation) break;
        board[availableLocation.i][availableLocation.j].isMine = true;
        gGame.minesCount++;
    }
}

function setMinesNegsCount(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            let count = 0;
            forEachNeg(board, i, j, (cell) => count += cell.isMine ? 1 : 0);
            const cell = board[i][j];
            cell.minesAroundCount = count;
        }
    }
}

function startGame(clickedCellLocation) {
    if (!gGame.minesCount) fillBoard(gBoard, clickedCellLocation);
    gStartTime = Date.now();
    gTimerIntervalId = setInterval(updateTime, TIMER_INTERVAL_TIMEOUT);
    gGame.isOn = true;
}

function isGameFinished() {
    return !gGame.isOn && gStartTime > 0;
}

function isGameWon() {
    return gGame.revealedCount == Math.pow(gLevel.SIZE, 2) - gGame.minesCount;
}

function changeFace(faceHTML) {
    const elFace = document.querySelector('.face');
    elFace.innerHTML = faceHTML;
}

function getImgHTML(imgName, fileType, onClickFunc=null) {
    const onClickHTML = onClickFunc ? `onclick="${onClickFunc}"` : ''
    return `<img src="images/${imgName}.${fileType}" ${onClickHTML}>`;
}

function handleMineClick(elCell, clickedCell) {
    updateLives(-1);
    if (gGame.lives > 0) {
        unrevealCell(elCell, clickedCell);
        renderMineClickEvent(elCell, clickedCell);
    }
    else {
        changeFace(FACE_LOSE_HTML);
        revealAllMines();
        clearInterval(gTimerIntervalId);
        gGame.isOn = false;
        handleButtonsActiveState();
    }

}

function renderMineClickEvent(elCell, clickedCell) {
    elCell.innerHTML = EXPLOSION_HTML;
    setTimeout(() => elCell.innerHTML = getCellInnerHTML(clickedCell), MINE_CLICK_TIMEOUT);
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

function handleHint(elCell, clickedCell) {
    clearTimeout(gHintTimeoutId);
    gHintTimeoutId = setTimeout(unrevealCell, HINT_CLICK_TIMEOUT, elCell, clickedCell);
    updateHints(-1);
    gIsHintClicked = false;
    handleButtonsActiveState();
}

function handleBestScore() {
    const bestScore = localStorage.getItem(`${getLevelString(gLevel)} score`);
    if (bestScore !== null && gGame.secsPassed >= +bestScore) return;

    const userName = prompt('Congrats! you got the best score! what is your name?');
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem(`${getLevelString(gLevel)} name`, userName);
        localStorage.setItem(`${getLevelString(gLevel)} score`, `${gGame.secsPassed}`);
    } else {
        prompt('Sorry, no Web storage support!')
    }
}

function getLevelString(level) {
    switch (level) {
        case LEVELS.BEGGINER: return 'Begginer';
        case LEVELS.MEDIUM: return 'Medium';
        case LEVELS.EXPERT: return 'Expert';
        default: return null;
    }
}

function renderBestScoresBoard() {
    let strHTML = '<tr>';
    strHTML += getBestScoresByLevelHTML('Begginer');
    strHTML += getBestScoresByLevelHTML('Medium');
    strHTML += getBestScoresByLevelHTML('Expert');
    strHTML += '</tr>'
    
    const elBestScores = document.querySelector('.best-scores tbody');
    elBestScores.innerHTML = strHTML;
}

function getBestScoresByLevelHTML(levelStr) {
    let name = localStorage.getItem(`${levelStr} name`);
    let score = localStorage.getItem(`${levelStr} score`);
    if (name === null || score === null) name = '', score = '';
    else score = +score;
    return `<td>${name}</td> <td>${score}</td>`;
}