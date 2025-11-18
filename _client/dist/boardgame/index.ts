// http://localhost:3000/boardgame/index.html
// ################################################################################################
namespace reco.boardgame {
    // ============================================================================================
    export class Session {
        // ----------------------------------------------------------------------------------------
        board: Board;
        // privateBoard : Board;
        listener: Listener;
        synchronizer: Synchronizer;
        // ----------------------------------------------------------------------------------------
        constructor(commonBoardDivId: string) {
            let boardDiv = document.getElementById(commonBoardDivId) as HTMLDivElement;
            this.board = new Board(this, boardDiv);
            this.listener = new Listener(this);
            this.synchronizer = new Synchronizer(this);
        }
        // ----------------------------------------------------------------------------------------
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class Board {
        // ----------------------------------------------------------------------------------------
        session: Session;
        boardDiv: HTMLDivElement;
        svgElt: SVGSVGElement;
        items: Item[] = [];
        // ----------------------------------------------------------------------------------------
        constructor(session: Session, boardDiv: HTMLDivElement) {
            this.session = session;
            this.boardDiv = boardDiv;
            this.svgElt = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.svgElt.setAttribute("width", "100%");
            this.svgElt.setAttribute("height", "100%");
            this.boardDiv.appendChild(this.svgElt);

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('width', '100%');
            rect.setAttribute('height', '100%');
            rect.setAttribute('fill', 'darkgray');
            this.svgElt.insertBefore(rect, this.svgElt.firstChild);
        }
        // ----------------------------------------------------------------------------------------
        addItem(): Item {
            let item = new Item(this);
            this.items.push(item);
            this.svgElt.appendChild(item.svgGroup);
            return item;
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class Item {
        // ----------------------------------------------------------------------------------------
        board: Board;
        svgGroup: SVGGElement;
        // ---------------------------------- ------------------------------------------------------
        constructor(board: Board) {
            this.board = board;
            this.svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

            // const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            // image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'path/to/image.png');
            // image.setAttribute('x', '0');
            // image.setAttribute('y', '0');
            // image.setAttribute('width', '100');
            // image.setAttribute('height', '100');
            // this.svgGroup.appendChild(image);
        }
        // ----------------------------------------------------------------------------------------
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class Listener {
        // ----------------------------------------------------------------------------------------
        session: Session;
        // ----------------------------------------------------------------------------------------
        constructor(session: Session) {
            let THIS = this;
            this.session = session;
            window.addEventListener("mousedown", (evt) => {
                THIS.onMoveStart(evt.target!, evt.offsetX, evt.offsetY);
            });
            window.addEventListener("mousemove", (evt) => {
                this.onmove(evt.offsetX, evt.offsetY);
            });
            window.addEventListener("mouseup", (evt) => {
                this.onup();
            });
            window.addEventListener("touchstart", (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                const touch = evt.touches[0];
                this.ondown(evt.target!, touch.clientX, touch.clientY);
            });
            window.addEventListener("touchmove", (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                const touch = evt.touches[0];
                const rect = (evt.target as HTMLElement).getBoundingClientRect();
                this.onmove(touch.clientX, touch.clientY);
            });
            window.addEventListener("touchend", (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                this.onup();
            });

        }
        // ----------------------------------------------------------------------------------------
        onMoveStart() { }
        // ----------------------------------------------------------------------------------------
        onMove() { }
        // ----------------------------------------------------------------------------------------
        onMoveEmd() { }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class Synchronizer {
        // ----------------------------------------------------------------------------------------
        session: Session;
        // ----------------------------------------------------------------------------------------
        constructor(session: Session) {
            this.session = session;
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class Event {
        // ----------------------------------------------------------------------------------------
        // ----------------------------------------------------------------------------------------
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class GameClient {
        // ----------------------------------------------------------------------------------------
        session: Session;
        // ----------------------------------------------------------------------------------------
        constructor(session: Session) {
            this.session = session;
        }
        // ----------------------------------------------------------------------------------------
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    console.log("Board Game");
    new Session("commonBoard");
    // ============================================================================================
}
// ################################################################################################
