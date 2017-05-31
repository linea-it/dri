Ext.define('Target.view.settings.CutoutController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.cutout',

    listen: {
        component: {
            'targets-cutout': {
                changecatalog: 'onChangeCatalog',
                deactivate: 'onDeactive',
                beforedestroy:  'onDeactive'
            }
        }
    },

    onChangeCatalog: function (currentCatalog) {
        var me = this,
            vm = me.getViewModel(),
            cutoutjobs = vm.getStore('cutoutjobs');

        vm.set('currentCatalog', currentCatalog);

        cutoutjobs.addFilter({
            property: 'cjb_product',
            value: currentCatalog.get('id')
        });

        cutoutjobs.load();

        me.taskReloadJobs = Ext.TaskManager.start({
            run: me.reloadJobs,
            interval: 10000,
            // repeat: 10,
            scope: me
        });

    },

    reloadJobs: function () {
        var me = this,
            vm = me.getViewModel(),
            cutoutjobs = vm.getStore('cutoutjobs');

        cutoutjobs.load();
    },

    onClickCreate: function () {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            win;

        win = me.lookupReference('winCutoutJobForm');

        if (!win) {
            win = Ext.create('Target.view.settings.CutoutJobForm',{
                reference: 'winCutoutJobForm',
                modal: true
            });

            me.getView().add(win);
        }

        win.getViewModel().set('currentCatalog', currentCatalog);

        win.show();

    },

    // onClickDownload: function () {
    //     console.log('onClickDownload');

    //     // Criar um arquivo com as urls para download das imagens
    //     // parecido com o que usamos para baixar do descut mas
    //     // com as nossas urls.

    // }
    onDeactive: function () {
        var me = this;

        if (me.taskReloadJobs) {
            Ext.TaskManager.stop(me.taskReloadJobs);
        }

    },

    onCheckAllBands: function (checkbox, state) {
        var me = this,
            cbGroup = me.lookup('cbgBands');

        cbGroup.eachBox(function (cb) {
            cb.setValue(state);

        }, me);

    }
});
