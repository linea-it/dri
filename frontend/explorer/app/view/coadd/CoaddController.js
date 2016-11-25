Ext.define('Explorer.view.coadd.CoaddController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.coadd',

    listen: {
        component: {
            'coadd-objects': {
                loadpanel: 'onLoadPanel'
            }
        }
    },

    onLoadPanel: function () {
        console.log('onLoadPanel');

    }

});
