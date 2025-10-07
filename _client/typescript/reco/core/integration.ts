// ################################################################################################
namespace reco.core.integration.viz {
    // ============================================================================================
    declare var Viz: any;
    // ============================================================================================
    export class RecoViz {
        // ----------------------------------------------------------------------------------------
        static render(eltId: string, dotSrc: string) {
            //@ts-ignore
            Viz.instance().then(viz => {
                const svgElement = viz.renderSVGElement(dotSrc) as SVGElement;
                svgElement.style.padding = '5px'
                document.getElementById(eltId)!.appendChild(svgElement);
            });
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
}
// ################################################################################################
declare const ejs: any;
const RECOEJS = ejs;
// ============================================================================================
namespace reco.core.integration.ejs {
    // ============================================================================================
    type RecoEjs = {
        templatesDocuments: { [id: string]: Document };
        loadTemplate: (templatePath: string) => string;
        resolveTemplate: (template: string) => string;
        render: (template: string, data: any) => string;
    };
    // ============================================================================================
    export const EJS: RecoEjs = {
        // ----------------------------------------------------------------------------------------
        templatesDocuments: {},
        // ----------------------------------------------------------------------------------------
        loadTemplate: function (templatePath: string): string {
            // console.log(`reco.EJS.loadTemplate("${templatePath}")`)
            let infos = templatePath.split("/")
            let idDoc = infos[0];
            let idTemplate = infos[1];
            let doc = EJS.templatesDocuments[idDoc]
            if (doc) {
                let template = doc.getElementById(idTemplate)
                if (template) {
                    return EJS.resolveTemplate(template.innerHTML);
                }
            }
            console.error(`Error: Missing template: ${templatePath}`)
            return `<span style='color:red'>"Missing template: ${templatePath}". </span>`;
        },
        // ----------------------------------------------------------------------------------------
        resolveTemplate: function (template: string): string {
            let items = template.split("@@");
            template = "";
            for (let i = 0; i < items.length; i = i + 2) {
                template += items[i] + (i + 1 < items.length ? EJS.loadTemplate(items[i + 1]) : "");
            }
            return template;
        },
        // ----------------------------------------------------------------------------------------
        render: function (template: string, data: any): string {
            try {
                template = EJS.resolveTemplate(template);
                // console.log("reco.EJS.render() call", data, template)
                //@ts-ignore
                return RECOEJS.render(template, data);
            } catch (error) {
                console.error(`Error: Rendering template: error >`, error);
                return `<span style='color:red'>"Missing template: ${error}". </span>`;
            }
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
}
// ################################################################################################
declare const FilesSrvcli: any;
// ============================================================================================
namespace reco.core.files.cli4srv {
    // ============================================================================================
    export const FilesSrv = {
        // ----------------------------------------------------------------------------------------
        readBlob: async function (url: string): Promise<Blob | undefined> {
            return await FilesSrvcli.readBlob(url);
        },
        // ----------------------------------------------------------------------------------------
        newDirectory: async function (url: string) {
            await FilesSrvcli.newDirectory(url)
        },
        // ----------------------------------------------------------------------------------------
        writeBlob: async function (url: string, blob: Blob) {
            await FilesSrvcli.writeBlob(url, blob);
        },
        // ----------------------------------------------------------------------------------------
        dirFiles: async function (url: string): Promise<{ name: string, type: string }[] | undefined> {
            return await FilesSrvcli.dirFiles(url);
        },
        // ----------------------------------------------------------------------------------------
        readText: async function (url: string): Promise<string | undefined> {
            return await FilesSrvcli.readText(url);
        },
        // ----------------------------------------------------------------------------------------
        writeText: async function (url: string, content: string = "") {
            await FilesSrvcli.writeText(url, content);
        },
        // ----------------------------------------------------------------------------------------
        delete: async function (url: string) {
            await FilesSrvcli.delete(url);
        },
        // ----------------------------------------------------------------------------------------
        downloadBlob: async function (url: string): Promise<Blob | undefined> {
            return await FilesSrvcli.downloadBlob(url);
        },
        // ----------------------------------------------------------------------------------------
        downloadText: async function (url: string): Promise<string | undefined> {
            return await FilesSrvcli.downloadText(url);
        },
        // ----------------------------------------------------------------------------------------
        downloadCheck: async function (url: string): Promise<boolean> {
            return await FilesSrvcli.downloadCheck(url);
        },
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
}
// ################################################################################################
console.log("reco.libs loaded")
// ################################################################################################
