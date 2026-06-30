/**
 * @author Jörn Kreutel
 */
import { mwf } from "vfh-iam-mwf-base";
import { mwfUtils } from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";
import { GenericDialogTemplateViewController } from "vfh-iam-mwf-base";


export default class DeleteDialogViewController extends GenericDialogTemplateViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller
    // viewProxy;

    /*
     * for any view: initialise the view
     */
    async onresume() {

        await super.onresume();

        console.log("DeleteDialogViewController.onresume(): ", this.args, this.root);

        // TODO: do databinding, set listeners, initialise the view
        const item = this.args.item;
        const templateProxy = this.root.viewProxy;

        templateProxy.bindAction("deleteItem", (event) => {
            event.original.preventDefault();
            item.delete().then(() => {
                this.hideDialog();
                this.args.onDeleted?.(item);
            })
        });

        templateProxy.bindAction("cancelForm", (event) => {
            event.original.preventDefault();
            this.hideDialog();
        });

    }


    constructor() {
        super();

        console.log("DeleteDialogViewController()");
    }


}
