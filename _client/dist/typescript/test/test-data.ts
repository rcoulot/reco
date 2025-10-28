// ################################################################################################
namespace reco.core.test.data {
    // ============================================================================================    
    import DB = reco.core.db.DB;
    import OBJ = reco.core.db.OBJ;
    import DBJson = reco.core.db.DBJson;
    import TreeHandler = reco.core.db.TreeHandler;
    // ============================================================================================
    export const testDBJson: DBJson = {
        "$id": "pdb01",
        "$name": "Tree-Test-Data",
        "$objects": {
            "ContinentAmericas": { "$id": "ContinentAmericas", "$type": "Continent", "name": "America" },
            "ContinentEurope": { "$id": "ContinentEurope", "$type": "Continent", "name": "Europe" },
            "CountryUSA": { "$id": "CountryUSA", "$type": "Country", "name": "USA", "continentId": "ContinentAmericas" },
            "CountryCanada": { "$id": "CountryCanada", "$type": "Country", "name": "Canada", "continentId": "ContinentAmericas" },
            "CountryFrance": { "$id": "CountryFrance", "$type": "Country", "name": "France", "continentId": "ContinentEurope" },
            "CountryGermany": { "$id": "CountryGermany", "$type": "Country", "name": "Germany", "continentId": "ContinentEurope" },
            "CountryBelgium": { "$id": "CountryBelgium", "$type": "Country", "name": "Belgium", "continentId": "ContinentEurope" },
            "StateCalifornia": { "$id": "StateCalifornia", "$type": "State", "name": "California", "countryId": "CountryUSA" },
            "StateNewyork": { "$id": "StateNewyork", "$type": "State", "name": "New York", "countryId": "CountryUSA" },
            "StateOntario": { "$id": "StateOntario", "$type": "State", "name": "Ontario", "countryId": "CountryCanada" },
            "StateQuebec": { "$id": "StateQuebec", "$type": "State", "name": "Quebec", "countryId": "CountryCanada" },
            "CityLosAngeles": { "$id": "CityLosAngeles", "$type": "City", "name": "Los Angeles", "stateId": "StateCalifornia" },
            "CitySanFrancisco": { "$id": "CitySanFrancisco", "$type": "City", "name": "San Francisco", "stateId": "StateCalifornia" },
            "CitySanDiego": { "$id": "CitySanDiego", "$type": "City", "name": "San Diego", "stateId": "StateCalifornia" },
            "CityNewyorkCity": { "$id": "CityNewyorkCity", "$type": "City", "name": "New York City", "stateId": "StateNewyork" },
            "CityBuffalo": { "$id": "CityBuffalo", "$type": "City", "name": "Buffalo", "stateId": "StateNewyork" },
            "CityToronto": { "$id": "CityToronto", "$type": "City", "name": "Toronto", "stateId": "StateOntario" },
            "CityOttawa": { "$id": "CityOttawa", "$type": "City", "name": "Ottawa", "stateId": "StateOntario" },
            "CityMontreal": { "$id": "CityMontreal", "$type": "City", "name": "Montreal", "stateId": "StateQuebec" },
            "CityQuebecCity": { "$id": "CityQuebecCity", "$type": "City", "name": "Quebec City", "stateId": "StateQuebec" },
            "CityParis": { "$id": "CityParis", "$type": "City", "name": "Paris", "countryId": "CountryFrance" },
            "CityLyon": { "$id": "CityLyon", "$type": "City", "name": "Lyon", "countryId": "CountryFrance" },
            "CityMarseille": { "$id": "CityMarseille", "$type": "City", "name": "Marseille", "countryId": "CountryFrance" },
            "CityBerlin": { "$id": "CityBerlin", "$type": "City", "name": "Berlin", "countryId": "CountryGermany" },
            "CityMunich": { "$id": "CityMunich", "$type": "City", "name": "Munich", "countryId": "CountryGermany" },
            "CityHamburg": { "$id": "CityHamburg", "$type": "City", "name": "Hamburg", "countryId": "CountryGermany" },
            "CityBrussels": { "$id": "CityBrussels", "$type": "City", "name": "Brussels", "countryId": "CountryBelgium" },
            "CityAntwerp": { "$id": "CityAntwerp", "$type": "City", "name": "Antwerp", "countryId": "CountryBelgium" },
            "CityGhent": { "$id": "CityGhent", "$type": "City", "name": "Ghent", "countryId": "CountryBelgium" },
            "Person01": { "$id": "Person01", "$type": "Person", "firstname": "Mickey", "lastname": "Mouse", "cityId": "CityNewyorkCity", "birthdate": "1928-11-18" },
            "Person02": { "$id": "Person02", "$type": "Person", "firstname": "Donald", "lastname": "Duck", "cityId": "CityLosAngeles", "birthdate": "1934-06-09" },
            "Person03": { "$id": "Person03", "$type": "Person", "firstname": "Goofy", "lastname": "Goof", "cityId": "CitySanDiego", "birthdate": "1932-05-25" },
            "Person04": { "$id": "Person04", "$type": "Person", "firstname": "Pluto", "lastname": "Dog", "cityId": "CityOttawa", "birthdate": "1930-01-01" },
            "Person05": { "$id": "Person05", "$type": "Person", "firstname": "Daisy", "lastname": "Duck", "cityId": "CityMontreal", "birthdate": "1940-02-12" },
            "Person06": { "$id": "Person06", "$type": "Person", "firstname": "Minne", "lastname": "Mouse", "cityId": "CityParis", "birthdate": "1928-11-18" }
        },
        "sequence": 1
    }
    // ============================================================================================
    export class TestDB extends DB {
        // ----------------------------------------------------------------------------------------
        protected newObj<T extends OBJ<DB>>($type: string, $id: string): T {
            let obj: any = undefined;
            switch ($type) {
                case "Continent": obj = new Continent(this, $id); break;
                case "Country": obj = new Country(this, $id); break;
                case "State": obj = new State(this, $id); break;
                case "City": obj = new City(this, $id); break;
                case "Person": obj = new Person(this, $id); break;
            }
            if (obj) return obj as T;
            throw "ERROR TestDB unkown type: " + $type
        }
        // ----------------------------------------------------------------------------------------
        get Continents(): Continent[] {
            return this.find({ $type: "Continent" }) as Continent[]
        }
        // ----------------------------------------------------------------------------------------
        get Cities(): City[] {
            return this.find({ $type: "City" }) as City[]
        }
        // ----------------------------------------------------------------------------------------
        get Persons(): Person[] {
            return this.find({ $type: "Person" }) as Person[]
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class Continent extends OBJ<TestDB> {
        // ----------------------------------------------------------------------------------------
        get name(): string { return this.objJson["name"] }
        set name(val: string) { this.setField("name", val) }
        // ----------------------------------------------------------------------------------------
        get countries(): Country[] {
            return this.db.find({ $type: "Country", "continentId": this.$id }) as Country[]
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class Country extends OBJ<TestDB> {
        // ----------------------------------------------------------------------------------------
        get name(): string { return this.objJson["name"] }
        set name(val: string) { this.setField("name", val) }
        // ----------------------------------------------------------------------------------------
        get continent(): Continent | undefined {
            return this.objJson["continentId"] ? new Continent(this.db, this.objJson["continentId"]) : undefined
        }
        set continent(refObj: Continent) {
            this.setField("continentId", refObj ? refObj.$id : undefined);
        }
        // ----------------------------------------------------------------------------------------
        get states(): State[] {
            return this.db.find({ $type: "State", "countryId": this.$id }) as State[]
        }
        // ----------------------------------------------------------------------------------------
        get cities(): City[] {
            return this.db.find({ $type: "City", "countryId": this.$id }) as City[]
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class State extends OBJ<TestDB> {
        // ----------------------------------------------------------------------------------------
        get name(): string { return this.objJson["name"] }
        set name(val: string) { this.setField("name", val) }
        // ----------------------------------------------------------------------------------------
        get country(): Country | undefined {
            return this.objJson["countryId"] ? new Country(this.db, this.objJson["countryId"]) : undefined
        }
        set country(refObj: Country) {
            this.setField("countryId", refObj ? refObj.$id : undefined);
        }
        // ----------------------------------------------------------------------------------------
        get cities(): City[] {
            return this.db.find({ $type: "City", "stateId": this.$id }) as City[]
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class City extends OBJ<TestDB> {
        // ----------------------------------------------------------------------------------------
        get name(): string { return this.objJson["name"] }
        set name(val: string) { this.setField("name", val) }
        // ----------------------------------------------------------------------------------------
        get state(): State | undefined {
            return this.objJson["stateId"] ? new State(this.db, this.objJson["stateId"]) : undefined
        }
        set state(refObj: State) {
            this.setField("stateId", refObj ? refObj.$id : undefined);
        }
        // ----------------------------------------------------------------------------------------
        get country(): Country | undefined {
            if (this.state) return this.state.country;
            else return this.objJson["countryId"] ? new Country(this.db, this.objJson["countryId"]) : undefined
        }
        set country(refObj: Country) {
            this.setField("countryId", refObj ? refObj.$id : undefined);
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class Person extends OBJ<TestDB> {
        // ----------------------------------------------------------------------------------------
        get firstname(): string { return this.objJson["firstname"] }
        set firstname(val: string) { this.setField("firstname", val) }
        get lastname(): string { return this.objJson["lastname"] }
        set lastname(val: string) { this.setField("lastname", val) }
        get birthdate(): string { return this.objJson["birthdate"] }
        set birthdate(val: string) { this.setField("birthdate", val) }
        get cityId(): string { return this.objJson["cityId"] }
        set cityId(val: string) { this.setField("cityId", val) }
        get cityName() { return  this.city ? this.city.name : "" }
        // ----------------------------------------------------------------------------------------
        get city(): City | undefined {
            return this.objJson["cityId"] ? new City(this.db, this.objJson["cityId"]) : undefined
        }
        set city(refObj: City) {
            this.setField("cityId", refObj ? refObj.$id : undefined);
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class GeoTreeHandler extends TreeHandler<TestDB> {
        // ----------------------------------------------------------------------------------------
        constructor(db: TestDB) { super(db); }
        // ----------------------------------------------------------------------------------------
        /** @override */ roots(): any[] {
            return this.db.Continents;
        }
        // ----------------------------------------------------------------------------------------
        /** @override */ parent(node: any): any {
            if (node instanceof City) return node.state ? node.state : node.country;
            else if (node instanceof State) return node.country;
            else if (node instanceof Country) return node.continent;
            return undefined;
        }
        // ----------------------------------------------------------------------------------------
        /** @override */ children(node: any): any[] {
            let children = []
            if (node instanceof Continent) children.push(...node.countries);
            else if (node instanceof Country) children.push(...node.states, ...node.cities);
            else if (node instanceof State) children.push(...node.cities);
            return children;
        }
        // ----------------------------------------------------------------------------------------
        /** @override */ label(node: any): string {
            return node.name;
        }
        // ----------------------------------------------------------------------------------------
        /** @override */ actions(node: any): string[] {
            return node instanceof OBJ ? ["view", "edit", "delete"] : [];
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
}
// ################################################################################################
