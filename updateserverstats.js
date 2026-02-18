const stats = {
	username: localStorage.username,
	passwordHash: localStorage.passwordHash,

	bestScore: localStorage.bestScore,
	bestTime: localStorage.bestTime,

	totalGames: localStorage.totalGames,
	totalEquations: localStorage.totalEquations,

	soundEnabled: localStorage.soundEnabled,
	musicEnabled: localStorage.musicEnabled,
	correctSound: localStorage.correctSound,
	wrongSound: localStorage.wrongSound,

	answer_question: localStorage.answer_question,
	reset_game: localStorage.reset_game,

	unlockedAchievements: localStorage.unlockedAchievements
};
fetch(API + "/setStats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(stats)
})
.then(res => res.json())
.then(data => {
    if (data.success) {
        console.log("Stats synced with server.");
        // Use the server's version of the data to update local storage
        const updated = data.currentStats;
        for (let key in updated) {
            localStorage[key] = typeof updated[key] === 'object' 
                ? JSON.stringify(updated[key]) 
                : updated[key];
        }
    } else {
        alert("Sync failed: " + data.message);
    }
})
.catch(err => console.error("Network error:", err));
