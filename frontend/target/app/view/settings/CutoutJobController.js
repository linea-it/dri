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
            { 'property': 'pcn_product_id', value: product.get('id') },
            { 'property': 'pca_setting', value: setting.get('cst_setting') }
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
        // Criar uma entrada na tabela cutout jobs. usa a store para isso
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            cutoutjobs = vm.getStore('cutoutjobs'),
            product = vm.get('currentProduct'),
            form = view.down('form'),
            values, job, flagImage, colors, properties;

        if (form.isValid()) {

            values = form.getValues();

            job = Ext.create('Target.model.CutoutJob', {
                cjb_product: product.get('id'),
                cjb_display_name: values.job_name,
                cjb_xsize: parseFloat(values.xsize),
                cjb_ysize: parseFloat(values.ysize),
                cjb_status: 'st', // Status Start
                cjb_description: values.cjb_description,
            });

            // Release
            if ((values.tag) && (values.tag !== '')) {
                job.set('cjb_tag', values.tag);
            }

            // Flag para indicar que ao menos uma imagem colorida precisa ser escolhida.
            flagImage = false;

            // Color Images Stiff
            if ((values.makeStiff === 'on') && (values.stiffColors)) {

                colors = Ext.isArray(values.stiffColors) ? values.stiffColors.join(';') : values.stiffColors;
                job.set('cjb_make_stiff', true);
                job.set('cjb_stiff_colors', colors.toLowerCase())

                flagImage = true;
            }

            // Color Images Lupton
            if ((values.makeLupton === 'on') && (values.luptonColors)) {

                colors = Ext.isArray(values.luptonColors) ? values.luptonColors.join(';') : values.luptonColors;
                job.set('cjb_make_lupton', true);
                job.set('cjb_lupton_colors', colors.toLowerCase())

                flagImage = true;
            }

            // Fits images
            if ((values.makeFits === 'on') && (values.fitsColors)) {

                colors = Ext.isArray(values.fitsColors) ? values.fitsColors.join('') : values.fitsColors;
                job.set('cjb_make_fits', true);
                job.set('cjb_fits_colors', colors.toLowerCase())
            }

            // Labels
            if ((values.label_properties)) {

                properties = Ext.isArray(values.label_properties) ? values.label_properties.join() : values.label_properties;
                job.set('cjb_label_position', values.label_position);
                job.set('cjb_label_colors', values.label_color);
                job.set('cjb_label_font_size', values.label_font_size);
                job.set('cjb_label_properties', properties);
            }

            if (!flagImage) {
                Ext.MessageBox.alert('Select a color image.', 'it is necessary to choose at least one color image.');
                return;
            }

            // TODO: Verificar a quantidade de imagens que serão geradas e avisar o usuario que pode demorar.

            view.setLoading(true);

            // adicionar o record a store e fazer o sync
            cutoutjobs.add(job);

            cutoutjobs.sync({
                success: function () {

                    // Limpar o Formulario
                    form.reset();

                    view.fireEvent('submitedjob', me);
                    Ext.GlobalEvents.fireEvent('eventregister', 'TargetViewer - create_mosaic');

                    // Fechar a Janela
                    view.close();

                    // Avisar o usuario que o Job foi submetido e será executado em background.
                    Ext.MessageBox.alert('Job was submitted', "The job will run in the background and you will be notified when it is finished.");
                },
                failure: function () {
                    // Avisar o usuario que Job falhou ao ser submetido.
                    Ext.MessageBox.alert('Failed to submit the job.', 'An error occurred and the Job was not submitted, please try again. if the error persists, let us know through the helpdesk.');
                },
                callback: function () {
                    // Reload a store com os jobs
                    cutoutjobs.load();

                    // Remover o loading
                    view.setLoading(false);
                }
            });
        }
    },

    onDeactive: function () {
        var me = this;

        if (me.taskReloadJobs) {
            Ext.TaskManager.stop(me.taskReloadJobs);
        }

    },

    onCheckAllFitsBands: function (checkbox, state) {
        var me = this,
            cbGroup = me.lookup('cbgFitsColor');

        cbGroup.eachBox(function (cb) {
            cb.setValue(state);

        }, me);
    },

    onCheckAllStiffBands: function (checkbox, state) {
        var me = this,
            cbGroup = me.lookup('cbgStiffColor');

        cbGroup.eachBox(function (cb) {
            cb.setValue(state);

        }, me);
    },

    onCheckAllLuptonBands: function (checkbox, state) {
        var me = this,
            cbGroup = me.lookup('cbgLuptonColor');

        cbGroup.eachBox(function (cb) {
            cb.setValue(state);

        }, me);
    },

});
