// ################################################################################################
namespace reco.core.db {
    // ============================================================================================
    export interface DBJson {
        $id: string,
        $name: string,
        $status?: string,
        $statusDate?: number,
        $objects: { [$id: string]: OBJJson },
        [key: string]: any
    }
    // ============================================================================================
    export interface OBJJson {
        $id: string,
        $type: string,
        $status?: string,
        $statusDate?: number,
        [key: string]: any
    }
    // ============================================================================================
    export interface OBJChange {
        fieldname?: string, 
        objChanged?: boolean,         
        objDeleted?: boolean, 
        objCreated?: boolean
    }
    // ============================================================================================
    export abstract class DB {
        // ----------------------------------------------------------------------------------------
        history: DBJson[] = [{
            $id: crypto.randomUUID(),
            $name: "NOMAME",
            $status: "CREATION",
            $statusDate: -1,
            $objects: {}
        }];
        historyIndex: number = 0;
        changeListeners: ((pobj: OBJ<any>, change: OBJChange) => void)[] = [];
        // ----------------------------------------------------------------------------------------
        genId(): string { return crypto.randomUUID(); }
        // ----------------------------------------------------------------------------------------
        get dbJson() { return this.history[this.historyIndex]; }
        set dbJson(json: DBJson) { this.history.push(json); this.historyIndex = this.history.length - 1; }
        // ----------------------------------------------------------------------------------------
        dbJsonReset() { this.history = []; this.historyIndex = 0; }
        // ----------------------------------------------------------------------------------------
        dbJsonLoad(json: DBJson) {
            this.dbJsonReset();
            this.dbJson = json;
        }
        // ----------------------------------------------------------------------------------------
        get $id(): string { return this.dbJson.$id; }
        // ----------------------------------------------------------------------------------------
        get $name(): string { return this.dbJson.$name; }
        set $name(value: string) {
            if (this.dbJson.$name === value) return;
            this.dbJson.$name = value;
            this.dbJson.$status = "MODIFIED";
            this.dbJson.$statusDate = Date.now();
        }
        // ----------------------------------------------------------------------------------------
        protected abstract newObj<T extends OBJ<DB>>($type: string, $id: string): T;
        // ----------------------------------------------------------------------------------------
        creatObj<T extends OBJ<DB>>($type: string): T {
            let objJson: OBJJson = {
                $id: this.genId(),
                $type: $type,
                $status: "CREATION",
                $statusDate: Date.now()
            }
            this.dbJson.$objects[objJson.$id] = objJson
            return this.newObj($type, objJson.$id);
        }
        // ----------------------------------------------------------------------------------------
        getObj<T extends OBJ<DB>>($id: string): T | undefined {
            if (!$id) return undefined;
            let json = this.dbJson.$objects[$id];
            if (json) {
                return this.newObj(json.$type, $id) as T;
            }
            throw `ERROR PDB getObj not found $id:${$id}`;
        }
        // ----------------------------------------------------------------------------------------
        find<T extends OBJ<DB>>(finder: any | ((objJson: OBJJson) => boolean)): T[] {
            let result: T[] = [];
            let objects = this.dbJson.$objects
            for (let $id in objects) {
                let objJson = objects[$id]
                if (typeof finder === 'function' && finder(objJson)) {
                    result.push(this.newObj(objJson.$type, objJson.$id))
                } else {
                    let match: boolean = true
                    for (let field in finder) {
                        match = finder[field] == objJson[field]
                        if (!match) break;
                    }
                    if (match)
                        result.push(this.newObj(objJson.$type, objJson.$id))
                }
            }
            return result;
        }
        // ----------------------------------------------------------------------------------------
        indexOf(list: OBJ<any>[], obj: OBJ<any>): number {
            return list.findIndex(x => x.$id === obj.$id);
        }
        // ----------------------------------------------------------------------------------------
        notifyChange(pobj: OBJ<any>, change: OBJChange) {
            for (let changeListener of this.changeListeners) changeListener(pobj, change);
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class OBJ<aDB extends DB> {
        // ----------------------------------------------------------------------------------------
        db: aDB;
        $id: string;
        // ----------------------------------------------------------------------------------------
        constructor(db: aDB, $id: string) {
            this.db = db
            this.$id = $id;
        }
        // ----------------------------------------------------------------------------------------
        get objJson(): OBJJson { return this.db.dbJson.$objects[this.$id]; }
        // ----------------------------------------------------------------------------------------
        get $type(): string { return this.objJson.$type; }
        get $type$id(): string { return this.$type+"."+this.$id; }
        // ----------------------------------------------------------------------------------------
        setField(field: string, value: any) {
            let objJson = this.objJson
            if (objJson[field] == value) return
            objJson.$status = objJson.$status == "NEW" ? "NEW" : "MODIFIED"
            objJson[field] = value
            this.db.notifyChange(this, { fieldname: field, objChanged: true });
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export abstract class TreeHandler<aDB extends DB> {
        // ----------------------------------------------------------------------------------------
        db: aDB;
        nodesClosedStates: { [nodeId: string]: boolean } = {};
        // ----------------------------------------------------------------------------------------
        constructor(db: aDB) { this.db = db; }
        // ----------------------------------------------------------------------------------------
        abstract roots(): OBJ<aDB>[];
        abstract parent(node: OBJ<aDB>): OBJ<aDB>;
        abstract children(node: OBJ<aDB>): OBJ<aDB>[];
        abstract label(node: OBJ<aDB>): string;
        // ----------------------------------------------------------------------------------------
        onIconClick(node: OBJ<aDB>): void { }
        isDefaultClosed(node: OBJ<aDB>): boolean { return false; }
        actions(node: OBJ<aDB>): string[] { return []; }
        // ----------------------------------------------------------------------------------------
        list(...roots: OBJ<aDB>[]): OBJ<aDB>[] {
            let THIS = this
            let list: any[] = [];
            function traverse(node: any) {
                list.push(node);
                (THIS.children(node) || []).forEach(traverse);
            }
            if (roots.length === 0) roots = this.roots();
            for (let node of roots) {
                traverse(node);
            }
            return list;
        }
        // ----------------------------------------------------------------------------------------
        id(node: OBJ<aDB>): string {
            return node.$id;
        }
        // ----------------------------------------------------------------------------------------
        nodeById(id: string): OBJ<aDB> | undefined {
            return id == this.db.$id ? undefined : this.db.getObj(id)
        }
        // ----------------------------------------------------------------------------------------
        path(node: OBJ<aDB>): OBJ<aDB>[] {
            let path: OBJ<aDB>[] = []
            while (node) {
                path.splice(0, 0, node)
                node = this.parent(node);
            }
            return path;
        }
        // ----------------------------------------------------------------------------------------
        depth(node: OBJ<aDB>): number {
            let path = this.path(node)
            return path.length;
        }
        // ----------------------------------------------------------------------------------------
        setClosed(node: OBJ<aDB>, isClosed: boolean): void {
            this.nodesClosedStates[this.id(node)] = isClosed
        }
        // ----------------------------------------------------------------------------------------
        isClosed(node: OBJ<aDB>): boolean {
            return this.nodesClosedStates[this.id(node)] ? true : false
        }
        // ----------------------------------------------------------------------------------------
        isInClosedPath(node: OBJ<aDB>): boolean {
            let path = this.path(node);
            path.splice(path.length - 1, 1);
            for (let node of path)
                if (this.isClosed(node)) return true;
            return false;
        }
        // ----------------------------------------------------------------------------------------
        css(node: OBJ<aDB>): string {
            let type = node.$type;
            if (type[0]) type = type[0].toLowerCase() + (type.length > 1 ? type.substring(1) : '')
            return type;
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
}
// ################################################################################################
