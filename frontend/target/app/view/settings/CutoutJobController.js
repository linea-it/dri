Ext.define('Target.view.settings.CutoutJobController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.cutoutjob',

    listen: {
        component: {
            'target-cutoutjob-form': {
                changeproduct: 'onChangeProduct'
            }
        }
    },

    onChangeProduct: function (product) {
        var me = this,
            vm = me.getViewModel(),
            contents = vm.getStore('contents');

        vm.set('currentProduct', product);

        contents.addFilter({
            property: 'pcn_product_id',
            value: product.get('id')
        });

        contents.load();
    },

    onCancelAddJob: function () {
        var me = this,
            win = me.getView(),
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
            product = vm.get('currentProduct'),
            form = view.down('form'),
            values, job;

        if (form.isValid()) {

            // view.setLoading(true);

            values = form.getValues();

            console.log(values);

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

            if ((values.label_properties) && (values.label_properties.length > 0)) {
                job.set('cjb_label_position', values.label_position);
                job.set('cjb_label_properties', values.label_properties.join());

            }

            console.log('job', '=', job);

            // adicionar o record a store e fazer o sync
            cutoutjobs.add(job);

            cutoutjobs.sync({
                callback: function () {
                    // Reload a store com os jobs
                    cutoutjobs.load();

                    // Limpar o Formulario
                    form.reset();

                    // Remover o loading
                    view.setLoading(false);

                    view.fireEvent('submitedjob', me);

                    // Fechar a Janela
                    view.close();
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
