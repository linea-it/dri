Ext.define('Explorer.view.system.SystemModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.system',

    requires: [
        'Explorer.store.Products',
        'Explorer.store.Objects',
        'Explorer.model.Product',
        'common.model.Dataset'
    ],

    data: {
        source: null,
        object_id: null,
        object: null
    },

    links: {
        currentProduct: {
            type: 'Explorer.model.Product',
            create: true
        },
        currentDataset: {
            type: 'common.model.Dataset',
            create: true
        }
    },

    stores: {
        products: {
            type: 'products'
        },
        objects: {
            type: 'objects'
        },
        // coaddObject: {
        //     type: 'coaddobject',
        //     storeId: 'coaddObject'
        // },
        properties: {
            type: 'array',
            fields: ['property', 'value'],
            remoteSort: false,
            remoteFilter: false,
            sorters: [{
                property: 'property',
                direction: 'ASC'
            }]
        },
        datasets: {
            type: 'datasets',
            storeId: 'datasets',
            remoteSort: false,
            sorters: [{
                property: 'id',
                direction: 'DESC'
            }]
        }
    }
});
