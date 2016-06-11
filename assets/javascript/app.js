$(document).on('ready', function() {
	// Link to Firebase
	var database = new Firebase("https://game-rock-paper-scissors.firebaseio.com/");
	// Link to Firebase for viewer tracking
	var presenceRef = new Firebase('https://game-rock-paper-scissors.firebaseio.com/.info/connected');
	var players = new Firebase('https://game-rock-paper-scissors.firebaseio.com/players');
	var player = 1;
	//var userID = userRef.key();
	var userRef;

	$('#addName').on('click',function() {
		database.once('value', function(snapshot) {
		  if (snapshot.val() == null) {
		  	addPlayer(player);
		  } else {
		  	player++;
		  	addPlayer(player);
		  }
		});
		return false;
	});

	function addPlayer(count) {
		userRef = players.child(count);
		userRef.onDisconnect().remove();
		userRef.set({
			'name': 'Matt',
			'wins': 0,
			'losses': 0
		});
	}

	/*players.on('value', function(snapshot) {
	  console.log(snapshot.val());
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