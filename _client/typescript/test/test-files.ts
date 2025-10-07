// ################################################################################################
namespace reco.test.test {
    // ============================================================================================
    import Files = reco.core.files.Files;
    import FileData = reco.core.files.FileData;
    // ============================================================================================
    const data = { fileData: undefined as FileData | undefined }
    // ============================================================================================
    async function btLoadTest(ev: Event) {
        data.fileData = await Files.pickFile("*/*", ".txt", ".text");
        if (!data.fileData) return;
        (document.getElementById("taTest") as HTMLTextAreaElement).value = data.fileData._text!;
    }
    // ============================================================================================
    async function btSaveTest(ev: Event) {
        data.fileData!.text = (document.getElementById("taTest") as HTMLTextAreaElement).value;
        Files.savePickFile(data.fileData!);
    }
    // ============================================================================================
    document.getElementById("btLoadTest")?.addEventListener("click", btLoadTest);
    document.getElementById("btSaveTest")?.addEventListener("click", btSaveTest);
    // ============================================================================================
}
// ################################################################################################
