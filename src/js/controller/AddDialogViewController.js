/**
 * @author Jörn Kreutel
 */
import {mwfUtils} from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";
import {GenericDialogTemplateViewController} from "vfh-iam-mwf-base";
import ExifReader from "exifreader";

export default class AddDialogViewController extends GenericDialogTemplateViewController {

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
            console.log("showPreview");
            fileObj = event.original.target.files[0];
            if (fileObj) {
                const imgSrc = URL.createObjectURL(fileObj);
                console.log("imgSrc: " + imgSrc);
                myItem.title = fileObj.name.replace(/\.([^.]*)$/, "");
                myItem.src = imgSrc;

                const metadata = ExifReader.load(fileObj);
                metadata.then((exifData) => {
                    console.log("exifData: ", exifData);
                    if (exifData.GPSLatitude?.description) {
                        const lat = exifData.GPSLatitude.description;
                        const lng = exifData.GPSLongitude.description;
                        console.log("lat: " + lat + ", lng: " + lng);
                    }
                    myItem.exif = exifData;
                    templateProxy.update({item: myItem});
                })
            }
        });

        templateProxy.bindAction("submitForm", (event) => {
            event.original.preventDefault();
            const remoteStorageCheckbox = event.original.target.querySelector("#addRemoteStorage");
            myItem.remote = remoteStorageCheckbox.checked;
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
                    myItem.create().then(() => {
                        this.args.onUpdated?.(myItem);
                        this.hideDialog();
                    });
                }
            } else {
                // myItem will be stored locally
                myItem.imgFile = fileObj;
                myItem.create().then(() => {
                    this.args.onUpdated?.(myItem);
                    this.hideDialog();
                });
            }
            ;
        });
    }

    constructor() {
        super();
        console.log("AddDialogViewController()");
    }

}
