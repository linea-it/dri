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
        'Tile.model.Release',
        'Tile.store.Tags',
        'Tile.model.Dataset'
    ],

    data: {
        release: null
    },

    links: {
        currentRelease: {
            type: 'Tile.model.Release',
            create: true
        },
        currentDataset: {
            type: 'Tile.model.Dataset',
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

        tiles: {
            type: 'footprints',
            pageSize: 0
        }

    }

});
