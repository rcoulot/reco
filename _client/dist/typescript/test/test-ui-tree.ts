// ################################################################################################
namespace reco.ui.tree.test {
    import TestDB = reco.core.test.data.TestDB
    import testDBJson = reco.core.test.data.testDBJson
    import GeoTreeHandler = reco.core.test.data.GeoTreeHandler
    import LayoutNcSc = reco.ui.layout.LayoutNcSc;
    // ============================================================================================
    async function testtree() {
        const testDB = new TestDB();
        testDB.dbJsonLoad(testDBJson);
        reco.ui.layout.RootPanel.addRootFullPanel("root");
        let layout = new LayoutNcSc("root",false)
        layout.display();
        new TreeUI(layout.northCenterId, new GeoTreeHandler(testDB)).display();
    }
    // ============================================================================================
    testtree()
    // ============================================================================================
}
// ################################################################################################
