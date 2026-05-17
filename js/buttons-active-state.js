'use strict'

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