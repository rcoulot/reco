// ################################################################################################
namespace reco.ui.form.test {
    // ============================================================================================
    import testPDBJson = reco.core.test.data.testPDBJson
    import TestDB = reco.core.test.data.TestDB
    import LayoutWcEnEs = reco.ui.layout.LayoutWcEnEs;
    import App = reco.ui.form.App;
    import PageDef = reco.ui.form.PageDef;
    import FormDef = reco.ui.form.FormDef;
    import FormDefItemAction = reco.ui.form.FormDefItemAction;
    import GeoTreeHandler = reco.core.test.data.GeoTreeHandler
    // ============================================================================================
    export class TestPersListFormDef extends FormDef<TestMainPageDef> {
        // ----------------------------------------------------------------------------------------
        btShowItemDef: FormDefItemAction;
        // ----------------------------------------------------------------------------------------
        constructor(pageDef: TestMainPageDef) {
            super(pageDef, pageDef.layout.eastNorthId);
            this.addTitleDef("'title'", "'Form for List of Persons'")
            let tableDef = this.addTableDef("'Persons Table'").addObjListExp("form.Persons")//.notResizable()
            this.addLabelDef("'Identifier'", undefined, tableDef, "false").setObjExp("item.obj", "$id")
            this.addLabelDef("'Firstname'", undefined, tableDef, "12.5%").setObjExp("item.obj", "firstname")
            this.addLabelDef("'Lastname'", undefined, tableDef, "12.5%").setObjExp("item.obj", "lastname")
            this.addLabelDef("'City'", undefined, tableDef, "12.5%").setObjExp("item.obj", "cityName", "cityId")
            this.addLabelDef("'State'", undefined, tableDef, "12.5%").setObjExp("item.obj", "city.state.name", "cityId")
            this.addLabelDef("'Country'", undefined, tableDef, "12.5%").setObjExp("item.obj", "city.country.name", "cityId")
            this.addLabelDef("'Birthdate'", undefined, tableDef, "12.5%").setObjExp("item.obj", "birthdate")
            this.btShowItemDef = this.addActionDef("btShowPers", "'show'", tableDef, true, 'false')
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
            this.addTitleDef("'title'", "'Person'")
            this.addLabelDef("'Identifier'").setObjExp("item.obj", "$id")
            this.addSimpleDef("'Firstname'").setObjExp("item.obj", "firstname")
            this.addSimpleDef("'Lastname'").setObjExp("item.obj", "lastname")
            this.addSelectDef("'City'", "form.db.Cities", "$id", "name").setObjExp("item.obj", "cityId")
            this.addSimpleDef("'Birth date'").setObjExp("item.obj", "birthdate")
            //let actions = this.addActionsDef("'Actions'", true)
            let actions = this.addActionsDef("", true)
            this.btPreviousItemDef = this.addActionDef("btPrevious", "'Previous'", actions)
            this.btNextItemDef = this.addActionDef("btNext", "'Next'", actions)
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
    }
    // ============================================================================================
    export class TestMainPageDef extends PageDef<TestApp, LayoutWcEnEs> {
        // ----------------------------------------------------------------------------------------
        testTreeFormDef: TestTreeFormDef;
        testPersFormDef: TestPersFormDef;
        testPersListFormDef: TestPersListFormDef;
        // ----------------------------------------------------------------------------------------
        constructor(app: TestApp) {
            super(app,new LayoutWcEnEs("test-form-root-div", false));
            this.testTreeFormDef = new TestTreeFormDef(this)
            this.testPersFormDef = new TestPersFormDef(this)
            this.testPersListFormDef = new TestPersListFormDef(this)
        }
        // ----------------------------------------------------------------------------------------
        display(): void {
            this.app.display(this.testTreeFormDef, this.app.db!.Persons, undefined)
            this.app.display(this.testPersListFormDef, this.app.db!.Persons, undefined)
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class TestApp extends App<TestDB> {
        // ----------------------------------------------------------------------------------------
        geoTreeHandler?: GeoTreeHandler;
        testMainPageDef: TestMainPageDef;
        // ----------------------------------------------------------------------------------------
        constructor() {
            super();
            this.testMainPageDef = new TestMainPageDef(this);
        }
        // ----------------------------------------------------------------------------------------
        async loadDb() {
            const testDB = new TestDB();
            await testDB.dbJsonLoad(testPDBJson);
            this.geoTreeHandler = new GeoTreeHandler(testDB)
            this.initDb(testDB);
        }
        // ----------------------------------------------------------------------------------------
        async startApp() {
            await this.loadDb();
            this.testMainPageDef.display();
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
