// ################################################################################################
namespace reco.ui.form.test {
    // ============================================================================================
    import testPDBJson = reco.core.test.data.testPDBJson
    import TestDB = reco.core.test.data.TestDB
    import LayoutNcSc = reco.ui.layout.LayoutNcSc;
    import App = reco.ui.form.App;
    import PageDef = reco.ui.form.PageDef;
    import FormDef = reco.ui.form.FormDef;
    import FormDefItemAction = reco.ui.form.FormDefItemAction;
    import Form = reco.ui.form.Form
    // ============================================================================================
    export class PersListFormDef extends FormDef {
        // ----------------------------------------------------------------------------------------
        persFormDef: PersFormDef;
        btShowItemDef?: FormDefItemAction;
        persForm?: Form;
        // ----------------------------------------------------------------------------------------
        constructor(pageDef: PageDef<App<any>,LayoutNcSc>, htmlEltId: string, persFormDef: PersFormDef) {
            super(pageDef, htmlEltId);
            this.persFormDef = persFormDef;
        }
        // ----------------------------------------------------------------------------------------
        init() {
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
            if (itemDef == this.btShowItemDef) this.showPerson(item, itemDef);
        }
        // ----------------------------------------------------------------------------------------
        showPerson(item: FormItem, itemDef: FormDefItemAction) {
            item.form.page.display(this.persFormDef, item.form.objList, item.obj!)
        }
        // ----------------------------------------------------------------------------------------

    }
    // ============================================================================================
    export class PersFormDef extends FormDef {
        // ----------------------------------------------------------------------------------------
        btNextItemDef?: FormDefItemAction;
        btPreviousItemDef?: FormDefItemAction;
        // ----------------------------------------------------------------------------------------
        init() {
            this.addTitleDef("'title'", "'Person'")
            this.addLabelDef("'Identifier'").setObjExp("item.obj", "$id")
            this.addSimpleDef("'Firstname'").setObjExp("item.obj", "firstname")
            this.addSimpleDef("'Lastname'").setObjExp("item.obj", "lastname")
            this.addSelectDef("'City'", "form.db.Cities", "$id", "name").setObjExp("item.obj", "cityId")
            this.addSimpleDef("'Birth date'").setObjExp("item.obj", "birthdate")
            let actions = this.addActionsDef("'Actions'", true)
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
    function runTest() {
        resizeRootElement("test-form-root-div", 1.2, 2)
        reco.core.ui.form.onstart = () => {
            const testDB = new TestDB();
            testDB.dbJsonLoad(testPDBJson);

            let app = new App(testDB);
            let pageDef = new PageDef(app, new LayoutNcSc("test-form-root-div"));

            let persFormDef = new PersFormDef(pageDef, pageDef.layout.southcenterId)
            let persListFormDef = new PersListFormDef(pageDef, pageDef.layout.northcenterId, persFormDef)

            app.display(persListFormDef, testDB.Persons, undefined)
        }
    }
    runTest()
    // ============================================================================================
}
// ################################################################################################
