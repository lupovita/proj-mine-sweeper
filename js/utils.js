'use strict'

function getCellElement(location) {
    return document.querySelector(`[data-i="${location.i}"][data-j="${location.j}"]`)
}

function getRandomSpecificLocation(board, isSpecificLocationFunc) {
	const specificLocations = getSpecificLocationsInBoard(board, isSpecificLocationFunc)

	if (specificLocations.length === 0) return null
	
	return getRandomLocation(specificLocations)
}

function getRandomLocation(locations) {
	const randIdx = getRandomInt(0, locations.length)

	return locations[randIdx]
}

function getSpecificLocationsInBoard(board, isSpecificLocationFunc) {
	const res = []

	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			const location = {i, j}

			if (isSpecificLocationFunc(location, board)) {
				res.push(location)
			}
		}
	}
	return res
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

function forEach(mat, func, startRow=0, endRow=mat.length - 1, startCol=0, endCol=mat[0].length - 1) {
    for (var i = startRow; i <= endRow; i++) {
        for (var j = startCol; j <= endCol; j++) {
            func(mat[i][j], {i, j})
        }
    }
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