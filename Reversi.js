// Reversi.js

//Creates board and says who's turn it is
var state = {
  action: 'idle',
  over: false,
  turn: 'b',
  board: [
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,'w','b',null,null,null],
    [null,null,null,'b','w',null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null]
  ],
  points: {w: 0, b: 0}
}

var ctx;

function onBoard(x,y){
	return ((x >= 1 && x <= 8) && (y >= 1 && y <= 8));
}

function checkAllDir(piece,x,y,target) {
	var row, col;
	for(var rowDirection = -1; rowDirection <= 1; rowDirection++){
		for(var colDirection = -1; colDirection <= 1; colDirection++){
			if (rowDirection === 0 && colDirection === 0) continue;
			//Goes to next piece
			row = x + rowDirection;
			col = y + colDirection;
			//Is there a piece there
			var exist = false;
			//checks if a piece is there and if it is the opposite color.
			while(state.board[col][row] === target && onBoard(row, col)) {
				row += rowDirection;
				col += colDirection;
				exist = true;
			}
			
			//check to see if last location is your color.
			if(exist && state.board[col][row] === piece){
				return true;
			}
		}
	}
	return false;
}

//checks to see if the move is valid
function checkValidMove(piece,x,y) {
	switch(piece) {
		case 'b': //black has to on other side of white
			return checkAllDir('b',x,y,'w');
			break;
		case 'w': //white has to be on other side of black
			return checkAllDir('w',x,y,'b');
			break;
	}
}

function moveAvailable(){
	for(var i = 1; i <= 8; i++){
		for(var j = 1; j <= 8; j++){
			if(checkValidMove(state.turn, i, j)){
				return true;
			}
		}
	}
	return false;
}

//checks if a player has a valid move and if so changes the turn
function nextTurn() {
	if(state.turn === 'b') {
		state.turn = 'w';
		if(!moveAvailable(state.turn)){
			state.turn = 'b';
		}
	}
	else {
		state.turn = 'b';
		if(!moveAvailable(state.turn)){
			state.turn = 'w';
		}
	}
	return ("It is " + state.turn + "'s turn.");
}

//sets the piece as the players color
function Place(x, y, piece){
	state.board[y][x] = piece;
}

//applies Place to all eight directions to capture the pieces
function applyAllDir(piece,x,y,target){
	if (!checkValidMove(piece,x,y)) return;
	var itemsToFlip = [],
		row,
		col;
		
	//adds valid pieces to flip in all eight directions to array
	for(var rowDirection = -1; rowDirection <= 1; rowDirection++){
		for (var colDirection = -1; colDirection <= 1; colDirection++){
			if(rowDirection === 0 && colDirection === 0) continue;
			
			row = x + rowDirection;
			col = y + colDirection;
			
			var posToFlip = [];
			
			while(state.board[col][row] === target && onBoard(row, col)){
				posToFlip.push([row, col]);
				row += rowDirection;
				col += colDirection;
			}
			
			if (posToFlip.length && state.board[col][row] === piece){
				itemsToFlip.push([row, col]);
				for(var z in posToFlip){
					itemsToFlip.push(posToFlip[z]);
				}
			}
		}
	}
	
	if(itemsToFlip.length){
		for (var z in itemsToFlip){
			Place(itemsToFlip[z][0], itemsToFlip[z][1], piece);
		}
	}
	checkVictory();
	nextTurn();
	renderBoard();
}

function applyFlip(piece, x, y){
	switch(piece) {
		case 'b': //black has to on other side of white
			return applyAllDir('b',x,y,'w');
			break;
		case 'w': //white has to be on other side of black
			return applyAllDir('w',x,y,'b');
			break;
	}
}

function updateScore(){
	state.points.w = 0;
	state.points.b = 0;
	for(var i = 1; i <= 8; i++){
		for(var j = 1; j <= 8; j++){
			if(state.board[i][j] === 'b'){
				state.points.b++;
			} else state.points.w++;
		}
	}
}

function checkVictory(){
	updateScore();
	var current = state.turn;
	if (!moveAvailable()){
		nextTurn();
		if(current === state.turn){
			state.over = true;
			if(state.points.w > state.points.b){
				return 'white wins';
			} else return 'black wins';
		}
	}
	return null;
}

function renderPiece(piece, x, y) {
  ctx.beginPath();
  if(state.board[y][x].charAt(0) === 'w') {
    ctx.fillStyle = '#fff';
  } else {
    ctx.fillStyle = '#000';
  }
  ctx.arc(x*100+50, y*100+50, 40, 0, Math.PI * 2);
  ctx.fill();
}

function renderSquare(x,y) {
    ctx.fillStyle = '#009900';
    ctx.fillRect(x*100, y*100, 100, 100);
	ctx.strokeStyle = "black";
	ctx.strokeRect(x*100,y*100, 100, 100);
    if(state.board[y][x]) {
      renderPiece(state.board[y][x], x, y);
    }
}

function renderBoard() {
  if(!ctx) return;
  for(var y = 0; y < 8; y++) {
    for(var x = 0; x < 8; x++) {
      renderSquare(x, y);
    }
  }
  ctx.fillText(("Turn: " + state.turn), 50, 50);
}

function boardPosition(x, y) {
  var boardX = Math.floor(x / 50);
  var boardY = Math.floor(y / 50);
  return {x: boardX, y: boardY}
}

function handleMouseDown(event){
	var position = boardPosition(event.clientX, event.clientY);
	var x = position.x;
	var y = position.y;
	if(checkValidMove(state.turn, x, y)){
		applyFlip(state.turn,x,y);
		nextTurn();
	}
}

function setup() {
  var canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 800;
  canvas.onmousedown = handleMouseDown;
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  renderBoard();
}

setup();