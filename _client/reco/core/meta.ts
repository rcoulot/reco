// ################################################################################################
namespace reco.core.meta {
    // ============================================================================================
    import PDB = reco.core.db.PDB; 
    import PObj = reco.core.db.PObj; 
    import TreeHandler = reco.core.db.TreeHandler;
    // ============================================================================================
    export class MetaModel extends PDB {
        // ----------------------------------------------------------------------------------------
        genId(): string {
            if (!this.dbJson.sequence) {
                this.dbJson.sequence = 1;
            } else {
                this.dbJson.sequence++;
            }
            return `meta${this.dbJson.sequence.toString().padStart(4, '0')}`;
        }
        // ----------------------------------------------------------------------------------------
        protected newObj<T extends PObj<PDB>>($type: string, $id: string): T {
            let obj: any = undefined;
            switch ($type) {
                case "MetaPackage": obj = new MetaPackage(this, $id); break;
                case "MetaClass": obj = new MetaClass(this, $id); break;
                case "MetaField": obj = new MetaField(this, $id); break;
                case "MetaRelation": obj = new MetaRelation(this, $id); break;
            }
            if (obj) return obj as T;
            throw "ERROR MetaModel unkown type: " + $type
        }
        // ----------------------------------------------------------------------------------------
        get name(): string { return this.$name }
        // ----------------------------------------------------------------------------------------
        get rootPackages(): MetaPackage[] {
            return this.find({ $type: "MetaPackage", "parentId": undefined }) as MetaPackage[]
        }
        // ----------------------------------------------------------------------------------------
        get rootClasses(): MetaClass[] {
            return this.find({ $type: "MetaClass", "packageId": undefined }) as MetaClass[]
        }
        // ----------------------------------------------------------------------------------------
        get allClasses(): MetaClass[] {
            return this.find({ $type: "MetaClass" }) as MetaClass[]
        }
        // ----------------------------------------------------------------------------------------
        addPackage(name: string = "NoName", parentPackage?: MetaPackage): MetaPackage {
            let metaPackage = this.creatObj<MetaPackage>("MetaPackage")
            metaPackage.name = name;
            if (parentPackage) metaPackage.parentPackage = parentPackage;
            return metaPackage;
        }
        // ----------------------------------------------------------------------------------------
        addClass(name: string = "NoName", parentPackage?: MetaPackage): MetaClass {
            let metaClass = this.creatObj<MetaClass>("MetaClass");
            metaClass.name = name;
            if (parentPackage) metaClass.parentPackage = parentPackage;
            return metaClass;
        }
        // ----------------------------------------------------------------------------------------
        get dotSrc(): string {
            return new VizGenerator(this).gen();
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class MetaPackage extends PObj<MetaModel> {
        // ----------------------------------------------------------------------------------------
        get model(): MetaModel { return this.db }
        // ----------------------------------------------------------------------------------------
        get name(): string { return this.objJson["name"] }
        set name(val: string) { this.setField("name", val) }
        // ----------------------------------------------------------------------------------------
        get parentPackage(): MetaPackage | undefined {
            return this.objJson["parentId"] ? new MetaPackage(this.db, this.objJson["parentId"]) : undefined
        }
        set parentPackage(refObj: MetaPackage) {
            this.setField("parentId", refObj ? refObj.$id : undefined);
        }
        // ----------------------------------------------------------------------------------------
        get classes(): MetaClass[] {
            return this.db.find({ $type: "MetaClass", "packageId": this.$id }) as MetaClass[]
        }
        // ----------------------------------------------------------------------------------------
        get packages(): MetaPackage[] {
            return this.db.find({ $type: "MetaPackage", "parentId": this.$id }) as MetaPackage[]
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class MetaClass extends PObj<MetaModel> {
        // ----------------------------------------------------------------------------------------
        get name(): string { return this.objJson["name"] }
        set name(val: string) { this.setField("name", val) }
        // ----------------------------------------------------------------------------------------
        get parentPackage(): MetaPackage | undefined {
            return this.objJson["packageId"] ? new MetaPackage(this.db, this.objJson["packageId"]) : undefined
        }
        set parentPackage(refObj: MetaPackage) {
            this.setField("packageId", refObj ? refObj.$id : undefined);
        }
        // ----------------------------------------------------------------------------------------
        get fields(): MetaField[] {
            return this.db.find({ $type: "MetaField", "classId": this.$id }) as MetaField[]
        }
        // ----------------------------------------------------------------------------------------
        get allRelations(): MetaRelation[] {
            return this.db.find({ $type: "MetaRelation", "classId": this.$id }) as MetaRelation[]
        }
        // ----------------------------------------------------------------------------------------
        get relations(): MetaRelation[] {
            return this.db.find({ $type: "MetaRelation", "classId": this.$id, "isBackref": false }) as MetaRelation[]
        }
        // ----------------------------------------------------------------------------------------
        field(name: string): MetaField | undefined {
            return this.db.find({ $type: "MetaField", "classId": this.$id, "name": name })[0] as MetaField
        }
        // ----------------------------------------------------------------------------------------
        relation(name: string): MetaRelation | undefined {
            return this.db.find({ $type: "MetaRelation", "classId": this.$id, "name": name })[0] as MetaRelation
        }
        // ----------------------------------------------------------------------------------------
        addField(name: string, type: string, typeInfo?: string): MetaField {
            let metaField = this.db.creatObj<MetaField>("MetaField");
            metaField.name = name;
            metaField.type = type;
            if (typeInfo) metaField.typeInfo = typeInfo;
            metaField.class = this;
            return metaField;
        }
        // ----------------------------------------------------------------------------------------
        addRelation(name: string, target: MetaClass, multiplicity: string = "1..1"): MetaRelation {
            let metaRelation = this.db.creatObj<MetaRelation>("MetaRelation");
            metaRelation.name = name;
            metaRelation.target = target;
            metaRelation.isBackref = false;
            metaRelation.multiplicity = multiplicity;
            metaRelation.class = this;
            return metaRelation;
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class MetaField extends PObj<MetaModel> {
        // ----------------------------------------------------------------------------------------
        get name(): string { return this.objJson["name"] }
        set name(val: string) { this.setField("name", val) }
        // ----------------------------------------------------------------------------------------
        get type(): string { return this.objJson["type"] }
        set type(val: string) { this.setField("type", val) }
        // ----------------------------------------------------------------------------------------
        get typeInfo(): string { return this.objJson["typeInfo"] }
        set typeInfo(val: string) { this.setField("typeInfo", val) }
        // ----------------------------------------------------------------------------------------
        get class(): MetaClass | undefined {
            return this.objJson["classId"] ? new MetaClass(this.db, this.objJson["classId"]) : undefined
        }
        set class(val: MetaClass | undefined) {
            this.setField("classId", val ? val.$id : undefined);
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class MetaRelation extends PObj<MetaModel> {
        // ----------------------------------------------------------------------------------------
        get name(): string { return this.objJson["name"] }
        set name(val: string) { this.setField("name", val) }
        // ----------------------------------------------------------------------------------------
        get isBackref(): boolean { return this.objJson["isBackref"] }
        set isBackref(val: boolean) { this.setField("isBackref", val) }
        // ----------------------------------------------------------------------------------------
        get backref(): MetaRelation | undefined {
            return this.objJson["backrefId"] ? new MetaRelation(this.db, this.objJson["backrefId"]) : undefined
        }
        set backref(newBackref: MetaRelation | undefined) {
            let backref = this.backref
            if (backref) backref.isBackref = false;
            this.setField("backrefId", newBackref ? newBackref.$id : undefined);
            if (newBackref) newBackref.isBackref = true;
        }
        // ----------------------------------------------------------------------------------------
        get multiplicity(): string { return this.objJson["multiplicity"] }
        set multiplicity(val: string) { this.setField("multiplicity", val) }
        // ----------------------------------------------------------------------------------------
        get class(): MetaClass | undefined {
            return this.objJson["classId"] ? new MetaClass(this.db, this.objJson["classId"]) : undefined
        }
        set class(val: MetaClass | undefined) {
            this.setField("classId", val ? val.$id : undefined);
        }
        // ----------------------------------------------------------------------------------------
        get target(): MetaClass | undefined {
            return this.objJson["targetId"] ? new MetaClass(this.db, this.objJson["targetId"]) : undefined
        }
        set target(val: MetaClass) {
            this.setField("targetId", val ? val.$id : undefined)
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    class VizGenerator {
        // ----------------------------------------------------------------------------------------
        private db: MetaModel;
        private dotsrc: string = ""
        private cluster_seq: number = 0
        // ----------------------------------------------------------------------------------------
        constructor(db: MetaModel) { this.db = db; }
        // ----------------------------------------------------------------------------------------
        push(indent: string, text: string) { this.dotsrc += indent + text + "\n"; }
        // ----------------------------------------------------------------------------------------
        gen() {
            this.dotsrc = "";
            this.push("", `digraph G${this.db.$name} {`);
            this.genConfig();
            for (let metaClass of this.db.rootClasses) this.genMetaClass(metaClass, "\t");
            for (let metaPackage of this.db.rootPackages) this.genMetaPackage(metaPackage, "\t");
            // for (let metaClass of this.db.allClasses) this.genMetaClass(metaClass, "\t");
            for (let metaClass of this.db.allClasses)
                for (let metaRelation of metaClass.relations)
                    this.getMetaRelation(metaRelation, "\t");
            this.push("", `}`);
            return this.dotsrc
        }
        // ----------------------------------------------------------------------------------------
        genConfig() {
            this.push("\t", `graph [`);
            // this.push("\t", `	label = "${this.db.$name}"`);
            // this.push("\t", `	labelloc = t`);
            this.push("\t", `	fontname = "Helvetica,Arial,sans-serif"`);
            this.push("\t", `	fontsize = 15`);
            this.push("\t", `	layout = dot`);
            // this.push("\t", `	rankdir = LR`);
            // this.push("\t", `	newrank = true`);
            this.push("\t", `];`);
            this.push("\t", `node [`);
            this.push("\t", `	style=filled`);
            this.push("\t", `	shape=rect`);
            this.push("\t", `	fillcolor="#00000005"`);
            this.push("\t", `	pencolor="#000000"`);
            this.push("\t", `	fontname="Helvetica,Arial,sans-serif"`);
            this.push("\t", `	fontsize = 10`);
            this.push("\t", `	shape=plaintext`);
            this.push("\t", `];`);
            this.push("\t", `edge [`);
            this.push("\t", `	arrowsize=1.5`);
            this.push("\t", `	fontname="Helvetica,Arial,sans-serif"`);
            this.push("\t", `	fontsize = 10`);
            // this.push("\t", `	labeldistance=4`);
            this.push("\t", `	labelfontcolor="#000000"`);
            this.push("\t", `	penwidth=1`);
            this.push("\t", `];`);
        }
        // ----------------------------------------------------------------------------------------
        genMetaPackage(metaPackage: MetaPackage, indent: string) {
            this.push(indent, `subgraph cluster_${this.cluster_seq++} {`);
            for (let metaClass of metaPackage.classes) this.genMetaClass(metaClass, indent + "\t");
            this.push(indent, `\tlabel=" ${metaPackage.name} ";`);
            this.push(indent, `\tcolor="#000000";`);
            this.push(indent, `};`);
        }
        // ----------------------------------------------------------------------------------------
        genMetaClass(clazz: MetaClass, indent: string) {
            this.push(indent, `${clazz.$id} [`);
            this.push(indent + "\t", `label=<<table border="0" cellborder="1" cellspacing="0" cellpadding="4">`);
            this.push(indent + "\t\t", `<tr> <td> <b> <font color="green"> Ⓒ </font> ${clazz.name} </b></td> </tr>`);
            this.push(indent + "\t\t", `<tr> <td align="left">`);
            let first = true
            for (let metaField of clazz.fields) {
                if (!first) this.push(indent + "\t\t\t", `<br align="left"/>`);
                this.genMetaField(metaField, indent + "\t\t\t");
                first = false
            }
            this.push(indent + "\t\t", ` </td> </tr>`);
            this.push(indent + "\t", `</table>>`);
            this.push(indent + "\t", `shape=plain`);
            this.push(indent, `];`);
        }
        // ----------------------------------------------------------------------------------------
        genMetaField(metaField: MetaField, indent: string) {
            this.push(indent, `${metaField.type} ${metaField.name}  `);
        }
        // ----------------------------------------------------------------------------------------
        getMetaRelation(metaRelation: MetaRelation, indent: string) {
            let relationDot = `${metaRelation.class!.$id} -> ${metaRelation.target!.$id} `
            relationDot += ` [`
            relationDot += ` label=" ${metaRelation.backref ? metaRelation.backref.name + " > " : ""}${metaRelation.name} "`;
            relationDot += ` dir="both"`
            relationDot += ` arrowhead="none"`
            relationDot += ` arrowtail="odiamond"`
            relationDot += ` headlabel=" ${metaRelation.multiplicity} "`
            relationDot += `]`;
            relationDot += `;`;
            this.push(indent, relationDot);
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class ModelTreeHandler extends TreeHandler<MetaModel> {
        // ----------------------------------------------------------------------------------------
        model: MetaModel;
        // ----------------------------------------------------------------------------------------
        constructor(model: MetaModel) {
            super(model);
            this.model = model;
        }
        // ----------------------------------------------------------------------------------------
        roots(): any[] {
            return this.model.rootPackages
        }
        // ----------------------------------------------------------------------------------------
        parent(node: any): any {
            if (node instanceof MetaPackage) return node.parentPackage;
            else if (node instanceof MetaClass) return node.parentPackage ? node.parentPackage : node.db;
            else if (node instanceof MetaField) return node.class;
            else if (node instanceof MetaRelation) return node.class;
            throw new Error("Unknown node type: " + node);
        }
        // ----------------------------------------------------------------------------------------
        children(node: any): any[] {
            let children = [];
            if (node instanceof MetaPackage) children.push(...node.packages, ...node.classes);
            else if (node instanceof MetaClass) children.push(...node.allRelations, ...node.fields);
            return children;
        }
        // ----------------------------------------------------------------------------------------
        label(node: any): string {
            if (node instanceof MetaPackage) return `${node.name}`;
            else if (node instanceof MetaClass) return `${node.name}`;
            else if (node instanceof MetaField) return `${node.name} : ${node.type} ${node.typeInfo ? node.typeInfo : ""}`;
            else if (node instanceof MetaRelation) return `${node.backref ? "/" : ""}${node.name} : ${node.target ? node.target.name : "?"}[${node.multiplicity}]`;
            throw new Error("Unknown node type: " + node);
        }
        // ----------------------------------------------------------------------------------------
        id(node: any): string {
            if (node instanceof MetaPackage) return node.$id;
            else if (node instanceof MetaClass) return node.$id;
            else if (node instanceof MetaField) return node.$id;
            else if (node instanceof MetaRelation) return node.$id;
            throw new Error("Unknown node type: " + node);
        }
        // ----------------------------------------------------------------------------------------
        nodeById(id: string): any {
            return id === this.model.$id ? this.model : this.model.getObj(id);
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
}
// ################################################################################################
