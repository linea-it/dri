Ext.define('Explorer.view.coadd.CoaddModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.coadd',

    requires: [
        'Explorer.store.Products',
        'Explorer.store.Association',
        'Explorer.store.Objects',
        'common.store.Datasets',
        'common.model.Dataset',
        'Explorer.model.Product',


    ],

    data: {
        source: null,
        object_id: null,
        object_data: null,
        property_id: null,
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
        associations: {
            type: 'association'
        },
        objects: {
            type: 'objects'
        },
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
