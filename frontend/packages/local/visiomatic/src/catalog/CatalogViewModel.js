/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('visiomatic.catalog.CatalogViewModel', {
    extend: 'Ext.app.ViewModel',

    requires: [
        'visiomatic.store.CatalogsTree',
        'visiomatic.model.CatalogTree',
        'visiomatic.store.Overlays',
        'visiomatic.store.FilterConditions',
        'common.model.Dataset'
    ],

    alias: 'viewmodel.catalogoverlay',

    stores: {
        catalogs: {
            type: 'catalogs-overlay-tree'
        },
        overlays: {
            type: 'overlays'
        }
    },

    data: {
        visiomatic: null,
        currentColor: '1dff00',
        currentFilters: null,
        drawEllipse: false
    },

    links: {
        currentCatalog: {
            type: 'visiomatic.model.CatalogTree',
            create: true
        },
        dataset: {
            type: 'common.model.Dataset',
            create: true
        }
    }
});
