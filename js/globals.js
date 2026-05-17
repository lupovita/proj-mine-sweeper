'use strict'

const LEVELS = {
    BEGGINER: { SIZE: 4, MINES: 2 },
    MEDIUM: { SIZE: 8, MINES: 14 },
    EXPERT: { SIZE: 12, MINES: 32 }
};

const CLASS_BEGGINER = 'btn-begginer', CLASS_MEDIUM = 'btn-medium', CLASS_EXPERT = 'btn-expert';

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
const FACE_LOSE_HTML = getImgHTML('face-lose', 'png', 'onInit()', 'Restart Game');
const FACE_SMILE_HTML = getImgHTML('face-smile', 'png', 'onInit()', 'Restart Game');
const FACE_WIN_HTML = getImgHTML('face-win', 'png', 'onInit()', 'Restart Game');
const LIFE_HTML = getImgHTML('life', 'gif');
const CLOCK_HTML = getImgHTML('clock', 'png');
const EXPLOSION_HTML = getImgHTML('explosion', 'gif');
const HINT_ON_HTML = getImgHTML('hint-on', 'png', 'onHintClick(this)', 'Cancel Hint');
const HINT_OFF_HTML = getImgHTML('hint-off', 'png', 'onHintClick(this)', 'Hint: Click a cell to reveal it for 1.5s');
const HINT_ON_SRC = 'images/hint-on.png';
const HINT_OFF_SRC = 'images/hint-off.png';
const DARK_MODE_SRC = 'images/dark-mode.png';
const LIGHT_MODE_SRC = 'images/light-mode.png';

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

function getImgHTML(imgName, fileType, onClickFunc = null, title = null) {
    const onClickHTML = onClickFunc ? `onclick="${onClickFunc}"` : '';
    const titleHTML = title ? `title="${title}"` : '';
    return `<img src="images/${imgName}.${fileType}" ${onClickHTML} ${titleHTML}>`;
}