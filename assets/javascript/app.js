$(document).on('ready', function() {
	// Links to Firebase
	var database = new Firebase("https://game-rock-paper-scissors.firebaseio.com/");
	var presenceRef = new Firebase('https://game-rock-paper-scissors.firebaseio.com/.info/connected');
	var playersRef = new Firebase('https://game-rock-paper-scissors.firebaseio.com/playersRef');
	var turnRef = new Firebase('https://game-rock-paper-scissors.firebaseio.com/turn');
	// Initialize variables
	var player;
	var otherPlayer;
	var playerName;
	var userRef;
	var wins1, wins2, losses1, losses2;
	var name = {};
	var choices = ['Rock','Paper','Scissors'];
	
	// Remove turn when either player disconnects
	turnRef.onDisconnect().remove();

	// Game Object
	var game = {
		listeners: function() {
			// Listen for a more than two clients
			database.on("value", function(snapshot) {
				var turnVal = snapshot.child('turn').val();
				if (turnVal !== null && player == undefined) {
					var wrapper = $('.wrapper');
					var $h1 = $('<h1>').text('Rock, Paper, Scissors SHOOT!');
					var $h2 = $('<h2>').text('Please wait until other players finish, then refresh screen.');
					wrapper.empty().append($h1).append($h2);
					throw new Error('Please wait until other players finish, then refresh screen.');
				}
			});
			// Start button click
			$('#addName').one('click',function() {
				game.setPlayer();
				return false;
			});
			// Show player name in box
			playersRef.on('child_added', function(childSnapshot) {
				// Gets player number
				var key = childSnapshot.key();
				// Gets player names
				name[key] = childSnapshot.val().name;
				$('.player' + key + ' > h2').text(name[key]);
				// Get player wins and losses
				var wins = childSnapshot.val().wins;
				var losses = childSnapshot.val().losses;
				$('.score' + key).text('Wins: ' + wins + ' Losses: ' + losses);
			});
			// Remove player name from box on disconnect
			playersRef.on('child_removed', function(childSnapshot) {
				// Find player that was removed
				var key = childSnapshot.key();
				// Empty turn message
				$('h4').text('');
				// Display beginning message
				$('.player' + key + ' > h2').text('Waiting for player ' + key);
				// Empty score
				$('.score' + key).text('');
				// Empty divs
				$('.choices1').empty();
				$('.results').empty();
				$('.choices2').empty();
			});
			// Listen for each turn to direct to proper turn function
			turnRef.on('value', function(snapshot) {
				var turnNum = snapshot.val();
				if (turnNum	== 1) {
					// Empty divs
					$('.choices1').empty();
					$('.results').empty();
					$('.choices2').empty();
					game.turn1();
				} else if (turnNum == 2) {
					game.turn2();
				} else if (turnNum == 3){
					game.turn3();
				}
			});
			// Listen for change in wins and losses for players 1
			playersRef.child(1).on('child_changed', function(childSnapshot) {
				if (childSnapshot.key() == 'wins') {
					wins1 = childSnapshot.val();
				} else if (childSnapshot.key() == 'losses') {
					losses1 = childSnapshot.val();
				}
				// Update score display
				$('.score1').text('Wins: ' + wins1 + ' Losses: ' + losses1);
			});
			// Listen for change in wins and losses for player 2
			playersRef.child(2).on('child_changed', function(childSnapshot) {
				if (childSnapshot.key() == 'wins') {
					wins2 = childSnapshot.val();
				} else if (childSnapshot.key() == 'losses') {
					losses2 = childSnapshot.val();
				}
				// Update score display
				$('.score2').text('Wins: ' + wins2 + ' Losses: ' + losses2);
			});
		},
		setPlayer: function() {
			// Query database
			database.once('value', function(snapshot) {
				// Gets player name
				playerName = $('#name-input').val();
				var playerObj = snapshot.child('playersRef');
				var num = playerObj.numChildren();
				// Add player 1
			  if (num == 0) {
					// Sets player to 1
			  	player = 1;
			  	game.addPlayer(player);
			  // Check if player 1 disconnected and re-add
			  } else if (num == 1 && playerObj.val()[2] !== undefined) {
					// Sets player to 1
			  	player = 1;
			  	game.addPlayer(player);
			  	// Start turn by setting turn to 1
			  	turnRef.set(1);
			  // Add player 2
			  } else if (num == 1) {
					// Sets player to 2
			  	player = 2;
			  	game.addPlayer(player);
			  	// Start turn by setting turn to 1
					turnRef.set(1);
			  }
			});
		},
		addPlayer: function(count) {
			// Remove form
			var greeting = $('.greeting');
			greeting.empty();
			// Show greeting
			var $hi = $('<h3>').text('Hi ' + playerName + '! You are Player ' + player);
			var $h4 = $('<h4>');
			greeting.append($hi).append($h4);
			// Create new child with player number
			userRef = playersRef.child(count);
			// Allows for disconnect
			userRef.onDisconnect().remove();
			// Sets children of player number
			userRef.set({
				'name': playerName,
				'wins': 0,
				'losses': 0
			});
		},
		turnMessage: function(playTurn) {
			otherPlayer = player == 1 ? 2:1;
			if (playTurn == player) {
				// Show its your turn
				$('h4').text("It's Your Turn!");
			} else if (playTurn == otherPlayer) {
				// Show waiting message
				$('h4').text('Waiting for ' + name[otherPlayer] + ' to choose.');
			} else {
				// Empty message
				$('h4').text('');
			}
		},
		showChoice: function() {
			for (i in choices) {
				var $a = $('<a>').text(choices[i]);
				$('.choices' + player).append($a);
			}
			// Listen for choice
			$(document).one('mousedown','a', game.setChoice);
		},
		setChoice: function() {
			// Send selection to database
			var selection = $(this).text();
			userRef.update({
				'choice': selection,
			});
			// Clear choices and add choice
			var $h1 = $('<h1>').text(selection)
			$('.choices' + player).empty().append($h1);
			// Listen for turnNum
			turnRef.once('value', function(snapshot) {
				var turnNum = snapshot.val();
				// Increment turn
				turnNum++;
				turnRef.set(turnNum);
			});
		},
		turn1: function() {
			$('.player1').css('border','4px solid yellow');
			$('.results').css('border','1px solid black');
			// Show turn message
			game.turnMessage(1);
			// Show choices to player 1
			if (player == 1) {
				game.showChoice();
			}
		},
		turn2: function() {
			$('.player1').css('border','1px solid black');
			$('.player2').css('border','4px solid yellow');
			// Show turn message
			game.turnMessage(2);
			// Show choices to player 2
			if (player == 2) {
				game.showChoice();
			}
		},
		turn3: function() {
			$('.player2').css('border','1px solid black');
			$('.results').css('border','4px solid yellow');
			// Remove turn message
			game.turnMessage(3);
			// Compute outcome
			game.outcome();
		},
		outcome: function() {
			// Get choices, wins, and losses from database
			playersRef.once('value', function(snapshot) {
				var snap1 = snapshot.val()[1];
				var snap2 = snapshot.val()[2];
				choice1 = snap1.choice;
				wins1 = snap1.wins;
				losses1 = snap1.losses;
				choice2 = snap2.choice;
				wins2 = snap2.wins;
				losses2 = snap2.losses;
				// Show other player's choice
				var textChoice = otherPlayer == 1 ? choice1:choice2;
				var $h1 = $('<h1>').text(textChoice)
				$('.choices' + otherPlayer).append($h1);
				game.logic();
			});
		},
		logic: function() {
			// Logic for finding winner
			if (choice1 == choice2) {
				game.winner(0);
			} else if (choice1 == 'Rock') {
				if (choice2 == 'Paper') {
					game.winner(2);
				} else if (choice2 == 'Scissors') {
					game.winner(1);
				}
			} else if (choice1 == 'Paper') {
				if (choice2 == 'Rock') {
					game.winner(1);
				} else if (choice2 == 'Scissors') {
					game.winner(2);
				}
			} else if (choice1 == 'Scissors') {
				if (choice2 == 'Rock') {
					game.winner(2);
				} else if (choice2 == 'Paper') {
					game.winner(1);
				}
			}
		},
		winner: function(playerNum) {
			var results;
			// Display tie
			if (playerNum == 0) {
				results = 'Tie!';
			} else {
				// Display winner
				results = name[playerNum] + ' Wins!';
				// Set wins and losses based on winner
				if (playerNum == 1) {
					wins = wins1;
					losses = losses2;
				} else {
					wins = wins2;
					losses = losses1;
				}
				// Incremement win and loss
				wins++;
				losses++;
				// Set the wins and losses
				playersRef.child(playerNum).update({
					'wins': wins
				});
				var otherPlayerNum = playerNum == 1 ? 2:1;
				playersRef.child(otherPlayerNum).update({
					'losses': losses
				});
			}
			// Display results
			$('.results').text(results);
			// Change turn back to 1 after 3 seconds
			window.setTimeout(function() {
				// Reset turn to 1
				turnRef.set(1);
			}, 3000)
		}
	}
	// Start game
	game.listeners();
});