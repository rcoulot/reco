// ################################################################################################
namespace reco.core.files {
    // ============================================================================================
    export const MimeTypes = { //
        'csv': 'text/plain', //
        'txt': 'text/plain', //
        'html': 'text/html', // 
        'js': 'application/javascript', //
        'mjs': 'application/javascript', //
        'css': 'text/css', //
        'gif': 'image/gif', //
        'png': 'image/png', //
        'jpeg': 'image/jpeg', //
        'jpg': 'image/jpeg', //
        'jfif': 'image/jpeg', //
        'svg': 'image/svg', //
        'json': 'application/json', //
        'binary': 'application/octet-stream', //
        'ico': 'image/x-icon', //
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
    // ============================================================================================
    export const Files = {
        // ----------------------------------------------------------------------------------------
        blobToDataUrl: function (blob: Blob): Promise<string> {
            return new Promise<string>(async (successCb, errorCb) => {
                const reader = new FileReader();
                reader.onload = (event) => { //@ts-ignore
                    successCb(event.target.result);
                }
                reader.onerror = (err) => { errorCb(err) }
                reader.readAsDataURL(blob);
            })
        },
        // ----------------------------------------------------------------------------------------
        blobToBase64: function (blob: Blob): Promise<string> {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onloadend = () => { //@ts-ignore
                    resolve(reader.result.split(',')[1])
                }
                reader.onerror = reject
                reader.readAsDataURL(blob)
            })
        },
        // ----------------------------------------------------------------------------------------
        base64ToBlob: function (base64: string, mimeType: string): Blob {
            const byteCharacters = atob(base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            return new Blob([byteArray], { type: mimeType });
        },
        // ----------------------------------------------------------------------------------------
        blobToString: function (blob: Blob): Promise<string | undefined> {
            return blob ? blob.text() : Promise.resolve(undefined);
        },
        // ----------------------------------------------------------------------------------------
        stringToBlob: function (content: string): Blob | undefined {
            return content ? new Blob([content], { type: "text/plain" }) : undefined
        },
        // ----------------------------------------------------------------------------------------
        pickFile: async function (mimeType: string | undefined = undefined, ...accept: string[]): Promise<FileData | undefined> {
            const pickerOpts: any = { types: [], excludeAcceptAllOption: true, multiple: false };
            if (mimeType) pickerOpts.types.push({ description: "", accept: { [mimeType]: accept }, });
            try { //@ts-ignore
                let fileHandles: FileSystemFileHandle[] = await window.showOpenFilePicker(pickerOpts);
                let fileHandle = fileHandles[0];
                const file = await fileHandle.getFile();
                return await new FileData().init(file.name, file, fileHandle);
            } catch (error) {
                return undefined;
            }
        },
        // ----------------------------------------------------------------------------------------
        /** @returns { Promise<FileData> } */
        pickImage: async function () {
            return Files.pickFile("image/*")
        },
        // ----------------------------------------------------------------------------------------
        savePickFile: async function (fileData: FileData): Promise<void> {
            const writable = await fileData!.fileHandle!.createWritable();
            await writable.write(fileData!.blob!);
            await writable.close();
        },
        // ----------------------------------------------------------------------------------------
        extension: function (filename: string): string {
            let pos = filename.lastIndexOf("/")
            filename = filename.substring(pos + 1)
            pos = filename.lastIndexOf(".")
            return pos >= 0 ? filename.substring(pos + 1) : ""
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
    export class FileData {
        // ----------------------------------------------------------------------------------------
        _fileHandle: FileSystemFileHandle | undefined;
        _name?: string;
        _blob?: Blob;
        _text?: string;
        get fileHandle(): FileSystemFileHandle | undefined { return this._fileHandle }
        get name(): string | undefined { return this._name }
        get blob(): Blob | undefined { return this._blob }
        get text(): string | undefined { return this._text }
        get json(): any { return JSON.parse(this._text!) }
        get size(): number { return this._blob!.size }
        set name(val: string) { this._name = val }
        async setBlob(val: Blob) {
            this._blob = val
            this._text = this._blob ? await this._blob.text() : undefined
        }
        set text(val: string) {
            this._text = val
            this._blob = Files.stringToBlob(val)
        }
        // ----------------------------------------------------------------------------------------
        async init(name: string, blob: Blob, fileHandle: FileSystemFileHandle): Promise<FileData> {
            this._name = name
            this._blob = blob
            this._text = this._blob ? await this._blob.text() : undefined
            this._fileHandle = fileHandle
            return this
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
}
// ################################################################################################
