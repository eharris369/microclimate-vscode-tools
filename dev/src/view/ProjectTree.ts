
import * as vscode from "vscode";

import ITreeItemAdaptable, { SimpleTreeItem } from "./TreeItemAdaptable";
import ConnectionManager from "../microclimate/connection/ConnectionManager";
import { Icons, getIconPaths } from "../constants/Resources";
import Commands from "../constants/Commands";

export default class ProjectTreeDataProvider implements vscode.TreeDataProvider<ITreeItemAdaptable> {

    public readonly treeDataProvider: vscode.TreeDataProvider<{}> = this;
    public readonly VIEW_ID: string = "ext.mc.mcProjectExplorer";        // must match package.json

    private onChangeEmitter: vscode.EventEmitter<ITreeItemAdaptable> = new vscode.EventEmitter<ITreeItemAdaptable>();
    public readonly onDidChangeTreeData: vscode.Event<ITreeItemAdaptable> = this.onChangeEmitter.event;

    constructor() {
        ConnectionManager.instance.addOnChangeListener(this.refresh);
    }

    /**
     * Notifies VSCode that this tree has to be refreshed.
     * Used as a call-back for ConnectionManager OnChange.
     */
    public refresh = (): void => {
        // Logger.log("Refresh tree");
        this.onChangeEmitter.fire();
    }

    /**
     * TreeDataProvider method to convert our custom TreeItemAdaptable class to a vscode.TreeItem
     */
    public getTreeItem(node: ITreeItemAdaptable): vscode.TreeItem | Promise<vscode.TreeItem> {
        return node.toTreeItem();
    }

    /**
     * TreeDataProvider method to get children for a given TreeItemAdaptable node, or provide the tree's root node.
     */
    public getChildren(node?: ITreeItemAdaptable): ITreeItemAdaptable[] | Promise<ITreeItemAdaptable[]> {
        if (!node) {
            const connections = ConnectionManager.instance.connections;
            if (connections.length > 0) {
                // The top-level nodes of this tree are our Connections, and their children are their Projects
                return connections;
            }
            else {
                // Provide a root node if no Connections have been created
                const noConnectionsRoot = new SimpleTreeItem("No Microclimate connections", vscode.TreeItemCollapsibleState.None);
                noConnectionsRoot.treeItem.iconPath = getIconPaths(Icons.Microclimate);
                noConnectionsRoot.treeItem.tooltip = "Click to create a new Microclimate connection";
                // Clicking the no connections item runs the new connection command.
                noConnectionsRoot.treeItem.command = {
                    command: Commands.NEW_CONNECTION,
                    title: ""
                };
                return [ noConnectionsRoot ];
            }
        }

        return node.getChildren();
    }
}
