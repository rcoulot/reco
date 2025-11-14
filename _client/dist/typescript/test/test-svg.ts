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
        childrenGroupsById: { [id: string]: SvgGroup } = {};
        childrenGroupElements: SVGElement[] = [];
        childrenLines: SvgLine[] = [];
        childrenLinesById: { [id: string]: SvgLine } = {};
        childrenLineElements: SVGLineElement[] = [];
        drag: { evX0: number, evY0: number, groupX0: number, groupY0: number, group: SvgGroup } | null = null
        // ----------------------------------------------------------------------------------------
        zoomFactor = 1;
        widthInit: number;
        heightInit: number;
        // ----------------------------------------------------------------------------------------
        constructor(id: string, width: string, height: string) {
            let THIS = this;
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
            window.onkeydown = function (ev) {
                // console.log("key '"+ev.key+"'")
                if (ev.ctrlKey && ev.key == "ArrowUp") THIS.zoomIn();
                else if (ev.ctrlKey && ev.key == "ArrowDown") THIS.zoomOut();
            }
            // Récupérer le viewBox actuel ou créer un par défaut
            this.widthInit = Math.round(this.elt.getBoundingClientRect().width);
            this.heightInit = Math.round(this.elt.getBoundingClientRect().height);
            this.elt.setAttribute('viewBox', `0 0 ${this.widthInit} ${this.heightInit}`);

        }
        // ----------------------------------------------------------------------------------------
        zoomIn() { this.zoomFactor += 0.1; this.zoom(); }
        zoomOut() { this.zoomFactor -= 0.1; this.zoom(); }
        // ----------------------------------------------------------------------------------------
        zoom() {
            this.zoomFactor = this.zoomFactor < 0.1 ? 0.1 : this.zoomFactor;
            this.zoomFactor = Math.round(this.zoomFactor * 100) / 100;
            let viewBox = this.elt.viewBox.baseVal;
            // Calculer les nouvelles dimensions
            const newWidth = Math.round(this.widthInit / this.zoomFactor)
            const newHeight = Math.round(this.heightInit / this.zoomFactor)
            // Calculer le centre si non spécifié
            const cx = viewBox.x + viewBox.width / 2;
            const cy = viewBox.y + viewBox.height / 2;
            // Calculer la nouvelle position pour centrer le zoom
            const newX = cx - newWidth / 2;
            const newY = cy - newHeight / 2;
            // Appliquer le nouveau viewBox
            this.elt.setAttribute('viewBox', `${newX} ${newY} ${newWidth} ${newHeight}`);
            console.log("zoomFactor = " + this.zoomFactor + " ## " + this.widthInit + " >> " + newWidth)
            for (let line of this.childrenLines) line.refresh();
        }
        // ----------------------------------------------------------------------------------------
        refresh() {
            for (let group of this.childrenGroups) group.refresh();
            for (let line of this.childrenLines) line.refresh();
        }
        // ----------------------------------------------------------------------------------------
        border(size: number, color: string): SvgRoot {
            this.elt.setAttribute("style", "border:" + size + "px solid " + color);
            return this;
        }
        // ----------------------------------------------------------------------------------------
        ondown(target: EventTarget, offsetX: number, offsetY: number) {
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
        onmove(offsetX: number, offsetY: number) {
            if (this.drag) {
                this.drag.group.moveTo(
                    this.drag.groupX0 + (offsetX - this.drag.evX0) / this.zoomFactor,
                    this.drag.groupY0 + (offsetY - this.drag.evY0) / this.zoomFactor
                );
                for (let line of this.childrenLines) line.refresh();
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
        eltBorder: SVGRectElement;
        elt: SVGGElement;
        childrenItems: SvgItem[] = [];
        childrenItemsById: { [id: string]: SvgItem } = {};
        childrenElements: SVGElement[] = [];
        x: number;
        y: number;
        borderSize: number = 1;
        borderColor: string = "transparent";
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
            this.svgRoot.childrenGroupElements.push(this.elt);
            this.svgRoot.childrenGroupsById[this.id] = this;
            this.eltBorder = document.createElementNS("http://www.w3.org/2000/svg", "rect") as any;
            this.eltBorder.setAttribute("x", "" + 0);
            this.eltBorder.setAttribute("y", "" + 0);
            this.eltBorder.setAttribute("width", "" + 0);
            this.eltBorder.setAttribute("height", "" + 0);
            this.eltBorder.setAttribute('fill', 'transparent');
            this.elt.appendChild(this.eltBorder);
        }
        // ----------------------------------------------------------------------------------------
        refresh() {
            for (let item of this.childrenItems) item.refresh();
            this.border(this.borderColor, this.borderSize)
        }
        // ----------------------------------------------------------------------------------------
        get eltX(): number { return this.x; }
        get eltY(): number { return this.y; }
        get eltHeight(): number { return this.elt.getBBox().height; }
        get eltWidth(): number { return this.elt.getBBox().width; }
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
            this.eltBorder.style.fill = color;
            return this;
        }
        // ----------------------------------------------------------------------------------------
        border(color: string = "black", size: number = 1): SvgGroup {
            this.borderColor = color;
            this.borderSize = size;
            const bbox = this.elt.getBBox();
            this.eltBorder.setAttribute('x', (bbox.x - 2).toString());
            this.eltBorder.setAttribute('y', (bbox.y - 2).toString());
            this.eltBorder.setAttribute('width', (bbox.width + 2 * 2).toString());
            this.eltBorder.setAttribute('height', (bbox.height + 2 * 2).toString());
            this.eltBorder.setAttribute('stroke', color);
            this.eltBorder.setAttribute('stroke-width', size.toString());
            return this;
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class SvgLine {
        // ----------------------------------------------------------------------------------------
        id: string;
        svgRoot: SvgRoot;
        idStart: string;
        idEnd: string;
        elt: SVGLineElement;
        // ----------------------------------------------------------------------------------------
        constructor(svgRoot: SvgRoot, svgGroupStart: SvgGroup, svgGroupEnd: SvgGroup) {
            this.svgRoot = svgRoot;
            this.id = this.svgRoot.id + "-" + this.svgRoot.SEQ++;
            this.idStart = svgGroupStart.id;
            this.idEnd = svgGroupEnd.id;
            this.elt = document.createElementNS("http://www.w3.org/2000/svg", "line") as any;
            this.elt.style.stroke = "black";
            this.svgRoot.childrenLines.push(this);
            this.svgRoot.childrenLineElements.push(this.elt);
            this.svgRoot.childrenLinesById[this.id] = this;
        }
        // ----------------------------------------------------------------------------------------
        get svgGroupStart(): SvgGroup { return this.svgRoot.childrenGroupsById[this.idStart]; }
        get svgGroupEnd(): SvgGroup { return this.svgRoot.childrenGroupsById[this.idEnd]; }
        get startCx(): number { return this.svgGroupStart.eltX + this.svgGroupStart.eltWidth / 2; }
        get startCy(): number { return this.svgGroupStart.eltY + this.svgGroupStart.eltHeight / 2; }
        get endCx(): number { return this.svgGroupEnd.eltX + this.svgGroupEnd.eltWidth / 2; }
        get endCy(): number { return this.svgGroupEnd.eltY + this.svgGroupEnd.eltHeight / 2; }
        // ----------------------------------------------------------------------------------------
        add(): SvgLine {
            this.svgRoot.elt.appendChild(this.elt);
            this.svgRoot.elt.insertBefore(this.elt, this.svgRoot.elt.firstChild);
            return this;
        }
        // ----------------------------------------------------------------------------------------
        refresh() {
            this.elt.setAttribute("id", "" + this.id);
            this.elt.setAttribute("x1", "" + this.startCx);
            this.elt.setAttribute("y1", "" + this.startCy);
            this.elt.setAttribute("x2", "" + this.endCx);
            this.elt.setAttribute("y2", "" + this.endCy);
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
            this.id = this.svgGroup.svgRoot.id + "-" + this.svgGroup.svgRoot.SEQ++;
            this.elt = document.createElementNS("http://www.w3.org/2000/svg", type) as any;
            this.elt.setAttribute("id", this.id);
            this.svgGroup.childrenItems.push(this);
            this.svgGroup.childrenElements.push(this.elt);
            this.svgGroup.childrenItemsById[this.elt.id] = this;
        }
        // ----------------------------------------------------------------------------------------
        get eltX(): number { return this.elt.getBoundingClientRect().x - this.svgGroup.elt.getBoundingClientRect().x; }
        get eltY(): number { return this.elt.getBoundingClientRect().y - this.svgGroup.elt.getBoundingClientRect().y; }
        get eltHeight(): number { return this.elt.getBoundingClientRect().height; }
        get eltWidth(): number { return this.elt.getBoundingClientRect().width; }
        // ----------------------------------------------------------------------------------------
        refresh() { }
        // ----------------------------------------------------------------------------------------
        add(): X {
            this.svgGroup.elt.appendChild(this.elt);
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
            this.elt.setAttribute('fill', 'transparent');
        }
        // ----------------------------------------------------------------------------------------
        roundCorner(r: number): RectItem {
            this.elt.setAttribute("rx", "" + r);
            this.elt.setAttribute("ry", "" + r);
            return this;
        }
        // ----------------------------------------------------------------------------------------
        fill(color: string): RectItem {
            this.elt.style.fill = color;
            return this;
        }
        // ----------------------------------------------------------------------------------------
        border(size: number, color: string): RectItem {
            this.elt.style.strokeWidth = "" + size;
            this.elt.style.stroke = color;
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
        fill(color: string): CircleItem {
            this.elt.style.fill = color;
            return this;
        }
        // ----------------------------------------------------------------------------------------
        border(size: number, color: string): CircleItem {
            this.elt.style.strokeWidth = "" + size;
            this.elt.style.stroke = color;
            return this;
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class TextItem extends SvgItem<TextItem, SVGTextElement> {
        // ----------------------------------------------------------------------------------------
        constructor(svgGroup: SvgGroup, x: number = 0, y: number = 0, text: string) {
            super(svgGroup, "text", x, y);
            this.elt.textContent = text;
            if (x == 0 && y == 0) {
                let lastItem = this.svgGroup.childrenItems[this.svgGroup.childrenItems.length - 2];
                y = lastItem ? lastItem.eltY + lastItem.eltHeight + 2 : 0;
            }
            console.log("TextItem y=" + y + " > " + text);
            this.elt.setAttribute("x", "" + x);
            this.elt.setAttribute("y", "" + y);
            this.elt.setAttribute('font-family', 'Times New Roman');
            this.elt.setAttribute('font-size', "12");
            this.elt.setAttribute('font-weight', "normal");
            this.elt.setAttribute('letter-spacing', "1px");
        }
        // ----------------------------------------------------------------------------------------
        font(weight: string = "normal", size: number = 12): TextItem {
            this.elt.setAttribute('font-size', "" + size);
            this.elt.setAttribute('font-weight', weight);
            return this;
        }
        // ----------------------------------------------------------------------------------------
        color(color: string): TextItem {
            this.elt.style.stroke = color;
            return this;
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class SeparatorItem extends SvgItem<SeparatorItem, SVGLineElement> {
        // ----------------------------------------------------------------------------------------
        constructor(svgGroup: SvgGroup, afterItemIndex: number = -1) {
            super(svgGroup, "line", 0, 0);
            if (afterItemIndex === -1) afterItemIndex = this.svgGroup.childrenItems.length - 2;
            let afterItem = this.svgGroup.childrenItems[afterItemIndex];
            let y = afterItem ? afterItem.eltY + 5 : 0;
            console.log("SeparatorItem y=" + y);
            this.elt.setAttribute("x1", "" + 0);
            this.elt.setAttribute("y1", "" + y);
            this.elt.setAttribute("x2", "" + this.svgGroup.eltWidth);
            this.elt.setAttribute("y2", "" + y);
        }
        // ----------------------------------------------------------------------------------------
        color(color: string): SeparatorItem {
            this.elt.style.stroke = color;
            return this;
        }
        // ----------------------------------------------------------------------------------------
        refresh() {
            this.elt.setAttribute("x2", "" + this.svgGroup.eltWidth);
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class SvgList extends SvgGroup {
        // ----------------------------------------------------------------------------------------
        strokeColor: string = "black";
        titleColor: string = "black";
        lineColor: string = "blue";
        // titleFillColor: string = "#f0f0f0";
        titleFillColor: string = "lightyellow";
        eltTitleBorder: SVGRectElement;
        borderTitleSize: number = 1;
        borderTitleColor: string = "transparent";
        titleItem: TextItem | null = null;
        // ----------------------------------------------------------------------------------------
        constructor(svgRoot: SvgRoot, x: number, y: number) {
            super(svgRoot, x, y);
            // this.fill("transparent").border(this.strokeColor).add();
            this.fill("white").border(this.strokeColor).add();
            this.eltTitleBorder = document.createElementNS("http://www.w3.org/2000/svg", "rect") as any;
            this.eltTitleBorder.setAttribute("x", "" + 0);
            this.eltTitleBorder.setAttribute("y", "" + 0);
            this.eltTitleBorder.setAttribute("width", "" + 0);
            this.eltTitleBorder.setAttribute("height", "" + 0);
            this.eltTitleBorder.setAttribute('fill', 'transparent');
            this.elt.appendChild(this.eltTitleBorder);
            this.fillTitle(this.titleFillColor);
        }
        // ----------------------------------------------------------------------------------------
        refresh(): void {
            super.refresh();
            this.borderTitle(this.borderTitleColor, this.borderTitleSize);
        }
        // ----------------------------------------------------------------------------------------
        title(text: string, color: string = this.titleColor): SvgList {
            this.titleColor = color;
            this.titleItem = new TextItem(this, 0, 0, text).font("bolder", 16).color(color).add();
            return this;
        }
        // ----------------------------------------------------------------------------------------
        fillTitle(color: string): SvgList {
            this.eltTitleBorder.style.fill = color;
            return this;
        }
        // ----------------------------------------------------------------------------------------
        borderTitle(color: string = "black", size: number = 1): SvgList {
            this.borderTitleColor = color;
            this.borderTitleSize = size;
            const bbox = this.elt.getBBox();
            this.eltTitleBorder.setAttribute('x', (bbox.x).toString());
            this.eltTitleBorder.setAttribute('y', (bbox.y).toString());
            this.eltTitleBorder.setAttribute('width', (bbox.width).toString());
            this.eltTitleBorder.setAttribute('height', (this.titleItem!.elt.getBoundingClientRect().height + 2 * 2).toString());
            this.eltTitleBorder.setAttribute('stroke', color);
            this.eltTitleBorder.setAttribute('stroke-width', size.toString());
            return this;
        }
        // ----------------------------------------------------------------------------------------
        separator(): SvgList {
            new SeparatorItem(this).color(this.strokeColor).add();
            return this;
        }
        // ----------------------------------------------------------------------------------------
        line(text: string, color: string = this.lineColor): SvgList {
            this.lineColor = color;
            new TextItem(this, 0, 0, text).color(color).add();
            return this;
        };
    }
    // ============================================================================================
    const svg: SvgRoot = new SvgRoot("mySvg", "70vw", "70vh").border(1, "blue");

    // const group1: SvgGroup = new SvgGroup(svg, 10, 10).add();
    // new RectItem(group1, 0, 0, 40, 20).fill("blue").border(1, "red").add();
    // const group2: SvgGroup = new SvgGroup(svg, 100, 100).add();
    // const r2 = new RectItem(group2, 0, 0, 80, 40).fill("green").border(1, "red").add();
    // new CircleItem(group2, 30, 20, 10).fill("green").border(1, "yellow").add();

    let cls1 = new SvgList(svg, 50, 50)
        .title("(c) Person")
        .separator()
        .line("(a) firstname")
        .line("(a) lastname")
        .line("(a) birthdate")
        .add();

    let cls2 = new SvgList(svg, 200, 50)
        .title("(c) Address")
        .separator()
        .line("(a) lines")
        .line("(a) city")
        .line("(a) zip")
        .line("(a) state")
        .line("(a) country")
        .add();

    new SvgLine(svg, cls1, cls2).add();

    svg.refresh();

    // ============================================================================================
}
// ################################################################################################
