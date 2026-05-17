'use strict'

function onCellEntered(i, j) {
    if (gMegaHintMode.locations.length > 0) {
        // unhighlight all cells before highlighting the current area:
        clearHighlightedCells();
        
        // highlight the area between the first click and the current cell hovered:
        const location1 = gMegaHintMode.locations[0], location2 = {i, j};
        const highlightFunc = (cell, location) => getCellElement(location).classList.add('highlight');
        manipulateAreaBetweenLocations(gBoard, location1, location2, highlightFunc);
    }
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
        const i = +gElCellDownClicked.dataset.i, j = +gElCellDownClicked.dataset.j;
        unshowNegs(gElCellDownClicked, i, j);
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

function onCellMarked(elCell, i, j) {
    if (isGameFinished()) return;

    const clickedCell = gBoard[i][j];

    if (clickedCell.isRevealed) return;
    if (clickedCell.isMarked) unmarkCell(elCell, clickedCell);
    else markCell(elCell, clickedCell);
}

function onLevelClick(elBtn) {
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
    const isSafeLocation = (location, board) => {
        const cell = board[location.i][location.j];
        return !cell.isMine && !cell.isRevealed;
    };
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
    if (gMegaHintMode.isOn) {
        gMegaHintMode.locations = [];
        clearHighlightedCells();
    }
    gMegaHintMode.isOn = !gMegaHintMode.isOn;
    elBtn.classList.toggle('mega-hint');
}

function onExterminateMinesClick() {
    if (!gGame.isOn) return;
    for (let i = 0; i < EXTERMINATE_MINES_AMOUNT; i++) {
        const isMineLocationFunc = (location, board) => {
            const cell = board[location.i][location.j];
            return cell.isMine;
        };
        const mineLocation = getRandomSpecificLocation(gBoard, isMineLocationFunc);
        if (!mineLocation) break;
        const cell = gBoard[mineLocation.i][mineLocation.j];
        cell.isMine = false;
        gGame.minesCount--;
    }
    setMinesNegsCount(gBoard);
    renderBoard();
    updateMarkedMines(0)
    handleButtonsActiveState();
}