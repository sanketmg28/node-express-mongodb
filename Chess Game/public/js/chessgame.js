const socket = io(); // Initialize socket.io connection
const chess = new Chess(); // Initialize Chess.js instance
const boardElement = document.getElementById('chessboard'); // Get the chessboard DOM element

let draggedPiece = null; // Store the currently dragged piece
let sourceSquare = null; // Store the source square of the dragged piece
let playerRole = null; // Role assigned to the player by the server ('w' or 'b')

// Wait for the DOM to load before rendering the board
document.addEventListener("DOMContentLoaded", () => {
    renderBoard();
});

// Listen for the player's role assignment from the server
socket.on('playerRole', (role) => {
    playerRole = role; // Assign player role dynamically
    console.log(`Assigned role: ${role}`);
    renderBoard(); // Re-render the board after getting the role
});

// Function to render the chessboard
const renderBoard = () => {
    if (!boardElement) {
        console.error("Chessboard element not found!"); // Error if chessboard element is missing
        return;
    }

    boardElement.innerHTML = ""; // Clear the chessboard
    const board = chess.board(); // Get the current board state from Chess.js

    if (!board || board.length === 0) {
        console.error("Chess.js board is empty!"); // Error if board state is invalid
        return;
    }

    // Loop through each square on the board
    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement('div'); // Create a square element
            squareElement.classList.add(
                'square',
                (rowIndex + squareIndex) % 2 === 0 ? 'light' : 'dark' // Alternate light and dark squares
            );
            squareElement.dataset.row = rowIndex; // Store row index as data attribute
            squareElement.dataset.col = squareIndex; // Store column index as data attribute

            if (square) { // If the square contains a piece
                const pieceElement = document.createElement('div'); // Create a piece element
                pieceElement.classList.add('piece', square.color === 'w' ? 'white' : 'black'); // Add piece color class
                pieceElement.innerText = getPieceUnicode(square.type, square.color); // Set piece symbol

                // Make the piece draggable if it's the player's turn
                if (playerRole === square.color && playerRole === chess.turn()) {
                    pieceElement.draggable = true; // Enable dragging
                    pieceElement.addEventListener('dragstart', (e) => {
                        draggedPiece = pieceElement; // Store the dragged piece
                        sourceSquare = { row: rowIndex, col: squareIndex }; // Store the source square
                        e.dataTransfer.setData('text/plain', ''); // Required for drag-and-drop
                    });
                }

                // Reset dragged piece and source square on drag end
                pieceElement.addEventListener('dragend', () => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement); // Add the piece to the square
            }

            // Allow dropping on the square
            squareElement.addEventListener('dragover', (e) => e.preventDefault());
            squareElement.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedPiece) { // If a piece is being dragged
                    const targetSquare = {
                        row: parseInt(squareElement.dataset.row), // Get target row
                        col: parseInt(squareElement.dataset.col), // Get target column
                    };
                    handleMove(sourceSquare, targetSquare); // Handle the move
                }
            });

            boardElement.appendChild(squareElement); // Add the square to the board
        });
    });
};

// Function to handle a move
const handleMove = (from, to) => {
    const move = {
        from: `${String.fromCharCode(97 + from.col)}${8 - from.row}`, // Convert source square to algebraic notation
        to: `${String.fromCharCode(97 + to.col)}${8 - to.row}`, // Convert target square to algebraic notation
        promotion: 'q', // Default promotion to queen
    };

    // Validate if it's the player's turn before sending the move
    if (playerRole === chess.turn()) {
        socket.emit('move', move); // Send the move to the server
    }
};

// Function to get the Unicode character for a chess piece
const getPieceUnicode = (type, color) => {
    const pieces = {
        p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔', // White pieces
        P: '♟', R: '♜', N: '♞', B: '♝', Q: '♛', K: '♚'  // Black pieces
    };
    return color === 'w' ? pieces[type] : pieces[type.toUpperCase()]; // Return the correct symbol based on color
};

// Listen for opponent's move and update the board
socket.on('move', (move) => {
    chess.move(move); // Update the Chess.js board state
    renderBoard(); // Re-render the board
});

// Listen for the board state from the server and update the board
socket.on('boardState', (fen) => {
    chess.load(fen); // Load the board state using FEN
    renderBoard(); // Re-render the board
});
