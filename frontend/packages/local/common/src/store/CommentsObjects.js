Ext.define('common.store.CommentsObjects', {
    extend: 'common.store.MyStore',

    alias: 'store.comments-objects',

    remoteFilter: true,

    remoteSort: true,

    autoLoad: false,

    proxy: {
        type: 'django',
        url: '/dri/api/objectscomments/'
    },

    sorters: [{
        property: 'date',
        direction: 'DESC'
    }]
});
