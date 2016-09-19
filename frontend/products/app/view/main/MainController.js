/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Products.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',

    onItemSelected: function (sender, record) {
        Ext.Msg.confirm('Confirm', 'Are you sure?', 'onConfirm', this);
    },

    onConfirm: function (choice) {
        if (choice === 'yes') {
            //
        }
    },

    onSelectRelease: function(combo, record){
        var refs = this.getReferences(),
            gridfield = refs.field,
            store = gridfield.getStore();

        //console.log(release)
        id = record.getData().id
        console.log(store)

        store.filter([
            {
                property: "tag_release",
                value: id
            }
        ])
    },
    onSelectType: function(combo, record){
        var refs = this.getReferences(),
            gridcatalogs = refs.catalogs,
            store = gridcatalogs.getStore();

        //console.log(release)
        name = record.getData().pgr_display_name
        console.log(store)

        store.filter([
            {
                property: "pgr_display_name",
                value: name
            }
        ])
    },
});
