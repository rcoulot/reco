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
        pickFile: async function (accept: string | undefined = undefined): Promise<FileData> {
            return new Promise((resolve, reject) => {
                let input = document.createElement('input')
                input.type = 'file'
                if (accept) input.accept = accept
                input.addEventListener('change', async function (event) {
                    const file = input!.files![0]
                    let text = await Files.blobToString(file)
                    console.log(`RecoFS.loadBrowserFile`, file)
                    resolve(await new FileData().init(file.name, file))
                })
                input.click()
            })
        },
        // ----------------------------------------------------------------------------------------
        /** @returns { Promise<FileData> } */
        pickImage: async function () {
            return Files.pickFile("image/*")
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
        name?: string;
        blob?: Blob;
        text?: string;
        size?: number;
        // ----------------------------------------------------------------------------------------
        async init(name: string, blob: Blob) {
            this.name = name
            this.blob = blob
            this.text = this.blob ? await this.blob.text() : undefined
            this.size = this.blob ? this.blob.size : 0
            return this
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
}
// ################################################################################################
