/**
 * Created by glauber on 06/04/16.
 */
Ext.define('Sky.view.search.SearchModel', {
    extend: 'Ext.app.ViewModel',

    requires: [
        'Sky.store.Datasets',
        'Sky.store.Releases',
        'Sky.store.Tags'
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
