// ################################################################################################
const FilesSrvcli = {
    // ============================================================================================
    readBlob: async function (url) {
        let resp = await fetch("/$data" + url, { method: 'GET' })
        let blob = resp.status == 200 ? await resp.blob() : undefined
        return blob
    },
    // ============================================================================================
    newDirectory: async function (url) {
        await fetch("/$data" + url, { method: 'POST', body: "" })
    },
    // ============================================================================================
    writeBlob: async function (url, blob) {
        await fetch("/$data" + url, { method: 'POST', body: await Files.blobToBase64(blob) })
    },
    // ============================================================================================
    dirFiles: async function (url) {
        let json = await FilesSrvcli.readText(url)
        return json ? JSON.parse(json) : undefined
    },
    // ============================================================================================
    readText: async function (url) {
        let blob = await FilesSrvcli.readBlob(url)
        return blob ? await Files.blobToString(blob) : undefined
    },
    // ============================================================================================
    writeText: async function (url, content = "") {
        let blob = new Blob([content], { type: "text/plain" })
        await FilesSrvcli.writeBlob(url, blob)
    },
    // ============================================================================================
    delete: async function (url) {
        await fetch("/$data" + url, { method: 'DELETE' })
    },
    // ============================================================================================
    downloadBlob: async function (url) {
        let resp = await fetch(url, { method: 'GET' })
        let blob = resp.status == 200 ? await resp.blob() : undefined
        return blob
    },
    // ============================================================================================
    downloadText: async function (url) {
        let blob = await FilesSrvcli.downloadBlob(url)
        return blob ? await Files.blobToString(blob) : undefined
    },
    // ============================================================================================
    downloadCheck: async function (url) {
        let resp = await fetch(url, { method: 'HEAD' })
        return resp.status !== 404
    },
    // ============================================================================================
}
// ################################################################################################
