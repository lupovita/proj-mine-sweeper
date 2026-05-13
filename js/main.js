'use strict'

const LEVELS = {
    BEGGINER: {SIZE: 4, MINES: 2},
    MEDIUM: {SIZE: 8, MINES: 14},
    EXPERT: {SIZE: 12, MINES: 32}
};

const CLASS_BEGGINER = 'btn-begginer', CLASS_MEDIUM = 'btn-medium', CLASS_EXPERT = 'btn-expert'

const SECOND = 1000;
const TIMER_INTERVAL_TIMEOUT = 500;

const MINE_HTML = getImgHTML('mine', false);
const FLAG_HTML = getImgHTML('flag', false);
const FACE_CLICK = getImgHTML('face-click', true);
const FACE_LOSE = getImgHTML('face-lose', true);
const FACE_SMILE = getImgHTML('face-smile', true);
const FACE_WIN = getImgHTML('face-win', true);

var gStartTime;
var gTimerIntervalId;
var gLevel;
var gGame;
var gBoard;


function onInit() {
    gStartTime = 0;
    clearInterval(gTimerIntervalId);
    if (!gLevel) gLevel = LEVELS.BEGGINER;
    gGame = {
        isOn: false,
        revealedCount: 0,
        markedCount: 0,
        secsPassed: 0
    };
    gBoard = buildCleanBoard();
    renderBoard();
    updateUnmarkedMines();
    changeFace(FACE_SMILE);
    updateTime();
}

function buildCleanBoard() {
    const board = [];

    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([]);
        for (var j = 0; j < gLevel.SIZE; j++) {
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
}

function renderBoard() {
    var strHTML = '';
    
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += `<tr>\n`;
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j];
            const className = getClassName(cell);
            strHTML += `\t<td 
                            class="${className}" 
                            data-i="${i}" data-j="${j}"
                            onpointerdown="onCellDownClicked(this, ${i}, ${j}, event)"
                            onpointerup="onCellUpClicked(this, ${i}, ${j}, event)"
                            onclick="onCellClicked(this, ${i}, ${j})"
                            oncontextmenu="onCellMarked(this, ${i}, ${j}); return false;"
                            onmousewheel="onShowNegs(this, ${i}, ${j})">\n
                            \t${getCellInnerHTML(cell)}\n
                         </td>\n`;
        }
        strHTML += `</tr>\n`;
    }

    const elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
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

function updateUnmarkedMines() {
    const unmarkedMines = gLevel.MINES - gGame.markedCount;
    const elUnmarkedMines = document.querySelector('.unmarked-mines span');
    elUnmarkedMines.innerText = unmarkedMines;
}

function updateTime() {
    const time = gStartTime ? parseInt((Date.now() - gStartTime) / SECOND) : 0;
    const elTime = document.querySelector('.time span');
    elTime.innerText = time;
    gGame.secsPassed = time;
}

function onCellDownClicked(elCell, i, j, ev) {
    if (isGameFinished()) return;
    changeFace(FACE_CLICK);
    if (ev.button === 1) showNegs(elCell, i, j);
}

function onCellUpClicked(elCell, i, j, ev) {
    if (isGameFinished()) return;
    changeFace(FACE_SMILE);
    if (ev.button === 1) unshowNegs(elCell, i, j);
}

function onCellClicked(elCell, i, j) {
    if (isGameFinished()) return;

    const clickedCell = gBoard[i][j];

    if (clickedCell.isRevealed || clickedCell.isMarked) return;
    if (!gGame.isOn) {
        startGame({i, j});
        elCell = getCellElement({i, j});
    }

    revealCell(elCell, clickedCell);

    if (!clickedCell.isMine && clickedCell.minesAroundCount === 0) expandReveal(gBoard, elCell, i, j);

    checkGameFinished(clickedCell.isMine);
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

function checkGameFinished(isClickedMine) {
    if (isClickedMine) {
        changeFace(FACE_LOSE);
        revealAllMines();
        clearInterval(gTimerIntervalId);
        gGame.isOn = false;
    }
    else if (isGameWon()) {
        changeFace(FACE_WIN);
        markAllMines();
        clearInterval(gTimerIntervalId);
        gGame.isOn = false;
    }
}

function expandReveal(board, elCell, i, j) {
    var revealNegCells = (cell, location) => {
            if (!cell.isRevealed && !cell.isMine) {
                const elCell = getCellElement(location);
                revealCell(elCell, cell);
                if (cell.minesAroundCount === 0) expandReveal(board, elCell, location.i, location.j);
            }
        };
    forEachNeg(board, i, j, revealNegCells);
}

function revealAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j];
            if (cell.isMine && !cell.isRevealed) {
                const elCell = getCellElement({i, j});
                revealCell(elCell, cell);
            }
        }
    }
}

function markAllMines() {
    if (gGame.markedCount === gLevel.MINES) return;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j];
            if (cell.isMine && !cell.isMarked) {
                const elCell = getCellElement({i, j});
                markCell(elCell, cell);
            }
        }
    }
}

function revealCell(elCell, cell) {
    if (cell.isRevealed) return;
    cell.isRevealed = true;
    elCell.innerHTML = getCellInnerHTML(cell);
    elCell.classList.add('revealed');
    if (!cell.isMine) gGame.revealedCount++;
}

function markCell(elCell, cell) {
    if (cell.isMarked) return;
    cell.isMarked = true;
    elCell.innerHTML = getCellInnerHTML(cell);
    gGame.markedCount++;
    updateUnmarkedMines();
}

function unmarkCell(elCell, cell) {
    cell.isMarked = false;
    elCell.innerHTML = getCellInnerHTML(cell);
    gGame.markedCount--;
    updateUnmarkedMines();
}

function fillBoardWithMines(board, isAvailableLocationFunc, minesAmount) {
    for (var i = 0; i < minesAmount; i++) {
        const availableLocation = getRandomAvailableLocation(board, isAvailableLocationFunc);
        if (!availableLocation) break;
        board[availableLocation.i][availableLocation.j].isMine = true;
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var count = 0;
            forEachNeg(board, i, j, (cell) => count = cell.isMine ? ++count : count);
            board[i][j].minesAroundCount = count;
        }
    }
}

function startGame(clickedCellLocation) {
    fillBoard(gBoard, clickedCellLocation);
    renderBoard();
    gStartTime = Date.now();
    gTimerIntervalId = setInterval(updateTime, TIMER_INTERVAL_TIMEOUT);
    gGame.isOn = true;
}

function isGameFinished() {
    return !gGame.isOn && gStartTime > 0;
}

function isGameWon() {
    return gGame.revealedCount == Math.pow(gLevel.SIZE, 2) - gLevel.MINES;
}

function changeFace(faceHTML) {
    const elFace = document.querySelector('.face');
    elFace.innerHTML = faceHTML;
}

function getImgHTML(imgName, isFace) {
    const onClickHTML = isFace ? 'onclick="onInit()"' : ''
    return `<img src="images/${imgName}.png" ${onClickHTML}>`;
}