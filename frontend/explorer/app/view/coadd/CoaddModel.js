Ext.define('Explorer.view.coadd.CoaddModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.coadd',

    requires: [
        'Explorer.store.CoaddObject',
        'common.model.Dataset',
        'common.store.Datasets'
    ],

    data: {
        source: null,
        object_id: null,
        coaddObject: null
    },

    links: {
        currentDataset: {
            type: 'common.model.Dataset',
            create: true
        }
    },

    stores: {
        coaddObject: {
            type: 'coaddobject',
            storeId: 'coaddObject'
        },
        properties: {
            type: 'array',
            fields: ['property', 'value']
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
