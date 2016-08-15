Ext.define('Sky.model.Dataset', {

    extend: 'common.model.Dataset',

    requires: [
        'common.data.proxy.Django'
    ],

    proxy: {
        type: 'django',
        url: '/dri/api/dataset/',
        reader: {
            type: 'json'
        }
    }

});
