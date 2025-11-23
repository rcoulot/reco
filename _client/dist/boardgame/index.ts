// http://localhost:3000/boardgame/index.html
// ################################################################################################
namespace reco.boardgame {
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
    }
    // ============================================================================================
    export class Board {
        // ----------------------------------------------------------------------------------------
        session: Session;
        boardDiv: HTMLDivElement;
        svgElt: SVGSVGElement;
        itemList: Item[] = [];
        itemDict: { [key: string]: Item } = {};
        // ----------------------------------------------------------------------------------------
        constructor(session: Session, boardDiv: HTMLDivElement) {
            this.session = session;
            this.boardDiv = boardDiv;
            this.svgElt = createSvgElement('svg', { 'width': '100%', 'height': '100%' }, this.boardDiv);
            const rect = createSvgElement('rect', { 'width': '100%', 'height': '100%', 'fill': 'darkgray' }, this.svgElt, false);
        }
        // ----------------------------------------------------------------------------------------
        addItem(builder?: ItemBuilder | null): Item {
            let item = new Item(this);
            this.itemList.push(item);
            this.itemDict[item.id] = item;
            if (builder) builder.build(item);
            setAttributs(item.svgGroup, { "item-id": item.id }, true);
            return item;
        }
        // ----------------------------------------------------------------------------------------
        itemForTarget(target: EventTarget): Item | null {
            let itemId = target instanceof Element ? target.getAttribute("item-id") : null;
            if (itemId && this.itemDict[itemId]) return this.itemDict[itemId];
            return null;
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
        id: string = randomUUID();
        // ---------------------------------- ------------------------------------------------------
        constructor(board: Board) {
            this.board = board;
            this.svgGroup = svgTranslate(createSvgElement('g', {}, this.board.svgElt), svgCenter(this.board.svgElt));
        }
        // ----------------------------------------------------------------------------------------
        addImage(href: string, width: number, height: number, x: number = Number.NaN, y: number = Number.NaN) {
            let box = svgBox(svgLastElt(this.svgGroup)!);
            x = isNaN(x) ? 0 : x;
            y = isNaN(y) ? (box.y + box.height) : y;
            const svgImage = createSvgElement('image', { "x": "" + x, "y": "" + y, "width": "" + width, "height": "" + height,"href": href }, this.svgGroup);
        }
        // ----------------------------------------------------------------------------------------
        addText(text: string, x: number = Number.NaN, y: number = Number.NaN) {
            let box = svgBox(svgLastElt(this.svgGroup)!);
            x = isNaN(x) ? 0 : x;
            y = isNaN(y) ? (box.y + box.height) : y;
            const svgText = createSvgElement('text', { "x": "" + x, "y": "" + y, "font-family": fontFamily, "font-size": fontSize, "font-weight": fontWeight, "letter-spacing": letterSpacing }, this.svgGroup);
            svgText.textContent = text;
        }
    }
    // ============================================================================================
    export class Listener implements MovableNotifier {
        // ----------------------------------------------------------------------------------------
        session: Session;
        movableInfo: MovableNotifierInfo;
        // ----------------------------------------------------------------------------------------
        constructor(session: Session) {
            this.session = session;
            this.movableInfo = new MovableNotifierInfo(this);
        }
        // ----------------------------------------------------------------------------------------
        onMoveStart(target: EventTarget, x: number, y: number) { }
        // ----------------------------------------------------------------------------------------
        onMove(x: number, y: number) { }
        // ----------------------------------------------------------------------------------------
        onMoveEnd() { }
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
