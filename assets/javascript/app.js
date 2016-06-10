$(document).on('ready', function() {
	// Link to Firebase
	var database = new Firebase("https://game-rock-paper-scissors.firebaseio.com/");
	// Link to Firebase for viewer tracking
	var presenceRef = new Firebase('https://game-rock-paper-scissors.firebaseio.com/.info/connected');
	var userRef = new Firebase('https://game-rock-paper-scissors.firebaseio.com/users');
	var userData = userRef.push();
	var userID = userData.key();

	// Game Object
	var game = {
		presence: function() {
			presenceRef.on('value', function(snapshot) {
			  if (snapshot.val()) {
			    userData.onDisconnect().remove();
			    userData.set(true);
			  }
			});
		},
		setPlayer: function() {
			userRef.on('value', function(snapshot) {
				//if (userID == snapshot.val().user)
			  console.log(snapshot.val());
			});
		}
	}
	// Initialize presence
	game.presence();
	game.setPlayer();
});