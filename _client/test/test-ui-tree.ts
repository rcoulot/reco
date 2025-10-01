// ################################################################################################
namespace reco.core.ui.tree.test {
    import TestDB = reco.core.test.data.TestDB
    import testPDBJson = reco.core.test.data.testPDBJson
    import GeoTreeHandler = reco.core.test.data.GeoTreeHandler
    // ============================================================================================
    async function testtree() {
        const testDB = new TestDB();
        testDB.dbJsonLoad(testPDBJson);
        reco.ui.layout.RootPanel.addRootFullPanel("tree");
        new TreeUI(document.getElementById("tree") as HTMLElement, new GeoTreeHandler(testDB)).display();
    }
    // ============================================================================================
    testtree()
    // ============================================================================================
}
// ################################################################################################
