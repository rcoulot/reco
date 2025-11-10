// ################################################################################################
namespace reco.ui.svg {
    // ============================================================================================
    export class SvgRoot {
        // ----------------------------------------------------------------------------------------
        SEQ: number = 0;
        id: string;
        elt: SVGSVGElement;
        childrenItems: SvgItem[] = [];
        childrenItemById: { [id: string]: SvgItem } = {};
        childrenElements: SVGElement[] = [];
        drag: { evX0: number, evY0: number, itemX0: number, itemY0: number, item: SvgItem } | null = null
        // ----------------------------------------------------------------------------------------
        constructor(id: string, width: string, height: string) {
            this.id = id;
            this.elt = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.elt.setAttribute("id", id);
            this.elt.setAttribute("width", width);
            this.elt.setAttribute("height", height);
            document.body.appendChild(this.elt);
            this.elt.onmousedown = (evt) => { this.ondown(evt.target!, evt.offsetX, evt.offsetY); }
            this.elt.onmousemove = (evt) => { this.onmove(evt.target!, evt.offsetX, evt.offsetY); }
            this.elt.onmouseup = (evt) => { this.onup(); }
            this.elt.addEventListener("touchstart", (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                const touch = evt.touches[0];
                this.ondown(evt.target!, touch.clientX, touch.clientY);
            });
            this.elt.addEventListener("touchmove", (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                const touch = evt.touches[0];
                const rect = (evt.target as HTMLElement).getBoundingClientRect();
                this.onmove(evt.target!, touch.clientX, touch.clientY);
            });
            this.elt.addEventListener("touchend", (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                this.onup();
            });
        }
        // ----------------------------------------------------------------------------------------
        border(size: number, color: string): SvgRoot {
            this.elt.setAttribute("style", "border:" + size + "px solid " + color);
            return this;
        }
        // ----------------------------------------------------------------------------------------
        ondown(target: EventTarget, offsetX: number, offsetY: number) {
            if (this.childrenElements.indexOf(target as SVGElement) !== -1) {
                const item = this.childrenItemById[(target as SVGElement).id];
                this.drag = {
                    "item": item,
                    "evX0": offsetX,
                    "evY0": offsetY,
                    "itemX0": parseFloat(item.elt.getAttribute("x")!),
                    "itemY0": parseFloat(item.elt.getAttribute("y")!)
                };
            }
        }
        // ----------------------------------------------------------------------------------------
        onmove(target: EventTarget, offsetX: number, offsetY: number) {
            if (this.drag) {
                this.drag.item.elt.setAttribute("x", (this.drag.itemX0 + offsetX - this.drag.evX0).toString());
                this.drag.item.elt.setAttribute("y", (this.drag.itemY0 + offsetY - this.drag.evY0).toString());
            }
        }
        // ----------------------------------------------------------------------------------------
        onup() {
            this.drag = null;
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class SvgItem<X extends SvgItem<X, T> = any, T extends SVGElement = SVGElement> {
        // ----------------------------------------------------------------------------------------
        id: string;
        svgRoot: SvgRoot;
        elt: T;
        // ----------------------------------------------------------------------------------------
        constructor(svgRoot: SvgRoot, type: string, x: number, y: number, w: number, h: number) {
            this.svgRoot = svgRoot;
            this.id = this.svgRoot.id + "-" + this.svgRoot.SEQ++;
            this.elt = document.createElementNS("http://www.w3.org/2000/svg", type) as any;
            this.elt.setAttribute("id", this.id);
            this.elt.setAttribute("x", "" + x);
            this.elt.setAttribute("y", "" + y);
            this.elt.setAttribute("width", "" + w);
            this.elt.setAttribute("height", "" + h);
            this.svgRoot.childrenItems.push(this);
            this.svgRoot.childrenElements.push(this.elt);
            this.svgRoot.childrenItemById[this.elt.id] = this;

        }
        // ----------------------------------------------------------------------------------------
        add(): X {
            this.svgRoot.elt.appendChild(this.elt);
            return this as unknown as X;
        }
        // ----------------------------------------------------------------------------------------
        fill(color: string): X {
            this.elt.style.fill = color;
            return this as unknown as X;
        }
        // ----------------------------------------------------------------------------------------
        border(size: number, color: string): X {
            this.elt.style.strokeWidth = "" + size;
            this.elt.style.stroke = color;
            return this as unknown as X;
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class RectItem extends SvgItem<RectItem, SVGRectElement> {
        // ----------------------------------------------------------------------------------------
        // ----------------------------------------------------------------------------------------
        constructor(svgRoot: SvgRoot, x: number, y: number, w: number, h: number) {
            super(svgRoot, "rect", x, y, w, h);
        }
        // ----------------------------------------------------------------------------------------
        roundCorner(r: number): RectItem {
            this.elt.setAttribute("rx", "" + r);
            this.elt.setAttribute("ry", "" + r);
            return this;
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    const svg: SvgRoot = new SvgRoot("mySvg", "70vw", "70vh").border(1, "blue");
    new RectItem(svg, 10, 10, 40, 20).fill("blue").border(1, "red").add();
    new RectItem(svg, 100, 100, 80, 40).fill("green").border(1, "red").add();
    // ============================================================================================
}
// ################################################################################################