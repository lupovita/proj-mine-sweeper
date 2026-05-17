'use strict'

function getCellElement(location) {
    return document.querySelector(`[data-i="${location.i}"][data-j="${location.j}"]`)
}

function getRandomSpecificLocation(board, isSpecificLocationFunc) {
	const specificLocations = getSpecificLocations(board, isSpecificLocationFunc)

	if (specificLocations.length === 0) return null
	
	return getRandomLocation(specificLocations)
}

function getRandomLocation(locations) {
	const randIdx = getRandomInt(0, locations.length)

	return locations[randIdx]
}

function getSpecificLocations(board, isSpecificLocationFunc) {
	const res = []

	for (let i = 0; i < board.length; i++) {
		for (let j = 0; j < board[0].length; j++) {
			const location = {i, j}

			if (isSpecificLocationFunc(location, board)) {
				res.push(location)
			}
		}
	}
	return res
}

function forEachNeg(mat, rowInd, colInd, func) {
    for (let i = rowInd - 1; i <= rowInd + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (let j = colInd - 1; j <= colInd + 1; j++) {
            if (j < 0 || j >= mat[0].length) continue
            if (i === rowInd && j === colInd) continue
            const cell = mat[i][j]
            func(cell, {i, j})
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
    for (let i = startRow; i <= endRow; i++) {
        for (let j = startCol; j <= endCol; j++) {
            const cell = mat[i][j]
            func(cell, {i, j})
        }
    }
}

function manipulateAreaBetweenLocations(mat, location1, location2, func) {
        const startRow = Math.min(location1.i, location2.i);
        const endRow = Math.max(location1.i, location2.i);
        const startCol = Math.min(location1.j, location2.j);
        const endCol = Math.max(location1.j, location2.j);
        forEach(mat, func, startRow, endRow, startCol, endCol);
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