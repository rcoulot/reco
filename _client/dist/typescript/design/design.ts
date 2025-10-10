// http://localhost:3000/design/index.html
// ################################################################################################
namespace reco.design {
    // ============================================================================================
    import Files = reco.core.files.Files;
    import FileData = reco.core.files.FileData;
    import MimeTypes = reco.core.files.MimeTypes;
    import MetaModel = reco.core.meta.MetaModel;
    import ModelTreeHandler = reco.core.meta.ModelTreeHandler;
    import RootPanel = reco.ui.layout.RootPanel;
    import App = reco.ui.form.App;
    import PageDef = reco.ui.form.PageDef;
    import FormDef = reco.ui.form.FormDef;
    import FormItem = reco.ui.form.FormItem;
    import FormDefItemAction = reco.ui.form.FormDefItemAction;
    // ============================================================================================
    export class DesignApp extends App<MetaModel> {
        // ----------------------------------------------------------------------------------------
        static pageDefCreationFcts: ((app: DesignApp) => void)[] = []
        // ----------------------------------------------------------------------------------------
        modelFileData?: FileData;
        model?: MetaModel;
        modelTreeHandler?: ModelTreeHandler;
        get welcomePageDef(): PageDef<any, any> { return this.getPageDefByClass("WelcomePageDef")!; }
        get mainPageDef(): PageDef<any, any> { return this.getPageDefByClass("MainPageDef")!; }
        // ----------------------------------------------------------------------------------------
        constructor() {
            super();
            RootPanel.addRootFullPanel("root");
        }
        // ----------------------------------------------------------------------------------------
        async openDb() {
            this.modelFileData = await Files.pickFile(MimeTypes.json, ".json");
            if (!this.modelFileData) { this.closeDb(); return; }
            this.model = new MetaModel();
            await this.model.dbJsonLoad(this.modelFileData.json);
            this.modelTreeHandler = new ModelTreeHandler(this.model);
            this.initDb(this.model);
            this.mainPageDef.display();
        }
        // ----------------------------------------------------------------------------------------
        async closeDb() {
            this.modelTreeHandler = undefined;
            this.initDb(undefined);
            this.welcomePageDef.display();
        }
        // ----------------------------------------------------------------------------------------
        async startApp() {
            for (let fct of DesignApp.pageDefCreationFcts) fct(this)
            this.welcomePageDef.display();
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class ToolbarFormDef extends FormDef<PageDef<DesignApp, any>> {
        // ----------------------------------------------------------------------------------------
        btOpenDef: FormDefItemAction;
        btSaveDef: FormDefItemAction;
        btCloseDef: FormDefItemAction
        // ----------------------------------------------------------------------------------------
        constructor(pageDef: PageDef<DesignApp, any>) {
            super(pageDef, pageDef.layout.toolbarEltId);
            this.btOpenDef = this.addActionDef("'Open'");
            this.btSaveDef = this.addActionDef("'Save'");
            this.btCloseDef = this.addActionDef("'Close'");
        }
        // ----------------------------------------------------------------------------------------
        onActionEvent(item: FormItem, itemDef: FormDefItemAction): void {
            if (itemDef == this.btOpenDef) this.pageDef.app.openDb();
            else if (itemDef == this.btSaveDef) alert("ToolbarFormDef.onActionEvent Save TODO");
            else if (itemDef == this.btCloseDef) this.pageDef.app.closeDb();
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    (function () {
        reco.ui.layout.RootPanel.addRootFullPanel("root");
        reco.ui.form.onstart = () => { new DesignApp().startApp(); }
    })();
    // ============================================================================================
}
// ################################################################################################
