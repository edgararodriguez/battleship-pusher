// import needed classes and services
import { Component, ViewContainerRef } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { BoardService } from './board.service'
import { Board } from './board'
// set game constants
declare const Pusher: any;
const NUM_PLAYERS = 2;
const BOARD_SIZE = 6;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [BoardService]
})

export class AppComponent {
  pusherChannel: any;
  canPlay: boolean = true;
  player: number = 0;
  players: number = 0;
  gameId: string;

  constructor(
    private toastr: ToastsManager,
    private _vcr: ViewContainerRef,
    private boardService: BoardService,
  ) {
    this.toastr.setRootViewContainerRef(_vcr);
    this.createBoards();
    this.initPusher();
    this.listenForChanges();
  }
 // initialise Pusher and bind to presence channel
  initPusher() : AppComponent {
    // findOrCreate unique channel ID
    let id = this.getQueryParam('id');
    if (!id) {
      id = this.getUniqueId();
      location.search = location.search ? '&id=' + id : 'id=' + id;
    }
    this.gameId = id;
    // init pusher
    const pusher = new Pusher('50cf0690ee1081a25514', {
      authEndpoint: '/pusher/auth',
      cluster: 'us2'
    });
    // bind to relevant channels
    this.pusherChannel = pusher.subscribe(id);
    this.pusherChannel.bind('pusher:member_added', member => { this.players++ })
    this.pusherChannel.bind('pusher:subscription_succeeded', members => {
      this.players = members.count;
      this.setPlayer(this.players);
      this.toastr.success("Success", 'Connected!');
    })
    this.pusherChannel.bind('pusher:member_removed', member => { this.players-- });

    return this;
  }
  // Listen for `client-fire` events.
  // Update the board object and other properties when
  // event triggered
  listenForChanges() : AppComponent {
    this.pusherChannel.bind('client-fire', (obj) => {
      this.canPlay = !this.canPlay;
      this.boards[obj.boardId] = obj.board;
      this.boards[obj.player].player.score = obj.score;
    });
    return this;
  }
// initialise player and set turn
  setPlayer(players:number = 0) : AppComponent {
    this.player = players - 1;
    if (players == 1) {
      this.canPlay = true;
    } else if (players == 2) {
      this.canPlay = false;
    }
    return this;
  }
  // event handler for click event on
      // each tile - fires torpedo at selected tile
  fireTorpedo(e:any) : AppComponent {
    let id = e.target.id,
      boardId = id.substring(1,2),
      row = id.substring(2,3), col = id.substring(3,4),
      tile = this.boards[boardId].tiles[row][col];
    if (!this.checkValidHit(boardId, tile)) {
      return;
    }

    if (tile.value == 1) {
      this.toastr.success("You got this.", "HURRAAA! YOU SANK A SHIP!");
      this.boards[boardId].tiles[row][col].status = 'win';
      this.boards[this.player].player.score++;
    } else {
      this.toastr.info("Keep trying fam.", "OOPS! YOU MISSED THIS TIME");
      this.boards[boardId].tiles[row][col].status = 'fail'
    }
    this.canPlay = false;
    this.boards[boardId].tiles[row][col].used = true;
    this.boards[boardId].tiles[row][col].value = "X";
    // trigger `client-fire` event once a torpedo
    // is successfully fired
    this.pusherChannel.trigger('client-fire', {
      player: this.player,
      score: this.boards[this.player].player.score,
      boardId: boardId,
      board: this.boards[boardId]
    });
    return this;
  }

  createBoards() : AppComponent {
    for (let i = 0; i < NUM_PLAYERS; i++)
      this.boardService.createBoard(BOARD_SIZE);
    return this;
  }

  checkValidHit(boardId: number, tile: any) : boolean {
    if (boardId == this.player) {
      this.toastr.error("Don't commit suicide.", "You can't hit your own board.")
      return false;
    }
    if (this.winner) {
      this.toastr.error("Game is over");
      return false;
    }
    if (!this.canPlay) {
      this.toastr.error("A bit too eager.", "It's not your turn to play.");
      return false;
    }
    if(tile.value == "X") {
      this.toastr.error("Don't waste your torpedos.", "You already shot here.");
      return false;
    }
    return true;
  }
// helper function to get query param
  getQueryParam(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  }
//helper function to create  a unique presence channel
//name for each game
  getUniqueId () {
    return 'presence-' + Math.random().toString(36).substr(2, 8);
  }
//get all boards and assign to board property
  get boards () : Board[] {
    return this.boardService.getBoards()
  }
  // winner property to determine if a user has won the game.
  // once a user gets a score higher than the size of the game
  // board, he has won.
  get winner () : Board {
    return this.boards.find(board => board.player.score >= BOARD_SIZE);
  }
//checks if player is a valid player for the game
  get validPlayer(): boolean {
    return (this.players >= NUM_PLAYERS) && (this.player < NUM_PLAYERS);
  }
}
