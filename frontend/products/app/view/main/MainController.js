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
            gridfield = refs.catalogs,
            store = gridfield.getStore();

        //console.log(release)
        id = record.getData().id
        console.log(store)

        store.filter([
            {
                property: "releases",
                value: id
            }
        ])
    },
    onSelectType: function(combo, record){
        var refs = this.getReferences(),
            gridcatalogs = refs.catalogs,
            bandcombo = refs.bands,
            store = gridcatalogs.getStore();
        store.removeFilter("band", false)
        bandcombo.clearValue()
        //console.log(release)
        id = record.getData().id
        console.log(store)

        store.filter([
            {
                property: "group_id",
                value: id
            }
        ])
    },
    ClearRelease: function(comboRelease){
        var refs = this.getReferences(),
            gridcatalogs = refs.catalogs,
            store = gridcatalogs.getStore();
        store.removeFilter("releases", false)
        comboRelease.clearValue()
    },
    clearType: function(comboType){
        var refs = this.getReferences(),
            gridcatalogs = refs.catalogs,
            store = gridcatalogs.getStore();
        store.removeFilter("group_id", false)
        comboType.clearValue()
    },
    clearBand: function(comboBand){
        var refs = this.getReferences(),
            gridcatalogs = refs.catalogs,
            store = gridcatalogs.getStore();
        store.removeFilter("band", false)
        comboBand.clearValue()
    },
    clearFilters: function(){
        var refs = this.getReferences(),
            gridcatalogs = refs.catalogs,
            bandcombo = refs.bands,
            releasefield = refs.releasefield,
            type = refs.type,
            store = gridcatalogs.getStore();
        store.clearFilter()
        bandcombo.clearValue()
        releasefield.clearValue()
        type.clearValue()
    },
    onSelectBand: function(combo, record){
        var refs = this.getReferences(),
            gridcatalogs = refs.catalogs,
            store = gridcatalogs.getStore();

        //console.log(release)
        filter = record.getData().filter
        console.log(filter)

        store.filter([
            {
                property: "band",
                value: filter
            }
        ])
    },
    loadProducts: function(){
        var refs = this.getReferences(),
            gridcatalogs = refs.catalogs,
            store = gridcatalogs.getStore(); 
        store.load()
    }
});
