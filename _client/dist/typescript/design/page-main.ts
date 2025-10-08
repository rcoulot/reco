// ################################################################################################
namespace reco.design {
    // ============================================================================================
    import LayoutWcEnEs = reco.ui.layout.LayoutWcEnEs;
    import PageDef = reco.ui.form.PageDef;
    import FormDef = reco.ui.form.FormDef;
    // ============================================================================================
    class MainPageDef extends PageDef<DesignApp, LayoutWcEnEs> {
        // ----------------------------------------------------------------------------------------
        constructor(app: DesignApp) {
            super(app, new LayoutWcEnEs("root",true));
            new MainPageTreeFormDef(this);
        }
        // ----------------------------------------------------------------------------------------
        display() {
            this.app.display(this.getFormDefByClass(MainPageTreeFormDef.name)!)
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    class MainPageTreeFormDef extends FormDef<MainPageDef> {
        // ----------------------------------------------------------------------------------------
        constructor(pageDef: MainPageDef) {
            super(pageDef, pageDef.layout.westCenterId);
            this.addTreeDef("'Model Tree'", this.pageDef.app.modelTreeHandler!);
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