// ################################################################################################
namespace reco.test {
    // ============================================================================================
    import Layout = reco.ui.layout.Layout;
    import LayoutNcSc = reco.ui.layout.LayoutNcSc;
    import LayoutNwNeSc = reco.ui.layout.LayoutNwNeSc;
    import LayoutWcEnEs = reco.ui.layout.LayoutWcEnEs;
    // ============================================================================================
    reco.ui.layout.RootPanel.addRootVerticalPanel("root", 50);
    // let testcase = "NcSc";
    // let testcase = "NwNeSc";
    let testcase = "LayoutWcEnEs";
    // ============================================================================================
    if (testcase === "NwNeSc") {
        let layout1 = new LayoutNwNeSc("root")
        layout1.display();
        // let layout2 = new LayoutNwNeSc(layout1.southCenterId)
        // layout2.display();
    } else if (testcase === "LayoutWcEnEs") {
        let layout1 = new LayoutWcEnEs("root")
        layout1.display();
    } else if (testcase === "NcSc") {
        let layout1 = new LayoutNcSc("root")
        layout1.display();
    }
    let panels = document.getElementsByClassName("panel") as HTMLCollectionOf<HTMLDivElement>;
    Array.from(panels).forEach(panel => {
        if (panel.children.length === 0) {
            panel.innerText = "Panel.id = " + panel.id;
            panel.style.whiteSpace = "nowrap";
        }
    });
    // ============================================================================================
}
// ################################################################################################
