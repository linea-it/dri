Ext.define('aladin.store.Images', {
    extend: 'common.store.MyStore',

    alias: 'store.aladin_images',

    requires: [
        'common.data.proxy.Django',
        'aladin.model.Image'
    ],

    model: 'aladin.model.Image',

    autoLoad: false,
    pageSize: 0,
    remoteFilter: true,

    proxy: {
        type: 'django',
        url: '/dri/api/aladin/image/'
    },
});
