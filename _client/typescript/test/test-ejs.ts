// ################################################################################################
namespace reco.core.integration.ejs.test {
    // ============================================================================================
    import EJS = reco.core.integration.ejs.EJS;
    // ============================================================================================
    const data = {
            title: "Weekdays",
            days: [
                { id: 1, name: "Monday" },
                { id: 2, name: "Tuesday" },
                { id: 3, name: "Wednesday" },
                { id: 4, name: "Thursday" },
                { id: 5, name: "Friday" },
                { id: 6, name: "Saturday" },
                { id: 7, name: "Sunday" },
            ]
    }
    // ============================================================================================
    async function testejs() {
        EJS.templatesDocuments["test"] = document
        let ejssrc = document.getElementById("ejs1")?.innerHTML
        let html = EJS.render(ejssrc!, data)
        document.getElementById("output")!.innerHTML = html
    }
    testejs();
    // ============================================================================================
}
// ################################################################################################
