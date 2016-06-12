window.onload = function() {
	var options = ['r','p','s'], userGuess, computerGuess, winner;

	function word(guess, player) {
		var action;
		switch(guess) {
    		case 'r': action = '<i class="fa fa-hand-rock-o fa-5x" aria-hidden="true"></i>'; break;
    		case 'p': action = '<i class="fa fa-hand-paper-o fa-5x" aria-hidden="true"></i>'; break;
    		case 's': action = '<i class="fa fa-hand-scissors-o fa-5x" aria-hidden="true"></i>'; break;
		}
		switch(player) {
    		case 'user': userGuess = action; break;
    		case 'computer': computerGuess = action; break;
		}
	}

	function findWinner(userGuess,computerGuess) {
		if (userGuess == computerGuess) {
			return "Tie";
		} else if (userGuess == 'r') {
			if (computerGuess == 'p') {
				return "Computer Wins";
			} else if (computerGuess == 's') {
				return "User Wins";
			}
		} else if (userGuess == 'p') {
			if (computerGuess == 'r') {
				return "User Wins";
			} else if (computerGuess == 's') {
				return "Computer Wins";
			}
		} else if (userGuess == 's') {
			if (computerGuess == 'r') {
				return "Computer Wins";
			} else if (computerGuess == 'p') {
				return "User Wins";
			}
		}
	}

	document.onkeyup = function(event) {
		// Choose r, p, s
		userGuess = String.fromCharCode(event.keyCode).toLowerCase();
		computerGuess = options[Math.floor(Math.random()*options.length)];

		// Find winner
		winner = findWinner(userGuess,computerGuess);

		// Change to Rock, Paper, Scissors
		word(userGuess,'user');
		word(computerGuess,'computer');

		// Display
		document.querySelector(".user").innerHTML = userGuess;
		document.querySelector(".computer").innerHTML = computerGuess;
		document.querySelector(".winner").innerHTML = "Winner: " + winner;
	}
}