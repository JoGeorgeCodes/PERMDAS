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
  if(data.success == true){
    alert("Sucess, overriding own stats")
	for(i in stats){
		localStorage[i] = stats[i];
	}
  }else{
    alert("Something Went Wrong")
  }
})
