// ################################################################################################
namespace reco.ui.form {
    // ============================================================================================
    export class FormGenerator {
        // ----------------------------------------------------------------------------------------
        form: Form;
        // ----------------------------------------------------------------------------------------
        constructor(form: Form) {
            this.form = form;
        }
        // ----------------------------------------------------------------------------------------
        generate(): string {
            this.form.debug("FormGenerator.generate");
            let html = ""
            html += `<div class="form" style="display: grid;grid-template-columns: max-content auto;max-width: 100%;" id="${this.form.id}">\n`;
            this.form.items = {};
            for (let itemDef of this.form.formDef.itemsDef) {
                let item = this.form.newItem(itemDef);
                item.obj = item.obj ? item.obj : this.form.obj;
                item.objList = item.objList ? item.objList : this.form.objList;
                this.form.debug("render form item", item)
                if (itemDef instanceof reco.ui.form.FormDefItemTitle) { html += this.generateTitle(itemDef, item) + "\n"; }
                else if (itemDef instanceof reco.ui.form.FormDefItemLabel) { html += this.generateLabel(itemDef, item) + "\n"; }
                else if (itemDef instanceof reco.ui.form.FormDefItemSimple) { html += this.generateSimple(itemDef, item) + "\n"; }
                else if (itemDef instanceof reco.ui.form.FormDefItemTree) { html += this.generateTree(itemDef, item) + "\n"; }
                else if (itemDef instanceof reco.ui.form.FormDefItemSelect) { html += this.generateSelect(itemDef, item) + "\n"; }
                else if (itemDef instanceof reco.ui.form.FormDefItemAction) { html += this.generateAction(itemDef, item) + "\n"; }
                else if (itemDef instanceof reco.ui.form.FormDefItemActions) { html += this.generateActions(itemDef, item) + "\n"; }
                else if (itemDef instanceof reco.ui.form.FormDefItemTable) { html += this.generateTable(itemDef, item) + "\n"; }
            }
            html += `<div>`;
            return html;
        }
        // ----------------------------------------------------------------------------------------
        generateTitle(itemDef: FormDefItemTitle, item: FormItem): string {
            this.form.debug("    FormGenerator.generateTitle");
            let html = "";
            html += `<div class="form-title ${item.cssClassObjId}" style="grid-column: 1 / span 2" id="${item.id}-title">${item.label}</div>`;
            return html;
        }
        // ----------------------------------------------------------------------------------------
        generateLabel(itemDef: FormDefItemLabel, item: FormItem): string {
            this.form.debug("    FormGenerator.generateLabel");
            let html = "";
            html += `    <div class="label-label label" id="${item.id}-label">${item.label}</div>\n`;
            html += `    <div class="label-value value ${item.cssClassObjId}" id="${item.id}-value">${item.value}</div>`;
            return html;
        }
        // ----------------------------------------------------------------------------------------
        generateSimple(itemDef: FormDefItemSimple, item: FormItem): string {
            this.form.debug("    FormGenerator.generateSimple");
            let html = "";
            html += `   <div class="simple-label label" id="${item.id}-label">${item.label}</div>\n`;
            html += `   <input class="simple-input value editable ${item.cssClassObjId}"  id="${item.id}-input" type="text" value="${item.value}">`;
            return html;
        }
        // ----------------------------------------------------------------------------------------
        generateTree(itemDef: FormDefItemTree, item: FormItem): string {
            this.form.debug("    FormGenerator.generateTree");
            let html = "";
            html += `   <div class="tree-label label" style="grid-column: 1 / span 2" id="${item.id}-label">${item.label}</div>\n`;
            html += `   <div class="div-tree" style="grid-column: 1 / span 2" id="${item.id}"></div>`;
            return html;
        }
        // ----------------------------------------------------------------------------------------
        generateSelect(itemDef: FormDefItemSelect, item: FormItem): string {
            this.form.debug("    FormGenerator.generateSelect");
            let html = "";
            html += `   <div class="select-label label" id="${item.id}-label">${item.label}</div>\n`;
            html += `   <select class="select-select value editable ${item.cssClassObjId}"  id="${item.id}-select">\n`;
            let selectedValue = item.value;
            for (let option of item.selectOptions) {
                html += `           <option value="${option.value}" ${option.value === selectedValue ? 'selected' : ''}>${option.label}</option>\n`;
            }
            html += `   </select>`;
            return html;
        }
        // ----------------------------------------------------------------------------------------
        generateAction(itemDef: FormDefItemAction, item: FormItem): string {
            this.form.debug("    FormGenerator.generateAction");
            let html = "";
            html += `   <button type="button" class="action-button" id="${item.id}">${item.label}</button>`;
            return html;
        }
        // ----------------------------------------------------------------------------------------
        generateActions(itemDef: FormDefItemActions, item: FormItem): string {
            this.form.debug("    FormGenerator.generateActions");
            let html = "";
            html += `   <div class="actions-label label" id="${item.id}-label">${item.label}</div>\n`;
            html += `   <div class="actions-buttons">\n`;
            let parent = item;
            let parentItemDef = parent.itemDef as FormDefItemActions;
            for (let actionDef of parentItemDef.actionsDef) {
                let item = this.form.newItem(actionDef, parent);
                html += `           <button type="button" class="action-button" id="${item.id}">${item.label}</button>\n`;
            }
            html += `   </div>`;
            return html;
        }
        // ----------------------------------------------------------------------------------------
        generateTable(itemDef: FormDefItemTable, item: FormItem): string {
            this.form.debug("    FormGenerator.generateTable");
            let html = "";
            html += `       <div class="table-label label" style="grid-column: 1 / span 2">${item.label}</div>\n`;
            html += `       <div class="div-table" style="grid-column: 1 / span 2">\n`;
            html += `       <table style="table-layout: fixed;" class="table-table ${itemDef.isResizable ? 'resizable' : 'not-resizable'}    ">\n`;
            html += `           <thead>\n`;
            let parent = item;
            let parentItemDef = parent.itemDef as FormDefItemTable;
            this.form.debug("render form template table header, parent >", parent);
            for (let colDef of parentItemDef.colsDef) {
                this.form.debug("render form template table header, colDef >", colDef);
                let item = this.form.newItem(colDef, parent);
                this.form.debug("render form template table header, col item >", item);
                let isColDefAction = colDef instanceof reco.ui.form.FormDefItemAction || colDef instanceof reco.ui.form.FormDefItemActions;
                html += `                   <th style = "overflow: hidden;white-space: nowrap;text-overflow: ellipsis;" > ${isColDefAction ? "" : item.label} </th>\n`;
            }
            html += `           </thead>\n`;
            html += `           <tbody>\n`;
            this.form.debug("table parent.objList => ", parent.objList);
            for (let index = 0; index < parent.objList!.length; index++) {
                html += `               <tr>\n`;
                let itemItemDef = parent.itemDef as FormDefItemTable;
                for (let colDef of itemItemDef.colsDef) {
                    let item = this.form.newItem(colDef, parent);
                    item.obj = parent.objList![index];
                    this.form.debug("render form template table row, colDef, obj >", colDef, item.obj);
                    let isColDefAction = colDef instanceof reco.ui.form.FormDefItemAction || colDef instanceof reco.ui.form.FormDefItemActions;
                    if (isColDefAction) {
                        html += `                               <td style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;"\n`;
                        html += `                                   id="${item.id}-value}">\n`;
                        html += `                                   <button type="button" class="action-button" id="${item.id}" title="${item.label}">\n`;
                        html += `                                   ${item.label}</button>\n`;
                        html += `                               </td> <%  \n`;
                    } else {
                        html += `                               <td style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;"\n`;
                        html += `                                   id="${item.id}-value}" \n`;
                        html += `                                   title="${item.value}"= >${item.value ? item.value : ''}</td>\n`;
                    }
                }
                html += `               </tr>\n`;
            }
            html += `           </tbody>\n`;
            html += `       </table>\n`;
            html += `       </div>`;
            return html;
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
}
// ################################################################################################