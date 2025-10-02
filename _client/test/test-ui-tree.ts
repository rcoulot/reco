// ################################################################################################
namespace reco.core.ui.tree.test {
    import TestDB = reco.core.test.data.TestDB
    import testPDBJson = reco.core.test.data.testPDBJson
    import GeoTreeHandler = reco.core.test.data.GeoTreeHandler
    import LayoutNcSc = reco.ui.layout.LayoutNcSc;
    // ============================================================================================
    async function testtree() {
        const testDB = new TestDB();
        testDB.dbJsonLoad(testPDBJson);
        reco.ui.layout.RootPanel.addRootFullPanel("root");
        let layout = new LayoutNcSc("root")
        layout.display();
        new TreeUI(layout.northCenterId, new GeoTreeHandler(testDB)).display();
    }
    // ============================================================================================
    testtree()
    // ============================================================================================
}
// ################################################################################################
