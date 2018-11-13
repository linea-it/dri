/**
 *
 */
Ext.define('Sky.view.footprint.FootprintModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.footprint',

    requires: [
        'Sky.store.Releases',
        'Sky.store.Datasets',
        'Sky.store.Footprints',
        'Sky.store.Surveys',
        'Sky.store.Tags',
        'Sky.model.Release',
        'Sky.model.Tag',
        'Sky.model.Dataset'
    ],

    data: {
        release: null
    },

    links: {
        currentRelease: {
            type: 'Sky.model.Release',
            create: true
        },
        currentTag: {
            type: 'Sky.model.Tag',
            create: true
        },
        currentDataset: {
            type: 'Sky.model.Dataset',
            create: true
        }
    },

    stores: {
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

        tagsbyrelease: {
            type: 'tags'
        }
    }

});
