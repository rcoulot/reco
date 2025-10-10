// ################################################################################################
namespace reco.design {
    // ============================================================================================
    import LayoutSimple = reco.ui.layout.LayoutSimple;
    import PageDef = reco.ui.form.PageDef;
    import FormDef = reco.ui.form.FormDef;
    import FormItem = reco.ui.form.FormItem;
    import FormDefItemAction = reco.ui.form.FormDefItemAction;
    // ============================================================================================
    class WelcomePageDef extends PageDef<DesignApp, LayoutSimple> {
        // ----------------------------------------------------------------------------------------
        constructor(app: DesignApp) {
            super(app, new LayoutSimple("root",true));
            new WelcomeBarFormDef(this);
        }
        // ----------------------------------------------------------------------------------------
        display() {
            this.app.display(this.getFormDefByClass(WelcomeBarFormDef.name)!)
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    class WelcomeBarFormDef extends FormDef<WelcomePageDef> {
        // ----------------------------------------------------------------------------------------
        btOpenModel?: FormDefItemAction;
        // ----------------------------------------------------------------------------------------
        constructor(pageDef: WelcomePageDef) {
            super(pageDef, pageDef.layout.toolbarEltId!);
            this.btOpenModel = this.addActionDef("'Open Model'")
        }
        // ----------------------------------------------------------------------------------------
        onActionEvent(item: FormItem, itemDef: FormDefItemAction): void {
            if (itemDef == this.btOpenModel) this.openModel();
        }
        // ----------------------------------------------------------------------------------------
        openModel() {
            // alert("WelcomeBarFormDef.openModel TODO")
            this.pageDef.app.getPageDefByClass("MainPageDef")!.display()
        }
        // ----------------------------------------------------------------------------------------
        display() {
            this.pageDef.app.display(this);
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    DesignApp.pageDefCreationFcts.push((app: DesignApp) => { new WelcomePageDef(app); });
    // ============================================================================================
}
// ################################################################################################