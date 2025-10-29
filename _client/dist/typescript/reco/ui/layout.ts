// ################################################################################################
namespace reco.ui.layout {
    // ============================================================================================
    import SEQ = reco.core.SEQ;
    const margin = 4;
    // ============================================================================================
    export class RootPanel {
        // ----------------------------------------------------------------------------------------
        static addRootFullPanel(idRootPanel: string): HTMLElement {
            let divs = document.body.getElementsByTagName("div")
            Array.from(divs).forEach(div => { div.remove(); });
            let rootPanel = document.createElement("div")
            rootPanel.id = idRootPanel;
            rootPanel.className = "root-panel";
            rootPanel.style.position = `absolute`;
            rootPanel.style.top = `${margin}px`;
            rootPanel.style.left = `${margin}px`;
            rootPanel.style.bottom = `${margin}px`;
            rootPanel.style.right = `${margin}px`;
            // rootPanel.style.width = `calc(100vw - ${2 * margin}px)`;
            // rootPanel.style.height = `calc(100vh - ${2 * margin}px)`;
            rootPanel.style.overflow = "hidden";
            // rootPanel.style.backgroundColor = `yellow`;
            document.body.append(rootPanel)
            return rootPanel;
        }
        // ----------------------------------------------------------------------------------------
        static addRootVerticalPanel(idRootPanel: string, widthAsPercentOfHeight: number): HTMLElement {
            let divs = document.body.getElementsByTagName("div")
            Array.from(divs).forEach(div => { div.remove(); });
            let rootPanel = document.createElement("div")
            rootPanel.id = idRootPanel;
            rootPanel.className = "root-panel";
            rootPanel.style.position = `absolute`;
            rootPanel.style.top = `${margin}px`;
            rootPanel.style.left = `max(0px, calc(${margin}px + 50vw - ${100 * widthAsPercentOfHeight / 200}vh))`;
            rootPanel.style.width = `calc(${100 * widthAsPercentOfHeight / 100}vh - ${2 * margin}px)`;
            rootPanel.style.height = `calc(100vh - ${2 * margin}px)`;
            rootPanel.style.overflow = "hidden";
            // rootPanel.style.backgroundColor = `yellow`;
            document.body.append(rootPanel)
            return rootPanel;
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class Slider extends HTMLElement {
        // ----------------------------------------------------------------------------------------
        slider?: { pos: number, size1: number, size2: number } = { pos: 0, size1: 0, size2: 0 };
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export abstract class Layout {
        // ----------------------------------------------------------------------------------------
        toolbarEltId?: string;
        parentEltId: string;
        layoutEltId: string;
        gridTemplateColumns: string;
        gridTemplateRows: string
        get parentElt(): HTMLElement { return document.getElementById(this.parentEltId)!; }
        get layoutElt(): HTMLElement { return document.getElementById(this.layoutEltId)!; }
        get rowCount(): number { return this.gridTemplateRows.split(" ").length; }
        get colCount(): number { return this.gridTemplateColumns.split(" ").length; }
        // ----------------------------------------------------------------------------------------
        constructor(idParentElt: string, withToolbar: boolean, gridTemplateColumns: string, gridTemplateRows: string) {
            this.parentEltId = idParentElt;
            this.gridTemplateColumns = gridTemplateColumns;
            this.gridTemplateRows = (withToolbar ? "2em " : "") + gridTemplateRows;
            this.layoutEltId = "layout-" + (++SEQ.val);
            this.toolbarEltId = withToolbar ? "toolbar-" + (++SEQ.val) : undefined;
        }
        // ----------------------------------------------------------------------------------------
        remove() {
            this.parentElt.innerHTML = "";
        }
        // ----------------------------------------------------------------------------------------
        display() {
            this.parentElt.innerHTML = "";
            if (!this.parentElt.classList.contains("layout-parent")) this.parentElt.classList.add("layout-parent");
            let layoutDiv = document.createElement("div");
            layoutDiv.id = this.layoutEltId;
            this.parentElt.appendChild(layoutDiv);
            this.parentElt.style.border = "none";
            this.layoutElt.className = "layout";
            this.layoutElt.style.width = `calc(100% - ${margin}px)`;
            this.layoutElt.style.height = `calc(100% - ${margin}px)`;
            this.layoutElt.style.display = "grid";
            this.layoutElt.style.gridTemplateColumns = this.gridTemplateColumns;
            this.layoutElt.style.gridTemplateRows = this.gridTemplateRows;
            if (this.toolbarEltId) {
                let toolbarDiv: HTMLDivElement = document.createElement("div");
                toolbarDiv.id = this.toolbarEltId;
                toolbarDiv.className = "toolbar";
                toolbarDiv.style.gridColumn = "1 / span " + this.colCount;
                // toolbarDiv.style.backgroundColor = "yellow";
                this.layoutElt.appendChild(toolbarDiv);
            }
        }
        // ----------------------------------------------------------------------------------------
        createPanel(id: string, cssClass?: string, gridColumn?: string, gridRow?: string): HTMLElement {
            let panel = document.createElement("div");
            panel.id = id;
            if (cssClass) panel.className = cssClass;
            if (gridRow) panel.style.gridRow = gridRow;
            if (gridColumn) panel.style.gridColumn = gridColumn;
            panel.style.overflow = "auto";
            this.layoutElt.appendChild(panel);
            return panel;
        }
        // ----------------------------------------------------------------------------------------
        createSplit(id: string, type: "HORIZONTAL" | "VERTICAL", gridColumn?: string, gridRow?: string): Slider {
            let split = document.createElement("div");
            split.id = id;
            split.className = "layout-split " + (type === "HORIZONTAL" ? "layout-horiz" : "layout-vert");
            split.style.cursor = type === "HORIZONTAL" ? "s-resize" : "e-resize";
            if (gridRow) split.style.gridRow = gridRow;
            if (gridColumn) split.style.gridColumn = gridColumn;
            this.layoutElt.appendChild(split);
            return split as Slider;
        }
        // ----------------------------------------------------------------------------------------
        addEventListener(...elements: HTMLElement[]): void {
            let THIS = this;
            for (let elt of elements) {
                elt.onmousedown = (ev) => { THIS.onSlideStart(ev, ev.target, ev.clientX, ev.clientY); }
                elt.addEventListener("touchstart", (ev) => {
                    if (ev.touches[0]) this.onSlideStart(ev, ev.touches[0].target, ev.touches[0].clientX, ev.touches[0].clientY);
                }, { passive: false });
                elt.onmousemove = (ev) => { THIS.onSlideMove(ev, ev.target, ev.clientX, ev.clientY); }
                elt.addEventListener("touchmove", (ev) => { 
                    if (ev.touches[0]) this.onSlideMove(ev, ev.touches[0].target, ev.touches[0].clientX, ev.touches[0].clientY); 
                }, { passive: false });
                elt.onmouseup = (ev) => { THIS.onSlideEnd(); }
                elt.addEventListener("touchend", (ev) => { THIS.onSlideEnd(); });
                elt.addEventListener("touchcancel", (ev) => { THIS.onSlideEnd(); });
            }
        }
        // ----------------------------------------------------------------------------------------
        abstract onSlideStart(ev: Event, target: EventTarget | null, clientX: number, clientY: number): void;
        abstract onSlideMove(ev: Event, target: EventTarget | null, clientX: number, clientY: number): void;
        abstract onSlideEnd(): void;
        // ----------------------------------------------------------------------------------------
        static setHeight(height: number, ...elements: HTMLElement[]): void {
            for (let elt of elements) elt.style.height = `${height}px`;
        }
        // ----------------------------------------------------------------------------------------
        static setWidth(width: number, ...elements: HTMLElement[]): void {
            for (let elt of elements) elt.style.width = `${width}px`;
        }
        // ----------------------------------------------------------------------------------------
        static reset(dimension: "width" | "height" | "both", ...elts: HTMLElement[]) {
            elts = elts.length > 0 ? elts : [document.body];
            for (let elt of elts) {
                if (elt === document.body || elt.classList.contains("layout-parent")) {
                    let panelElts: HTMLCollectionOf<HTMLElement> = elt.getElementsByClassName("panel") as HTMLCollectionOf<HTMLElement>;
                    for (let panelElt of panelElts) {
                        if (dimension === "both" || dimension === "width") panelElt.style.width = "";
                        if (dimension === "both" || dimension === "height") panelElt.style.height = "";
                    }
                    let splitElts: HTMLCollectionOf<HTMLElement> = elt.getElementsByClassName("layout-split") as HTMLCollectionOf<HTMLElement>;
                    for (let splitElt of splitElts) {
                        if (dimension === "both" || dimension === "width") splitElt.style.width = "";
                        if (dimension === "both" || dimension === "height") splitElt.style.height = "";
                    }
                }
            }
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class LayoutSimple extends Layout {
        // ----------------------------------------------------------------------------------------
        centerId: string;
        // ----------------------------------------------------------------------------------------
        constructor(idParentElt: string, withToolbar: boolean) {
            super(idParentElt, withToolbar, "1fr", "1fr");
            this.centerId = "panel-" + (++SEQ.val);
        }
        // ----------------------------------------------------------------------------------------
        onSlideStart(ev: Event, target: EventTarget | null, clientX: number, clientY: number): void { }
        onSlideMove(ev: Event, target: EventTarget | null, clientX: number, clientY: number): void { }
        onSlideEnd(): void { }
        // ----------------------------------------------------------------------------------------
        display() {
            if (this.parentElt.children.length > 0) return;
            super.display();
            this.createPanel(this.centerId, "panel center");
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class LayoutNcSc extends Layout {
        // ----------------------------------------------------------------------------------------
        northCenterId: string;
        southCenterId: string;
        splitHorizId: string;
        get northCenter(): HTMLElement { return document.getElementById(this.northCenterId)!; }
        get southCenter(): HTMLElement { return document.getElementById(this.southCenterId)!; }
        get splitHoriz(): Slider { return document.getElementById(this.splitHorizId)! as Slider; }
        // ----------------------------------------------------------------------------------------
        constructor(idParentElt: string, withToolbar: boolean) {
            super(idParentElt, withToolbar, "1fr", "1fr 10px 1fr");
            this.northCenterId = "panel-" + (++SEQ.val);
            this.southCenterId = "panel-" + (++SEQ.val);
            this.splitHorizId = "split-" + (++SEQ.val);
        }
        // ----------------------------------------------------------------------------------------
        display() {
            if (this.parentElt.children.length > 0) return;
            super.display();
            this.createPanel(this.northCenterId, "panel northCenter");
            this.createSplit(this.splitHorizId, "HORIZONTAL");
            this.createPanel(this.southCenterId, "panel southCenter");
            this.addEventListener(this.layoutElt, this.northCenter, this.southCenter, this.splitHoriz);
        }
        // ----------------------------------------------------------------------------------------
        onSlideStart(ev: Event, target: EventTarget | null, clientX: number, clientY: number) {
            if (target === this.splitHoriz) {
                ev.preventDefault();
                this.splitHoriz.slider = { pos: clientY, size1: this.northCenter.offsetHeight, size2: this.southCenter.offsetHeight };
            }
        }
        // ----------------------------------------------------------------------------------------
        onSlideMove(ev: Event, target: EventTarget | null, clientX: number, clientY: number) {
            if (this.splitHoriz.slider) {
                ev.preventDefault();
                let deltapos = clientY - this.splitHoriz.slider.pos;
                Layout.setHeight(this.splitHoriz.slider.size1 + deltapos - margin / 2, this.northCenter);
                Layout.setHeight(this.splitHoriz.slider.size2 - deltapos - margin / 2, this.southCenter);
                Layout.reset("height", this.northCenter, this.southCenter);
            }
        }
        // ----------------------------------------------------------------------------------------
        onSlideEnd() {
            this.splitHoriz.slider = undefined;
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class LayoutNwNeSc extends Layout {
        // ----------------------------------------------------------------------------------------
        northWestId: string;
        northEastId: string;
        southCenterId: string;
        splitHorizId: string;
        splitVertId: string;
        get northWest(): HTMLElement { return document.getElementById(this.northWestId)!; }
        get northEast(): HTMLElement { return document.getElementById(this.northEastId)!; }
        get southCenter(): HTMLElement { return document.getElementById(this.southCenterId)!; }
        get splitHoriz(): Slider { return document.getElementById(this.splitHorizId)! as Slider; }
        get splitVert(): Slider { return document.getElementById(this.splitVertId)! as Slider; }
        // ----------------------------------------------------------------------------------------
        constructor(idParentElt: string, withToolbar: boolean,) {
            super(idParentElt, withToolbar, "1fr 10px 1fr", "1fr 10px 1fr");
            this.northWestId = "panel-" + (++SEQ.val);
            this.northEastId = "panel-" + (++SEQ.val);
            this.southCenterId = "panel-" + (++SEQ.val);
            this.splitHorizId = "split-" + (++SEQ.val);
            this.splitVertId = "split-" + (++SEQ.val);
        }
        // ----------------------------------------------------------------------------------------
        display() {
            if (this.parentElt.children.length > 0) return;
            super.display();
            this.createPanel(this.northWestId, "panel northWest");
            this.createSplit(this.splitVertId, "VERTICAL");
            this.createPanel(this.northEastId, "panel northEast");
            this.createSplit(this.splitHorizId, "HORIZONTAL", "1 / span 3");
            this.createPanel(this.southCenterId, "panel southCenter", "1 / span 3");
            this.addEventListener(this.layoutElt, this.northWest, this.northEast, this.southCenter, this.splitHoriz, this.splitVert);
        }
        // ----------------------------------------------------------------------------------------
        onSlideStart(ev: Event, target: EventTarget | null, clientX: number, clientY: number) {
            if (target === this.splitHoriz) {
                ev.preventDefault();
                this.splitHoriz.slider = { pos: clientY, size1: this.splitVert.offsetHeight, size2: this.southCenter.offsetHeight };
            } else if (target === this.splitVert) {
                ev.preventDefault();
                this.splitVert.slider = { pos: clientX, size1: this.northWest.offsetWidth, size2: this.northEast.offsetWidth };
            }
        }
        // ----------------------------------------------------------------------------------------
        onSlideMove(ev: Event, target: EventTarget | null, clientX: number, clientY: number) {
            if (this.splitHoriz.slider) {
                ev.preventDefault();
                let deltapos = clientY - this.splitHoriz.slider.pos;
                Layout.setHeight(this.splitHoriz.slider.size1 + deltapos - margin / 2, this.northWest, this.splitVert, this.northEast);
                Layout.setHeight(this.splitHoriz.slider.size2 - deltapos - margin / 2, this.southCenter);
                Layout.reset("height", this.northWest, this.northEast, this.southCenter);
            } else if (this.splitVert.slider) {
                ev.preventDefault();
                let deltapos = clientX - this.splitVert.slider.pos;
                Layout.setWidth(this.splitVert.slider.size1 + deltapos - margin / 2, this.northWest);
                Layout.setWidth(this.splitVert.slider.size2 - deltapos - margin / 2, this.northEast);
                Layout.reset("width", this.northWest, this.northEast);
            }
        }
        // ----------------------------------------------------------------------------------------
        onSlideEnd() {
            this.splitHoriz.slider = undefined;
            this.splitVert.slider = undefined;
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class LayoutWcEnEs extends Layout {
        // ----------------------------------------------------------------------------------------
        westCenterId: string;
        eastNorthId: string;
        eastSouthId: string;
        splitVertId: string;
        splitHorizId: string;
        get westCenter(): HTMLElement { return document.getElementById(this.westCenterId)!; }
        get eastNorth(): HTMLElement { return document.getElementById(this.eastNorthId)!; }
        get eathSouth(): HTMLElement { return document.getElementById(this.eastSouthId)!; }
        get splitVert(): Slider { return document.getElementById(this.splitVertId)! as Slider; }
        get splitHoriz(): Slider { return document.getElementById(this.splitHorizId)! as Slider; }
        // ----------------------------------------------------------------------------------------
        constructor(idParentElt: string, withToolbar: boolean) {
            super(idParentElt, withToolbar, "1fr 10px 1fr", "1fr 10px 1fr");
            this.westCenterId = "panel-" + (++SEQ.val);
            this.eastNorthId = "panel-" + (++SEQ.val);
            this.eastSouthId = "panel-" + (++SEQ.val);
            this.splitVertId = "split-" + (++SEQ.val);
            this.splitHorizId = "split-" + (++SEQ.val);
        }
        // ----------------------------------------------------------------------------------------
        display() {
            if (this.parentElt.children.length > 0) return;
            super.display();
            this.createPanel(this.westCenterId, "panel westCenter", undefined, (this.toolbarEltId ? "2" : "1") + " / span 3");
            this.createSplit(this.splitVertId, "VERTICAL", undefined, (this.toolbarEltId ? "2" : "1") + " / span 3");
            this.createPanel(this.eastNorthId, "panel eastNorth");
            this.createSplit(this.splitHorizId, "HORIZONTAL");
            this.createPanel(this.eastSouthId, "panel eastSouth");
            this.addEventListener(this.layoutElt, this.westCenter, this.eastNorth, this.eathSouth, this.splitHoriz, this.splitVert);
        }
        // ----------------------------------------------------------------------------------------
        onSlideStart(ev: Event, target: EventTarget | null, clientX: number, clientY: number) {
            if (target === this.splitHoriz) {
                ev.preventDefault();
                this.splitHoriz.slider = { pos: clientY, size1: this.eastNorth.offsetHeight, size2: this.eathSouth.offsetHeight };
            } else if (target === this.splitVert) {
                ev.preventDefault();
                this.splitVert.slider = { pos: clientX, size1: this.westCenter.offsetWidth, size2: this.splitHoriz.offsetWidth };
            }
        }
        // ----------------------------------------------------------------------------------------
        onSlideMove(ev: Event, target: EventTarget | null, clientX: number, clientY: number) {
            if (this.splitHoriz.slider) {
                ev.preventDefault();
                let deltapos = clientY - this.splitHoriz.slider.pos;
                Layout.setHeight(this.splitHoriz.slider.size1 + deltapos - margin / 2, this.eastNorth);
                Layout.setHeight(this.splitHoriz.slider.size2 - deltapos - margin / 2, this.eathSouth);
                Layout.reset("width", this.eastNorth, this.eathSouth);
            } else if (this.splitVert.slider) {
                ev.preventDefault();
                let deltapos = clientX - this.splitVert.slider.pos;
                Layout.setWidth(this.splitVert.slider.size1 + deltapos - margin / 2, this.westCenter);
                Layout.setWidth(this.splitVert.slider.size2 - deltapos - margin / 2, this.eastNorth, this.splitHoriz, this.eathSouth);
                Layout.reset("height", this.westCenter, this.eastNorth, this.eathSouth);
            }
        }
        // ----------------------------------------------------------------------------------------
        onSlideEnd() {
            this.splitHoriz.slider = undefined;
            this.splitVert.slider = undefined;
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    // window.addEventListener("resize", () => { Layout.reset("both"); });
    // ============================================================================================
}
// ################################################################################################
