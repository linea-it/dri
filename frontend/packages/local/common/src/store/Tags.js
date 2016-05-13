Ext.define('common.store.Tags', {
    extend: 'common.store.MyStore',

    model: 'common.model.Tag',

    alias: 'store.tags',

    remoteFilter: true,

    remoteSort: true,

    proxy: {
        type: 'django',
        url: '/dri/api/tags/'
    },

    sorters: [{
        property: 'tag_display_name',
        direction: 'ASC'
    }]

});
