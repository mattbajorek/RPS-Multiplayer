$(document).on('ready', function() {
	// Link to Firebase
	var database = new Firebase("https://game-rock-paper-scissors.firebaseio.com/");
	// Link to Firebase for viewer tracking
	var presenceRef = new Firebase('https://game-rock-paper-scissors.firebaseio.com/.info/connected');
	var players = new Firebase('https://game-rock-paper-scissors.firebaseio.com/players');
	var turn = new Firebase('https://game-rock-paper-scissors.firebaseio.com/turn');
	var player = 1;
	//var userID = userRef.key();
	var userRef;
	var name;

	$('#addName').one('click',function() {
		// Gets player name
		name = $('#name-input').val();
		// Query database
		database.once('value', function(snapshot) {
			var playerObj = snapshot.child('players');
			var num = playerObj.numChildren();
			// Add player 1
		  if (num == 0) {
		  	addPlayer(player);
		  // Check if player 1 disconnected and readd
		  } else if (num == 1 && playerObj.val()[2] !== undefined) {
		  	turn.set(1);
		  	addPlayer(player);
		  // Add player 2
		  } else if (num == 1) {
		  	player++;
		  	// Create new child with player number
				turn.set(1);
		  	addPlayer(player);
		  // Reject any more players
		  } else {
		  	console.log("Please wait until other players finish, then refresh screen.");
		  }
		});
		return false;
	});

	function addPlayer(count) {
		// Remove form
		var greeting = $('.greeting');
		greeting.empty();
		// Show greeting
		greeting.text('Hi ' + name + '! You are Player ' + player);
		// Create new child with player number
		userRef = players.child(count);
		// Allows for disconnect
		userRef.onDisconnect().remove();
		// Sets children of player number
		userRef.set({
			'name': name,
			'wins': 0,
			'losses': 0
		});
	}

/*
	players.on('child_changed', function(oldChildSnapshot) {
	  console.log(oldChildSnapshot.val());
	});


	presenceRef.on('value', function(snapshot) {
	  if (snapshot.val()) {
	  	var userRef = players.child(count);
		  userRef.onDisconnect().remove();
		  userRef.set({
				'name': 'Matt',
				'wins': 0,
				'losses': 0
				//'userID': userID
			});
	  }
	});

	// Game Object
	var game = {
		presence: function() {
			presenceRef.on('value', function(snapshot) {
				console.log(snapshot.val());
			  if (snapshot.val()) {
			    userRef.onDisconnect().remove();
			    userRef.set(true);
			  }
			});
		},
		setPlayer: function() {
			listRef.on('value', function(snapshot) {
				//if (userID == snapshot.val().user)
			  console.log(snapshot.numChildren());
			  var num = snapshot.numChildren();
			  var obj = {};
			  obj[num] = userID;
			  player.onDisconnect().remove();
			  player.update(obj);
			});
		}
	}
	// Initialize presence
	game.presence();
	game.setPlayer();*/
});