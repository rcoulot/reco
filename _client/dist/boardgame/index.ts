// http://localhost:3000/boardgame/index.html
// ################################################################################################
namespace reco.boardgame {
    // ============================================================================================
    export class Session {
        // ----------------------------------------------------------------------------------------
        id: string;
        board: Board;
        synchronizer: Synchronizer;
        // ----------------------------------------------------------------------------------------
        constructor(commonBoardDivId: string, sessionId: string = uuid(), active: boolean = true) {
            this.id = sessionId;
            let boardDiv = document.getElementById(commonBoardDivId) as HTMLDivElement;
            this.board = new Board(this, boardDiv);
            if (active) new Listener(this);
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
        get width(): number { return this.boardDiv.offsetWidth; }
        get height(): number { return this.boardDiv.offsetHeight; }
        get center(): Position { return { x: this.width / 2, y: this.height / 2 }; }
        // ----------------------------------------------------------------------------------------
        constructor(session: Session, boardDiv: HTMLDivElement) {
            this.session = session;
            this.boardDiv = boardDiv;
            this.svgElt = createSvgElement('svg', { 'width': '100%', 'height': '100%' }, this.boardDiv);
        }
        // ----------------------------------------------------------------------------------------
        addItem(position: Position = svgCenter(this.svgElt), itemId: string = uuid(), sessionId: string = ""): Item {
            console.log("Session.addItem [" + this.session.id + "]" + sessionId + "/" + itemId)
            let item = new Item(this, itemId);
            this.itemList.push(item);
            this.itemDict[item.id] = item;
            setAttributs(item.svgGroup, { "item-id": item.id, "session-id": this.session.id }, true);
            this.session.synchronizer.addItem(position, item.id, sessionId);
            item.moveTo(position);
            for (let otherItem of this.itemList) {
                if (otherItem.onTop) svgOnTop(otherItem.svgGroup)
            }
            return item;
        }
        // ----------------------------------------------------------------------------------------
        itemForTarget(target: EventTarget): Item | null {
            let sessionId = target instanceof Element ? target.getAttribute("session-id") : null;
            if (sessionId !== this.session.id) return null;
            let itemId = target instanceof Element ? target.getAttribute("item-id") : null;
            if (itemId && this.itemDict[itemId]) return this.itemDict[itemId];
            return null;
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class Item {
        // ----------------------------------------------------------------------------------------
        board: Board;
        movable: boolean = false;
        onTop: boolean = false;
        svgGroup: SVGGElement;
        id: string;
        position: Position = { x: 0, y: 0 };
        // ----------------------------------------------------------------------------------------
        constructor(board: Board, itemId: string) {
            this.id = itemId;
            this.board = board;
            this.svgGroup = createSvgElement('g', {}, this.board.svgElt);
        }
        // ----------------------------------------------------------------------------------------
        setMovable(movable: boolean, sessionId: string = "") {
            this.movable = movable;
            this.board.session.synchronizer.setMovable(movable, this.id, sessionId)
        }
        // ----------------------------------------------------------------------------------------
        addImage(href: string, size: Size, internalPosition: Position = { x: Number.NaN, y: Number.NaN }, sessionId: string = "") {
            let box = svgBox(svgLastElt(this.svgGroup)!);
            if (isNaN(internalPosition.x)) {
                internalPosition.x = 0;
                internalPosition.y = box.y + box.height;
            }
            const svgImage = createSvgElement('image', {
                "x": "" + internalPosition.x, "y": "" + internalPosition.y,
                "width": "" + size.width, "height": "" + size.height,
                "href": href,
                "session-id": this.board.session.id,
                "item-id": this.id
            }, this.svgGroup);
            this.board.session.synchronizer.addImage(href, size, internalPosition, this.id, sessionId)
        }
        // ----------------------------------------------------------------------------------------
        addRect(size: Size, internalPosition: Position = { x: Number.NaN, y: Number.NaN }, fill: string = "none", sessionId: string = "") {
            let box = svgBox(svgLastElt(this.svgGroup)!);
            if (isNaN(internalPosition.x)) {
                internalPosition.x = 0;
                internalPosition.y = box.y + box.height;
            }
            const svgRect = createSvgElement('rect', {
                "x": "" + internalPosition.x, "y": "" + internalPosition.y,
                "width": "" + size.width, "height": "" + size.height,
                "fill": fill,
                "session-id": this.board.session.id,
                "item-id": this.id
            }, this.svgGroup);
            this.board.session.synchronizer.addRect(size, internalPosition, fill, this.id, sessionId)
        }
        // ----------------------------------------------------------------------------------------
        addText(text: string, internalPosition: Position = { x: Number.NaN, y: Number.NaN }, sessionId: string = "") {
            let box = svgBox(svgLastElt(this.svgGroup)!);
            if (isNaN(internalPosition.x)) {
                internalPosition.x = 0;
                internalPosition.y = box.y + box.height;
            }
            const svgText = createSvgElement('text', {
                "x": "" + internalPosition.x, "y": "" + internalPosition.y,
                "font-family": fontFamily, "font-size": fontSize,
                "font-weight": fontWeight, "letter-spacing": letterSpacing,
                "session-id": this.board.session.id,
                "item-id": this.id
            }, this.svgGroup);
            svgText.textContent = text;
            this.board.session.synchronizer.addText(text, internalPosition, this.id, sessionId)
        }
        // ----------------------------------------------------------------------------------------
        moveTo(position: Position, sessionId: string = "") {
            this.position = position;
            this.svgGroup = svgTranslate(this.svgGroup, this.position);
        }
    }
    // ============================================================================================
    export class Listener implements MovableNotifier {
        // ----------------------------------------------------------------------------------------
        session: Session;
        movableInfo: MovableNotifierInfo;
        get id(): string { return this.session.id }
        // ----------------------------------------------------------------------------------------
        constructor(session: Session) {
            this.session = session;
            this.movableInfo = new MovableNotifierInfo(this);
        }
        // ----------------------------------------------------------------------------------------
        onMoveStart(target: EventTarget, position: Position): Item | null {
            let item = this.session.board.itemForTarget(target);
            item = item && item.movable ? item : null;
            return item;
        }
        // ----------------------------------------------------------------------------------------
        onMove(position: Position) {
            this.session.board.session.synchronizer.moveTo(position, this.movableInfo.item!.id, "");
        }
        // ----------------------------------------------------------------------------------------
        onMoveEnd() {
            this.session.board.session.synchronizer.moveTo(this.movableInfo.item!.position, this.movableInfo.item!.id, "", true);
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class RemoteSession {
        // ----------------------------------------------------------------------------------------
        id: string;
        session: Session;
        constructor(session: Session) {
            this.session = session;
            this.id = this.session.id;
        }
        // ----------------------------------------------------------------------------------------
        addItem(position: Position, itemId: string, sessionId: string) {
            console.log("RemoteSession.addItem " + sessionId + "/" + itemId)
            this.session.board.addItem(position, itemId, sessionId);
        }
        // ----------------------------------------------------------------------------------------
        setMovable(movable: boolean, itemId: string, sessionId: string) {
            console.log("RemoteSession.setMovable " + sessionId + "/" + itemId + " > " + movable)
            let item = this.session.board.itemDict[itemId]
            item.setMovable(movable, sessionId);
        }
        // ----------------------------------------------------------------------------------------
        addImage(href: string, size: Size, internalPosition: Position, itemId: string, sessionId: string) {
            console.log("RemoteSession.addImage " + sessionId + "/" + itemId + " > " + href)
            let item = this.session.board.itemDict[itemId]
            item.addImage(href, size, internalPosition, sessionId);
        }
        // ----------------------------------------------------------------------------------------
        addRect(size: Size, internalPosition: Position, fill: string, itemId: string, sessionId: string) {
            console.log("RemoteSession.addRect " + sessionId + "/" + itemId)
            let item = this.session.board.itemDict[itemId]
            item.addRect(size, internalPosition, fill, sessionId);
        }
        // ----------------------------------------------------------------------------------------
        addText(text: string, internalPosition: Position, itemId: string, sessionId: string) {
            console.log("RemoteSession.addText " + sessionId + "/" + itemId + " > " + text)
            let item = this.session.board.itemDict[itemId]
            item.addText(text, internalPosition, sessionId);
        }
        // ----------------------------------------------------------------------------------------
        moveTo(position: Position, itemId: string, sessionId: string = "") {
            console.log("RemoteSession.moveTo " + sessionId + "/" + itemId + " > " + position.x + " x " + position.y)
            let item = this.session.board.itemDict[itemId]
            item.moveTo(position, sessionId);
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class Synchronizer {
        // ----------------------------------------------------------------------------------------
        session: Session;
        remoteSessions: RemoteSession[] = [];
        lastEvent: number = 0;
        // ----------------------------------------------------------------------------------------
        constructor(session: Session) {
            this.session = session;
        }
        // ----------------------------------------------------------------------------------------
        addRemoteSession(remoteSession: RemoteSession) {
            this.remoteSessions.push(remoteSession);
        }
        // ----------------------------------------------------------------------------------------
        addItem(position: Position, itemId: string, sessionId: string) {
            for (let remoteSession of this.remoteSessions)
                if (sessionId !== remoteSession.id)
                    remoteSession.addItem(position, itemId, this.session.id);
        }
        // ----------------------------------------------------------------------------------------
        setMovable(movable: boolean, itemId: string, sessionId: string) {
            for (let remoteSession of this.remoteSessions)
                if (sessionId !== remoteSession.id)
                    remoteSession.setMovable(movable, itemId, this.session.id);
        }
        // ----------------------------------------------------------------------------------------
        addImage(href: string, size: Size, internalPosition: Position, itemId: string, sessionId: string) {
            for (let remoteSession of this.remoteSessions)
                if (sessionId !== remoteSession.id)
                    remoteSession.addImage(href, size, internalPosition, itemId, this.session.id);
        }
        // ----------------------------------------------------------------------------------------
        addRect(size: Size, internalPosition: Position, fill: string, itemId: string, sessionId: string) {
            for (let remoteSession of this.remoteSessions)
                if (sessionId !== remoteSession.id)
                    remoteSession.addRect(size, internalPosition, fill, itemId, this.session.id);
        }
        // ----------------------------------------------------------------------------------------
        addText(text: string, internalPosition: Position, itemId: string, sessionId: string) {
            for (let remoteSession of this.remoteSessions)
                if (sessionId !== remoteSession.id)
                    remoteSession.addText(text, internalPosition, itemId, this.session.id);
        }
        // ----------------------------------------------------------------------------------------
        moveTo(position: Position, itemId: string, sessionId: string, forced: boolean = false) {
            let now = Date.now()
            if (forced || now - this.lastEvent > 0) { // 500) {
                for (let remoteSession of this.remoteSessions)
                    if (sessionId !== remoteSession.id)
                        remoteSession.moveTo(position, itemId, this.session.id);
                this.lastEvent = now;
            }
        }
        // ----------------------------------------------------------------------------------------

    }
    // ============================================================================================
    console.log("Board Game");
    let session1 = new Session("board1", "S1");
    let session2 = new Session("board2", "S2"); //, false);
    session2.board.svgElt.setAttribute("transform", "rotate(180)")
    session1.synchronizer.addRemoteSession(new RemoteSession(session2));
    session2.synchronizer.addRemoteSession(new RemoteSession(session1));

    let H = session1.board.height;
    let W = session1.board.width;
    let C = session1.board.center;
    console.log(`W=${W}, H=${H}, C=${C.x}x${C.y}`)

    session1.board.addItem({ x: 0, y: 0 }, "cyanZone").addRect({ "width": W, "height": H / 4 }, { x: 0, y: 0 }, "cyan");
    session1.board.addItem({ x: 0, y: 0 }, "grayZone").addRect({ "width": W, "height": H / 2 }, { x: 0, y: H / 4 }, "darkgray");
    session1.board.addItem({ x: 0, y: 0 }, "yellowZone").addRect({ "width": W, "height": H / 4 }, { x: 0, y: H * 3 / 4 }, "yellow");

    session1.board.itemDict["cyanZone"].onTop = true;
    session2.board.itemDict["yellowZone"].onTop = true;

    {
        let item = session1.board.addItem(pointTranslate(C, { width: -100, height: -25 }), "I1");
        item.addText("Mario 1");
        item.addImage("./images/mario.png", { width: 50, height: 50 });
        item.setMovable(true);
    }
    {
        let item = session1.board.addItem(pointTranslate(C, { width: 100, height: -25 }), "I2");
        item.addText("Mario 2");
        item.addImage("./images/mario.png", { width: 50, height: 50 });
        item.setMovable(true);
    }
    // ============================================================================================
}
// ################################################################################################
