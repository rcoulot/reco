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
        btCloseDef: FormDefItemAction;
        // ----------------------------------------------------------------------------------------
        constructor(pageDef: MainPageDef) {
            super(pageDef, pageDef.layout.eastSouthId);
            this.addTitleDef("'Class Details'")
            this.addSimpleDef("'package'").setObjExp("item.obj.parentPackage", "name")
            this.addSimpleDef("'class'").setObjExp("item.obj", "name")
            let fieldsTableDef = this.addTableDef("'fields'").addObjListExp("form.obj.fields").notResizable()
            this.addSimpleDef("'name'", fieldsTableDef).setObjExp("item.obj", "name")
            this.addLabelDef("'type'", undefined, fieldsTableDef).setObjExp("item.obj", "type")
            this.addSimpleDef("'typeInfo'", fieldsTableDef).setObjExp("item.obj", "typeInfo")
            let relationsTableDef = this.addTableDef("'relations'").addObjListExp("form.obj.allRelations").notResizable()
            this.addSimpleDef("'name'", relationsTableDef).setObjExp("item.obj", "name")
            this.addLabelDef("'target'", undefined, relationsTableDef).setObjExp("item.obj.target", "name")
            this.addLabelDef("'multiplicity'", undefined, relationsTableDef).setObjExp("item.obj", "multiplicity")
            this.addLabelDef("'backref'", undefined, relationsTableDef).setObjExp("item.obj.backref", "name")
            this.btCloseDef = this.addActionDef("'Close'");
        }
        // ----------------------------------------------------------------------------------------
        onActionEvent(item: FormItem, itemDef: FormDefItemAction): void {
            if (itemDef == this.btCloseDef) this.pageDef.app.hide(this.pageDef.metaClassFormDef, item.objList, item.obj);
        }
        // ----------------------------------------------------------------------------------------
        display() {
            this.pageDef.app.display(this);
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    DesignApp.pageDefCreationFcts.push((app: DesignApp) => { new MainPageDef(app); });
    // ============================================================================================
}
// ################################################################################################