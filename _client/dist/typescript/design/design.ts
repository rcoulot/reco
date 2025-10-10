// ################################################################################################
namespace reco.design {
    // ============================================================================================
    import DBJson = reco.core.db.DBJson;
    import MetaModel = reco.core.meta.MetaModel;
    import ModelTreeHandler = reco.core.meta.ModelTreeHandler;
    import RootPanel = reco.ui.layout.RootPanel;
    import App = reco.ui.form.App;
    // ============================================================================================
    export class DesignApp extends App<MetaModel> {
        // ----------------------------------------------------------------------------------------
        static pageDefCreationFcts: ((app: DesignApp) => void)[] = []
        // ----------------------------------------------------------------------------------------
        model?: MetaModel;
        modelTreeHandler?: ModelTreeHandler;
        modelUrl: string = "";
        // ----------------------------------------------------------------------------------------
        constructor() {
            super();
            RootPanel.addRootFullPanel("root");
        }
        // ----------------------------------------------------------------------------------------
        async loadModel(modelUrl: string = "/design/test-model.json"): Promise<void> {
            this.modelUrl = modelUrl;
            this.model = new MetaModel();
            this.model.dbJsonLoad(await (await fetch(modelUrl)).json() as DBJson);
            this.initDb(this.model);
            this.modelTreeHandler = new ModelTreeHandler(this.model);
            for (let fct of DesignApp.pageDefCreationFcts) fct(this)
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    (async function runDesign() {
        let app = new DesignApp()
        await app.loadModel();
        // app.getPageDefByClass("MainPageDef")!.display()
        app.getPageDefByClass("WelcomePageDef")!.display()
    })()
    // ============================================================================================
}
// ################################################################################################
