Ext.define('visiomatic.download.FitsController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.fits-files',

    listen: {
        component: {
            'target-download-descut': {
                changeLoadFits: 'onChangeLoadFits'
            }
        }
    },

    listen: {
        component: {
            'target-download-descut': {
                changeLoadFits: 'onChangeLoadFits'
            }
        }
    },

    onChangeLoadFits: function (result) {
        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            store = vm.getStore('fitsFiles');

        store.filter([
            {
                property:'result',
                value: result
            },
        ]);
    }
});
