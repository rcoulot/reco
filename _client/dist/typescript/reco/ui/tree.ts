// ################################################################################################
namespace reco.ui.tree {
    // ============================================================================================
    import DB = reco.core.db.DB;
    import OBJ = reco.core.db.OBJ;
    import TreeHandler = reco.core.db.TreeHandler;
    import FormItem = reco.ui.form.FormItem;
    // ============================================================================================
    export class TreeUI<aDB extends DB> {
        // ----------------------------------------------------------------------------------------
        treeHandler: TreeHandler<aDB>;
        formItem: FormItem;
        eltId: string;
        get elt(): HTMLElement { return document.getElementById(this.eltId) as HTMLElement; }
        // ----------------------------------------------------------------------------------------
        constructor(eltId: string, nodes: TreeHandler<aDB>, formItem: FormItem) {
            this.treeHandler = nodes;
            this.formItem = formItem;
            this.eltId = eltId;
            this.elt.innerHTML = "";
        }
        // ----------------------------------------------------------------------------------------
        onIconClick(actionNode: OBJ<aDB>) {
            this.treeHandler.onIconClick(actionNode);
            let actionNodeNewState = this.treeHandler.isClosed(actionNode) ? "open" : "close";
            let actionNodeElt = document.getElementById(this.treeHandler.id(actionNode))!;
            let actionNodeIcoElt = actionNodeElt.getElementsByClassName('node-ico')[0] as HTMLElement;
            actionNodeIcoElt.classList.remove('node-ico-opened', 'node-ico-closed');
            actionNodeIcoElt.classList.add(actionNodeNewState === "open" ? 'node-ico-opened' : 'node-ico-closed');
            this.treeHandler.setClosed(actionNode, actionNodeNewState === "close");
            let subNodes = this.treeHandler.list(actionNode);
            subNodes.splice(0, 1);
            for (let node of subNodes) {
                let nodeElt = document.getElementById(this.treeHandler.id(node))!;
                nodeElt.classList.remove('node-hidden');
                if (actionNodeNewState === "close") {
                    nodeElt.classList.add('node-hidden');
                } else if (this.treeHandler.isInClosedPath(node)) {
                    nodeElt.classList.add('node-hidden');
                }
            }
        }
        // ----------------------------------------------------------------------------------------
        display() {
            let html = ""
            this.elt.onclick = (e: MouseEvent) => {
                let target = e.target as HTMLElement;
                let id = target.id;
                if (!id) id = target.parentElement!.id;
                if (!id) return;
                if (id === this.elt.id) return;
                let node = this.treeHandler.nodeById(id);
                if (node) {
                    if (target.classList.contains('node-ico')) this.onIconClick(node);
                    else if (target.classList.contains('node-label')) {
                        this.formItem.itemDef.formDef.onActionEvent(this.formItem, this.formItem.itemDef, "onTreeLabelClick", { tree: this, node: node })
                    } else if (target.classList.contains('node-action')) {
                        this.formItem.itemDef.formDef.onActionEvent(this.formItem, this.formItem.itemDef, "onTreeActionClick", { tree: this, node: node })
                    }
                }
            };
            for (let node of this.treeHandler.list()) {
                let id = this.treeHandler.id(node);
                let depth = this.treeHandler.depth(node);
                let closed = this.treeHandler.isDefaultClosed?.(node);
                let actions = this.treeHandler.actions(node);
                let leaf = this.treeHandler.children(node).length === 0;
                let label = this.treeHandler.label(node);
                let nodeCss = this.treeHandler.css(node);
                html += `<div id="${id}" class="node ${nodeCss}" data-depth="${depth}" data-label="${label}">`;
                for (let i = 0; i < depth - 1; i++) html += `<div class="node-indent">&nbsp;</div>`;
                html += `<div class="node-ico ${leaf ? 'node-ico-leaf' : (closed ? 'node-ico-closed' : 'node-ico-opened')}">&nbsp;</div>`;
                html += `<div class="node-label">${label}</div>`;
                if (actions.length > 0) html += `<div class="node-action">&nbsp;</div>`;
                html += `</div>\n`;
                this.elt.innerHTML = html;
            }
        }
        // ----------------------------------------------------------------------------------------
    }
    // ============================================================================================
}
// ################################################################################################