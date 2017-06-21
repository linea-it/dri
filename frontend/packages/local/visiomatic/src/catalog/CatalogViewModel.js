/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('visiomatic.catalog.CatalogViewModel', {
    extend: 'Ext.app.ViewModel',

    requires: [
        'visiomatic.store.CatalogsTree',
        'visiomatic.model.CatalogTree'
    ],

    alias: 'viewmodel.catalogoverlay',

    stores: {
        catalogs: {
            type: 'catalogs-overlay-tree'
        },
    }

});
