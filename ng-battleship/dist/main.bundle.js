webpackJsonp([1,5],{

/***/ 350:
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 350;


/***/ }),

/***/ 351:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__ = __webpack_require__(442);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__environments_environment__ = __webpack_require__(467);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__app_app_module__ = __webpack_require__(463);




if (__WEBPACK_IMPORTED_MODULE_2__environments_environment__["a" /* environment */].production) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["enableProdMode"])();
}
__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_3__app_app_module__["a" /* AppModule */]);
//# sourceMappingURL=/Users/eagascarodriguez171/Desktop/battleship-pusher/ng-battleship/src/main.js.map

/***/ }),

/***/ 462:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ng2_toastr_ng2_toastr__ = __webpack_require__(343);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ng2_toastr_ng2_toastr___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_ng2_toastr_ng2_toastr__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__board_service__ = __webpack_require__(464);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var NUM_PLAYERS = 2;
var BOARD_SIZE = 6;
var AppComponent = (function () {
    function AppComponent(toastr, _vcr, boardService) {
        this.toastr = toastr;
        this._vcr = _vcr;
        this.boardService = boardService;
        this.canPlay = true;
        this.player = 0;
        this.players = 0;
        this.toastr.setRootViewContainerRef(_vcr);
        this.createBoards();
        this.initPusher();
        this.listenForChanges();
    }
    // initialise Pusher and bind to presence channel
    AppComponent.prototype.initPusher = function () {
        var _this = this;
        // findOrCreate unique channel ID
        var id = this.getQueryParam('id');
        if (!id) {
            id = this.getUniqueId();
            location.search = location.search ? '&id=' + id : 'id=' + id;
        }
        this.gameId = id;
        // init pusher
        var pusher = new Pusher('50cf0690ee1081a25514', {
            authEndpoint: '/pusher/auth',
            cluster: 'us2'
        });
        // bind to relevant channels
        this.pusherChannel = pusher.subscribe(id);
        this.pusherChannel.bind('pusher:member_added', function (member) { _this.players++; });
        this.pusherChannel.bind('pusher:subscription_succeeded', function (members) {
            _this.players = members.count;
            _this.setPlayer(_this.players);
            _this.toastr.success("Success", 'Connected!');
        });
        this.pusherChannel.bind('pusher:member_removed', function (member) { _this.players--; });
        return this;
    };
    // Listen for `client-fire` events.
    // Update the board object and other properties when
    // event triggered
    AppComponent.prototype.listenForChanges = function () {
        var _this = this;
        this.pusherChannel.bind('client-fire', function (obj) {
            _this.canPlay = !_this.canPlay;
            _this.boards[obj.boardId] = obj.board;
            _this.boards[obj.player].player.score = obj.score;
        });
        return this;
    };
    // initialise player and set turn
    AppComponent.prototype.setPlayer = function (players) {
        if (players === void 0) { players = 0; }
        this.player = players - 1;
        if (players == 1) {
            this.canPlay = true;
        }
        else if (players == 2) {
            this.canPlay = false;
        }
        return this;
    };
    // event handler for click event on
    // each tile - fires torpedo at selected tile
    AppComponent.prototype.fireTorpedo = function (e) {
        var id = e.target.id, boardId = id.substring(1, 2), row = id.substring(2, 3), col = id.substring(3, 4), tile = this.boards[boardId].tiles[row][col];
        if (!this.checkValidHit(boardId, tile)) {
            return;
        }
        if (tile.value == 1) {
            this.toastr.success("You got this.", "HURRAAA! YOU SANK A SHIP!");
            this.boards[boardId].tiles[row][col].status = 'win';
            this.boards[this.player].player.score++;
        }
        else {
            this.toastr.info("Keep trying fam.", "OOPS! YOU MISSED THIS TIME");
            this.boards[boardId].tiles[row][col].status = 'fail';
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
    };
    AppComponent.prototype.createBoards = function () {
        for (var i = 0; i < NUM_PLAYERS; i++)
            this.boardService.createBoard(BOARD_SIZE);
        return this;
    };
    AppComponent.prototype.checkValidHit = function (boardId, tile) {
        if (boardId == this.player) {
            this.toastr.error("Don't commit suicide.", "You can't hit your own board.");
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
        if (tile.value == "X") {
            this.toastr.error("Don't waste your torpedos.", "You already shot here.");
            return false;
        }
        return true;
    };
    // helper function to get query param
    AppComponent.prototype.getQueryParam = function (name) {
        var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    };
    //helper function to create  a unique presence channel
    //name for each game
    AppComponent.prototype.getUniqueId = function () {
        return 'presence-' + Math.random().toString(36).substr(2, 8);
    };
    Object.defineProperty(AppComponent.prototype, "boards", {
        //get all boards and assign to board property
        get: function () {
            return this.boardService.getBoards();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppComponent.prototype, "winner", {
        // winner property to determine if a user has won the game.
        // once a user gets a score higher than the size of the game
        // board, he has won.
        get: function () {
            return this.boards.find(function (board) { return board.player.score >= BOARD_SIZE; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppComponent.prototype, "validPlayer", {
        //checks if player is a valid player for the game
        get: function () {
            return (this.players >= NUM_PLAYERS) && (this.player < NUM_PLAYERS);
        },
        enumerable: true,
        configurable: true
    });
    AppComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-root',
            template: __webpack_require__(626),
            styles: [__webpack_require__(624)],
            providers: [__WEBPACK_IMPORTED_MODULE_2__board_service__["a" /* BoardService */]]
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1_ng2_toastr_ng2_toastr__["ToastsManager"] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1_ng2_toastr_ng2_toastr__["ToastsManager"]) === 'function' && _a) || Object, (typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["ViewContainerRef"] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_0__angular_core__["ViewContainerRef"]) === 'function' && _b) || Object, (typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_2__board_service__["a" /* BoardService */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_2__board_service__["a" /* BoardService */]) === 'function' && _c) || Object])
    ], AppComponent);
    return AppComponent;
    var _a, _b, _c;
}());
//# sourceMappingURL=/Users/eagascarodriguez171/Desktop/battleship-pusher/ng-battleship/src/app.component.js.map

/***/ }),

/***/ 463:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__(137);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_forms__ = __webpack_require__(432);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_http__ = __webpack_require__(438);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_ng2_toastr_ng2_toastr__ = __webpack_require__(343);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_ng2_toastr_ng2_toastr___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_ng2_toastr_ng2_toastr__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__app_component__ = __webpack_require__(462);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["NgModule"])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_5__app_component__["a" /* AppComponent */]
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["BrowserModule"],
                __WEBPACK_IMPORTED_MODULE_2__angular_forms__["a" /* FormsModule */],
                __WEBPACK_IMPORTED_MODULE_3__angular_http__["a" /* HttpModule */],
                __WEBPACK_IMPORTED_MODULE_4_ng2_toastr_ng2_toastr__["ToastModule"].forRoot()
            ],
            providers: [],
            bootstrap: [__WEBPACK_IMPORTED_MODULE_5__app_component__["a" /* AppComponent */]]
        }), 
        __metadata('design:paramtypes', [])
    ], AppModule);
    return AppModule;
}());
//# sourceMappingURL=/Users/eagascarodriguez171/Desktop/battleship-pusher/ng-battleship/src/app.module.js.map

/***/ }),

/***/ 464:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__board__ = __webpack_require__(465);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__player__ = __webpack_require__(466);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return BoardService; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var BoardService = (function () {
    function BoardService() {
        this.playerId = 1;
        this.boards = [];
    }
    // method for creating a board which takes
    // an optional size parameter that defaults to 5
    BoardService.prototype.createBoard = function (size) {
        if (size === void 0) { size = 5; }
        // create tiles for board
        var tiles = [];
        for (var i = 0; i < size; i++) {
            tiles[i] = [];
            for (var j = 0; j < size; j++) {
                tiles[i][j] = { used: false, value: 0, status: '' };
            }
        }
        // generate random ships for the board
        for (var i = 0; i < size * 2; i++) {
            tiles = this.randomShips(tiles, size);
        }
        // create board
        var board = new __WEBPACK_IMPORTED_MODULE_1__board__["a" /* Board */]({
            player: new __WEBPACK_IMPORTED_MODULE_2__player__["a" /* Player */]({ id: this.playerId++ }),
            tiles: tiles
        });
        // append created board to `boards` property
        this.boards.push(board);
        return this;
    };
    // function to return the tiles after a value
    // of 1 (a ship) is inserted into a random tile
    // in the array of tiles
    BoardService.prototype.randomShips = function (tiles, len) {
        len = len - 1;
        var ranRow = this.getRandomInt(0, len), ranCol = this.getRandomInt(0, len);
        if (tiles[ranRow][ranCol].value == 1) {
            return this.randomShips(tiles, len);
        }
        else {
            tiles[ranRow][ranCol].value = 1;
            return tiles;
        }
    };
    // helper function to return a random
    // integer between ${min} and ${max}
    BoardService.prototype.getRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    // returns all created boards
    BoardService.prototype.getBoards = function () {
        return this.boards;
    };
    BoardService = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(), 
        __metadata('design:paramtypes', [])
    ], BoardService);
    return BoardService;
}());
//# sourceMappingURL=/Users/eagascarodriguez171/Desktop/battleship-pusher/ng-battleship/src/board.service.js.map

/***/ }),

/***/ 465:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Board; });
var Board = (function () {
    function Board(values) {
        if (values === void 0) { values = {}; }
        Object.assign(this, values);
    }
    return Board;
}());
//# sourceMappingURL=/Users/eagascarodriguez171/Desktop/battleship-pusher/ng-battleship/src/board.js.map

/***/ }),

/***/ 466:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Player; });
var Player = (function () {
    function Player(values) {
        if (values === void 0) { values = {}; }
        this.score = 0;
        Object.assign(this, values);
    }
    return Player;
}());
//# sourceMappingURL=/Users/eagascarodriguez171/Desktop/battleship-pusher/ng-battleship/src/player.js.map

/***/ }),

/***/ 467:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return environment; });
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.
var environment = {
    production: false
};
//# sourceMappingURL=/Users/eagascarodriguez171/Desktop/battleship-pusher/ng-battleship/src/environment.js.map

/***/ }),

/***/ 624:
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ 626:
/***/ (function(module, exports) {

module.exports = "<div class=\"section\">\n  <div class=\"container\">\n    <div class=\"content\">\n      <h1 class=\"title\">Ready to sink some battleships?</h1>\n      <h6 class=\"subtitle is-6\"><strong>Edgar's Battleship</strong></h6>\n      <hr>\n\n      <!-- shows when a player has won the game -->\n      <section *ngIf=\"winner\" class=\"notification is-success has-text-centered\" style=\"color:white\">\n        <h1>Player {{ winner.player.id }} has won the game!</h1>\n        <h5>Click <a href=\"{{ gameUrl }}\">here</a> to start a new game.</h5>\n      </section>\n\n      <!-- shows while waiting for 2nd user to join -->\n      <div *ngIf=\"players < 2\">\n        <h2>Waiting for 2nd user to join...</h2>\n        <h3 class=\"subtitle is-6\">You can invite them with this link: {{ gameUrl }}?id={{ gameId }}. You can also open <a href=\"{{ gameUrl }}?id={{ gameId }}\" target=\"_blank\">this link</a> in a new browser, to play all by yourself.</h3>\n      </div>\n\n      <!-- loops through the boards array and displays the player and board tiles -->\n      <div class=\"columns\" *ngIf=\"validPlayer\">\n        <div class=\"column has-text-centered\" *ngFor=\"let board of boards; let i = index\">\n          <h5>\n            PLAYER {{ board.player.id }} <span class=\"tag is-info\" *ngIf=\"i == player\">You</span>\n            // <strong>SCORE: {{ board.player.score }}</strong>\n          </h5>\n          <table class=\"is-bordered\" [style.opacity] = \"i == player ? 0.5 : 1\">\n            <tr *ngFor=\"let row of board.tiles; let j = index\">\n              <td *ngFor=\"let col of row; let k = index\"\n              (click) = \"fireTorpedo($event)\"\n              [style.background-color] = \"col.used ? '' : 'transparent'\"\n              [class.win] = \"col.status == 'win'\" [class.fail] = \"col.status !== 'win'\"\n              class=\"battleship-tile\" id=\"t{{i}}{{j}}{{k}}\">\n              {{ col.value == \"X\" ? \"X\" : \"💀\" }}\n            </td>\n          </tr>\n        </table>\n      </div>\n    </div>\n\n    <div class=\"has-text-centered\">\n      <span class=\"tag is-warning\" *ngIf=\"canPlay\">Your turn!</span>\n      <span class=\"tag is-danger\" *ngIf=\"!canPlay\">Other player's turn.</span>\n      <h5 class=\"title\"><small>{{ players }} player(s) in game</small></h5>\n    </div>\n\n  </div>\n</div>\n</div>\n"

/***/ }),

/***/ 645:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(351);


/***/ })

},[645]);
//# sourceMappingURL=main.bundle.map