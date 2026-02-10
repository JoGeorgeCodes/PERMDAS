
//test commit
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());
app.use(express.json());

// File where data is stored
const DATA_FILE = "users.json";

// Load users from file if it exists
let users = {};
if (fs.existsSync(DATA_FILE)) {
  console.log("DATA_FILE exists. Loading users...");
  const data = fs.readFileSync(DATA_FILE, "utf8");
  users = JSON.parse(data);
  console.log("Loaded users:", users);
} else {
  console.log("No DATA_FILE found. Starting with empty users.");
}

// Save users to file
function saveUsers() {
  console.log("Saving users to file...");
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
  console.log("Save complete.");
}

// --- Register a new username ---
app.post("/register", (req, res) => {
  console.log("POST /register called");

  const { name } = req.body;

  if (!name || typeof name !== "string") {
    console.log("Invalid username:", name);
    return res.status(400).json({ error: "Invalid username" });
  }

  if (!users[name]) {
    console.log("New user. Creating:", name);
    users[name] = {
      scores: [],
      totalGames: 0,
      totalEquations: 0
    };
    saveUsers();

    console.log("Registration success:", name);
    res.json({ success: true, user: users[name] });
  } else {

    console.log("User Already Exists", name);
    res.json({ success: false, user: null, msg: "Please use login page" });
    return;
  }

});

// --- Submit a score for Blitz mode ---
app.post("/score-blitz", (req, res) => {
  console.log("POST /score-blitz called (Blitz mode)");
  const { name, score, passwordHash } = req.body;
  if (!name || typeof score !== "number" || !users[name]) {
    console.log("Invalid request:", { name, score });
    return res.status(400).json({ error: "Invalid request" });
  }

  if (!users[name].blitzScores) {
    users[name].blitzScores = [];
  }

  if(!users[name].passwordHash && users[name].passwordHash != passwordHash) 
    return res.status(401).json({ error: "Not authorized" });
  users[name].blitzScores.push(score);
  users[name].totalGames += 1;
  saveUsers();
  console.log("Blitz score submitted:", { name, score });
  res.json({ success: true, user: users[name] });
});


app.post("/score", (req, res) => {
  console.log("POST /score called");

  const { name, score, passwordHash } = req.body;

  if (!name || typeof score !== "number" || !users[name]) {
    console.log("Invalid request:", { name, score });
    return res.status(400).json({ error: "Invalid request" });
  }
  if(!users[name].passwordHash && users[name].passwordHash != passwordHash) 
    return res.status(401).json({ error: "Not authorized" });
  users[name].scores.push(score);
  users[name].totalGames += 1;
  saveUsers();

  console.log("Score submitted:", { name, score });
  res.json({ success: true, user: users[name] });
});


// --- Submit a score for Freefall mode ---
app.post("/score-freefall", (req, res) => {
  console.log("POST /score-freefall called (Frefall mode)");
  const { name, score, passwordHash } = req.body;
  if (!name || typeof score !== "number" || !users[name]) {
    console.log("Invalid request:", { name, score });
    return res.status(400).json({ error: "Invalid request" });
  }
  
  if (!users[name].freeFallScores) {
    users[name].freeFallScores = [];
  }

  if(!users[name].passwordHash && users[name].passwordHash != passwordHash) 
    return res.status(401).json({ error: "Not authorized" });
  users[name].freeFallScores.push(score);
  users[name].totalGames += 1;
  saveUsers();
  console.log("Freefall score submitted:", { name, score });
  res.json({ success: true, user: users[name] });
});


// --- Get top 10 Blitz scores (leaderboard) ---
app.get("/leaderboard-blitz", (req, res) => {
  console.log("GET /leaderboard-blitz called (Blitz mode)");
  let bestScores = [];
  for (let name in users) {
    // Ensure blitzScores exists
    if (!users[name].blitzScores) {
      users[name].blitzScores = [];
    }

    let userScores = users[name].blitzScores;
    if (userScores.length === 0) continue;
    let bestScore = Math.max(...userScores); // best score = highest score
    bestScores.push({ name, score: bestScore });
  }
  bestScores.sort((a, b) => b.score - a.score); // Sort descending (highest first)
  const topScores = bestScores.slice(0, 10);
  console.log("Returning Blitz leaderboard:", topScores);
  res.json(topScores);
});

// --- Get top 10 scores (leaderboard) ---
app.get("/leaderboard", (req, res) => {
  console.log("GET /leaderboard called");

  let bestScores = [];

  for (let name in users) {
    let userScores = users[name].scores;
    if (userScores.length === 0) continue;

    let bestScore = Math.min(...userScores); // best time = lowest score
    bestScores.push({ name, score: bestScore });
  }

  bestScores.sort((a, b) => a.score - b.score);

  const topScores = bestScores.slice(0, 10);
  res.json(topScores);
});

// --- Get top 10 Freefall scores (leaderboard) ---
app.get("/leaderboard-freefall", (req, res) => {
  console.log("DEBUG: GET /leaderboard-freefall called (freefall mode)");
  let bestScores = [];
  for (let name in users) {
    // Ensure blitzScores exists
    if (!users[name].freeFallScores) {
      users[name].freeFallScores = [];
    }

    let userScores = users[name].freeFallScores;
    if (userScores.length === 0) continue;
    let bestScore = Math.max(...userScores); // best score = highest score
    bestScores.push({ name, score: bestScore });
  }
  bestScores.sort((a, b) => b.score - a.score); // Sort descending (highest first)
  const topScores = bestScores.slice(0, 10);
  console.log("DEBUG: Returning free fall leaderboard:", topScores);
  res.json(topScores);
});

app.post("/login", (req, res) => {
  console.log("Login attempt received");

  const { username, passwordHash } = req.body;

  if (!users[username]) {
    console.log("Usr Not found")
    return res.status(401).json({ success: false, message: "User not found" });
  }
  //If the user has no password and the hash was sent corresponds to no password
  if(!users[username].passwordHash && passwordHash == "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"){
    res.json({ success: true});
  }else{
    console.log("Correct Hash: " + users[username].passwordHash);
    console.log("They Sent: " + passwordHash);

    if (users[username].passwordHash === passwordHash) {
      res.json({ success: true});
    } else {
      res.json({ success: false });
    }
  }
});
app.post("/setPassword", (req, res) => {
  console.log("Password Change attemt");
  console.log(req.body)
  const {
    username,
    oldPasswordHash,
    newPasswordHash
  } = req.body;

  if (!users[username]) {
    console.log("User Not Found to change password")
    return res.status(401).json({ success: false, message: "User not found" });
  }
  //If the user has no password and the hash was sent corresponds to no password
  if(!users[username].passwordHash && oldPasswordHash == "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"){
    console.log("User has no password and adden one")
    users[username].passwordHash = newPasswordHash
    saveUsers();
  }else{
    console.log("already has password h.: "+users[username].passwordHash)
    console.log(oldPasswordHash)
    if (users[username].passwordHash === oldPasswordHash) {
      users[username].passwordHash = newPasswordHash
      saveUsers();
    } else {
      res.json({ success: false });
    }
  }
  saveUsers();
});

app.post("/setStats", (req, res) => {
  console.log("Stats Update Attempt");
  console.log(req.body);

  const { 
    username,
    bestScore,
    bestTime,
    totalGames,
    totalEquations,
    soundEnabled,
    musicEnabled,
    correctSound,
    wrongSound,
    answer_question,
    reset_game,
    unlockedAchievements
  } = req.body;

  if (!users[username]) {
    console.log("User Not Found to update the stats!!");
    return res.status(401).json({ success: false, message: "User not found" });
  }

  // well oc i used ai for these long strings of text, but i typud all the ifs and non repetetive stuff
  const user = users[username];
  if(Math.min(...user.scores) == user.bestScore){
    user.bestTime = bestTime;
    res.json({ success: true , trueBestScore: bestScore});
  }else if(Math.min(...user.scores) > user.bestScore){ 
    //they have a better best score, so add that time and then send back theri bestScore
    user.scores
  }
  user.totalGames = totalGames;
  user.totalEquations = totalEquations;
  user.soundEnabled = soundEnabled;
  user.musicEnabled = musicEnabled;
  user.correctSound = correctSound;
  user.wrongSound = wrongSound;
  user.answer_question = answer_question;
  user.reset_game = reset_game;
  user.unlockedAchievements = unlockedAchievements;
  saveUsers();
  console.log("Stats updated for", username);
});

app.get("/users", (req, res) => {
  console.log("GET /users called");
  console.log("User list:", Object.keys(users));
  res.json(Object.keys(users));
});

app.get("/dump", (req, res) => {
  console.log("GET /dump called");
  if (!fs.existsSync(DATA_FILE)) {
    console.log("No file yet");
    return res.json({ message: "No file yet" });
  }
  const data = fs.readFileSync(DATA_FILE, "utf8");
  console.log("Dump data:", data);
  res.type("json").send(data);
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
});
