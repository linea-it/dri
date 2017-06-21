/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('Target.view.catalog.CatalogModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.catalog',

    requires: [
        'Target.model.Catalog',
        'Target.store.CatalogsTree',
        'Target.store.Products',
        'Target.store.Bookmarks'
    ],

    stores: {
        catalogs: {
            type: 'catalogs-tree'
        },
        products: {
            type: 'products'
        },
        bookmarks: {
            type: 'bookmarks',
            autoLoad: false
        }
    },

    links: {
        selectedCatalog: {
            type: 'Target.model.Catalog',
            create: true
        }
    }
});
