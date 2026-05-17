'use strict'

function handleMegaHint(clickedCellLoc) {
    gMegaHintMode.locations.push(clickedCellLoc);
    if (gMegaHintMode.locations.length < 2) return;

    updateGameMoves(0);

    const location1 = gMegaHintMode.locations[0], location2 = gMegaHintMode.locations[1];
    const revealFunc = (cell, location) => revealCell(getCellElement(location), cell);

    manipulateAreaBetweenLocations(gBoard, location1, location2, revealFunc);

    setTimeout(onUndoClick, MEGA_HINT_CLICK_TIMEOUT);

    resetMegaHint();
    gMegaHintMode.isUsed = true;
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

function handleHint(elCell, clickedCell) {
    clearTimeout(gHintTimeoutId);
    gHintTimeoutId = setTimeout(unrevealCell, HINT_CLICK_TIMEOUT, elCell, clickedCell);
    updateHints(-1);
    gIsHintClicked = false;
    handleButtonsActiveState();
}