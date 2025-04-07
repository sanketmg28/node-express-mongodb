const express = require('express'); // Import Express framework
const socket = require('socket.io'); // Import Socket.IO for real-time communication
const http = require('http'); // Import HTTP module to create a server
const path = require('path'); // Import Path module for handling file paths
const { Chess } = require('chess.js'); // Import Chess.js library for chess logic

const app = express(); // Initialize Express app
const server = http.createServer(app); // Create an HTTP server
const io = socket(server); // Attach Socket.IO to the server

const chess = new Chess(); // Initialize a new chess game
let players = {}; // Object to store player IDs (white and black)
let currentPlayer = 'w'; // White moves first, represented by 'w'

app.set('view engine', 'ejs'); // Set EJS as the template engine
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

// Route to render the main page
app.get('/', (req, res) => {
    res.render('index', { title: "Chess Game" }); // Render 'index.ejs' with a title
});

// Handle Socket.IO connections
io.on('connection', (uniqueSocket) => {
    console.log('Socket Connected:', uniqueSocket.id); // Log when a client connects

    // Assign roles to players (white, black, or spectator)
    if (!players.white) {
        players.white = uniqueSocket.id; // Assign white role if not taken
        uniqueSocket.emit('playerRole', 'w'); // Notify the client of their role
    } else if (!players.black) {
        players.black = uniqueSocket.id; // Assign black role if not taken
        uniqueSocket.emit('playerRole', 'b'); // Notify the client of their role
    } else {
        uniqueSocket.emit('spectatorRole'); // Notify the client they are a spectator
    }

    // Handle client disconnection
    uniqueSocket.on('disconnect', () => {
        if (uniqueSocket.id === players.white) {
            delete players.white; // Remove white player if they disconnect
        } else if (uniqueSocket.id === players.black) {
            delete players.black; // Remove black player if they disconnect
        } else {
            console.log('Spectator disconnected'); // Log spectator disconnection
        }
    });

    // Handle move events from clients
    uniqueSocket.on('move', (move) => {
        try {
            // Ensure the correct player is making the move
            if (chess.turn() === 'w' && uniqueSocket.id !== players.white) return;
            if (chess.turn() === 'b' && uniqueSocket.id !== players.black) return;

            const result = chess.move(move); // Attempt to make the move
            if (result) {
                io.emit('move', move); // Broadcast the move to all clients
                io.emit('boardState', chess.fen()); // Broadcast the updated board state
            } else {
                console.log('Invalid move:', move); // Log invalid move
                uniqueSocket.emit('invalidMove', move); // Notify the client of invalid move
            }
        } catch (err) {
            console.error('Move error:', err); // Log any errors during move processing
            uniqueSocket.emit('invalidMove', move); // Notify the client of invalid move
        }
    });
});

// Start the server on port 3000
server.listen(3000, () => {
    console.log(`Server listening on port 3000`); // Log server start
});
