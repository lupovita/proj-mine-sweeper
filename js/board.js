'use strict'

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
                            onpointerenter="onCellEntered(${i}, ${j})"
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

function getClassName(cell) {
    const revealedClass = cell.isRevealed ? 'revealed' : '';
    const className = `cell mines-around-${cell.minesAroundCount} ${revealedClass}`;
    return className;
}

function getCellInnerHTML(cell) {
    if (cell.isRevealed) {
        if (cell.isMine) return MINE_HTML;
        if (cell.minesAroundCount > 0) return cell.minesAroundCount;
    }
    else if (cell.isMarked) return FLAG_HTML;

    return '';
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

function clearHighlightedCells() {
    const unhighlightFunc = (cell, location) => getCellElement(location).classList.remove('highlight');
    forEach(gBoard, unhighlightFunc);
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

function revealAllMines() {
    forEach(gBoard, (cell, location) =>
            (cell.isMine && !cell.isRevealed) ? revealCell(getCellElement(location), cell): null);
}

function markAllMines() {
    if (gGame.markedCount === gGame.minesCount) return;
    forEach(gBoard, (cell, location) =>
            (cell.isMine && !cell.isMarked) ? markCell(getCellElement(location), cell): null);
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

function setMine(elCell, clickedCell) {
    clickedCell.isMine = !clickedCell.isMine;
    gGame.minesCount += clickedCell.isMine ? 1 : -1;
    elCell.innerHTML = getCellInnerHTML(clickedCell);
    setMinesNegsCount(gBoard);
    renderBoard();
    updateMarkedMines(0);
}