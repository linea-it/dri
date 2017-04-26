Ext.define('Target.view.cutout.CutoutJobController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.cutoutjob',

    listen: {
        component: {
            'targets-cutoutjob': {
                changecatalog: 'onChangeCatalog'
            }
        }
        // store: {
        //     '#Users': {
        //         load: 'onLoadUsers'
        //     },
        // }
    },

    onChangeCatalog: function (currentCatalog) {
        var me = this,
            vm = me.getViewModel(),
            cutoutjobs = vm.getStore('cutoutjobs');

        vm.set('currentCatalog', currentCatalog);

        cutoutjobs.addFilter([
            {'property': 'cjb_product', value: currentCatalog.get('id')}
        ]);

        cutoutjobs.load();

    },

    onClickCreate: function () {
        console.log('onClickCreate');

        var me = this,
            win;

        win = me.lookupReference('winAddJob');

        if (!win) {
            win = Ext.create('Target.view.cutout.AddJobWindow',{});

            me.getView().add(win);
        }

        win.show();

    },

    onCancelAddJob: function () {
        console.log('onCancelAddJob');
        var me = this;

        // TODO limpar os Forms antes de fechar
        // me.lookupReference('AddJobForm').getForm().reset();

        me.lookupReference('winAddJob').close();

    },

    onSubmitAddJob: function () {
        console.log('onSubmitAddJob');

        // Criar uma entrada na tabela cutout jobs usar a store para isso
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            cutoutjobs = vm.getStore('cutoutjobs'),
            product = vm.get('currentCatalog'),
            job;

        view.setLoading(true);

        // TODO Fazer o parse dos valores do formulario

        // TODO criar um record cutoutjob
        job = Ext.create('Target.model.CutoutJob', {
            cjb_product: product.get('id')
            // prm_user: user,
            // prm_workgroup: null
        });

        // adicionar o record a store e fazer o sync
        cutoutjobs.add(job);

        cutoutjobs.sync({
            callback: function () {
                // Reload a store com os jobs
                cutoutjobs.load();

                // Limpar o Formulario
                me.lookupReference('AddJobForm').getForm().reset();

                // Fechar a Janela
                me.lookupReference('winAddJob').close();

                // Remover o loading
                view.setLoading(false);
            }
        });

    },

    onClickDownload: function () {
        console.log('onClickDownload');

        // Criar um arquivo com as urls para download das imagens
        // parecido com o que usamos para baixar do descut mas
        // com as nossas urls.

    }

});
