// ################################################################################################
namespace reco.design {
    // ============================================================================================
    import LayoutWcEnEs = reco.ui.layout.LayoutWcEnEs;
    import PageDef = reco.ui.form.PageDef;
    import FormDef = reco.ui.form.FormDef;
    import FormItem = reco.ui.form.FormItem;
    import FormDefItemAction = reco.ui.form.FormDefItemAction;
    import FormDefItemTree = reco.ui.form.FormDefItemTree;
    import MetaClass = reco.core.meta.MetaClass;
    import MetaField = reco.core.meta.MetaField;
    import MetaRelation = reco.core.meta.MetaRelation;
    // ============================================================================================
    export class MainPageDef extends PageDef<DesignApp, LayoutWcEnEs> {
        // ----------------------------------------------------------------------------------------
        toolbarFormDef: ToolbarFormDef;
        mainPageTreeFormDef: MainPageTreeFormDef;
        metaClassFormDef: MetaClassFormDef;
        // ----------------------------------------------------------------------------------------
        constructor(app: DesignApp) {
            super(app, new LayoutWcEnEs("root", true));
            this.toolbarFormDef = new ToolbarFormDef(this);
            this.mainPageTreeFormDef = new MainPageTreeFormDef(this);
            this.metaClassFormDef = new MetaClassFormDef(this);
        };
        // ----------------------------------------------------------------------------------------
        display() {
            this.app.display(this.toolbarFormDef)
            this.app.display(this.mainPageTreeFormDef)
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class MainPageTreeFormDef extends FormDef<MainPageDef> {
        // ----------------------------------------------------------------------------------------
        formDefItemTree: FormDefItemTree;
        // ----------------------------------------------------------------------------------------
        constructor(pageDef: MainPageDef) {
            super(pageDef, pageDef.layout.westCenterId);
            this.formDefItemTree = this.addTreeDef("'Model Tree'", () => this.pageDef.app.modelTreeHandler!);
        }
        // ----------------------------------------------------------------------------------------
        display() {
            this.pageDef.app.display(this);
        }
        // ----------------------------------------------------------------------------------------
        onActionEvent(item: FormItem, itemDef: FormDefItemAction, eventType?: string, eventData?: any): void {
            if (eventType === "onTreeLabelClick") {
                if (eventData.node instanceof MetaClass) {
                    // alert(`Label for: ${eventData.node.constructor.name} >> ${eventData.node.name}`);
                    this.pageDef.app.display(this.pageDef.metaClassFormDef, [], eventData.node)
                } else {
                    this.pageDef.app.hide(this.pageDef.metaClassFormDef, [], eventData.node)
                }
            }
        }
    }
    // ============================================================================================
    class MetaClassFormDef extends FormDef<MainPageDef> {
        // ----------------------------------------------------------------------------------------
        constructor(pageDef: MainPageDef) {
            super(pageDef, pageDef.layout.eastNorthId);
            this.addTitleDef("'Class Details'")
            this.addSimpleDef("'package name'").setObjExp("item.obj.parentPackage", "name")
            this.addSimpleDef("'class name'").setObjExp("item.obj", "name")

            // let tableDef = this.addTableDef("'Class fields'").addObjListExp("form.Persons")//.notResizable()
            // this.addLabelDef("'Identifier'", undefined, tableDef, "false").setObjExp("item.obj", "$id")
            // this.addLabelDef("'Firstname'", undefined, tableDef, "12.5%").setObjExp("item.obj", "firstname")
            // this.addLabelDef("'Lastname'", undefined, tableDef, "12.5%").setObjExp("item.obj", "lastname")
            // this.addLabelDef("'City'", undefined, tableDef, "12.5%").setObjExp("item.obj", "cityName", "cityId")
            // this.addLabelDef("'State'", undefined, tableDef, "12.5%").setObjExp("item.obj", "city.state.name", "cityId")
            // this.addLabelDef("'Country'", undefined, tableDef, "12.5%").setObjExp("item.obj", "city.country.name", "cityId")
            // this.addLabelDef("'Birthdate'", undefined, tableDef, "12.5%").setObjExp("item.obj", "birthdate")
            // this.btShowItemDef = this.addActionDef("'show'", tableDef, true, 'false')


            // this.modelFormDiv = this.page.getElementById("modelFormDiv")!
            // let form = this.page.getElementById("form.class")!
            // this.formHtml = form?.innerHTML.replaceAll("@id", "id")
        }
        // ----------------------------------------------------------------------------------------
        display() {
            this.pageDef.app.display(this);
        }
        // ----------------------------------------------------------------------------------------
        // populate(clazz: MetaClass) {
        //     this.page.getInputElementById("form.class.name")!.value = clazz.name ? clazz.name : "";
        //     // ----
        //     let fieldsTable = this.page.getTableElementById("form.class.fields")!;
        //     let fieldsTableBody = fieldsTable.tBodies[0]!;
        //     let fieldRowHtml = fieldsTableBody.innerHTML;
        //     fieldsTableBody.innerHTML = "";
        //     let fieldsTableBodyHtml = ""
        //     for (let field of clazz.fields) {
        //         let code = "`" + fieldRowHtml + "`"
        //         code = code.replaceAll("@equals@", "==")
        //         try {
        //             fieldsTableBodyHtml += '\n' + eval("`" + fieldRowHtml + "`").replaceAll('@selected="true"', "selected").replaceAll('@selected="false"', "");
        //         } catch (e) {
        //             console.error("Error evaluating field row template", e, code);
        //             throw e
        //         }
        //     }
        //     fieldsTableBody.innerHTML = fieldsTableBodyHtml;
        //     // ----
        //     let relationsTable = this.page.getTableElementById("form.class.relations")!;
        //     let relationsTableBody = relationsTable.tBodies[0]!;
        //     let relationRowHtml = relationsTableBody.innerHTML;
        //     relationsTableBody.innerHTML = "";
        //     let relationsTableBodyHtml = ""
        //     for (let relation of clazz.allRelations) {
        //         relationsTableBodyHtml += '\n' + eval("`" + relationRowHtml + "`")
        //     }
        //     relationsTableBody.innerHTML = relationsTableBodyHtml;
        // }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    DesignApp.pageDefCreationFcts.push((app: DesignApp) => { new MainPageDef(app); });
    // ============================================================================================
}
// ################################################################################################