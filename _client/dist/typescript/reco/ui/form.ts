// ################################################################################################
namespace reco.ui.form {
    // ============================================================================================
    import DB = reco.core.db.DB
    import OBJ = reco.core.db.OBJ
    import OBJChange = reco.core.db.OBJChange
    import Layout = reco.ui.layout.Layout;
    import TreeHandler = reco.core.db.TreeHandler;
    import TreeUI = reco.ui.tree.TreeUI;
    import SEQ = reco.core.SEQ;
    // ============================================================================================
    export var onstart: () => void | undefined;
    // ============================================================================================
    export class FormDefItem<ITEM extends FormDefItem<any>> {
        // ----------------------------------------------------------------------------------------
        formDef: FormDef<any>;
        id: string;
        labelExp: string = "";
        valueExp?: string;
        objListExp?: string = undefined;
        objExp?: string = undefined;
        objFieldname: string = "";
        objRelatedFieldnames: string[] = [];
        // ----------------------------------------------------------------------------------------
        constructor(formDef: FormDef<any>, labelExp: string) {
            this.formDef = formDef;
            this.id = "FormDefItem-" + (++SEQ.val);
            this.labelExp = labelExp;
            this.formDef.itemsDefDict[this.id] = this;
            this.formDef.itemsDef.push(this);
        }
        // ----------------------------------------------------------------------------------------
        setObjExp(objExp: string, objFieldname: string, ...objOtherFieldnames: string[]): ITEM {
            this.objExp = objExp;
            this.objFieldname = objFieldname;
            this.valueExp = objExp + "." + objFieldname
            this.objRelatedFieldnames.push(objFieldname, ...objOtherFieldnames);
            return this as unknown as ITEM
        }
        // ----------------------------------------------------------------------------------------
        addObjListExp(objListExp: string): ITEM {
            this.objListExp = objListExp;
            return this as unknown as ITEM
        }
        // ----------------------------------------------------------------------------------------
        evalValueExp(db: DB, index: number) {
            throw "Error NOT IMPLEMENTED for " + this.constructor.name
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    class FormItemSinglePObj<ITEM extends FormDefItem<any>> extends FormDefItem<ITEM> { }
    // ============================================================================================
    export class FormDefItemTitle extends FormDefItem<FormDefItemTitle> { }
    // ============================================================================================
    export class FormDefItemLabel extends FormDefItem<FormDefItemLabel> {
        // ----------------------------------------------------------------------------------------
        table?: FormDefItemTable;
        // ----------------------------------------------------------------------------------------
        constructor(form: FormDef<any>, labelExp: string, valueExp?: string, table?: FormDefItemTable) {
            super(form, labelExp);
            this.valueExp = valueExp;
            this.table = table;
            if (this.table) {
                this.formDef.itemsDef.splice(this.formDef.itemsDef.length - 1, 1)
                this.table.colsDef.push(this);
            }
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class FormDefItemSimple extends FormItemSinglePObj<FormDefItemSimple> {
        // ----------------------------------------------------------------------------------------
        table?: FormDefItemTable;
        // ----------------------------------------------------------------------------------------
        constructor(form: FormDef<any>, labelExp: string, table?: FormDefItemTable) {
            super(form, labelExp);
            this.table = table;
            if (this.table) {
                this.formDef.itemsDef.splice(this.formDef.itemsDef.length - 1, 1)
                this.table.colsDef.push(this);
            }
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class FormDefItemTree extends FormItemSinglePObj<FormDefItemSimple> {
        // ----------------------------------------------------------------------------------------
        treeHandlerProvider: () => TreeHandler<any>;
        // ----------------------------------------------------------------------------------------
        constructor(form: FormDef<any>, labelExp: string, treeHandlerProvider: () => TreeHandler<any>) {
            super(form, labelExp);
            this.treeHandlerProvider = treeHandlerProvider;
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class FormDefItemSelect extends FormItemSinglePObj<FormDefItemSelect> {
        // ----------------------------------------------------------------------------------------
        table?: FormDefItemTable;
        optionsExp: string;
        optionValueField: string;
        optionLabelField: string;
        // ----------------------------------------------------------------------------------------
        constructor(form: FormDef<any>, labelExp: string, optionsExp: string, optionIdField: string, optionValueField: string, table?: FormDefItemTable) {
            super(form, labelExp);
            this.optionsExp = optionsExp;
            this.optionValueField = optionIdField
            this.optionLabelField = optionValueField
            this.table = table;
            if (this.table) {
                this.formDef.itemsDef.splice(this.formDef.itemsDef.length - 1, 1)
                this.table.colsDef.push(this);
            }
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class FormDefItemAction extends FormDefItem<FormDefItemAction> {
        // ----------------------------------------------------------------------------------------
        actionsDef?: FormDefItemActions;
        table?: FormDefItemTable;
        // ----------------------------------------------------------------------------------------
        constructor(form: FormDef<any>, labelExp: string, parent?: FormDefItemActions | FormDefItemTable, isTableRow: boolean = true) {
            super(form, labelExp);
            this.actionsDef = parent instanceof FormDefItemActions ? parent : undefined;
            this.table = parent instanceof FormDefItemTable ? parent : undefined;
            if (this.actionsDef) {
                this.formDef.itemsDef.splice(this.formDef.itemsDef.length - 1, 1)
                this.actionsDef.actionsDef.push(this);
            } else if (this.table) {
                this.formDef.itemsDef.splice(this.formDef.itemsDef.length - 1, 1)
                if (isTableRow) this.table.colsDef.push(this);
                else {
                    this.table.tableActions = this.table.tableActions ? this.table.tableActions : new FormDefItemActions(this.formDef, "'...'", false, this.table);
                    this.table.tableActions.actionsDef.push(this);
                }
            }
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class FormDefItemActions extends FormDefItem<FormDefItemActions> {
        // ----------------------------------------------------------------------------------------
        table?: FormDefItemTable;
        actionsDef: FormDefItemAction[];
        asBar: boolean;
        // ----------------------------------------------------------------------------------------
        constructor(form: FormDef<any>, labelExp: string, asBar: boolean, table?: FormDefItemTable, tableRow: boolean = true) {
            super(form, labelExp);
            this.actionsDef = [];
            this.asBar = asBar;
            this.table = table;
            if (this.table) {
                this.formDef.itemsDef.splice(this.formDef.itemsDef.length - 1, 1)
                if (tableRow) this.table.colsDef.push(this);
                else this.table.tableActions = this;
            }
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class FormDefItemTable extends FormDefItem<FormDefItemTable> {
        // ----------------------------------------------------------------------------------------
        colsDef: FormDefItem<any>[] = [];
        tableActions?: FormDefItemActions;
        isResizable: boolean = true;
        // ----------------------------------------------------------------------------------------
        constructor(form: FormDef<any>, labelExp: string) {
            super(form, labelExp);
        }
        // ----------------------------------------------------------------------------------------
        notResizable(): FormDefItemTable {
            this.isResizable = false;
            return this;
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class FormDef<P extends PageDef<any, any>> {
        // ----------------------------------------------------------------------------------------
        pageDef: P;
        htmlEltId: string;
        id: string
        idExp: string = "";
        itemsDefDict: { [key: string]: FormDefItem<any> } = {};
        itemsDef: FormDefItem<any>[] = [];
        // ----------------------------------------------------------------------------------------
        constructor(pageDef: P, htmlEltId: string, id: string | undefined = undefined) {
            this.pageDef = pageDef;
            this.htmlEltId = htmlEltId;
            this.id = id ? id : "FormDef" + (++SEQ.val);
            this.pageDef.formDefDict[this.id] = this;
            this.pageDef.formDefs.push(this);
        }
        // ----------------------------------------------------------------------------------------
        addTitleDef(labelExp: string): FormDefItemTitle {
            return new FormDefItemTitle(this, labelExp);
        }
        // ----------------------------------------------------------------------------------------
        addLabelDef(labelExp: string, valueExp?: string, table?: FormDefItemTable): FormDefItemLabel {
            return new FormDefItemLabel(this, labelExp, valueExp, table);
        }
        // ----------------------------------------------------------------------------------------
        addSimpleDef(labelExp: string, table?: FormDefItemTable): FormDefItemSimple {
            return new FormDefItemSimple(this, labelExp, table);
        }
        // ----------------------------------------------------------------------------------------
        addTreeDef(labelExp: string, treeHandlerProvider: () => TreeHandler<any>): FormDefItemTree {
            return new FormDefItemTree(this, labelExp, treeHandlerProvider);
        }
        // ----------------------------------------------------------------------------------------
        addSelectDef(labelExp: string, optionsExp: string, optionIdField: string, optionValueField: string, table?: FormDefItemTable): FormDefItemSelect {
            return new FormDefItemSelect(this, labelExp, optionsExp, optionIdField, optionValueField, table);
        }
        // ----------------------------------------------------------------------------------------
        addTableDef(labelExp: string): FormDefItemTable {
            return new FormDefItemTable(this, labelExp);
        }
        // ----------------------------------------------------------------------------------------
        addActionDef(labelExp: string, parent?: FormDefItemActions | FormDefItemTable, isTableRow: boolean = true): FormDefItemAction {
            return new FormDefItemAction(this, labelExp, parent, isTableRow);
        }
        // ----------------------------------------------------------------------------------------
        addActionsDef(labelExp: string, asBar: boolean): FormDefItemActions {
            return new FormDefItemActions(this, labelExp, asBar);
        }
        // ----------------------------------------------------------------------------------------
        onActionEvent(item: FormItem, itemDef: FormDefItemAction, eventType: string = "", eventData: any = {}): void {
            let txt = item.obj ? item.obj.$type + "." + item.obj.$id : "";
            alert("Action event on item  not handled !" + item.id + " / " + item.label + " / " + txt);
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class PageDef<A extends App<any>, T extends Layout> {
        // ----------------------------------------------------------------------------------------
        app: A;
        id: string
        formDefDict: { [id: string]: FormDef<any> } = {};
        formDefs: FormDef<any>[] = [];
        layout: T;
        // ----------------------------------------------------------------------------------------
        constructor(app: A, layout: T) {
            this.id = "PageDef" + (++SEQ.val);
            this.app = app;
            this.layout = layout;
            this.app.pageDefDict[this.id] = this;
            this.app.pageDefs.push(this);
        }
        // ----------------------------------------------------------------------------------------
        getFormDefByClass<F extends FormDef<any>>(classFormDef: string): F | undefined {
            for (let formDef of this.formDefs) {
                if (formDef.constructor.name == classFormDef) return formDef as F;
            }
            return undefined
        }
        // ----------------------------------------------------------------------------------------
        display() { }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class App<D extends DB> {
        // ----------------------------------------------------------------------------------------
        private _db?: D;
        pageDefDict: { [id: string]: PageDef<any, any> } = {};
        pageDefs: PageDef<any, any>[] = [];
        page?: Page;
        // ----------------------------------------------------------------------------------------
        get db(): D | undefined { return this._db; }
        set db(db: D | undefined) { this.initDb(db); }
        // ----------------------------------------------------------------------------------------
        constructor(db: D | undefined = undefined) {
            if (db) this.initDb(db)
        }
        // ----------------------------------------------------------------------------------------
        initDb(db: D | undefined): App<D> {
            let THIS = this;
            this._db = db;
            if (this._db) {
                this._db.changeListeners.push(
                    (pobj: OBJ<any>, change: OBJChange) => {
                        THIS.onDbChange(pobj, change);
                    });
            }
            this.removePage();
            this.page = undefined;
            return this;
        }
        // ----------------------------------------------------------------------------------------
        getPageDefByClass<P extends PageDef<any, any>>(classPageDef: string): P | undefined {
            for (let pageDef of this.pageDefs) {
                if (pageDef.constructor.name == classPageDef) return pageDef as P;
            }
            return undefined
        }
        // ----------------------------------------------------------------------------------------
        removePage() {
            if (this.page) this.page.remove()
            this.page = undefined;
        }
        // ----------------------------------------------------------------------------------------
        hide(formDef: FormDef<any>, objList?: OBJ<DB>[], obj?: OBJ<DB>): void {
            if (this.page && this.page.pageDef !== formDef.pageDef) this.page.remove();
            this.page = this.page ? this.page : new Page(formDef.pageDef);
            this.page.hide(formDef, objList, obj);
        }
        // ----------------------------------------------------------------------------------------
        display(formDef: FormDef<any>, objList?: OBJ<DB>[], obj?: OBJ<DB>): void {
            if (this.page && this.page.pageDef !== formDef.pageDef) this.page.remove();
            this.page = this.page ? this.page : new Page(formDef.pageDef);
            this.page.display(formDef, objList, obj);
        }
        // ----------------------------------------------------------------------------------------
        onDbChange(pobj: OBJ<any>, change: OBJChange) {
            if (change.objChanged && this.page) {
                let objElements = document.getElementsByClassName(pobj.$type$id)
                for (let objElement of objElements) {
                    if (objElement.classList.contains(change.fieldname!)) {
                        let itemId = objElement.id.substring(0, objElement.id.lastIndexOf("-"))
                        for (let form of this.page.forms) {
                            let item = form.items[itemId];
                            if (item) item.refresh();
                        }
                    }
                }
                for (let form of this.page.forms) {
                    for (let itemId in form.items) {
                        let item = form.items[itemId];
                        if (item.treeUI) item.refresh();
                    }
                }
            }
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class Page {
        // ----------------------------------------------------------------------------------------
        pageDef: PageDef<any, any>;
        get app(): App<any> { return this.pageDef.app };
        formsDict: { [id: string]: Form } = {};
        forms: Form[] = [];
        // ----------------------------------------------------------------------------------------
        constructor(pageDef: PageDef<any, any>) {
            this.pageDef = pageDef;
            for (let formDef of this.pageDef.formDefs) {
                this.newForm(formDef)
            }
        }
        // ----------------------------------------------------------------------------------------
        getForm(formDef: FormDef<any>): Form | undefined {
            for (let form of this.forms) {
                if (form.formDef == formDef) return form;
            }
            return undefined;
        }
        // ----------------------------------------------------------------------------------------
        newForm(formDef: FormDef<any>): Form {
            let form = new Form(this, formDef);
            this.formsDict[form.id] = form;
            this.forms.push(form);
            return form;
        }
        // ----------------------------------------------------------------------------------------
        removeForm(form: Form): Page {
            form.remove();
            delete this.formsDict[form.id];
            this.forms.splice(this.forms.indexOf(form), 1);
            return this;
        }
        // ----------------------------------------------------------------------------------------
        remove(): Page {
            this.forms.forEach(form => {
                form.remove()
                delete this.formsDict[form.id];
            });
            this.forms = [];
            this.pageDef.layout.remove();
            return this;
        }
        // ----------------------------------------------------------------------------------------
        hide(formDef: FormDef<any>, objList?: OBJ<DB>[], obj?: OBJ<DB>): void {
            this.pageDef.layout.display();
            let form = this.getForm(formDef);
            form = form ? form : this.newForm(formDef);
            form.hide(objList, obj);
        }
        // ----------------------------------------------------------------------------------------
        display(formDef: FormDef<any>, objList?: OBJ<DB>[], obj?: OBJ<DB>): void {
            this.pageDef.layout.display();
            let form = this.getForm(formDef);
            form = form ? form : this.newForm(formDef);
            form.display(objList, obj);
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class Form {
        // ----------------------------------------------------------------------------------------
        page: Page;
        id: string;
        formDef: FormDef<any>;
        items: { [id: string]: FormItem } = {};
        get db(): DB { return this.page.app!.db!; }
        objList?: OBJ<DB>[];
        obj?: OBJ<DB>;
        // ----------------------------------------------------------------------------------------
        constructor(page: Page, formDef: FormDef<any>) {
            this.id = "Form" + (++SEQ.val);
            this.formDef = formDef;
            this.page = page;
        }
        // ----------------------------------------------------------------------------------------
        remove() {
            let elt = document.getElementById(this.formDef.htmlEltId)!;
            elt.innerHTML = "";
        }
        // ----------------------------------------------------------------------------------------
        hide(objList?: OBJ<DB>[], obj?: OBJ<DB>): void {
            let elt = document.getElementById(this.formDef.htmlEltId)!;
            elt.innerHTML = "";
        }
        // ----------------------------------------------------------------------------------------
        display(objList?: OBJ<DB>[], obj?: OBJ<DB>): void {
            let THIS = this
            this.items = {};
            this.objList = objList;
            this.obj = obj;
            let elt = document.getElementById(this.formDef.htmlEltId)!;
            elt.innerHTML = new FormGenerator(this).generate();
            let formDivs = elt.getElementsByClassName("form");
            for (let formDiv of formDivs as HTMLCollectionOf<HTMLDivElement>) {
                if (formDiv.parentElement?.classList.contains("toolbar")) formDiv.style.display = "block";
            }
            let treeDivs = elt.getElementsByClassName("div-tree");
            for (let treeDiv of treeDivs) {
                let item = THIS.items[treeDiv.id] as FormItem
                let itemDef = this.items[treeDiv.id].itemDef as FormDefItemTree;
                item.treeUI = new TreeUI(treeDiv.id, itemDef.treeHandlerProvider(), item).display();
            }
            let actionButtons = elt.getElementsByClassName("action-button");
            for (let button of actionButtons) {
                button.addEventListener("click", (event) => {
                    let itemButton = THIS.items[button.id] as FormItem
                    THIS.formDef.onActionEvent(itemButton, itemButton.itemDef);
                });
            }
            let inputs: HTMLElement[] = []
            inputs.push(...elt.getElementsByClassName("simple-input") as HTMLCollectionOf<HTMLInputElement>)
            inputs.push(...elt.getElementsByClassName("select-select") as HTMLCollectionOf<HTMLSelectElement>)
            for (let input of inputs) {
                let id = input.id!;
                id = id.substring(0, id.lastIndexOf("-"))
                let item = this.items[id];
                if (input instanceof HTMLInputElement) input.onchange = () => { item.value = input.value }
                else if (input instanceof HTMLSelectElement) input.onchange = () => { item.value = input.options[input.selectedIndex].value }
            }
            // onWinResize.fct!();
        }
        // ----------------------------------------------------------------------------------------
        newItem(itemDef: FormDefItem<any>, parentItem?: FormItem): FormItem {
            return new FormItem(this, itemDef, parentItem)
        }
        // ----------------------------------------------------------------------------------------
        debug(...values: any[]) {
            //console.log(...values)
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class FormItem {
        // ----------------------------------------------------------------------------------------
        id: string;
        form: Form;
        treeUI?: TreeUI<any>;
        itemDef: FormDefItem<any>;
        parentItem?: FormItem;
        objList?: OBJ<DB>[] = undefined;
        obj?: OBJ<DB> = undefined;
        objIndex?: number = undefined;
        get cssClassObjId() { return this.obj ? this.obj.$type$id + " " + this.itemDef.objRelatedFieldnames.join(" ") : ""; }
        // ----------------------------------------------------------------------------------------
        constructor(form: Form, itemDef: FormDefItem<any>, parentItem?: FormItem) {
            this.id = "FormItem" + (++SEQ.val);
            this.form = form;
            this.itemDef = itemDef;
            this.form.items[this.id] = this
            this.parentItem = parentItem;
            this.obj = this.eval(this.itemDef.objExp);
            this.obj = this.obj ? this.obj : this.form.obj;
            this.objList = this.eval(this.itemDef.objListExp);
            this.objList = this.objList ? this.objList : this.form.objList;
        }
        // ----------------------------------------------------------------------------------------
        eval(exp?: string): any {
            if (!exp) return undefined
            return (function (exp: string, form: Form, item: FormItem): any {
                try {
                    return eval(exp)
                } catch (error) {
                    return ""
                }
            })(exp, this.form, this)
        }
        // ----------------------------------------------------------------------------------------
        get db(): any { return this.form.db; }
        get label(): any { return this.eval(this.itemDef.labelExp) }
        get value(): any { return this.eval(this.itemDef.valueExp!) }
        set value(value: any) { this.eval(this.itemDef.valueExp! + "='" + (value == undefined || value == null ? "" : value) + "'") }
        get selectOptions(): any {
            let selectDef = this.itemDef as FormDefItemSelect
            let rawOptions: any[] = this.eval(selectDef.optionsExp)
            // console.log("ǵet selectOptions selectDef.optionsExp="+selectDef.optionsExp+", rawOptions >",rawOptions)
            let options: any[] = [];
            for (let rawOption of rawOptions) {
                options.push({ value: rawOption[selectDef.optionValueField], label: rawOption[selectDef.optionLabelField] });
            }
            return options
        }
        // ----------------------------------------------------------------------------------------
        refresh() {
            if (this.itemDef instanceof FormDefItemSimple) {
                let input = document.getElementById(this.id + "-input") as HTMLInputElement
                input.value = this.value;
            } else if (this.itemDef instanceof FormDefItemSelect) {
                let select = document.getElementById(this.id + "-select") as HTMLSelectElement
                select.value = this.value;
            } else if (this.itemDef instanceof FormDefItemLabel) {
                let label = document.getElementById(this.id + "-value")!
                label.innerText = this.value;
            } else if (this.itemDef instanceof FormDefItemTree && this.treeUI) {
                this.treeUI.display(true);
            }
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    var starForm = async () => {
        if (reco.ui.form.onstart) reco.ui.form.onstart()
        else setTimeout(starForm, 100);
    }
    starForm();
    // ============================================================================================
}
// ################################################################################################
