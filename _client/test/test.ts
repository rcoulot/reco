// ################################################################################################
namespace reco.test.files {
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
        // pickFile: async function (accept: string | undefined = undefined): Promise<FileData> {
        //     return new Promise((resolve, reject) => {
        //         let input = document.createElement('input')
        //         input.type = 'file'
        //         if (accept) input.accept = accept
        //         input.addEventListener('change', async function (event) {
        //             const file = input!.files![0]
        //             let text = await Files.blobToString(file)
        //             console.log(`RecoFS.loadBrowserFile`, file)
        //             resolve(await new FileData().init(file.name, file, file))
        //         })
        //         input.click()
        //     })
        // },
        // ----------------------------------------------------------------------------------------
        // savePickFile: async function (fileData: FileData): Promise<void> {
        //     return new Promise((resolve, reject) => {
        //         const url = URL.createObjectURL(fileData.blob!);
        //         const a = document.createElement('a');
        //         a.href = url;
        //         a.download = fileData.file!.name;
        //         document.body.appendChild(a);
        //         a.click();
        //         document.body.removeChild(a);
        //         URL.revokeObjectURL(url);
        //     })
        // },
        // ----------------------------------------------------------------------------------------
        /** @returns { Promise<FileData> } */
        // pickImage: async function () {
        //     return Files.pickFile("image/*")
        // },
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
namespace reco.test.test {
    // ============================================================================================
    import Files = reco.test.files.Files;
    import FileData = reco.test.files.FileData;
    // ============================================================================================
    const data = { fileData: undefined as FileData | undefined }
    // ============================================================================================
    async function btLoadTest(ev: Event) {
        const pickerOpts = {
            types: [
                {
                    description: "Text Files",
                    accept: {
                        "*/*": [".txt",".text"],
                    },
                },
            ],
            excludeAcceptAllOption: true,
            multiple: false,
        };
        //@ts-ignore
        let [fileHandle]: FileSystemFileHandle[] = await window.showOpenFilePicker(pickerOpts);
        const file = await fileHandle.getFile();
        data.fileData = await new FileData().init(file.name, file, fileHandle);
        let taTest = document.getElementById("taTest") as HTMLTextAreaElement;
        taTest.value = data.fileData._text!
    }
    // ============================================================================================
    async function btSaveTest(ev: Event) {
        data.fileData!.text = (document.getElementById("taTest") as HTMLTextAreaElement).value;
        const writable = await data.fileData!.fileHandle!.createWritable();
        await writable.write(data.fileData!.blob!);
        await writable.close();
    }
    // ============================================================================================
    document.getElementById("btLoadTest")?.addEventListener("click", btLoadTest);
    document.getElementById("btSaveTest")?.addEventListener("click", btSaveTest);
    // ============================================================================================
}
// ################################################################################################
