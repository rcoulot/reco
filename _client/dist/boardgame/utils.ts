// ################################################################################################
namespace reco.boardgame {
    // ============================================================================================    
    export const fontFamily = 'Times New Roman';
    export const fontSize = "12";
    export const fontWeight = "normal";
    export const letterSpacing = "1px";
    // ============================================================================================
    export const randomUUID = function (): string {
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
    export interface MovableNotifier {
        movableInfo: MovableNotifierInfo;
        onMoveStart(target: EventTarget, x: number, y: number): void;
        onMove(x: number, y: number): void;
        onMoveEnd(): void;
    }
    // ============================================================================================
    export class MovableNotifierInfo {
        // ----------------------------------------------------------------------------------------
        notifier: MovableNotifier;
        moving: boolean = false;
        evX0: number = Number.NaN;
        evY0: number = Number.NaN;
        itemX0: number = Number.NaN;
        itemY0: number = Number.NaN;
        item: Item | null = null;
        // ----------------------------------------------------------------------------------------
        constructor(notifier: MovableNotifier) {
            this.notifier = notifier;
            window.addEventListener("mousedown", (evt) => {
                notifier.onMoveStart(evt.target!, evt.clientX, evt.clientY);
            });
            window.addEventListener("mousemove", (evt) => {
                if (notifier.movableInfo.moving) notifier.onMove(evt.clientX, evt.clientY);
            });
            window.addEventListener("mouseup", (evt) => {
                if (notifier.movableInfo.moving) notifier.onMoveEnd();
            });
            window.addEventListener("touchstart", (evt) => {
                if (evt.touches.length === 1) {
                    const touch = evt.touches[0];
                    notifier.onMoveStart(evt.target!, touch.clientX, touch.clientY);
                }
            });
            window.addEventListener("touchmove", (evt) => {
                if (notifier.movableInfo.moving) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    const touch = evt.touches[0];
                    notifier.onMove(touch.clientX, touch.clientY);
                }
            });
            window.addEventListener("touchend", (evt) => {
                if (notifier.movableInfo.moving) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    notifier.onMoveEnd();
                }
            });
        }
        // ----------------------------------------------------------------------------------------
        onMoveStart(target: EventTarget, x: number, y: number) {
            this.notifier.onMoveStart(target, x, y);
            // let targetParent = (target as SVGElement).parentNode as SVGGElement
            // if (this.childrenGroupElements.indexOf(targetParent) !== -1) {
            //     const group = this.childrenGroupsById[targetParent.id];
            //     this.drag = {
            //         "group": group,
            //         "evX0": offsetX,
            //         "evY0": offsetY,
            //         "groupX0": group.x,
            //         "groupY0": group.y
            //     };
            // }
        }
        // ----------------------------------------------------------------------------------------
        onMove(x: number, y: number) {
            this.notifier.onMove(x, y);
        }
        // ----------------------------------------------------------------------------------------
        onMoveEnd() {
            this.notifier.onMoveEnd();
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
}
// ################################################################################################