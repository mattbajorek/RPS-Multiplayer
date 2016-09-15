# Two Player Live Rock, Paper, Scissors With Chat
Week 7 homework for Rutgers Coding Bootcamp.

LIVE PREVIEW --> https://game-rock-paper-scissors.firebaseapp.com/

## Screenshots

Main | Player 1 Enters
-------------|--------
![Main Image](/readme_images/main.png?raw=true"main.png") | ![Player 1 Enters Image](/readme_images/player1.png?raw=true"player1.png")

Player 2 Enters | Player 1 Selects
-------------|--------
![Player 2 Enters Image](/readme_images/player2.png?raw=true"player2.png") | ![Player 1 Selects Image](/readme_images/selection1.png?raw=true"selection1.png")

Player 2 Selects | Results
-------------|--------
![Player 2 Selects Image](/readme_images/selection2.png?raw=true"selection2.png") | ![Result Image](/readme_images/winner.png?raw=true"winner.png")

Disconnected | More Than Two Players
-------------|--------
![Disconnected Image](/readme_images/disconnected.png?raw=true"disconnected.png") | ![More Than Two Players Image](/readme_images/third.png?raw=true"third.png")

## User Story
* Only two users can play at the same time.
* Each player chooses a move and then is told whether they won, lost, or there was a tie.
* Each player's wins and losses will be tracked.
* Throw some chat functionality in there, because no internet game is complete without having to endure endless taunts and insults from your opponent.

## Technologies used
- HTML
- CSS (media queries, font-awesome, animations)
- JavaScript/jQuery
- Firebase for persistant storage

## How to Play

1. Type in your name and press "Start" to begin (may need to wait for other player)
2. First player clicks on selection
3. Second player clicks on selection
4. Review ending results and play again
5. Chatting can be done at anytime by typing in message box and hitting send

## Built With

* Sublime Text
* Gimp

## Deployed With

* Heroku (PHP)

## Walk throughs of code

Most interesting JavaScript code
```
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
    if (turnNum == 1) {
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
}
```

## Author

* [Matthew Bajorek](https://www.linkedin.com/in/matthewbajorek)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone who's code was used
* All those hours spent playing rock, paper, scissors in school or with friends