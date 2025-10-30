// http://localhost:3000/test/test-ui-form.html 
// ################################################################################################
namespace reco.ui.form.test {
    // ============================================================================================
    import TestDB = reco.core.test.data.TestDB
    import Files = reco.core.files.Files;
    import FileData = reco.core.files.FileData;
    import MimeTypes = reco.core.files.MimeTypes;
    import LayoutWcEnEs = reco.ui.layout.LayoutWcEnEs;
    import LayoutSimple = reco.ui.layout.LayoutSimple;
    import App = reco.ui.form.App;
    import PageDef = reco.ui.form.PageDef;
    import FormDef = reco.ui.form.FormDef;
    import FormItem = reco.ui.form.FormItem;
    import FormDefItemAction = reco.ui.form.FormDefItemAction;
    import GeoTreeHandler = reco.core.test.data.GeoTreeHandler
    // ============================================================================================
    export class TestPersListFormDef extends FormDef<TestMainPageDef> {
        // ----------------------------------------------------------------------------------------
        btShowItemDef: FormDefItemAction;
        // ----------------------------------------------------------------------------------------
        constructor(pageDef: TestMainPageDef) {
            super(pageDef, pageDef.layout.eastNorthId);
            this.addTitleDef("'Form for List of Persons'")
            let tableDef = this.addTableDef("'Persons Table'").addObjListExp("form.Persons").notResizable()
            this.addLabelDef("'Identifier'", undefined, tableDef).setObjExp("item.obj", "$id")
            this.addLabelDef("'Firstname'", undefined, tableDef).setObjExp("item.obj", "firstname")
            this.addLabelDef("'Lastname'", undefined, tableDef).setObjExp("item.obj", "lastname")
            this.addLabelDef("'City'", undefined, tableDef).setObjExp("item.obj", "cityName", "cityId")
            this.addLabelDef("'State'", undefined, tableDef).setObjExp("item.obj", "city.state.name", "cityId")
            this.addLabelDef("'Country'", undefined, tableDef).setObjExp("item.obj", "city.country.name", "cityId")
            this.addLabelDef("'Birthdate'", undefined, tableDef).setObjExp("item.obj", "birthdate")
            this.btShowItemDef = this.addActionDef("'show'", tableDef, true)
        }
        // ----------------------------------------------------------------------------------------
        onActionEvent(item: FormItem, itemDef: FormDefItemAction): void {
            if (itemDef == this.btShowItemDef) this.showPerson(item);
        }
        // ----------------------------------------------------------------------------------------
        showPerson(item: FormItem) {
            item.form.page.display(this.pageDef.testPersFormDef, item.form.objList, item.obj!)
        }
        // ----------------------------------------------------------------------------------------

    }
    // ============================================================================================
    export class TestPersFormDef extends FormDef<TestMainPageDef> {
        // ----------------------------------------------------------------------------------------
        btNextItemDef: FormDefItemAction;
        btPreviousItemDef: FormDefItemAction;
        // ----------------------------------------------------------------------------------------
        constructor(pageDef: TestMainPageDef) {
            super(pageDef, pageDef.layout.eastSouthId);
            this.addTitleDef("'Person'")
            this.addLabelDef("'Identifier'").setObjExp("item.obj", "$id")
            this.addSimpleDef("'Firstname'").setObjExp("item.obj", "firstname")
            this.addSimpleDef("'Lastname'").setObjExp("item.obj", "lastname")
            this.addSelectDef("'City'", "form.db.Cities", "$id", "name").setObjExp("item.obj", "cityId")
            this.addSimpleDef("'Birth date'").setObjExp("item.obj", "birthdate")
            //let actions = this.addActionsDef("'Actions'", true)
            let actions = this.addActionsDef("", true)
            this.btPreviousItemDef = this.addActionDef("'Previous'", actions)
            this.btNextItemDef = this.addActionDef("'Next'", actions)
        }
        // ----------------------------------------------------------------------------------------
        onActionEvent(item: FormItem, itemDef: FormDefItemAction): void {
            if (itemDef == this.btNextItemDef) this.next(item, itemDef);
            else if (itemDef == this.btPreviousItemDef) this.previous(item, itemDef);
        }
        // ----------------------------------------------------------------------------------------
        next(item: FormItem, itemDef: FormDefItemAction) {
            let list = item.form.objList!;
            let index0 = item.db.indexOf(list, item.obj!)
            let index1 = index0 + 1 >= list.length ? 0 : index0 + 1;
            console.log("PersFormDef.next list, index0,index1", list, index0, index1);
            item.form.display(list, list[index1]);
        }
        // ----------------------------------------------------------------------------------------
        previous(item: FormItem, itemDef: FormDefItemAction) {
            let list = item.form.objList!;
            let index0 = item.db.indexOf(list, item.obj!)
            let index1 = index0 - 1 < 0 ? list.length - 1 : index0 - 1;
            console.log("PersFormDef.previous list, index0,index1", list, index0, index1);
            item.form.display(list, list[index1]);
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class TestTreeFormDef extends FormDef<TestMainPageDef> {
        // ----------------------------------------------------------------------------------------
        constructor(pageDef: TestMainPageDef) {
            super(pageDef, pageDef.layout.westCenterId);
            this.addTreeDef("'Geo Tree'", () => this.pageDef.app.geoTreeHandler!);
        }
        // ----------------------------------------------------------------------------------------
        onActionEvent(item: FormItem, itemDef: FormDefItemAction, eventType?: string, eventData?: any): void {
            if (eventType === "onTreeActionClick") {
                alert(`Action for: ${eventData.node.name}`);
            } else if (eventType === "onTreeLabelClick") {
                alert(`Label for: ${eventData.node.name}`);
            }   
        }
    }
    // ============================================================================================
    export class TestToolbarFormDef extends FormDef<PageDef<TestApp, any>> {
        // ----------------------------------------------------------------------------------------
        btOpenDef: FormDefItemAction;
        btSaveDef: FormDefItemAction;
        btCloseDef: FormDefItemAction
        // ----------------------------------------------------------------------------------------
        constructor(pageDef: PageDef<TestApp, any>) {
            super(pageDef, pageDef.layout.toolbarEltId);
            this.btOpenDef = this.addActionDef("'Open'");
            this.btSaveDef = this.addActionDef("'Save'");
            this.btCloseDef = this.addActionDef("'Close'");
        }
        // ----------------------------------------------------------------------------------------
        onActionEvent(item: FormItem, itemDef: FormDefItemAction): void {
            if (itemDef == this.btOpenDef) this.pageDef.app.openDb();
            else if (itemDef == this.btSaveDef) alert("TestToolbarFormDef.onActionEvent Save TODO");
            else if (itemDef == this.btCloseDef) this.pageDef.app.closeDb();
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class TestMainPageDef extends PageDef<TestApp, LayoutWcEnEs> {
        // ----------------------------------------------------------------------------------------
        testToolbarFormDef: TestToolbarFormDef;
        testTreeFormDef: TestTreeFormDef;
        testPersFormDef: TestPersFormDef;
        testPersListFormDef: TestPersListFormDef;
        // ----------------------------------------------------------------------------------------
        constructor(app: TestApp) {
            super(app, new LayoutWcEnEs("test-form-root-div", true));
            this.testToolbarFormDef = new TestToolbarFormDef(this)
            this.testTreeFormDef = new TestTreeFormDef(this)
            this.testPersFormDef = new TestPersFormDef(this)
            this.testPersListFormDef = new TestPersListFormDef(this)
        }
        // ----------------------------------------------------------------------------------------
        display(): void {
            this.app.display(this.testToolbarFormDef)
            this.app.display(this.testTreeFormDef, this.app.db!.Persons)
            this.app.display(this.testPersListFormDef, this.app.db!.Persons)
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class TestWelcomePageDef extends PageDef<TestApp, LayoutSimple> {
        // ----------------------------------------------------------------------------------------
        testToolbarFormDef: TestToolbarFormDef;
        // ----------------------------------------------------------------------------------------
        constructor(app: TestApp) {
            super(app, new LayoutSimple("test-form-root-div", true));
            this.testToolbarFormDef = new TestToolbarFormDef(this);
        }
        // ----------------------------------------------------------------------------------------
        display(): void {
            this.app.display(this.testToolbarFormDef)
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class TestApp extends App<TestDB> {
        // ----------------------------------------------------------------------------------------
        dbFileData?: FileData;
        geoTreeHandler?: GeoTreeHandler;
        testMainPageDef: TestMainPageDef;
        testWelcomePageDef: TestWelcomePageDef;
        // ----------------------------------------------------------------------------------------
        constructor() {
            super();
            this.testMainPageDef = new TestMainPageDef(this);
            this.testWelcomePageDef = new TestWelcomePageDef(this);
        }
        // ----------------------------------------------------------------------------------------
        async openDb() {
            this.dbFileData = await Files.pickFile(MimeTypes.json, ".json");
            if (!this.dbFileData) { this.closeDb(); return; }
            const testDB = new TestDB();
            await testDB.dbJsonLoad(this.dbFileData.json);
            this.geoTreeHandler = new GeoTreeHandler(testDB)
            this.initDb(testDB);
            this.testMainPageDef.display();
        }
        // ----------------------------------------------------------------------------------------
        async closeDb() {
            this.geoTreeHandler = undefined;
            this.initDb(undefined);
            this.testWelcomePageDef.display();
        }
        // ----------------------------------------------------------------------------------------
        async startApp() {
            this.testWelcomePageDef.display();
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    (function () {
        reco.ui.layout.RootPanel.addRootFullPanel("test-form-root-div");
        reco.ui.form.onstart = () => { new TestApp().startApp(); }
    })();
    // ============================================================================================
}
// ################################################################################################
