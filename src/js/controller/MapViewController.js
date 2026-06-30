/**
 * @author Jörn Kreutel
 */
import { mwf } from "vfh-iam-mwf-base";
import { mwfUtils } from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";

export let mapObject = null;
export let mapRootview = null;
export let mapMarkers = [];

export default class MapViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller

    /*
     * for any view: initialise the view
     */
    async onresume() {
        await super.onresume();


        entities.MediaItem.readAll().then((listitems) => {

            console.log("mapMarkers: ", mapMarkers);

            const bhtCoords = [52.54417, 13.35278];
            listitems.forEach((item) => {
                // let coords = [];
                const exists = mapMarkers.some((entry) => entry.itemId === item._id);

                if (!exists) {

                    if (item.exif && item.exif.GPSLatitude?.description && item.exif.GPSLongitude?.description) {
                        const coords = [
                            Number(item.exif.GPSLatitude.description),
                            Number(item.exif.GPSLongitude.description)
                        ];
                        const marker = L.marker(coords);
                        const markerPopup = document.createElement("div");
                        markerPopup.classList.add("myapp-marker-popup");
                        const title = document.createElement("h2");
                        title.textContent = item.title;
                        markerPopup.appendChild(title);
                        // const img = document.createElement("img");
                        // img.src = item.src;
                        // markerPopup.appendChild(img);
                        markerPopup.onclick = () => {
                            this.nextView("myapp-readview", { item });
                        };
                        marker.bindPopup(markerPopup);
                        mapMarkers.push({
                            itemId: item._id,
                            marker,  // needed, if re-established with coords in Readview?
                            _latlng: coords
                        });
                    }
                }
            });


            if (!mapObject) {
                mapObject = L.map("myapp-maproot")
                    .setView(
                        mapMarkers.length > 0 ? mapMarkers[0]._latlng : bhtCoords,
                        13
                    );
                L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(mapObject);
                mapRootview = this.root.querySelector("#myapp-maproot");

            } else {
                if (!this.root.querySelector("#myapp-maproot")) {
                    this.root.querySelector("main").appendChild(mapRootview);
                }
            }

            mapMarkers.forEach((marker) => {
                // To do: search for existing marker with same coords and choose only one of them.
                marker.marker.addTo(mapObject);
            });
        });
    }


    constructor() {
        super();

        console.log("MapViewController()");
    }

    /*
     * for views that initiate transitions to other views
     * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
     */
    async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
        // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly
        if (nextviewid == "myapp-readview" && returnValue?.deletedItem) {
            const deletedItem = returnValue.deletedItem;
            // Remove the marker corresponding to the deleted item
            const markerIndex = mapMarkers.findIndex((marker) => marker.itemId === deletedItem._id);
            if (markerIndex !== -1) {
                const markerToRemove = mapMarkers[markerIndex].marker;
                mapObject.removeLayer(markerToRemove);
                mapMarkers.splice(markerIndex, 1);
            }
            if (mapMarkers.length > 0) {
                mapObject.setView(mapMarkers[0]._latlng, 13);
            } else {
                mapObject.setView([52.54417, 13.35278], 13);
            }
        }
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
