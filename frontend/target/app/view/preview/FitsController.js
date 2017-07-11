Ext.define('Target.view.preview.FitsController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.fits_files',

    loadFits: function (tilename) {
        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            store = vm.getStore('fits_files');

        vm.set('tilename', tilename);

        store.filter([
            {
                property:'tilename',
                value: tilename
            },
        ]);
    },
});
