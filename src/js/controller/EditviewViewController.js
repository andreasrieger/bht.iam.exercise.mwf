/**
 * @author Jörn Kreutel
 */
import {mwf} from "vfh-iam-mwf-base";
import {mwfUtils} from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";

export default class EditviewViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller
    // viewProxy;

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        const myItem = new entities.MediaItem("lirem", "https://picsum.photos/100/200");
        // TODO: do databinding, set listeners, initialise the view
        const templateProxy = this.bindElement("myapp-editviewTemplate", {item: myItem}, this.root).viewProxy;

        templateProxy.bindAction("submitForm", (event) => {
            event.original.preventDefault();
            myItem.create(() => {
                    alert("submitting:" + myItem.title);
                }
            )
        });
        templateProxy.bindAction("showPreview", (event) => {
            const fileObj = event.original.target.files[0];
            if (fileObj) {

                if (true) {
                    const imgSrc = URL.createObjectURL(fileObj);
                    console.log("imgSrc: " + imgSrc);
                    myItem.src = imgSrc;
                    templateProxy.update({item: myItem});
                } else if (false) {
                    const fileReader = new FileReader();
                    fileReader.readAsDataURL(fileObj);
                    fileReader.onload = (e) => {
                        const imgSrc = fileReader.result;
                        myItem.src = e.target.result;
                        templateProxy.update({item: myItem});
                    }
                } else {
                    const imgDataForm = new FileReader();
                    imgDataForm.append("foobarbaz", fileObj);
                    const request = new XMLHttpRequest();
                    request.open("POST", "http://localhost:7077/api/upload");
                    request.send(imgDataForm);
                    request.onload = (e) => {
                        const responseText = e.target.responseText;
                        const responseObj = JSON.parse(responseText);
                        const imgSrc = "http://localhost:7077/api/upload/" + responseObj.data.foobarbaz;
                        myItem.src = imgSrc;
                        templateProxy.update({item: myItem});
                    }
                    // imgDataForm.readAsDataURL(fileObj);
                    // imgDataForm.onload = (e) => {
                    //     const imgSrc = e.target.result;
                    //     myItem.src = imgSrc;
                    //     templateProxy.update({item: myItem});
                    //     myItem.create(()=>alert("created: " + myItem.title))
                    // }
                }
            }

        });

        // call the superclass once creation is done
        super.oncreate();
    }


    constructor() {
        super();

        console.log("EditviewViewController()");
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
