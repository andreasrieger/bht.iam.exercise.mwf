/**
 * @author Jörn Kreutel
 */
import { mwf } from "vfh-iam-mwf-base";
import { mwfUtils } from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";

export default class ListviewViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller
    items = [];
    filterMode = "all";
    addNewMediaItemElement;

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view


        const addNewMediaItemElement = this.root.querySelector("#addNewMediaItem");
        addNewMediaItemElement.onclick = (() => {
            this.createNewItem();
        });

        this.viewProxy = this.bindElement("myapp-filterTemplate", {
            filterEnabled: false,
            filterToggleIcon: "myapp-img-cloud",
            filterToggleTitle: "Remote anzeigen"
        }, this.root).viewProxy;

        this.viewProxy.bindAction("toggleFilter", () => {
            if (this.filterMode === "remote") {
                this.filterMode = "local";

                this.viewProxy.update({
                    filterEnabled: true,
                    filterToggleIcon: "myapp-img-cloud",
                    filterToggleTitle: "Remote anzeigen"
                });
            } else {
                this.filterMode = "remote";

                this.viewProxy.update({
                    filterEnabled: true,
                    filterToggleIcon: "myapp-img-drive",
                    filterToggleTitle: "Lokal anzeigen"
                });
            }

            this.applyFilter();
        });

        this.viewProxy.bindAction("resetFilter", () => {
            this.filterMode = "all";

            this.viewProxy.update({
                filterEnabled: false,
                filterToggleIcon: "myapp-img-cloud",
                filterToggleTitle: "Remote anzeigen"
            });

            this.applyFilter();
        });
        // this.viewProxy = this.bindElement("myapp-listviewTemplate", {
        //     filterEnabled: false,
        //     filterIconClass: "mwf-img-link"
        // }, this.root).viewProxy;

        // this.viewProxy.set("filterEnabled", true);
        // this.viewProxy.set("filterIconClass", "mwf-img-disk");

        // const filterButton = this.root.querySelector("#filterRemoteLocal");
        // const filterReset = this.root.querySelector("#filterReset");

        // filterButton.onclick = () => {
        //     if (this.filterMode === "remote") {
        //         this.filterMode = "local";

        //         filterButton.classList.remove("myapp-img-drive");
        //         filterButton.classList.add("myapp-img-cloud");
        //         filterButton.title = "Remote anzeigen";
        //     } else {
        //         this.filterMode = "remote";

        //         filterButton.classList.remove("myapp-img-cloud");
        //         filterButton.classList.add("myapp-img-drive");
        //         filterButton.title = "Lokale anzeigen";
        //     }

        //     this.applyFilter();
        // };

        // filterReset.onclick = () => {
        //     this.filterMode = "all";

        //     filterToggle.classList.remove("myapp-img-drive");
        //     filterToggle.classList.add("myapp-img-cloud");

        //     this.applyFilter();
        // };
        // this.root.querySelector("#filterReset").onclick = () => {
        //     this.showAllItems();
        // };

        // this.root.querySelector("#filterRemote").onclick = () => {
        //     this.showRemoteItems();
        // };

        // this.root.querySelector("#filterLocal").onclick = () => {
        //     this.showLocalItems();
        // };

        entities.MediaItem.readAll().then((listitems) => {
            this.items = listitems;
            this.applyFilter();
        });

        // call the superclass once creation is done
        super.oncreate();
    }


    constructor() {
        super();
        console.log("ListviewViewController()");
    }

    /*
     * for views that initiate transitions to other views
     * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
     */
    async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
        // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly
        if (nextviewid == "myapp-readview" && returnValue?.deletedItem) {
            this.removeFromListview(returnValue.deletedItem._id);
        }
    }


    createNewItem() {
        const newItem = new entities.MediaItem();

        this.showDialog("myapp-addviewTemplate", {
            item: newItem,
            onUpdated: (updatedItem) => {
                this.addToListview(updatedItem);
            },
            actionBindings: {
                showPreview: () => {
                    // alert("showPreview");
                },
                submitForm: () => {
                    // alert("submitForm");
                }
            }
        });

    };

    editItem(item) {
        this.showDialog("myapp-editviewTemplate", {
            item: item,
            onUpdated: (updatedItem) => {
                this.updateInListview(updatedItem._id, updatedItem);
            },
        });
    }


    deleteItem(item) {
        this.showDialog("myapp-deleteDialogTemplate", {
            item: item,
            onDeleted: (deletedItem) => {
                this.removeFromListview(deletedItem._id);
            },
        })
    }

    applyFilter() {
        let filteredItems = this.items;

        if (this.filterMode === "remote") {
            filteredItems = this.items.filter((item) => item.remote === true);
        }

        if (this.filterMode === "local") {
            filteredItems = this.items.filter((item) => item.remote !== true);
        }

        filteredItems.forEach((item) => {
            if (item.imgFile) {
                item.src = URL.createObjectURL(item.imgFile);
            }
        });

        this.initialiseListview(filteredItems);
    }

    // showAllItems() {
    //     this.filterMode = "all";
    //     this.applyFilter();
    // }

    // showRemoteItems() {
    //     this.filterMode = "remote";
    //     this.applyFilter();
    // }

    // showLocalItems() {
    //     this.filterMode = "local";
    //     this.applyFilter();
    // }



    /*
     * for views with listviews: react to the selection of a listitem
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemSelected(itemobj, listviewid) {
        // TODO: implement how selection of itemobj shall be handled
    }

    /*
     * for views with listviews: react to the selection of a listitem menu option
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemMenuItemSelected(menuitemview, itemobj, listview) {
        // TODO: implement how selection of the option menuitemview for itemobj shall be handled
        super.onListItemMenuItemSelected(menuitemview, itemobj, listview);
    }

    /*
     * for views with dialogs
     * TODO: delete if no dialogs are used or if generic controller for dialogs is employed
     */
    bindDialog(dialogid, dialogview, dialogdataobj) {
        // call the supertype function
        super.bindDialog(dialogid, dialogview, dialogdataobj);

        // TODO: implement action bindings for dialog, accessing dialog.root
    }

}
