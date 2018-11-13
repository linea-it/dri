Ext.define('Target.view.settings.CutoutJobController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.cutoutjob',

    listen: {
        component: {
            'target-cutoutjob-form': {
                changeproduct: 'onChangeProduct',
                changesetting: 'onChangeSetting'
            }
        },
        store: {
            '#Contents': {
                load: 'onLoadContents'
            }
        }
    },

    onChangeProduct: function (product) {
        var me = this,
            vm = me.getViewModel(),
            contents = vm.getStore('contents');

        vm.set('currentProduct', product);

        contents.removeAll();
        contents.clearFilter(true);

        contents.addFilter({
            property: 'pcn_product_id',
            value: product.get('id')
        });

        contents.load();
    },

    onChangeSetting: function (setting) {
        var me = this,
            vm = me.getViewModel(),
            product = vm.get('currentProduct'),
            contents = vm.getStore('contents');

        vm.set('currentSetting', setting);

        contents.addFilter([
            {'property': 'pcn_product_id', value: product.get('id')},
            {'property': 'pca_setting', value: setting.get('cst_setting')}
        ]);

    },

    onLoadContents: function (store) {
        this.addContentsToField(store);

    },

    addContentsToField: function (store) {
        var me = this,
            vm = me.getViewModel(),
            auxcontents = vm.get('auxcontents');

        store.each(function (record) {
            if (record.get('is_visible') === true) {
                auxcontents.add(record);

            }

        }, store);
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

            view.setLoading(true);

            values = form.getValues();

            job = Ext.create('Target.model.CutoutJob', {
                cjb_product: product.get('id'),
                cjb_display_name: values.job_name,
                cjb_job_type: values.job_type,
                cjb_xsize: parseFloat(values.xsize / 60).toFixed(3),
                cjb_ysize: parseFloat(values.ysize / 60).toFixed(3),
                cjb_Blacklist: false,
                cjb_status: 'st', // Status Start
                cjb_description: values.cjb_description,
                cjb_image_formats: values.image_formats
            });

            if (values.job_type == 'single') {
                // Se for job Single Epoch

                if (values.band) {
                    try {
                        job.set('cjb_band', values.band.join());
                    }
                    catch (err) {
                        job.set('cjb_band', values.band);
                    }
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
                job.set('cjb_label_colors', values.label_color);
                job.set('cjb_label_font_size', values.label_font_size);

                job.set('cjb_label_properties', values.label_properties.join().toLowerCase());

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
                    view.setLoading(false);

                    view.fireEvent('submitedjob', me);
                    Ext.GlobalEvents.fireEvent('eventregister','TargetViewer - create_mosaic');

                    // Fechar a Janela
                    me.afterSubmitJob(view);
                }
            });
        }
    },


    afterSubmitJob: function (view) {
        // console.log('afterSubmitJob(%o)', view);
        var me = this,
            objectsCount = view.getObjectsCount(),
            maxObjects = view.getMaxObjects();

        view.close();

        // Checar a quantidade de objetos na lista se for maior que 100
        // Mostar um popup informando a limitiacao do sistema
        if (objectsCount > maxObjects) {
            Ext.MessageBox.alert(
                '',
                "The cutout tool has currently a limit of "+maxObjects+" objects. We are working to fix this limitation.<br>"+
                "The job will run in the background and you will be notified when it is finished.");
        } else {
            Ext.MessageBox.alert(
               '',
               "The job will run in the background and you will be notified when it is finished.");
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
//
