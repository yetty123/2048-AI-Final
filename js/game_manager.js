function GameManager(size, InputManager, Actuator) {
  this.size = size; 
  this.inputManager = new InputManager;
  this.actuator = new Actuator;
  this.running = false;
  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));

  this.inputManager.on('think', function() {
    var best = this.ai.getBestMove();
    this.actuator.showHint(best.move);
  }.bind(this));

  this.inputManager.on('run', function() {
    if (this.running) {
      this.running = false;
      this.actuator.setRunButton('Resume');
    } else {
      this.running = true;
      this.run()
      this.actuator.setRunButton('Pause');
    }
  }.bind(this));

  this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.actuator.restart();
  this.running = false;
  this.actuator.setRunButton('Run AI');
  this.setup();
};

// Initialize game
GameManager.prototype.setup = function () {
  this.grid = new Grid(this.size);
  this.grid.addStartTiles();
  this.ai = new AI(this.grid);
  this.score = 0;
  this.over = false;
  this.won = false;
  this.actuate();
};


// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  this.actuator.actuate(this.grid, {
    score: this.score,
    over: this.over,
    won: this.won
  });
};

// makes a given move and updates state
GameManager.prototype.move = function(direction) {
  var result = this.grid.move(direction);
  this.score += result.score;

  if (!result.won) {
    if (result.moved) {
      this.grid.computerMove();
    }
  } else {
    this.won = true;
  }

  // if there are no moves, end the game
  if (!this.grid.movesAvailable()) {
    this.over = true; 
  }

  this.actuate();
}

// runs the ai until there are no moves left
GameManager.prototype.run = function() {
  var best = this.ai.getBestMove();
  this.move(best.move);
  var timeout = animationDelay;
  if (this.running && !this.over && !this.won) {
    var self = this;
    setTimeout(function(){
      self.run();
    }, timeout);
  }
}
