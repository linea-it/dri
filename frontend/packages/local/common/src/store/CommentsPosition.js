Ext.define('common.store.CommentsPosition', {
    extend: 'common.store.MyStore',

    alias: 'store.comments-position',

    requires: [
        'common.model.CommentPosition'
    ],

    model: 'common.model.CommentPosition',

    remoteFilter: true,

    remoteSort: true,

    autoLoad: false,

    proxy: {
        type: 'django',
        url: '/dri/api/comment/position/'
    },

    sorters: [{
        property: 'date',
        direction: 'DESC'
    }]
});
