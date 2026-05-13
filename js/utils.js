'use strict'

function renderBoard(mat, selector) {

    var strHTML = '<table border="0"><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {
            const cell = mat[i][j]
            const className = `cell cell-${i}-${j} ${cell.type}`

            strHTML += `<td class="${className}">${cell.content.dom}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'
    
    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

function renderCell(location, value) {
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

function getCellElement(location) {
    return document.querySelector(`[data-i="${location.i}"][data-j="${location.j}"]`)
}

function showGameFinishedModal(msg) {
    const elModal = document.querySelector('.game-finished-modal')
    elModal.hidden = false
    elModal.querySelector('h1').innerText = msg
}

function hideGameFinishedModal() {
    // Hide Modal
    const elModal = document.querySelector('.game-finished-modal')
    elModal.hidden = true
}

function playAudio(audioSrc) {
	const audio = new Audio(audioSrc)
	audio.volume = 0.1
	audio.play()
}

function getRandomAvailableLocation(board, isAvailableLocationFunc) {
	const availableLocations = getAvailableLocationsInBoard(board, isAvailableLocationFunc)

	if (availableLocations.length === 0) {
		return null
	}

	return getRandomLocation(availableLocations)
}

function getRandomLocation(locations) {
	const randIdx = getRandomInt(0, locations.length)

	return locations[randIdx]
}

function getAvailableLocationsInBoard(board, isAvailableLocationFunc) {
	const res = []

	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			const location = {i, j}

			if (isAvailableLocationFunc(location, board)) {
				res.push(location)
			}
		}
	}
	return res
}

function isFoodOrEmptyLocation(location, board) {
	const cell = board[location.i][location.j]

	return cell.content.type === TYPES.foodType || isEmptyLocation(location, board)
}

function isEmptyLocation(location, board) {
	const cell = board[location.i][location.j]

	return cell.content.type === TYPES.emptyType && cell.type === FLOOR
}

function forEachNeg(mat, rowInd, colInd, func) {
    for (var i = rowInd - 1; i <= rowInd + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = colInd - 1; j <= colInd + 1; j++) {
            if (j < 0 || j >= mat[0].length) continue
            if (i === rowInd && j === colInd) continue

            func(mat[i][j], {i, j})
        }
    }
    // Secret passage check
    // if (rowInd === 0) {
    //     func(mat[mat.length - 1][colInd])
    // }
    // else if (rowInd === mat.length - 1) {
    //     func(mat[0][colInd])
    // }
    // else if (colInd == 0) {
    //     func(mat[rowInd][mat[0].length - 1])
    // }
    // else if (colInd == mat[0].length - 1) {
    //     func(mat[rowInd][0])
    // }
}

function isNeg(location1, location2, mat) {
	const verticalDiff = Math.abs(location1.i - location2.i)
	const horizontalDiff = Math.abs(location1.j - location2.j)
    // const isNegNoSecretPass = verticalDiff <= 1 && horizontalDiff <= 1
    // const isNegSecretPass = horizontalDiff === mat[0].length - 1 && verticalDiff === 0 ||
    //                         verticalDiff === mat.length - 1 && horizontalDiff === 0
    // return isNegNoSecretPass || isNegSecretPass
    return verticalDiff <= 1 && horizontalDiff <= 1
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}