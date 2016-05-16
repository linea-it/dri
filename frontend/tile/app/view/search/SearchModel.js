/**
 * Created by glauber on 06/04/16.
 */
Ext.define('Tile.view.search.SearchModel', {
    extend: 'Ext.app.ViewModel',

    requires: [
        'Tile.store.Datasets',
        'Tile.store.Releases',
        'Tile.store.Tags'
    ],

    alias: 'viewmodel.search',

    stores: {
        releases: {
            type: 'releases',
            storeId: 'search-releases',
            autoLoad: true
        },
        tags: {
            type: 'tags',
            storeId: 'search-tags',
            autoLoad: true
        },
        search: {
            type: 'datasets',
            storeId: 'search-tiles',
            pageSize: 0
        }
    }
});
