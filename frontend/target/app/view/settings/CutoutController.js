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
        console.log('onChangeCatalog(%o)', currentCatalog);
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
        console.log('onClickCreate');

        var me = this,
            win;

        win = me.lookupReference('winCutoutJobForm');

        if (!win) {
            win = Ext.create('Target.view.settings.CutoutJobForm',{
                reference: 'winCutoutJobForm',
                modal: true
            });

            me.getView().add(win);
        }

        win.show();

    },

    onCancelAddJob: function () {
        var me = this,
            win = me.lookup('winCutoutJobForm'),
            form = win.down('form');

        // Limpar o Form antes de fechar
        form.reset();

        win.close();

    },

    onSubmitJob: function () {
        // Criar uma entrada na tabela cutout jobs usar a store para isso
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            cutoutjobs = vm.getStore('cutoutjobs'),
            product = vm.get('currentCatalog'),
            win = me.lookup('winCutoutJobForm'),
            form = win.down('form'),
            values, job;

        if (form.isValid()) {

            win.setLoading(true);

            values = form.getValues();

            job = Ext.create('Target.model.CutoutJob', {
                cjb_product: product.get('id'),
                cjb_display_name: values.job_name,
                cjb_job_type: values.job_type,
                cjb_xsize: values.xsize,
                cjb_ysize: values.ysize,
                cjb_Blacklist: false
            });

            if (values.job_type == 'single') {
                // Se for job Single Epoch

                if (values.band) {
                    job.set('cjb_band', values.band.join());

                }

                if (values.no_blacklist) {
                    job.set('cjb_Blacklist', true);

                }

            } else {
                // Se for Coadd Images

                if ((values.tag) && (values.tag !== '')) {
                    job.set('cjb_tag', values.tag);

                }
            }

            // adicionar o record a store e fazer o sync
            cutoutjobs.add(job);

            cutoutjobs.sync({
                callback: function () {
                    // Reload a store com os jobs
                    cutoutjobs.load();

                    // Limpar o Formulario
                    form.reset();

                    // Remover o loading
                    win.setLoading(false);

                    // Fechar a Janela
                    win.close();
                }
            });
        }
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
