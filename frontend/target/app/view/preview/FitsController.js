Ext.define('Target.view.preview.FitsController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.fits-files',

    listen: {
          component: {
              'target-download-descut': {
                  changeLoadFits: 'onChangeLoadFits',
              }
      }
    },

    listen: {
        component: {
            'target-download-descut': {
                changeLoadFits: 'onChangeLoadFits'
            }
        },
    },

    onChangeLoadFits: function(tilename) {
        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            store = vm.getStore('fitsFiles');

        vm.set('tilename', tilename);

        store.filter([
            {
                property:'tilename',
                value: tilename
            }
        ]);
    },
});
