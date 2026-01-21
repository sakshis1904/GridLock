### GridLock — Real-Time Connect-4 Game

GridLock is a real-time multiplayer Connect-4 (4 in a Row) game built using the MERN stack with WebSockets.
Players can compete player vs player or player vs bot, with live updates, matchmaking, and a leaderboard.

</br>

### Features

* Real-time gameplay using Socket.IO
* Automatic matchmaking
* Competitive bot if no opponent joins in 10 seconds
* Backend-controlled game logic (anti-cheat)
* Disconnect & reconnect handling (30 seconds)
* Leaderboard with win tracking

</br>

### Tech Stack
### Frontend

* React
* Socket.IO Client
* Vite

### Backend

* Node.js
* Express.js
* Socket.IO

### Database
* MongoDB Atlas

</br> 

### How the Game Works

1. User enters a username
2. System waits for an opponent
3. If no player joins within 10 seconds, a bot starts the game
4. Players take turns dropping discs into a 7×6 grid
5. First player to connect 4 discs wins
6. Game result is saved and leaderboard is updated

</br> 

### Bot Strategy

The bot is not random. It prioritizes:

* Blocking the opponent’s winning move
* Playing a winning move if available
* Making a valid strategic move

</br> 

### Real-Time Communication

WebSockets are used for:

* Game updates
* Turn synchronization
* Bot moves
* Disconnect & reconnect handling

</br> 

### Run Locally

### 1️. Clone Repository

git clone https://github.com/sakshis1904/GridLock.git </br>
cd GridLock

### 2️. Backend Setup

cd backend </br>
npm install </br>
npm start

### 3️. Frontend Setup
cd frontend </br>
npm install </br>
npm run dev


### 4. Environment Variables

Create a .env file in backend/:

PORT=3001 </br>
MONGO_URI=your_mongodb_connection_string

</br> 

### Leaderboard

* Tracks total wins per player
* Sorted in descending order
* Displayed on frontend


### Author

Sakshi Shrivastava </br>
Backend / Full-Stack Developer </br>
GitHub: https://github.com/sakshis1904
