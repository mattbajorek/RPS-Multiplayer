$(document).on('ready', function() {
	// Links to Firebase
	var database = new Firebase("https://game-rock-paper-scissors.firebaseio.com/");
	var presenceRef = new Firebase('https://game-rock-paper-scissors.firebaseio.com/.info/connected');
	var playersRef = new Firebase('https://game-rock-paper-scissors.firebaseio.com/playersRef');
	var turnRef = new Firebase('https://game-rock-paper-scissors.firebaseio.com/turn');
	var chatRef = new Firebase('https://game-rock-paper-scissors.firebaseio.com/chat');
	// Initialize variables
	var player;
	var otherPlayer;
	var name = {};
	var userRef;
	var wins1, wins2, losses1, losses2;
	
	var choices = ['rock','paper','scissors'];
	
	// Remove turn and chat when either player disconnects
	turnRef.onDisconnect().remove();
	chatRef.onDisconnect().remove();

	// Deal with android orientation change event
	$(window).bind( 'orientationchange', function(e){
		
	});

	// Game Object
	var game = {
		listeners: function() {
			// Listen for a more than two clients
			database.on("value", function(snapshot) {
				var turnVal = snapshot.child('turn').val();
				if (turnVal !== null && player == undefined) {
					var wrapper = $('.wrapper');
					var $img = $('<img>').attr('src',"assets/images/header.png");
					var $h1 = $('<h1>').text('Please wait until other players finish, then refresh screen.');
					wrapper.empty().append($img).append($h1);
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
				// Remove loading and add player name
				var waiting = $('.player' + key + ' > .waiting');
				waiting.empty();
				var $h1 = $('<h1>').text(name[key]);
				waiting.append($h1);				
				// Get player wins and losses
				var wins = childSnapshot.val().wins;
				var losses = childSnapshot.val().losses;
				var $wins = $('<h2>').text('Wins: ' + wins);
				var $losses = $('<h2>').text('Losses: ' + losses);
				$wins.addClass('float-left');
				$losses.addClass('float-right');
				$('.score' + key).append($wins).append($losses);
			});
			// Remove player name from box on disconnect
			playersRef.on('child_removed', function(childSnapshot) {
				// Find player that was removed
				var key = childSnapshot.key();
				// Show 'player has disconnected' on chat
				chat.sendDisconnect(key);
				// Empty turn message
				$('h4').text('Waiting for another player to join.');
				// Display beginning message
				var waiting = $('.player' + key + ' > .waiting');
				waiting.empty();
				var $h1 = $('<h1>').text('Waiting for player ' + key);
				var $i = $('<i>').addClass('fa fa-spinner fa-spin fa-one-large fa-fw')
				waiting.append($h1).append($i);
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
				if (wins1 !== undefined) {
					$('.score1 .float-left').text('Wins: ' + wins1);
					$('.score1 .float-right').text('Losses: ' + losses1);
				}
			});
			// Listen for change in wins and losses for player 2
			playersRef.child(2).on('child_changed', function(childSnapshot) {
				if (childSnapshot.key() == 'wins') {
					wins2 = childSnapshot.val();
				} else if (childSnapshot.key() == 'losses') {
					losses2 = childSnapshot.val();
				}
				// Update score display
				$('.score2 .float-left').text('Wins: ' + wins2);
				$('.score2 .float-right').text('Losses: ' + losses2);
			});
		},
		setPlayer: function() {
			// Query database
			database.once('value', function(snapshot) {
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
			// Gets player name
			var playerName = $('#name-input').val();
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
				// Empty message for turn 3
				$('h4').text('');
			}
		},
		showChoice: function() {
			for (i in choices) {
				var $i = $('<i>');
				$i.addClass('fa fa-hand-' + choices[i] + '-o fa-three-small');
				$i.attr('data-choice', choices[i]);
				game.rotateChoice(player, $i, choices[i]);
				$('.choices' + player).append($i);
			}
			// Listen for choice
			$(document).one('mousedown','i', game.setChoice);
		},
		setChoice: function() {
			// Send selection to database
			var selection = $(this).attr('data-choice');
			userRef.update({
				'choice': selection,
			});
			// Clear choices and add choice
			var $i = $('<i>');
			$i.addClass('fa fa-hand-' + selection + '-o fa-one-large');
			$i.attr('data-choice', selection);
			$i.addClass('position-absolute-choice' + player);
			game.rotateChoice(player, $i, selection);
			$('.choices' + player).empty().append($i);
			// Listen for turnNum
			turnRef.once('value', function(snapshot) {
				var turnNum = snapshot.val();
				// Increment turn
				turnNum++;
				turnRef.set(turnNum);
			});
		},
		rotateChoice: function(person, element, choice) {
			// Rotate each choice properly depending on the player
			if (person == 1) {
				if (choice == 'rock' || choice == 'paper') {
					return element.addClass('fa-rotate-90');
				} else {
					return element.addClass('fa-flip-horizontal');
				}				
			} else if (person == 2) {
				if (choice == 'rock' || choice == 'paper') {
					return element.addClass('fa-rotate-270-flip-horizontal');
				}
			}
		},
		turn1: function() {
			$('.player1').css('border','4px solid yellow');
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
				var $i = $('<i>');
				$i.addClass('fa fa-hand-' + textChoice + '-o fa-one-large');
				$i.addClass('position-absolute-choice' + otherPlayer);
				$i.attr('data-choice', textChoice);
				game.rotateChoice(otherPlayer, $i, textChoice);
				$('.choices' + otherPlayer).append($i);

				game.choiceAnimation();
			});
		},
		logic: function() {
			// Logic for finding winner
			if (choice1 == choice2) {
				game.winner(0);
			} else if (choice1 == 'rock') {
				if (choice2 == 'paper') {
					game.winner(2);
				} else if (choice2 == 'scissors') {
					game.winner(1);
				}
			} else if (choice1 == 'paper') {
				if (choice2 == 'rock') {
					game.winner(1);
				} else if (choice2 == 'scissors') {
					game.winner(2);
				}
			} else if (choice1 == 'scissors') {
				if (choice2 == 'rock') {
					game.winner(2);
				} else if (choice2 == 'paper') {
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
				// Gray loser
				var otherPlayerNum = playerNum == 1 ? 2:1;
				$('.choices' + otherPlayerNum + ' > i').css('opacity','0.5');
				window.setTimeout(function() {
					// Set the wins and losses
					playersRef.child(playerNum).update({
						'wins': wins
					});
					playersRef.child(otherPlayerNum).update({
						'losses': losses
					});
				}, 500);
			}
			// Display results
			window.setTimeout(function() {
				$('.results').text(results).css('z-index','1');
			}, 500);
			// Change turn back to 1 after 3 seconds
			window.setTimeout(function() {
				// Reset turn to 1
				turnRef.set(1);
				$('.results').text('').css('z-index','-1');
			}, 2000);
		},
		choiceAnimation: function() {
		  var $choice1 = $('.choices1 > i');
		  var $choice2 = $('.choices2 > i');
		  // Choice 1 animation
		  $choice1.addClass('animation-choice1');
		  $choice1.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function() {
		    $choice1.addClass('choice1-end');
		  });
			// Choice 2 animation
		  $choice2.addClass('animation-choice2');
		  $choice2.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function() {
		    $choice2.addClass('choice2-end');
		    game.logic();
		  });
		}
	}
	// Start game
	game.listeners();

	// Chat object
	var chat = {
		message:'',
		listeners: function() {
			// Send button click
			$('#addMessage').on('click',function(event) {
				chat.getMessage();
				return false;
			});
			// Show message when received
			chatRef.on('child_added', function(childSnapshot) {
				// Get name and message
				var playerName = childSnapshot.val().name;
				var message = childSnapshot.val().message;
				// Show message
				chat.showMessage(playerName, message);
			});
		},
		getMessage: function() {
			var input = $('#message-input');
			// Get message then clear it
			chat.message = input.val();
			input.val('');
			// Send data to database if player has name
			if (player !== undefined) {
				chat.sendMessage();
			}
		},
		sendMessage: function() {
			var obj = {};
			obj['name'] = name[player];
			obj['message'] = chat.message;
			chatRef.push(obj);
		},
		sendDisconnect: function(key) {
			var obj = {};
			obj['name'] = name[key];
			obj['message'] = ' has disconnected.';
			chatRef.push(obj);
		},
		showMessage: function(playerName, message) {
			// Auto scroll to bottom variables
			var messages = document.getElementById('messages');
			var isScrolledToBottom = messages.scrollHeight - messages.clientHeight <= messages.scrollTop + 1;
			// Create p with display string
			var $p = $('<p>');
			if (message == ' has disconnected.' && player !== undefined) {
				$p.text(playerName + message);
				$p.css('background','gray');
			} else if (player !== undefined) {
				$p.text(playerName + ': ' + message);
			}
			// If player 1 -> blue text
			if (name[1] == playerName) {
				$p.css('color','blue');
			// If player 2 -> red text
			} else if (name[2] == playerName) {
				$p.css('color','red');
			}
			// Append message
			if ($p.text() !== '') {
				$('#messages').append($p);
			}
			// Auto scroll to bottom
			if (isScrolledToBottom) {
				messages.scrollTop = messages.scrollHeight - messages.clientHeight;;
			}
		}
	}

	// Start chat
	chat.listeners();
});