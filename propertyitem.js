
class PropertyItem {
    // propertyinfo contains uic, item, model, sn, location, quantity, date, and notes
    constructor(uic, lin, nsn, nomenclature, ui, oh_qty, sn, date_seen, notes, monthly_cyclic) {
        this.uic = uic;
        this.lin = lin;
        this.nsn = nsn;
        this.nomenclature = nomenclature;
        this.ui = ui;
        this.oh_qty = oh_qty;
        this.sn = sn;
        this.date_seen = date_seen;
        this.notes = notes;
        this.monthly_cyclic = monthly_cyclic;
    }

    displaySingleSnItems() {
        var singleSnOut = {};
        singleSnOut.count = this.sn.length;
        singleSnOut.items = [];
        
        // if the SN array length is 0, then output the item
        if (this.sn.length == 0) {
            singleSnOut.count = 1;
            singleSnOut.items.push(new PropertyItem(
                this.uic,
                this.lin,
                this.nsn,
                this.nomenclature,
                this.ui,
                this.oh_qty,
                "",
                "",
                "",
                "",
            ))
            return singleSnOut;
        }

        for (let index = 0; index < this.sn.length; index++) {
            singleSnOut.items.push(new PropertyItem(
                this.uic,
                this.lin,
                this.nsn,
                this.nomenclature,
                this.ui,
                1,
                this.sn[index],
                "",
                "",
                "",
            ))
        }
        return singleSnOut;
    }
}

export { PropertyItem };


