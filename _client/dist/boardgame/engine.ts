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
        constructor(commonBoardDivId: string, proportion: Size, sessionId: string = uuid(), active: boolean = true) {
            this.id = sessionId;
            let boardDiv = document.getElementById(commonBoardDivId) as HTMLDivElement;
            this.board = new Board(this, boardDiv, proportion);
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
        sizeR1: Size;
        sizeR0: Size;
        get widthR0(): number { return this.boardDiv.offsetWidth; }
        get heightR0(): number { return this.boardDiv.offsetHeight; }
        // get center(): Position { return { x: this.width / 2, y: this.height / 2 }; }
        // ----------------------------------------------------------------------------------------
        constructor(session: Session, boardDiv: HTMLDivElement, sizeR1: Size) {
            this.session = session;
            this.boardDiv = boardDiv;
            this.sizeR1 = sizeR1;
            this.sizeR0 = calculateSizeR0(this.boardDiv, this.sizeR1);
            this.svgElt = createSvgElement('svg', { 'width': this.sizeR0.width + "", 'height': this.sizeR0.height + "" }, this.boardDiv);
        }
        // ----------------------------------------------------------------------------------------
        addItem(positionR1: Position, itemId: string = uuid(), sessionId: string = ""): Item {
            console.log("Session.addItem [" + this.session.id + "]" + sessionId + "/" + itemId)
            let item = new Item(this, itemId);
            this.itemList.push(item);
            this.itemDict[item.id] = item;
            setAttributs(item.svgGroup, { "item-id": item.id, "session-id": this.session.id }, true);
            this.session.synchronizer.addItem(positionR1, item.id, sessionId);
            item.moveTo(positionR1);
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
        get positionR0(): Position {
            return positionR1toR0(this.board.sizeR0, this.board.sizeR1, this.positionR1);
        }
        positionR1: Position = { x: 0, y: 0 };
        get sizeR0(): Size {
            let box = svgBox(this.svgGroup);
            return { width: box.width, height: box.height };
        }
        get sizeR1(): Size {
            return sizeR0toR1(this.board.sizeR0, this.board.sizeR1, this.sizeR0);
        }
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
        nextRelativePositionR1(): Position {
            return positionR0toR1(this.board.sizeR0, this.board.sizeR1, { x: 0, y: this.sizeR0.height + 2 });
        }
        // ----------------------------------------------------------------------------------------
        addImage(href: string, sizeR1: Size, relativePosR1: Position | null = null, sessionId: string = "") {
            if (!relativePosR1) relativePosR1 = this.nextRelativePositionR1();
            let relativePosR0 = positionR1toR0(this.board.sizeR0, this.board.sizeR1, relativePosR1);
            let sizeR0 = sizeR1toR0(this.board.sizeR0, this.board.sizeR1, sizeR1);
            const svgImage = createSvgElement('image', {
                "x": relativePosR0.x + "", "y": relativePosR0.y + "",
                "width": sizeR0.width + "", "height": sizeR0.height + "",
                "href": href,
                "session-id": this.board.session.id,
                "item-id": this.id
            }, this.svgGroup);
            this.board.session.synchronizer.addImage(href, sizeR1, relativePosR1, this.id, sessionId)
        }
        // ----------------------------------------------------------------------------------------
        addRect(sizeR1: Size, relativePosR1: Position | null = null, fill: string = "none", sessionId: string = "") {
            if (!relativePosR1) relativePosR1 = this.nextRelativePositionR1();
            let relativePosR0 = positionR1toR0(this.board.sizeR0, this.board.sizeR1, relativePosR1);
            let sizeR0 = sizeR1toR0(this.board.sizeR0, this.board.sizeR1, sizeR1);
            const svgRect = createSvgElement('rect', {
                "x": relativePosR0.x + "", "y": relativePosR0.y + "",
                "width": sizeR0.width + "", "height": sizeR0.height + "",
                "fill": fill,
                "session-id": this.board.session.id,
                "item-id": this.id
            }, this.svgGroup);
            this.board.session.synchronizer.addRect(sizeR1, relativePosR1, fill, this.id, sessionId)
        }
        // ----------------------------------------------------------------------------------------
        addText(text: string, relativePosR1: Position | null = null, sessionId: string = "") {
            if (!relativePosR1) relativePosR1 = this.nextRelativePositionR1();
            let relativePosR0 = positionR1toR0(this.board.sizeR0, this.board.sizeR1, relativePosR1);
            const svgText = createSvgElement('text', {
                "x": relativePosR0.x + "", "y": relativePosR0.y + "",
                "font-family": fontFamily, "font-size": fontSize,
                "font-weight": fontWeight, "letter-spacing": letterSpacing,
                "session-id": this.board.session.id,
                "item-id": this.id
            }, this.svgGroup);
            svgText.textContent = text;
            this.board.session.synchronizer.addText(text, relativePosR1, this.id, sessionId)
        }
        // ----------------------------------------------------------------------------------------
        moveTo(positionR1: Position, sessionId: string = "") {
            this.positionR1 = positionR1;
            this.svgGroup = svgTranslate(this.svgGroup, positionR1toR0(this.board.sizeR0, this.board.sizeR1, positionR1));
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
        onMoveStart(target: EventTarget): Item | null {
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
            this.session.board.session.synchronizer.moveTo(this.movableInfo.item!.positionR1, this.movableInfo.item!.id, "", true);
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
}
// ################################################################################################
