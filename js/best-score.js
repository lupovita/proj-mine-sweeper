'use strict'

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