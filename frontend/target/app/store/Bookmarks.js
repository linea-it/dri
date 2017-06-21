Ext.define('Target.store.Bookmarks', {
    extend: 'common.store.MyStore',

    alias: 'store.bookmarks',

    requires: [
        'Target.model.Bookmarked'
    ],

    model: 'Target.model.Bookmarked',

    remoteFilter: true,

    pageSize: 0,

    proxy: {
        url: '/dri/api/bookmarked/'
    },

    sorters: [
        {
            property: 'id',
            direction: 'ASC'
        }
    ]

});
