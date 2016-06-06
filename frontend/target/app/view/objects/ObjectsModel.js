/**
 * This class is the view model for the Main view of the application.
 */
Ext.define('Target.view.objects.ObjectsModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.objects',

    requires: [
        'Target.model.Catalog',
        'Target.model.CatalogObject',
        'Target.store.Tiles',
        'Target.store.Objects',
        'Target.store.CatalogColumns',
        'Target.store.CatalogClassColumns'
    ],

    data: {
        tag_id: 0,
        field_id: 0,
        catalog: 0
    },

    stores: {
        tiles: {
            type: 'catalog-tiles'
        },
        objects: {
            type: 'targets-objects',
            storeId: 'objects'
        },
        catalogColumns: {
            type: 'catalog-columns',
            storeId: 'catalogColumns'
        },
        catalogClassColumns: {
            type: 'catalog-class-columns',
            storeId: 'catalogClassColumns'
        }
    },

    links: {
        currentCatalog: {
            type: 'Target.model.Catalog',
            create: true
        }
    }
});
