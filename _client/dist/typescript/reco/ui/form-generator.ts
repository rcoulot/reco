// ################################################################################################
namespace reco.ui.form {
    // ============================================================================================
    export class FormGenerator {
        // ----------------------------------------------------------------------------------------
        form: Form;
        elt: HTMLElement;
        divForm: HTMLDivElement;
        // ----------------------------------------------------------------------------------------
        constructor(form: Form, elt: HTMLElement) {
            this.form = form;
            this.elt = elt;
            this.divForm = document.createElement("div");
            this.divForm.className = "form";
            this.divForm.style.display = "grid";
            this.divForm.style.gridTemplateColumns = "max-content auto";
            this.divForm.style.maxWidth = "100%";
        }
        // ----------------------------------------------------------------------------------------
        generate(): HTMLDivElement {
            this.form.debug("FormGenerator.generate");
            this.divForm.id = this.form.id;
            this.form.items = {};
            for (let itemDef of this.form.formDef.itemsDef) {
                let item = this.form.newItem(itemDef);
                item.obj = item.obj ? item.obj : this.form.obj;
                item.objList = item.objList ? item.objList : this.form.objList;
                this.form.debug("render form item", item)
                if (itemDef instanceof FormDefItemTitle) { this.generateTitle(this.divForm, itemDef, item); }
                else if (itemDef instanceof FormDefItemLabel) { this.generateLabelValue(this.divForm, itemDef, item); }
                else if (itemDef instanceof FormDefItemSimple) { this.generateSimple(this.divForm, itemDef, item); }
                else if (itemDef instanceof FormDefItemTree) { this.generateTree(this.divForm, itemDef, item); }
                else if (itemDef instanceof FormDefItemSelect) { this.generateSelect(this.divForm, itemDef, item); }
                else if (itemDef instanceof FormDefItemAction) { this.generateAction(this.divForm, itemDef, item); }
                else if (itemDef instanceof FormDefItemActions) { this.generateActions(this.divForm, itemDef, item); }
                else if (itemDef instanceof FormDefItemTable) { this.generateTable(this.divForm, itemDef, item); }
            }
            this.elt.innerHTML = "";
            this.elt.appendChild(this.divForm);
            return this.divForm;
        }
        // ----------------------------------------------------------------------------------------
        createLabelElt(itemDef: FormDefItemLabel, item: FormItem): HTMLDivElement {
            let itemEltLabel = document.createElement("div");
            itemEltLabel.className = `label-label label ${item.cssClassObjId}`;
            itemEltLabel.id = `${item.id}-label`;
            itemEltLabel.innerHTML = item.label;
            return itemEltLabel;
        }
        // ----------------------------------------------------------------------------------------
        createLabelValueElt(itemDef: FormDefItemLabel, item: FormItem): HTMLDivElement {
            let itemEltValue = document.createElement("div");
            itemEltValue.className = `label-value value ${item.cssClassObjId}`;
            itemEltValue.id = `${item.id}-value`;
            itemEltValue.innerHTML = item.value ? item.value : '';
            return itemEltValue;
        }
        // ----------------------------------------------------------------------------------------
        createSimpleElt(itemDef: FormDefItemSimple, item: FormItem): HTMLInputElement {
            this.form.debug("    FormGenerator.generateSimple");
            let itemEltValue = document.createElement("input");
            itemEltValue.className = `simple-input value editable ${item.cssClassObjId}`;
            itemEltValue.id = `${item.id}-input`;
            itemEltValue.type = "text";
            itemEltValue.value = item.value ? item.value : '';
            return itemEltValue;
        }
        // ----------------------------------------------------------------------------------------
        generateTitle(parentElt: HTMLElement, itemDef: FormDefItemTitle, item: FormItem): void {
            this.form.debug("    FormGenerator.generateTitle");
            let itemElt = document.createElement("div");
            itemElt.className = `form-title ${item.cssClassObjId}`;
            itemElt.style.gridColumn = "1 / span 2";
            itemElt.id = `${item.id}-title`;
            itemElt.innerHTML = item.label;
            this.divForm.appendChild(itemElt);
        }
        // ----------------------------------------------------------------------------------------
        generateLabelValue(parentElt: HTMLElement, itemDef: FormDefItemLabel, item: FormItem): void {
            this.form.debug("    FormGenerator.generateLabelValue");
            let itemEltLabel = this.createLabelElt(itemDef, item);
            let itemEltValue = this.createLabelValueElt(itemDef, item);
            parentElt.appendChild(itemEltLabel);
            parentElt.appendChild(itemEltValue);
        }
        // ----------------------------------------------------------------------------------------
        generateSimple(parentElt: HTMLElement, itemDef: FormDefItemSimple, item: FormItem): void {
            this.form.debug("    FormGenerator.generateSimple");
            let itemEltLabel = this.createLabelElt(itemDef, item);
            let itemEltValue = this.createSimpleElt(itemDef, item);
            parentElt.appendChild(itemEltLabel);
            parentElt.appendChild(itemEltValue);
        }
        // ----------------------------------------------------------------------------------------
        generateTree(parentElt: HTMLElement, itemDef: FormDefItemTree, item: FormItem): void {
            this.form.debug("    FormGenerator.generateTree");
            let itemEltLabel = this.createLabelElt(itemDef, item);
            itemEltLabel.style.gridColumn = "1 / span 2";
            let itemEltValue = document.createElement("div");
            itemEltValue.className = `div-tree`;
            itemEltValue.style.gridColumn = "1 / span 2";
            itemEltValue.id = `${item.id}`;
            parentElt.appendChild(itemEltLabel);
            parentElt.appendChild(itemEltValue);
        }
        // ----------------------------------------------------------------------------------------
        generateSelect(parentElt: HTMLElement, itemDef: FormDefItemSelect, item: FormItem): void {
            this.form.debug("    FormGenerator.generateSelect");
            let itemEltLabel = this.createLabelElt(itemDef, item);
            let itemEltValue = document.createElement("select");
            itemEltValue.className = `select-select value editable ${item.cssClassObjId}`;
            itemEltValue.id = `${item.id}-select`;
            let selectedValue = item.value;
            for (let option of item.selectOptions) {
                let itemEltOption = document.createElement("option");
                itemEltOption.value = option.value;
                itemEltOption.innerHTML = option.label;
                itemEltOption.selected = option.value === selectedValue;
                itemEltValue.appendChild(itemEltOption);
            }
            parentElt.appendChild(itemEltLabel);
            parentElt.appendChild(itemEltValue);
        }
        // ----------------------------------------------------------------------------------------
        generateAction(parentElt: HTMLElement, itemDef: FormDefItemAction, item: FormItem): void {
            this.form.debug("    FormGenerator.generateAction");
            let itemEltValue = document.createElement("button");
            itemEltValue.type = "button";
            itemEltValue.className = `action-button`;
            itemEltValue.id = `${item.id}`;
            itemEltValue.innerHTML = item.label;
            parentElt.appendChild(itemEltValue);
        }
        // ----------------------------------------------------------------------------------------
        generateActions(parentElt: HTMLElement, itemDef: FormDefItemActions, item: FormItem): void {
            this.form.debug("    FormGenerator.generateActions");
            let itemEltLabel = this.createLabelElt(itemDef, item);
            let itemEltButtons = document.createElement("div");
            itemEltButtons.className = `actions-buttons`;
            let parent = item;
            let parentItemDef = parent.itemDef as FormDefItemActions;
            for (let actionDef of parentItemDef.actionsDef) {
                let item = this.form.newItem(actionDef, parent);
                let itemEltButton = document.createElement("button");
                itemEltButton.type = "button";
                itemEltButton.className = `action-button`;
                itemEltButton.id = `${item.id}`;
                itemEltButton.innerHTML = item.label;
                itemEltButtons.appendChild(itemEltButton);
            }
            parentElt.appendChild(itemEltLabel);
            parentElt.appendChild(itemEltButtons);
        }
        // ----------------------------------------------------------------------------------------
        generateTable(parentElt: HTMLElement, itemDef: FormDefItemTable, item: FormItem): void {
            this.form.debug("    FormGenerator.generateTable");
            let itemEltLabel = this.createLabelElt(itemDef, item);
            itemEltLabel.style.gridColumn = "1 / span 2";
            let itemEltTableDiv = document.createElement("div");
            itemEltTableDiv.className = `div-table`;
            itemEltTableDiv.style.gridColumn = "1 / span 2";
            let itemEltTable = document.createElement("table");
            itemEltTable.style.tableLayout = "fixed";
            itemEltTable.className = `table-table ${itemDef.isResizable ? 'resizable' : 'not-resizable'}`;
            let itemEltTableHead = document.createElement("thead");
            itemEltTableHead.style.tableLayout = "fixed";
            itemEltTableHead.className = `table-table ${itemDef.isResizable ? 'resizable' : 'not-resizable'}`;
            let parent = item;
            let parentItemDef = parent.itemDef as FormDefItemTable;
            this.form.debug("render form template table header, parent >", parent);
            for (let colDef of parentItemDef.colsDef) {
                this.form.debug("render form template table header, colDef >", colDef);
                let item = this.form.newItem(colDef, parent);
                this.form.debug("render form template table header, col item >", item);
                let isColDefAction = colDef instanceof reco.ui.form.FormDefItemAction || colDef instanceof reco.ui.form.FormDefItemActions;
                let itemEltTableHeadCell = document.createElement("th");
                itemEltTableHeadCell.style.overflow = "hidden";
                itemEltTableHeadCell.style.whiteSpace = "nowrap";
                itemEltTableHeadCell.style.textOverflow = "ellipsis";
                itemEltTableHeadCell.innerHTML = isColDefAction ? "" : item.label;
                itemEltTableHead.appendChild(itemEltTableHeadCell);
            }
            let itemEltTableBody = document.createElement("tbody");
            this.form.debug("table parent.objList => ", parent.objList);
            for (let index = 0; index < parent.objList!.length; index++) {
                let itemEltTableBodyRow = document.createElement("tr");
                let itemItemDef = parent.itemDef as FormDefItemTable;
                for (let colDef of itemItemDef.colsDef) {
                    let item = this.form.newItem(colDef, parent);
                    item.obj = parent.objList![index];
                    this.form.debug("render form template table row, colDef, obj >", colDef, item.obj);
                    let isColDefAction = colDef instanceof reco.ui.form.FormDefItemAction || colDef instanceof reco.ui.form.FormDefItemActions;
                    let itemEltTableBodyRowCell = document.createElement("td");
                    itemEltTableBodyRowCell.style.overflow = "hidden";
                    itemEltTableBodyRowCell.style.whiteSpace = "nowrap";
                    itemEltTableBodyRowCell.style.textOverflow = "ellipsis";
                    itemEltTableBodyRowCell.id = `${item.id}-cell`;
                    if (isColDefAction) {
                        let itemEltTableBodyRowCellButton = document.createElement("button");
                        itemEltTableBodyRowCellButton.type = "button";
                        itemEltTableBodyRowCellButton.className = `action-button`;
                        itemEltTableBodyRowCellButton.id = `${item.id}`;
                        itemEltTableBodyRowCellButton.title = `${item.label}`;
                        itemEltTableBodyRowCellButton.innerHTML = item.label;
                        itemEltTableBodyRowCell.appendChild(itemEltTableBodyRowCellButton);
                    } else if (colDef instanceof FormDefItemLabel) {
                        let itemEltValue = this.createLabelValueElt(itemDef, item);
                        itemEltValue.style.border = "none";
                        itemEltValue.style.margin = "0";
                        itemEltValue.title = `${item.value}`;
                        itemEltTableBodyRowCell.appendChild(itemEltValue);
                    } else if (colDef instanceof FormDefItemSimple) {
                        let itemEltValue = this.createSimpleElt(itemDef, item);
                        itemEltValue.style.border = "none";
                        itemEltValue.style.margin = "0";
                        itemEltValue.style.width = "100%";
                        itemEltValue.title = `${item.value}`;
                        itemEltTableBodyRowCell.appendChild(itemEltValue);
                    }
                    itemEltTableBodyRow.appendChild(itemEltTableBodyRowCell);
                }
                itemEltTableBody.appendChild(itemEltTableBodyRow);
            }
            itemEltTable.appendChild(itemEltTableHead);
            itemEltTable.appendChild(itemEltTableBody);
            itemEltTableDiv.appendChild(itemEltTable);
            parentElt.appendChild(itemEltLabel);
            parentElt.appendChild(itemEltTableDiv);
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
}
// ################################################################################################