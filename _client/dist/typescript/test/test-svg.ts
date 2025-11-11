// http://localhost:3000/test/test-svg.html 
// ################################################################################################
namespace reco.ui.svg {
    // ============================================================================================
    export class SvgRoot {
        // ----------------------------------------------------------------------------------------
        SEQ: number = 0;
        id: string;
        elt: SVGSVGElement;
        childrenGroups: SvgGroup[] = [];
        childrenGroupById: { [id: string]: SvgGroup } = {};
        childrenElements: SVGElement[] = [];
        drag: { evX0: number, evY0: number, groupX0: number, groupY0: number, group: SvgGroup } | null = null
        // ----------------------------------------------------------------------------------------
        constructor(id: string, width: string, height: string) {
            this.id = id;
            this.elt = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.elt.setAttribute("id", id);
            this.elt.setAttribute("width", width);
            this.elt.setAttribute("height", height);
            document.body.appendChild(this.elt);
            this.elt.onmousedown = (evt) => { this.ondown(evt.target!, evt.offsetX, evt.offsetY); }
            this.elt.onmousemove = (evt) => { this.onmove(evt.offsetX, evt.offsetY); }
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
                this.onmove(touch.clientX, touch.clientY);
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
            let targetParent = (target as SVGElement).parentNode as SVGGElement
            if (this.childrenElements.indexOf(targetParent) !== -1) {
                const group = this.childrenGroupById[targetParent.id];
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
        onmove(offsetX: number, offsetY: number) {
            if (this.drag) {
                // this.drag.item.elt.setAttribute("x", (this.drag.itemX0 + offsetX - this.drag.evX0).toString());
                // this.drag.item.elt.setAttribute("y", (this.drag.itemY0 + offsetY - this.drag.evY0).toString());
                this.drag.group.moveTo(this.drag.groupX0 + offsetX - this.drag.evX0,
                    this.drag.groupY0 + offsetY - this.drag.evY0);
            }
        }
        // ----------------------------------------------------------------------------------------
        onup() {
            this.drag = null;
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class SvgGroup {
        // ----------------------------------------------------------------------------------------
        id: string;
        svgRoot: SvgRoot;
        elt: SVGGElement;
        childrenItems: SvgItem[] = [];
        childrenItemsById: { [id: string]: SvgItem } = {};
        childrenElements: SVGElement[] = [];
        x: number;
        y: number;
        // ----------------------------------------------------------------------------------------
        constructor(svgRoot: SvgRoot, x: number, y: number) {
            this.svgRoot = svgRoot;
            this.x = x;
            this.y = y;
            this.id = this.svgRoot.id + "-" + this.svgRoot.SEQ++;
            this.elt = document.createElementNS("http://www.w3.org/2000/svg", "g") as any;
            this.elt.setAttribute("id", this.id);
            this.moveTo(x, y);
            this.svgRoot.childrenGroups.push(this);
            this.svgRoot.childrenElements.push(this.elt);
            this.svgRoot.childrenGroupById[this.id] = this;
        }
        // ----------------------------------------------------------------------------------------
        moveTo(x: number, y: number): SvgGroup {
            this.x = x;
            this.y = y;
            this.elt.setAttribute("transform", "translate(" + x + ", " + y + ")");
            return this;
        }
        // ----------------------------------------------------------------------------------------
        add(): SvgGroup {
            this.svgRoot.elt.appendChild(this.elt);
            return this;
        }
        // ----------------------------------------------------------------------------------------
        fill(color: string): SvgGroup {
            this.elt.style.fill = color;
            return this;
        }
        // ----------------------------------------------------------------------------------------
        border(size: number, color: string): SvgGroup {
            this.elt.style.strokeWidth = "" + size;
            this.elt.style.stroke = color;
            return this;
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class SvgItem<X extends SvgItem<X, T> = any, T extends SVGElement = SVGElement> {
        // ----------------------------------------------------------------------------------------
        id: string;
        svgGroup: SvgGroup;
        elt: T;
        // ----------------------------------------------------------------------------------------
        constructor(svgGroup: SvgGroup, type: string, x: number, y: number) {
            this.svgGroup = svgGroup;
            this.id = this.svgGroup.id + "-" + this.svgGroup.svgRoot.SEQ++;
            this.elt = document.createElementNS("http://www.w3.org/2000/svg", type) as any;
            this.elt.setAttribute("id", this.id);
            this.svgGroup.childrenItems.push(this);
            this.svgGroup.childrenElements.push(this.elt);
            this.svgGroup.childrenItemsById[this.elt.id] = this;
        }
        // ----------------------------------------------------------------------------------------
        add(): X {
            this.svgGroup.elt.appendChild(this.elt);
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
        w: number;
        h: number;
        // ----------------------------------------------------------------------------------------
        constructor(svgGroup: SvgGroup, x: number, y: number, w: number, h: number) {
            super(svgGroup, "rect", x, y);
            this.w = w;
            this.h = h;
            this.elt.setAttribute("x", "" + x);
            this.elt.setAttribute("y", "" + y);
            this.elt.setAttribute("width", "" + w);
            this.elt.setAttribute("height", "" + h);
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
    export class CircleItem extends SvgItem<CircleItem, SVGCircleElement> {
        // ----------------------------------------------------------------------------------------
        r: number;
        // ----------------------------------------------------------------------------------------
        constructor(svgGroup: SvgGroup, x: number, y: number, r: number) {
            super(svgGroup, "circle", x, y);
            this.r = r;
            this.elt.setAttribute("cx", "" + x);
            this.elt.setAttribute("cy", "" + y);
            this.elt.setAttribute("r", "" + r);
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    const svg: SvgRoot = new SvgRoot("mySvg", "70vw", "70vh").border(1, "blue");
    const group1: SvgGroup = new SvgGroup(svg, 10, 10).fill("lightgray").add();
    new RectItem(group1, 0, 0, 40, 20).fill("blue").border(1, "red").add();
    const group2: SvgGroup = new SvgGroup(svg, 100, 100).fill("lightgray").add();
    const r2 = new RectItem(group2, 0, 0, 80, 40).fill("green").border(1, "red").add();
    new CircleItem(group2, 30, 20, 10).fill("green").border(1, "yellow").add();
    // ============================================================================================
}
// ################################################################################################
