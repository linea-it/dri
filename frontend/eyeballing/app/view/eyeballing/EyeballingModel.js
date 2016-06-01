/**
 *
 */
Ext.define('Eyeballing.view.eyeballing.EyeballingModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.eyeballing',

    requires: [
        'Eyeballing.store.Releases',
        'Eyeballing.store.Datasets',
        'Eyeballing.store.Footprints',
        'Eyeballing.store.Surveys',
        'Eyeballing.store.Tags',
        'Eyeballing.store.Flaggeds',
        'Eyeballing.store.Features',
        'Eyeballing.store.Defects',
        'Eyeballing.store.Filters',
        'Eyeballing.model.Release',
        'Eyeballing.model.Tag',
        'Eyeballing.model.Dataset',
        'Eyeballing.model.Flagged',
        'Eyeballing.model.Defect'
    ],

    data: {
        release: null
    },

    links: {
        currentRelease: {
            type: 'Eyeballing.model.Release',
            create: true
        },
        currentTag: {
            type: 'Eyeballing.model.Tag',
            create: true
        },
        currentDataset: {
            type: 'Eyeballing.model.Dataset',
            create: true
        },
        flagged: {
            type: 'Eyeballing.model.Flagged',
            create: true
        }
    },

    stores: {
        filters: {
            type: 'filters'
        },

        // Releases  = Todos os releases disponiveis.
        releases: {
            type: 'releases',
            storeId: 'Releases',
            autoLoad: false,
            remoteFilter: true
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

        // Datasets = Tiles que estao nos tags de um release
        datasets: {
            type: 'datasets'
        },

        // Tile = Uma instancia reduzida de um dataset somente informacoes das coordenadas
        // de cada tile.
        tiles: {
            type: 'footprints',
            pageSize: 0
        },

        flaggeds: {
            type: 'flaggeds'
        },

        features: {
            type: 'features',
            storeId: 'Features'
        },

        defects: {
            type: 'defects'
        }

    }

});
