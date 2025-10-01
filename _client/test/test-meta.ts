// ################################################################################################
namespace reco.core.meta.test {
    // ============================================================================================
    import VIZ = reco.core.integration.viz.RecoViz;
    // ============================================================================================
    async function testmeta() {

        const model = new MetaModel();
        model.$name = "Agenda";
        
        let packAgenda = model.addPackage("Agenda");
        let clsPerson = model.addClass("Person",packAgenda);
        let clsAddress = model.addClass("Address",packAgenda);
        let clsCountry = model.addClass("Country",packAgenda);

        clsPerson.addField("firstname", "string");
        clsPerson.addField("lastname", "string");
        clsPerson.addField("birthdate", "Date");
        clsPerson.addRelation("addresses", clsAddress, "0..n");

        clsAddress.addField("street", "string");
        clsAddress.addField("city", "string");
        clsAddress.addField("zip", "string");
        clsAddress.addRelation("country", clsCountry, "0..1");
        clsPerson.relation("addresses")!.backref = clsAddress.addRelation("person", clsPerson, "0..1");

        clsCountry.addField("code", "string");
        clsCountry.addField("name", "string");
        
        console.log('MetaModel test\n',model.dbJson);
        console.log('MetaModel dotSrc\n',model.dotSrc);

        VIZ.render("viz", model.dotSrc);
    }
    testmeta()
    // ============================================================================================
}
// ################################################################################################
