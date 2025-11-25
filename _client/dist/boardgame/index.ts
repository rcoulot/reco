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
        position: Position = { x: 0, y: 0 };
        // ----------------------------------------------------------------------------------------
        constructor(board: Board, position: Position = svgCenter(board.svgElt)) {
            this.board = board;
            this.svgGroup = createSvgElement('g', {}, this.board.svgElt);
            this.moveTo(position);
        }
        // ----------------------------------------------------------------------------------------
        addImage(href: string, size: Size, internalPosition: Position = { x: Number.NaN, y: Number.NaN }) {
            let box = svgBox(svgLastElt(this.svgGroup)!);
            if (isNaN(internalPosition.x)) {
                internalPosition.x = 0;
                internalPosition.y = box.y + box.height;
            }
            const svgImage = createSvgElement('image', {
                "x": "" + internalPosition.x, "y": "" + internalPosition.y,
                "width": "" + size.width, "height": "" + size.height,
                "href": href,
                "item-id": this.id
            }, this.svgGroup);
        }
        // ----------------------------------------------------------------------------------------
        addText(text: string, internalPosition: Position = { x: Number.NaN, y: Number.NaN }) {
            let box = svgBox(svgLastElt(this.svgGroup)!);
            if (isNaN(internalPosition.x)) {
                internalPosition.x = 0;
                internalPosition.y = box.y + box.height;
            }
            const svgText = createSvgElement('text', {
                "x": "" + internalPosition.x, "y": "" + internalPosition.y,
                "font-family": fontFamily, "font-size": fontSize,
                "font-weight": fontWeight, "letter-spacing": letterSpacing,
                "item-id": this.id
            }, this.svgGroup);
            svgText.textContent = text;
        }
        // ----------------------------------------------------------------------------------------
        moveTo(position: Position) {
            this.position = position;
            this.svgGroup = svgTranslate(this.svgGroup, this.position);
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
        onMoveStart(target: EventTarget, x: number, y: number): Item | null {
            return this.session.board.itemForTarget(target);
        }
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
    item.addImage("./images/mario.png", { width: 50, height: 50 });
    // ============================================================================================
}
// ################################################################################################
