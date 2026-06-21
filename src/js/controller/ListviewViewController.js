/**
 * @author Jörn Kreutel
 */
import {mwf} from "vfh-iam-mwf-base";
import {mwfUtils} from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";
// import {GenericCRUDImplLocal} from "vfh-iam-mwf-base";

const titles = ["Foo", "Bar", "Baz"];
const imgs = ["https://picsum.photos/100/100", "https://picsum.photos/200/300", "https://picsum.photos/200/100"];

export default class ListviewViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller
    items;
    addNewMediaItemElement;

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view
        const newItem = new entities.MediaItem(
            titles[Date.now() % titles.length],
            imgs[Date.now() % imgs.length]
        )
        const templateProxy = this.bindElement("myapp-mediaItemDialogTemplate", {item: newItem}, this.root).viewProxy;
        if (templateProxy) console.log("templateProxy: " + templateProxy);
        templateProxy.bindAction("showPreview", (event) => {
            console.log("showPreview");
        })

        // templateProxy.bindAction("createItem", (event) => {
        //     console.log("createItem");
        // })

        // templateProxy.bindAction("showPreview", (event) => {
        // function foobarbaz(event) {
        //
        //     const fileObj = event.original.target.files[0];
        //     if (fileObj) {
        //
        //         if (true) {
        //             const imgSrc = URL.createObjectURL(fileObj);
        //             console.log("imgSrc: " + imgSrc);
        //             newItem.src = imgSrc;
        //             templateProxy.update({item: newItem});
        //         } else if (false) {
        //             const fileReader = new FileReader();
        //             fileReader.readAsDataURL(fileObj);
        //             fileReader.onload = (e) => {
        //                 const imgSrc = fileReader.result;
        //                 newItem.src = e.target.result;
        //                 templateProxy.update({item: newItem});
        //             }
        //         } else {
        //             const imgDataForm = new FileReader();
        //             imgDataForm.append("foobarbaz", fileObj);
        //             const request = new XMLHttpRequest();
        //             request.open("POST", "http://localhost:7077/api/upload");
        //             request.send(imgDataForm);
        //             request.onload = (e) => {
        //                 const responseText = e.target.responseText;
        //                 const responseObj = JSON.parse(responseText);
        //                 const imgSrc = "http://localhost:7077/api/upload/" + responseObj.data.foobarbaz;
        //                 newItem.src = imgSrc;
        //                 templateProxy.update({item: newItem});
        //             }
        //
        //             imgDataForm.readAsDataURL(fileObj);
        //             imgDataForm.onload = (e) => {
        //                 const imgSrc = e.target.result;
        //                 newItem.src = imgSrc;
        //                 templateProxy.update({item: newItem});
        //                 newItem.create(() => alert("created: " + newItem.title))
        //             }
        //         }
        //     }
        //
        // }


        this.addNewMediaItemElement = this.root.querySelector("#addNewMediaItem");
        this.addNewMediaItemElement.onclick = (() => {
            console.log("addNewMediaItem");
            this.createNewItem();
        });


        entities.MediaItem.readAll().then((listitems) => {
            this.initialiseListview(listitems);
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
        if (nextviewid == "mediaReadview" && returnValue && returnValue.deletedItem) {
            this.removeFromListview(returnValue.deletedItem._id);
        }
    }

    /*
     * for views with listviews: bind a list item to an item view
     * TODO: delete if no listview is used or if databinding uses ractive templates
     */

    /*
    bindListItemView(listviewid, itemview, itemobj) {
        // TODO: implement how attributes of itemobj shall be displayed in itemview
        itemview.root.getElementsByTagName("img")[0].src = itemobj.src;
        itemview.root.getElementsByTagName("h2")[0].textContent = itemobj.title + itemobj._id;
        itemview.root.getElementsByTagName("h3")[0].textContent = itemobj.added;
    }
    */

    createNewItem() {
        const newItem = new entities.MediaItem(
            titles[Date.now() % titles.length],
            imgs[Date.now() % imgs.length]
        )
        this.showDialog("myapp-mediaItemDialogTemplate", {
            item: newItem,
            actionBindings: {
                // showPreview: ((event) => {
                //     alert("showPreview");
                //     // this.foobarbaz(event);
                // }),
                submitForm: ((event) => {
                    event.original.preventDefault();
                    newItem.create().then(() => {
                        this.addToListview(newItem);
                    });
                    this.hideDialog();
                })
            }
        });
    }

    deleteItem(item) {
        item.delete().then((item) => {
            this.removeFromListview(item);
        })
    }

    editItem(item) {
        this.showDialog("myapp-mediaItemDialogTemplate", {
            item: item,
            actionBindings: {
                submitForm: ((event) => {
                    event.original.preventDefault();
                    item.update().then(() => {
                        this.updateInListview(item._id, item);
                    });
                    this.hideDialog();
                }),
                deleteItem: ((event) => {
                    this.deleteItem(item);
                    this.hideDialog();
                })
            }
        });
    }

    /*
     * for views with listviews: react to the selection of a listitem
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemSelected(itemobj, listviewid) {
        // TODO: implement how selection of itemobj shall be handled
        // alert("Element " + itemobj.title + itemobj._id + " wurde ausgewählt!");
        // this.nextView("mediaReadview", {item: itemobj});
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
