/**
 *
 */
Ext.define('Tile.view.home.HomeModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.home',

    requires: [
        'Tile.store.Releases',
        'Tile.store.Datasets',
        'Tile.store.Footprints',
        'Tile.store.Surveys',
        'Tile.model.Release',
        'Tile.store.Tags',
        'Tile.model.Dataset'
    ],

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
            type: 'releases'
        },
        // Tags = esta store e filtrada localmente e possui todos os tags
        // independente de release.
        tags: {
            type: 'tags',
            storeId: 'AllTags',
            autoLoad: true,
            remoteFilter: false
        }, 

        // Datasets = Tiles que estao nos tags de um release 
        // esta store e paginada       
        datasets: {
            type: 'datasets'
        },
        // Surveys = Imagens que estao disponiveis para um release
        surveys: {
            type: 'surveys'
        },

        tagsbyrelease: {
            type: 'tags'
        }, 

        tiles: {
            type: 'footprints',
            pageSize: 0
        }

    }

});
