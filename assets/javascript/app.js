$(document).on('ready', function() {
	// Links to Firebase
	var database = new Firebase("https://game-rock-paper-scissors.firebaseio.com/");
	var presenceRef = new Firebase('https://game-rock-paper-scissors.firebaseio.com/.info/connected');
	var playersRef = new Firebase('https://game-rock-paper-scissors.firebaseio.com/playersRef');
	var turnRef = new Firebase('https://game-rock-paper-scissors.firebaseio.com/turn');
	// Initialize variables
	var player;
	var playerName;
	var userRef;
	var name = {};
	var choices = ['Rock','Paper','Scissors'];
	// Remove turn when either player disconnects
	turnRef.onDisconnect().remove();

	// Game Object
	var game = {
		listeners: function() {
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
				$('.score' + key).text('Wins: 0 Losses: 0');
			});
			// Remove player name from box on disconnect
			playersRef.on('child_removed', function(childSnapshot) {
				var key = childSnapshot.key();
				$('.player' + key + ' > h2').text('Waiting for player ' + key);
				$('.score' + key).text('');
			});
			// Listen for turn
			turnRef.on('value', function(snapshot) {
				var turnNum = snapshot.val();
				// If a third window throw error
				if (turnNum !== null && player == undefined) {
					var wrapper = $('.wrapper');
					var $h1 = $('<h1>').text('Rock, Paper, Scissors SHOOT!');
					var $h2 = $('<h2>').text('Please wait until other playersRef finish, then refresh screen.');
					wrapper.empty().append($h1).append($h2);
					throw new Error('Please wait until other playersRef finish, then refresh screen.');
				// Listen for first turn
				} else if (turnNum == 1) {
					game.turn1();
				} else if (turnNum == 2) {
					game.turn2();
				} else if (turnNum == 3){
					game.turn3();
				}
			});
			// Listen for choice
			$(document).one('click','a', game.setChoice);
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
			  // Check if player 1 disconnected and readd
			  } else if (num == 1 && playerObj.val()[2] !== undefined) {
					// Sets player to 1
			  	player = 1;
			  	// Start turn by setting turn to 1
			  	turnRef.set(1);
			  	game.addPlayer(player);
			  // Add player 2
			  } else if (num == 1) {
					// Sets player to 2
			  	player = 2;
			  	// Start turn by setting turn to 1
					turnRef.set(1);
			  	game.addPlayer(player);
			  }
			});
		},
		addPlayer: function(count) {
			// Remove form
			var greeting = $('.greeting');
			greeting.empty();
			// Show greeting
			var $hi = $('<h3>').text('Hi ' + playerName + '! You are Player ' + player);
			greeting.append($hi);
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
			// Quick fix for turn 1 issue for player 2
			if (player == 2) {
				var $turn = $('<h4>').text('Waiting for ' + name[1] + ' to choose.');
				greeting.append($turn);
			}
		},
		showChoice: function() {
			for (i in choices) {
				var $a = $('<a>').text(choices[i]);
				$('.choices' + player).append($a);
			}
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
			// Show waiting message
			var num = player == 1 ? 2:1;
			$('h4').text('Waiting for ' + name[num] + ' to choose.')
			// Listen for turnNum
			var turnNum
			turnRef.on('value', function(snapshot) {
				turnNum = snapshot.val();
			});
			// Increment turn
			turnNum++;
			turnRef.set(turnNum);
		},
		turn1: function() {
			$('.player1').css('border','4px solid yellow');
			$('.player2').css('border','1px solid black');
			if (player == 1) {
				var $turn = $('<h4>').text("It's Your Turn!");
				$('.greeting').append($turn);
				game.showChoice();
			}
		},
		turn2: function() {
			$('.player1').css('border','1px solid black');
			$('.player2').css('border','4px solid yellow');
			if (player == 2) {
				$('h4').text("It's Your Turn!");
				game.showChoice();
			}
		},
		turn3: function() {
			$('.player2').css('border','1px solid black');
			$('.results').css('border','4px solid yellow');
			$('h4').text("");
		}
	}
	// Start game
	game.listeners();
});