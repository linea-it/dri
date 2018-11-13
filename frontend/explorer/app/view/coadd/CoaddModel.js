Ext.define('Explorer.view.coadd.CoaddModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.coadd',

    requires: [
        'Explorer.store.Products',
        'Explorer.store.Association',
        'Explorer.store.Objects',
        'common.store.Surveys',
        'common.store.Tags',
        'common.store.Footprints',
        'common.store.Datasets',
        'common.model.Dataset',
        'Explorer.model.Product',
        'Explorer.store.SpectralDistributions'
    ],

    data: {
        source: null,
        object_id: null,
        object_data: null,
        property_id: null,
        position: null
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
        },
        // Surveys = Imagens que estao disponiveis para um release
        surveys: {
            type: 'surveys'
        },

        // Tags = Tags associados ao Release
        tags: {
            type: 'tags',
            storeId: 'Tags'
        },
        // Tile = Uma instancia reduzida de um dataset somente informacoes das coordenadas
        // de cada tile.
        tiles: {
            type: 'footprints',
            pageSize: 0
        },

        spectral: {
            type: 'spectral-distribution'
        }
    }
});
