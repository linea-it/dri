/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('Target.view.catalog.CatalogModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.catalog',

    requires: [
        'Target.model.Catalog',
        'Target.store.CatalogsTree'

    ],

    stores: {
        catalogs: {
            type: 'catalogs-tree'
        }

    },

    links: {
        selectedCatalog: {
            type: 'Target.model.Catalog',
            create: true
        }
    }
});
