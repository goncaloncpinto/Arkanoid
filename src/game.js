import Paddle from "/src/paddle";
import InputHandler from "/src/input";
import Ball from "/src/ball";
import { buildLevel, level1, level2, level3 } from "/src/levels";

const GAMESTATE = {
  PAUSED: 0,
  RUNNING: 1,
  MENU: 2,
  GAMEOVER: 3,
  NEWLEVEL: 4,
  GAMECOMPLETE: 5
};

export default class Game {
  constructor(gameWidth, gameHeight) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.gamestate = GAMESTATE.MENU;
    this.ball = new Ball(this);
    this.paddle = new Paddle(this);
    this.gameObjects = [];
    this.bricks = [];
    this.lives = 3;
    this.score = 0;

    this.levels = [level1, level2, level3];
    this.currentLevel = 0;

    new InputHandler(this.paddle, this);
  }

  start() {
    if (
      this.gamestate !== GAMESTATE.MENU &&
      this.gamestate !== GAMESTATE.NEWLEVEL &&
      this.gamestate !== GAMESTATE.GAMECOMPLETE
    )
      return;

    if (this.gamestate === GAMESTATE.GAMECOMPLETE) {
      this.lives = 3;
      this.currentLevel = 0;
      this.score = 0;
      this.ball.reset();
      this.gamestate = GAMESTATE.MENU;
      return;
    }
    this.bricks = buildLevel(this, this.levels[this.currentLevel]);
    this.ball.reset();
    this.gameObjects = [this.ball, this.paddle];

    this.gamestate = GAMESTATE.RUNNING;
    document.getElementById("lives").innerHTML = this.lives;
    document.getElementById("level").innerHTML = this.currentLevel + 1;
    document.getElementById("score").innerHTML = this.score;
  }

  update(deltaTime) {
    if (this.lives === 0) this.gamestate = GAMESTATE.GAMEOVER;
    if (
      this.gamestate === GAMESTATE.PAUSED ||
      this.gamestate === GAMESTATE.MENU ||
      this.gamestate === GAMESTATE.GAMEOVER ||
      this.gamestate === GAMESTATE.NEWLEVEL ||
      this.gamestate === GAMESTATE.GAMECOMPLETE
    )
      return;

    if (this.bricks.length === 0) {
      if (this.currentLevel < this.levels.length - 1) {
        this.currentLevel++;
        document.getElementById("level").innerHTML = this.currentLevel + 1;
        this.toggleLevelChangePause();
      } else this.gamestate = GAMESTATE.GAMECOMPLETE;
    }

    [...this.gameObjects, ...this.bricks].forEach((object) => {
      object.update(deltaTime);
    });

    this.bricks = this.bricks.filter((brick) => !brick.markedForDeletion);
  }

  draw(ctx) {
    [...this.gameObjects, ...this.bricks].forEach((object) => {
      object.draw(ctx);
    });

    if (this.gamestate === GAMESTATE.PAUSED) {
      ctx.rect(0, 0, this.gameWidth, this.gameWidth);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fill();

      ctx.font = "30px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText("Paused", this.gameWidth / 2, this.gameHeight / 2);
    }

    if (this.gamestate === GAMESTATE.MENU) {
      ctx.rect(0, 0, this.gameWidth, this.gameWidth);
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fill();

      ctx.font = "30px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(
        "Press SPACEBAR to start",
        this.gameWidth / 2,
        this.gameHeight / 2
      );
    }

    if (this.gamestate === GAMESTATE.GAMEOVER) {
      ctx.rect(0, 0, this.gameWidth, this.gameWidth);
      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.fill();

      ctx.font = "30px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", this.gameWidth / 2, this.gameHeight / 2);
    }

    if (this.gamestate === GAMESTATE.GAMECOMPLETE) {
      ctx.rect(0, 0, this.gameWidth, this.gameWidth);
      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.fill();

      ctx.font = "30px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText("GAME COMPLETE !", this.gameWidth / 2, this.gameHeight / 2);

      ctx.font = "20px Arial";
      ctx.fillText(
        "Press SPACEBAR to go to Menu",
        this.gameWidth / 2,
        this.gameHeight / 2 + 50
      );
    }

    if (this.gamestate === GAMESTATE.NEWLEVEL) {
      ctx.rect(0, 0, this.gameWidth, this.gameWidth);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fill();

      ctx.font = "30px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(
        "Level " + (this.currentLevel + 1),
        this.gameWidth / 2,
        this.gameHeight / 2
      );

      ctx.font = "20px Arial";
      ctx.fillText(
        "Press SPACEBAR to continue",
        this.gameWidth / 2,
        this.gameHeight / 2 + 50
      );
    }
  }

  togglePause() {
    if (
      this.gamestate === GAMESTATE.MENU ||
      this.gamestate === GAMESTATE.GAMEOVER ||
      this.gamestate === GAMESTATE.NEWLEVEL ||
      this.gamestate === GAMESTATE.GAMECOMPLETE
    )
      return;
    if (this.gamestate === GAMESTATE.PAUSED) {
      this.gamestate = GAMESTATE.RUNNING;
    } else {
      this.gamestate = GAMESTATE.PAUSED;
    }
  }

  toggleLevelChangePause() {
    if (
      this.gamestate === GAMESTATE.MENU ||
      this.gamestate === GAMESTATE.GAMEOVER
    )
      return;
    if (this.gamestate === GAMESTATE.NEWLEVEL) {
      this.gamestate = GAMESTATE.RUNNING;
    } else {
      this.gamestate = GAMESTATE.NEWLEVEL;
    }
  }
}
