// ################################################################################################
namespace reco.boardgame {
    // ============================================================================================    
    export const fontFamily = 'Times New Roman';
    export const fontSize = "12";
    export const fontWeight = "normal";
    export const letterSpacing = "1px";
    // ============================================================================================
    export const uuid = function (): string {
        let uuid = '';
        for (let i = 0; i < 36; i++) {
            if (i === 8 || i === 13 || i === 18 || i === 23) {
                uuid += '-';
            } else if (i === 14) {
                uuid += '4';
            } else {
                uuid += (Math.random() * 16 | 0).toString(16);
            }
        }
        return uuid;
    }
    // ============================================================================================
    export const setAttributs = function (element: Element, attributs: { [key: string]: string }, recursive: boolean = false): void {
        for (const key in attributs) {
            element.setAttribute(key, attributs[key]);
        }
        if (recursive) {
            const children = element.children;
            for (let i = 0; i < children.length; i++) {
                setAttributs(children[i], attributs, true);
            }
        }
    }
    // ============================================================================================
    export const createSvgElement = function <X extends SVGElement>(tagName: string, attributs?: { [key: string]: string }, parent?: Node | SVGElement, append: boolean = true): X {
        const element = document.createElementNS("http://www.w3.org/2000/svg", tagName) as X;
        if (attributs) {
            setAttributs(element, attributs);
        }
        if (parent) {
            if (append) parent.appendChild(element);
            else parent.insertBefore(element, parent.firstChild);
        }
        return element;
    }
    // ============================================================================================
    export const svgBox = function (svgElt: SVGGraphicsElement | null): DOMRect { return svgElt ? svgElt.getBBox() : new DOMRect(0, 0, 0, 0); }
    // ============================================================================================
    export const svgCenter = function (svgElt: SVGGraphicsElement | null): { x: number, y: number } {
        let box = svgBox(svgElt);
        return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    }
    // ============================================================================================
    export const svgLastElt = function (svgElt: SVGElement | null): SVGGraphicsElement | null {
        if (!svgElt) return null;
        let len = svgElt.children.length;
        if (len === 0) return null;
        return svgElt.children.item(len - 1) as SVGGraphicsElement;
    }
    // ============================================================================================
    export const svgTranslate = function (svgElt: SVGGraphicsElement, xy: { x: number, y: number }): SVGGraphicsElement {
        svgElt.setAttribute("transform", `translate(${xy.x}, ${xy.y})`);
        return svgElt;
    }
    // ============================================================================================
    export type Size = { width: number, height: number };
    export type Position = { x: number, y: number };
    export const pointTranslate = function (point: Position, move: Size): Position {
        return { x: point.x + move.width, y: point.y + move.height };
    }
    export interface MovableNotifier {
        movableInfo: MovableNotifierInfo;
        onMoveStart(target: EventTarget, position: Position): Item | null;
        onMove(position: Position): void;
        onMoveEnd(): void;
    }
    // ============================================================================================
    export class MovableNotifierInfo {
        // ----------------------------------------------------------------------------------------
        notifier: MovableNotifier;
        ev0Position: Position = { x: Number.NaN, y: Number.NaN };
        item0Position: Position = { x: Number.NaN, y: Number.NaN };
        item: Item | null = null;
        get moving(): boolean { return this.item !== null; }
        // ----------------------------------------------------------------------------------------
        constructor(notifier: MovableNotifier) {
            let THIS = this;
            this.notifier = notifier;
            window.addEventListener("mousedown", (evt) => {
                THIS.onMoveStart(evt.target!, evt.clientX, evt.clientY);
            });
            window.addEventListener("mousemove", (evt) => {
                if (THIS.moving) THIS.onMove(evt.clientX, evt.clientY);
            }, { passive: false });
            window.addEventListener("mouseup", (evt) => {
                THIS.onMoveEnd();
            }, { passive: false });
            window.addEventListener("touchstart", (evt) => {
                if (evt.touches.length === 1) {
                    const touch = evt.touches[0];
                    THIS.onMoveStart(evt.target!, touch.clientX, touch.clientY);
                }
                evt.preventDefault();
                // evt.stopPropagation();
            }, { passive: false });
            window.addEventListener("touchmove", (evt) => {
                if (THIS.moving) {
                    const touch = evt.touches[0];
                    THIS.onMove(touch.clientX, touch.clientY);
                }
                // evt.preventDefault();
                // evt.stopPropagation();
            }, { passive: false });
            window.addEventListener("touchcancel", (evt) => {
                // evt.preventDefault();
                // evt.stopPropagation();
                THIS.onMoveEnd();
            });
            window.addEventListener("touchend", (evt) => {
                // evt.preventDefault();
                // evt.stopPropagation();
                THIS.onMoveEnd();
            });
        }
        // ----------------------------------------------------------------------------------------
        onMoveStart(target: EventTarget, x: number, y: number) {
            let position = { x: x, y: y };
            this.item = this.notifier.onMoveStart(target, position);
            if (this.item) {
                console.log("Move start item " + this.item.id);
                this.ev0Position = position;
                this.item0Position = { x: this.item.position.x, y: this.item.position.y };
            }
        }
        // ----------------------------------------------------------------------------------------
        onMove(x: number, y: number) {
            if (this.item) {
                let position = {
                    x: this.item0Position.x + (x - this.ev0Position.x),
                    y: this.item0Position.y + (y - this.ev0Position.y)
                }
                this.item.moveTo(position);
                this.notifier.onMove(position);
            }
        }
        // ----------------------------------------------------------------------------------------
        onMoveEnd() {
            if (this.item) {
                console.log("Move end item " + this.item.id);
                this.notifier.onMoveEnd();
                this.item = null;
                this.ev0Position = { x: Number.NaN, y: Number.NaN };
                this.item0Position = { x: Number.NaN, y: Number.NaN };
            }
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
}
// ################################################################################################