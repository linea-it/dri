/**
 *
 */
Ext.define('Tile.view.eyeballing.EyeballingModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.eyeballing',

    requires: [
        'Tile.store.Releases',
        'Tile.store.Datasets',
        'Tile.store.Footprints',
        'Tile.store.Surveys',
        'Tile.store.Tags',
        'Tile.store.Flaggeds',
        'Tile.store.Features',
        'Tile.store.Defects',
        'Tile.store.Filters',
        'Tile.model.Release',
        'Tile.model.Tag',
        'Tile.model.Dataset',
        'Tile.model.Flagged',
        'Tile.model.Defect'
    ],

    data: {
        release: null
    },

    links: {
        currentRelease: {
            type: 'Tile.model.Release',
            create: true
        },
        currentTag: {
            type: 'Tile.model.Tag',
            create: true
        },
        currentDataset: {
            type: 'Tile.model.Dataset',
            create: true
        },
        flagged: {
            type: 'Tile.model.Flagged',
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
