// http://localhost:3000/boardgame/index.html
// ################################################################################################
namespace reco.boardgame {
    // ============================================================================================    
    const fontFamily = 'Times New Roman';
    const fontSize = "12";
    const fontWeight = "normal";
    const letterSpacing = "1px";
    // ============================================================================================
    export class Session {
        // ----------------------------------------------------------------------------------------
        board: Board;
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
        get boundingRect(): DOMRect { return this.svgElt.getBoundingClientRect(); }
        get centerX(): number { return this.boundingRect.width / 2; }
        get centerY(): number { return this.boundingRect.height / 2; }
        get width(): number { return this.boundingRect.width; }
        get height(): number { return this.boundingRect.width; }
        // ----------------------------------------------------------------------------------------
        addItem(builder?: ItemBuilder | null): Item {
            let item = new Item(this);
            this.items.push(item);
            if (builder) builder.build(item);
            this.svgElt.appendChild(item.svgGroup);
            return item;
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export interface ItemBuilder {
        // ----------------------------------------------------------------------------------------
        build(item: Item): void;
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
            this.svgGroup.setAttribute("transform", "translate(" + this.board.centerX + ", " + this.board.centerY + ")");
        }
        // ----------------------------------------------------------------------------------------
        get boundingClientRect(): DOMRect { return this.svgGroup.getBoundingClientRect(); }
        get lastElt(): SVGGraphicsElement | null {
            let len = this.svgGroup.children.length;
            if (len === 0) return null;
            return this.svgGroup.children.item(len - 1) as SVGGraphicsElement;
        }
        get lastEltBBox(): DOMRect | null {
            let lastElt = this.lastElt;
            if (!lastElt) return null;
            return lastElt.getBBox();
        }
        get lastEltX(): number {
            let lastElt = this.lastElt;
            if (!lastElt) return 0;
            return this.lastEltBBox!.x;
        }
        get lastEltY(): number {
            let lastElt = this.lastElt;
            if (!lastElt) return 0;
            return this.lastEltBBox!.y;
        }
        get lastEltHeight(): number {
            let lastElt = this.lastElt;
            if (!lastElt) return 0;
            return this.lastEltBBox!.height;
        }
        get lastEltWidth(): number {
            let lastElt = this.lastElt;
            if (!lastElt) return 0;
            return this.lastEltBBox!.width;
        }
        // ----------------------------------------------------------------------------------------
        addImage(href: string, width: number, height: number, x: number = Number.NaN, y: number = Number.NaN) {
            x = isNaN(x) ? 0 : x;
            y = isNaN(y) ? (this.lastEltY + this.lastEltHeight) : y;
            const svgImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            svgImage.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href);
            svgImage.setAttribute('x', '' + x);
            svgImage.setAttribute('y', '' + y);
            svgImage.setAttribute('width', '' + width);
            svgImage.setAttribute('height', '' + height);
            this.svgGroup.appendChild(svgImage);
        }
        // ----------------------------------------------------------------------------------------
        addText(text: string, x: number = Number.NaN, y: number = Number.NaN) {
            x = isNaN(x) ? 0 : x;
            y = isNaN(y) ? (this.lastEltY + this.lastEltHeight) : y;
            const svgText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            svgText.setAttribute("x", "" + x);
            svgText.setAttribute("y", "" + y);
            svgText.setAttribute('font-family', fontFamily);
            svgText.setAttribute('font-size', fontSize);
            svgText.setAttribute('font-weight', fontWeight);
            svgText.setAttribute('letter-spacing', letterSpacing);
            svgText.textContent = text;
            this.svgGroup.appendChild(svgText);
        }
    }
    // ============================================================================================
    export class Listener {
        // ----------------------------------------------------------------------------------------
        session: Session;
        moving: boolean = false;
        drag: { evX0: number, evY0: number, itemX0: number, itemY0: number, item: Item } | null = null
        // ----------------------------------------------------------------------------------------
        constructor(session: Session) {
            let THIS = this;
            this.session = session;
            window.addEventListener("mousedown", (evt) => {
                THIS.onMoveStart(evt.target!, evt.clientX, evt.clientY);
            });
            window.addEventListener("mousemove", (evt) => {
                if (THIS.moving) THIS.onMove(evt.clientX, evt.clientY);
            });
            window.addEventListener("mouseup", (evt) => {
                if (THIS.moving) THIS.onMoveEnd();
            });
            window.addEventListener("touchstart", (evt) => {
                if (evt.touches.length === 1) {
                    const touch = evt.touches[0];
                    THIS.onMoveStart(evt.target!, touch.clientX, touch.clientY);
                }
            });
            window.addEventListener("touchmove", (evt) => {
                if (THIS.moving) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    const touch = evt.touches[0];
                    THIS.onMove(touch.clientX, touch.clientY);
                }
            });
            window.addEventListener("touchend", (evt) => {
                if (THIS.moving) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    THIS.onMoveEnd();
                }
            });

        }
        // ----------------------------------------------------------------------------------------
        onMoveStart(target: EventTarget, x: number, y: number) {
            let targetParent = (target as SVGElement).parentNode as SVGGElement
            if (this.childrenGroupElements.indexOf(targetParent) !== -1) {
                const group = this.childrenGroupsById[targetParent.id];
                this.drag = {
                    "group": group,
                    "evX0": offsetX,
                    "evY0": offsetY,
                    "groupX0": group.x,
                    "groupY0": group.y
                };
            }
        }
        // ----------------------------------------------------------------------------------------
        onMove(x: number, y: number) {

        }
        // ----------------------------------------------------------------------------------------
        onMoveEnd() {

        }
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
    let session = new Session("commonBoard");
    let item = session.board.addItem();
    item.addText("Mario");
    item.addImage("./images/mario.png", 50, 50);
    // ============================================================================================
}
// ################################################################################################
