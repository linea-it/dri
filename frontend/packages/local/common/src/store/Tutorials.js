Ext.define('common.store.Tutorials', {
    extend: 'common.store.MyStore',

    alias: 'store.tutorials',

    fields: ['id', 'application', 'application_display_name', 'ttr_title', 'ttr_src', 'ttr_description'],

    remoteSort: true,

    remoteFilter: true,

    autoLoad: false,

    pageSize: 0,

    proxy: {
        type: 'django',
        url: '/dri/api/tutorial/'
    }

});
