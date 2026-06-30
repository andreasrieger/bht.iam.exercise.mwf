/**
 * @author Jörn Kreutel
 */
import { mwf } from "vfh-iam-mwf-base";
import { mwfUtils } from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";
import { GenericDialogTemplateViewController } from "vfh-iam-mwf-base";

export default class EditDialogViewController extends GenericDialogTemplateViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller

    /*
     * for any view: initialise the view
     */
    async onresume() {

        await super.onresume();

        // TODO: do databinding, set listeners, initialise the view
        const myItem = this.args.item;
        const templateProxy = this.root.viewProxy;
        let fileObj = null;

        templateProxy.bindAction("showPreview", (event) => {
            fileObj = event.original.target.files[0];
            if (fileObj) {
                const imgSrc = URL.createObjectURL(fileObj);
                if (!myItem.title) {
                    myItem.title = fileObj.name.replace(/\.([^.]*)$/, "");
                }
                myItem.src = imgSrc;
                templateProxy.update({ item: myItem });
            }
        });

        templateProxy.bindAction("submitForm", (event) => {
            event.original.preventDefault();
            const remoteStorageCheckbox = this.root.querySelector("#editRemoteStorage");
            remoteStorageCheckbox.checked = !!myItem.remote;
            // myItem.remote = remoteStorageCheckbox.checked;
            if (myItem.remote) {
                //myItem will be stored remotely
                const imgDataForm = new FormData();
                imgDataForm.append("my_own_imgSrc_data", fileObj);
                const request = new XMLHttpRequest();
                request.open("POST", "http://localhost:7077/api/upload");
                request.send(imgDataForm);
                request.onload = () => {
                    const responseText = request.responseText;
                    console.log("responseText: " + responseText);
                    const responseObj = JSON.parse(responseText);
                    const imgSrc = "http://localhost:7077/" + responseObj.data.my_own_imgSrc_data;
                    myItem.src = imgSrc;
                    myItem.update().then(() => {
                        this.args.onUpdated?.(myItem);
                        this.hideDialog();
                    });
                }
            } else {
                // myItem will be stored locally
                myItem.imgFile = fileObj;
                myItem.update().then(() => {
                    this.args.onUpdated?.(myItem);
                    this.hideDialog();
                });
            }
        });

        templateProxy.bindAction("deleteItem", (event) => {
            this.showDialog("myapp-deleteDialogTemplate", {
                item: myItem,
                onDeleted: (deletedItem) => {
                    this.args.onDeleted?.(deletedItem);
                    this.hideDialog();
                }
            });
        });

    }


    constructor() {
        super();
        console.log("EditviewViewController()");
    }


}
