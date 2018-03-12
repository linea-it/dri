Ext.define('Explorer.view.system.SystemModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.system',

    requires: [
        'Explorer.store.Products',
        'Explorer.store.Objects',
        'Explorer.model.Product',
        'Explorer.store.Association',
        'Explorer.store.ProductDisplayContents',
        'common.model.Dataset',
        'common.store.Surveys',
        'common.store.Tags',
        'common.store.Footprints',
        'common.store.Datasets',
    ],

    data: {
        source: null,
        object_id: null,
        display_ra: '',
        display_dec: '',
        display_radius: '',
        object: null,
        object_data: null,
        property_id: null,
        overlayMembers: null,
        position: null,
        have_members: false,
        selected_member: null,
        have_vac: false,
        visibleOverlayVacs: true,
        overlayVac: null,
        vacRadius: 1,
        vacOverlayColor: '1B81BC',
        vacOverlayPointSize: 1.2,
        vacOverlaypointType: 'square'
    },

    links: {
        currentProduct: {
            type: 'Explorer.model.Product',
            create: true
        },
        currentDataset: {
            type: 'common.model.Dataset',
            create: true
        },
        currentVacProduct: {
            type: 'Explorer.model.Product',
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
        members: {
            type: 'objects'
        },
        displayContents: {
            type: 'product-display-contents'
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

        vacProducts: {
            type: 'products'
        },
        vacProductDisplayContents: {
            type: 'product-display-contents'
        },
        vacObjects: {
            type: 'objects',
            pageSize: 2000
        },
    }
});
