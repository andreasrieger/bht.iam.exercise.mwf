/**
 * @author Jörn Kreutel
 */
import { mwf } from "vfh-iam-mwf-base";
import { mwfUtils } from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";
import { mapObject } from "./MapViewController";
import { mapRootview } from "./MapViewController";
import { mapMarkers } from "./MapViewController";

export default class ReadviewViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller
    viewProxy;

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view
        const item = this.args.item;
        this.viewProxy = this.bindElement("myapp-readviewTemplate", { item: item }, this.root).viewProxy;
        this.viewProxy.bindAction("deleteItem", () => {
            this.showDialog("myapp-deleteDialogTemplate", {
                item: item,
                onDeleted: (deletedItem) => {
                    this.previousView({ deletedItem }); // ES6 shorthand for the same
                }
            });
        })



        const mapRoot = this.root.querySelector(".myapp-readview-maproot");

        if (mapRoot && item.exif && item.exif.GPSLatitude?.description && item.exif.GPSLongitude?.description) {
            const coords = [
                Number(item.exif.GPSLatitude.description),
                Number(item.exif.GPSLongitude.description)
            ];


            const map = L.map(mapRoot).setView(coords, 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            const marker = L.marker(coords).addTo(map);
            marker.bindPopup(item.title).openPopup();
            // } else {
            //     mapRoot.style.display = "none";
        }


        // if (mapRootview) {

        //     console.log("this.root:" , this.root);

        //     this.root.querySelector("main").appendChild(mapRootview);
        // }

        // call the superclass once creation is done
        super.oncreate();
    }


    constructor() {
        super();

        console.log("ReadviewViewController()");
    }

    /*
     * for views that initiate transitions to other views
     * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
     */
    async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
        // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly
    }

    /*
     * for views with listviews: bind a list item to an item view
     * TODO: delete if no listview is used or if databinding uses ractive templates
     */
    bindListItemView(listviewid, itemview, itemobj) {
        // TODO: implement how attributes of itemobj shall be displayed in itemview
    }

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
