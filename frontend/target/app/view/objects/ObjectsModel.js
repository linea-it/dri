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
        'Target.store.ProductContent',
        'Target.store.ProductAssociation'
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
        productcontent: {
            type: 'product-content',
            storeId: 'ProductContent'
        },
        productassociation: {
            type: 'product-association',
            storeId: 'ProductAssociation'
        }
    },

    links: {
        currentCatalog: {
            type: 'Target.model.Catalog',
            create: true
        }
    }
});
