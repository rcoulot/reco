// ################################################################################################
namespace reco.core.xlsx {
    // ============================================================================================
    import MimeTypes = reco.core.files.MimeTypes
    import Files = reco.core.files.Files
    // ============================================================================================
    declare const XLSX: any;
    const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    // ============================================================================================
    export const ExcelCellTypes: { [key: string]: string } = {
        z: "<merged>",
        b: "boolean",
        e: "<error>",
        n: "number",
        d: "Date",
        s: "string",
        merged: "<merged>",
        boolean: "boolean",
        error: "<error>",
        number: "number",
        Date: "Date",
        string: "string"
    }
    // ============================================================================================
    export const RecoXLS = {
        // ----------------------------------------------------------------------------------------
        loadBlob: async function (xlsxBlob: Blob): Promise<RecoWorkbook> {
            const data = new Uint8Array(await xlsxBlob.arrayBuffer());
            let workbook = XLSX.read(data, { type: 'array', cellStyles: true, cellDates: true });
            return new RecoWorkbook(workbook)
        },
        // ----------------------------------------------------------------------------------------
        cellPosToRowCol: function (cellPos: string): number[] {
            let rc: number[] = [0, 0]
            for (let ch of cellPos) {
                let letterIndex = LETTERS.indexOf(ch) + 1
                if (letterIndex > 0) {
                    rc[1] = rc[1] * LETTERS.length + letterIndex
                } else {
                    rc[0] = rc[0] * 10 + Number(ch)
                }
            }
            rc[0]--
            rc[1]--
            return rc
        },
        // ----------------------------------------------------------------------------------------
        rowColToCellPos: async function (rc: number[]): Promise<string> {
            let c = rc[1] + 1
            let cellPos: string = ""
            while (c > 0) {
                let r = Math.floor((c - 1) / LETTERS.length)
                let l = c - r * LETTERS.length
                c = r
                cellPos = LETTERS[l - 1] + cellPos
            }
            cellPos += "" + (rc[0] + 1)
            return cellPos
        },
        // ----------------------------------------------------------------------------------------
        colToColPos: async function (c: number): Promise<string> {
            c++
            let colPos: string = ""
            while (c > 0) {
                let r = Math.floor((c - 1) / LETTERS.length)
                let l = c - r * LETTERS.length
                c = r
                colPos = LETTERS[l - 1] + colPos
            }
            return colPos
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class RecoWorkbook {
        // ----------------------------------------------------------------------------------------
        workbook: any = undefined
        private _workbookAsJson?: { [sheelname: string]: string[][] } = undefined
        get sheetNames(): string[] { return this.workbook ? this.workbook.SheetNames : [] }
        getSheet(sheetName: string): RecoSheet { return new RecoSheet(this, sheetName) }
        get recoSheets(): RecoSheet[] {
            let recoSheets: RecoSheet[] = [];
            let sheetNames = this.sheetNames
            for (let sheetName of sheetNames) recoSheets.push(this.getSheet(sheetName))
            return recoSheets
        }
        // ----------------------------------------------------------------------------------------
        constructor(workbook: any) {
            this.workbook = workbook
        }
        // ----------------------------------------------------------------------------------------
        get workbookAsJson(): { [sheetname: string]: string[][] } {
            if (this._workbookAsJson) return this._workbookAsJson
            this._workbookAsJson = {}
            for (let sheetName of this.workbook.SheetNames) {
                this._workbookAsJson[sheetName] = []
                let recosheet = new RecoSheet(this, sheetName)
                for (let r = 0; r < recosheet.rowCount; r++) {
                    for (let c = 0; c < recosheet.colCount; c++) {
                        let cell = recosheet.getCell([r, c])
                        if (!cell.asText) continue
                        this._workbookAsJson[sheetName][r] = this._workbookAsJson[sheetName][r] ? this._workbookAsJson[sheetName][r] : []
                        this._workbookAsJson[sheetName][r][c] = cell.asText
                    }
                }
            }
            return this._workbookAsJson
        }
        // ----------------------------------------------------------------------------------------
        async exportBlob(): Promise<Blob> {
            const workbook = XLSX.utils.book_new();
            for (let sheetName in this.workbookAsJson) {
                const sheetData = this.workbookAsJson[sheetName]
                const sheet = XLSX.utils.aoa_to_sheet(sheetData);
                XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
            }
            const base64Xlsx = XLSX.write(workbook, { bookType: "xlsx", type: "base64" });
            const xlsxBlob = Files.base64ToBlob(base64Xlsx, MimeTypes.xlsx)
            return xlsxBlob
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class RecoSheet {
        // ----------------------------------------------------------------------------------------
        recoWorkbook: RecoWorkbook;
        sheetName: string;
        sheet?: any;
        // ----------------------------------------------------------------------------------------
        constructor(recoWorkbook: RecoWorkbook, sheetName: string) {
            this.recoWorkbook = recoWorkbook
            this.sheetName = sheetName
            this.sheet = recoWorkbook.workbook.Sheets[sheetName]
        }
        // ----------------------------------------------------------------------------------------
        get rowCount(): number {
            let count = 0
            for (let cellPos in this.sheet) {
                let row = RecoXLS.cellPosToRowCol(cellPos)[0] + 1
                count = count < row ? row : count
            }
            return count
        }
        // ----------------------------------------------------------------------------------------
        get colCount(): number {
            let count = 0
            for (let cellPos in this.sheet) {
                let col = RecoXLS.cellPosToRowCol(cellPos)[1] + 1
                count = count < col ? col : count
            }
            return count
        }
        // ----------------------------------------------------------------------------------------
        get recoCells(): RecoCell[][] {
            let cells : RecoCell[][] = []
            for (let r = 0; r < this.rowCount; r++) {
                cells[r] = []
                for (let c = 0; c < this.colCount; c++) {
                    cells[r][c] = this.getCell([r, c])
                }
            }
            return cells
        }
        // ----------------------------------------------------------------------------------------
        getCell(cellLoc: string | number[]): RecoCell {
            let cellPos = ""
            if (cellLoc instanceof String) cellPos = "" + cellLoc //@ts-ignore
            else cellPos = RecoXLS.rowColToCellPos(cellLoc)
            return new RecoCell(this, cellPos)
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class RecoCell {
        // ----------------------------------------------------------------------------------------
        recoSheet: RecoSheet;
        cellPos: string;
        cell: any;
        get rc(): number[] { return RecoXLS.cellPosToRowCol(this.cellPos) }
        get r(): number { return this.rc[0] }
        get c(): number { return this.rc[1] }
        get asText(): string | undefined { return this.cell ? this.cell.w : undefined }
        get asHtml(): string | undefined { return this.cell && this.cell.h ? this.cell.h : this.asText }
        get type(): string | undefined { return this.cell ? ExcelCellTypes[this.cell.t] : undefined }
        // ----------------------------------------------------------------------------------------
        constructor(recoSheet: RecoSheet, cellPos: string) {
            this.recoSheet = recoSheet
            this.cellPos = cellPos
            this.cell = this.recoSheet.sheet[cellPos]
        }
        // ----------------------------------------------------------------------------------------
        get hiddenByMerge(): boolean {
            let mergeInfo = this.recoSheet.sheet["!merges"]
            if (!mergeInfo) return false
            let rc = this.rc
            for (let mergeCell of mergeInfo) {
                let rcStart = [mergeCell.s.r, mergeCell.s.c]
                let rcEnd = [mergeCell.e.r, mergeCell.e.c]
                if (rc[0] >= rcStart[0] &&
                    rc[1] >= rcStart[1] &&
                    (rc[0] !== rcStart[0] || rc[1] !== rcStart[1]) &&
                    rc[0] <= rcEnd[0] &&
                    rc[1] <= rcEnd[1]) return true
            }
            return false
        }
        // ----------------------------------------------------------------------------------------
        get merged(): boolean {
            let mergeSize = this.mergeSize
            return mergeSize[0] > 0 || mergeSize[1] > 0
        }
        // ----------------------------------------------------------------------------------------
        get mergeSize(): number[] {
            let mergeInfo = this.recoSheet.sheet["!merges"]
            if (!mergeInfo) return [0, 0]
            let rc = this.rc
            for (let mergeCell of mergeInfo) {
                let rcStart = [mergeCell.s.r, mergeCell.s.c]
                let rcEnd = [mergeCell.e.r, mergeCell.e.c]
                if (rc[0] == rcStart[0] && rc[1] == rcStart[1]) return [rcEnd[0] - rcStart[0], rcEnd[1] - rcStart[1]]
            }
            return [0, 0]
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
}
// ################################################################################################
