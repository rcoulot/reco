// ################################################################################################
namespace reco.core.db {
    // ============================================================================================
    export interface PDBJson {
        $id: string,
        $name: string,
        $status?: string,
        $statusDate?: number,
        $objects: { [$id: string]: PObjJson },
        [key: string]: any
    }
    // ============================================================================================
    export interface PObjJson {
        $id: string,
        $type: string,
        $status?: string,
        $statusDate?: number,
        [key: string]: any
    }
    // ============================================================================================
    export interface PObjChange {
        fieldname?: string, 
        objChanged?: boolean,         
        objDeleted?: boolean, 
        objCreated?: boolean
    }
    // ============================================================================================
    export abstract class PDB {
        // ----------------------------------------------------------------------------------------
        history: PDBJson[] = [{
            $id: crypto.randomUUID(),
            $name: "NOMAME",
            $status: "CREATION",
            $statusDate: -1,
            $objects: {}
        }];
        historyIndex: number = 0;
        changeListeners: ((pobj: PObj<any>, change: PObjChange) => void)[] = [];
        // ----------------------------------------------------------------------------------------
        genId(): string { return crypto.randomUUID(); }
        // ----------------------------------------------------------------------------------------
        get dbJson() { return this.history[this.historyIndex]; }
        set dbJson(json: PDBJson) { this.history.push(json); this.historyIndex = this.history.length - 1; }
        // ----------------------------------------------------------------------------------------
        dbJsonReset() { this.history = []; this.historyIndex = 0; }
        // ----------------------------------------------------------------------------------------
        dbJsonLoad(json: PDBJson) {
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
        protected abstract newObj<T extends PObj<PDB>>($type: string, $id: string): T;
        // ----------------------------------------------------------------------------------------
        creatObj<T extends PObj<PDB>>($type: string): T {
            let objJson: PObjJson = {
                $id: this.genId(),
                $type: $type,
                $status: "CREATION",
                $statusDate: Date.now()
            }
            this.dbJson.$objects[objJson.$id] = objJson
            return this.newObj($type, objJson.$id);
        }
        // ----------------------------------------------------------------------------------------
        getObj<T extends PObj<PDB>>($id: string): T | undefined {
            if (!$id) return undefined;
            let json = this.dbJson.$objects[$id];
            if (json) {
                return this.newObj(json.$type, $id) as T;
            }
            throw `ERROR PDB getObj not found $id:${$id}`;
        }
        // ----------------------------------------------------------------------------------------
        find<T extends PObj<PDB>>(finder: any | ((objJson: PObjJson) => boolean)): T[] {
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
        indexOf(list: PObj<any>[], obj: PObj<any>): number {
            return list.findIndex(x => x.$id === obj.$id);
        }
        // ----------------------------------------------------------------------------------------
        notifyChange(pobj: PObj<any>, change: PObjChange) {
            for (let changeListener of this.changeListeners) changeListener(pobj, change);
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class PObj<DB extends PDB> {
        // ----------------------------------------------------------------------------------------
        db: DB;
        $id: string;
        // ----------------------------------------------------------------------------------------
        constructor(db: DB, $id: string) {
            this.db = db
            this.$id = $id;
        }
        // ----------------------------------------------------------------------------------------
        get objJson(): PObjJson { return this.db.dbJson.$objects[this.$id]; }
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
    export abstract class TreeHandler<DB extends PDB> {
        // ----------------------------------------------------------------------------------------
        db: DB;
        nodesClosedStates: { [nodeId: string]: boolean } = {};
        // ----------------------------------------------------------------------------------------
        constructor(db: DB) { this.db = db; }
        // ----------------------------------------------------------------------------------------
        abstract roots(): PObj<DB>[];
        abstract parent(node: PObj<DB>): PObj<DB>;
        abstract children(node: PObj<DB>): PObj<DB>[];
        abstract label(node: PObj<DB>): string;
        // ----------------------------------------------------------------------------------------
        onIconClick(node: PObj<DB>): void { }
        onLabelClick(node: PObj<DB>): void { }
        onActionClick(node: PObj<DB>): void { }
        isDefaultClosed(node: PObj<DB>): boolean { return false; }
        actions(node: PObj<DB>): string[] { return []; }
        // ----------------------------------------------------------------------------------------
        list(...roots: PObj<DB>[]): PObj<DB>[] {
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
        id(node: PObj<DB>): string {
            return node.$id;
        }
        // ----------------------------------------------------------------------------------------
        nodeById(id: string): PObj<DB> | undefined {
            return id == this.db.$id ? undefined : this.db.getObj(id)
        }
        // ----------------------------------------------------------------------------------------
        path(node: PObj<DB>): PObj<DB>[] {
            let path: PObj<DB>[] = []
            while (node) {
                path.splice(0, 0, node)
                node = this.parent(node);
            }
            return path;
        }
        // ----------------------------------------------------------------------------------------
        depth(node: PObj<DB>): number {
            let path = this.path(node)
            return path.length;
        }
        // ----------------------------------------------------------------------------------------
        setClosed(node: PObj<DB>, isClosed: boolean): void {
            this.nodesClosedStates[this.id(node)] = isClosed
        }
        // ----------------------------------------------------------------------------------------
        isClosed(node: PObj<DB>): boolean {
            return this.nodesClosedStates[this.id(node)] ? true : false
        }
        // ----------------------------------------------------------------------------------------
        isInClosedPath(node: PObj<DB>): boolean {
            let path = this.path(node);
            path.splice(path.length - 1, 1);
            for (let node of path)
                if (this.isClosed(node)) return true;
            return false;
        }
        // ----------------------------------------------------------------------------------------
        css(node: PObj<DB>): string {
            let type = node.$type;
            if (type[0]) type = type[0].toLowerCase() + (type.length > 1 ? type.substring(1) : '')
            return type;
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
}
// ################################################################################################
