/**
 *
 */
Ext.define('Target.view.objects.ObjectsController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.objects',

    /**
     * @requires Target.view.catalog.Export
     */
    requires: [
        'Target.view.catalog.Export',
        'Target.view.catalog.SubmitCutout',
        'Target.view.association.Panel',
        'Target.model.Rating',
        'Target.model.Reject',
        'Target.view.wizard.Wizard'
    ],

    listen: {
        component: {
            'targets-objects-panel': {
                beforeLoadPanel: 'onBeforeLoadPanel',
                beforeloadcatalog: 'loadCurrentSetting'
            },
            'targets-objects-tabpanel': {
                select: 'onSelectObject'
            }
        },
        store: {
            '#Catalogs': {
                load: 'onLoadCatalogs'
            },
            '#objects': {
                update: 'onUpdateObject'
            }
        }
    },

    onBeforeLoadPanel: function (catalogId, objectsPanel) {
        var me = this,
            vm = objectsPanel.getViewModel(),
            catalogs = vm.getStore('catalogs'),
            refs = me.getReferences(),
            objectsGrid = refs.targetsObjectsGrid;

        objectsGrid.setLoading(true);

        catalogs.removeAll();
        catalogs.clearFilter(true);
        catalogs.filter([
            {
                property: 'id',
                value: catalogId
            }
        ]);

    },

    onLoadCatalogs: function (store) {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog,
            refs = me.getReferences(),
            objectsGrid = refs.targetsObjectsGrid;

        if (store.count() === 1) {
            currentCatalog = store.first();

            vm.set('currentCatalog', currentCatalog);

            objectsGrid.setLoading(false);

            me.loadCurrentSetting();
        }

    },

    loadCurrentSetting: function () {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('currentSettings'),
            product = vm.get('currentCatalog'),
            refs = me.getReferences(),
            objectsGrid = refs.targetsObjectsGrid;

        objectsGrid.setLoading(true);

        store.addFilter([
            {
                property: 'cst_product',
                value: product.get('id')
            }
        ]);

        store.load({
            callback: function (records, operations, success) {

                objectsGrid.setLoading(false);

                if ((success) && (records.length == 1)) {
                    vm.set('currentSetting', records[0]);

                    me.configurePanelBySettings();

                } else if (((success) && (records.length > 1))) {
                    console.log('Mais de uma setting');
                    console.log('TODO ISSO NAO PODE ACONTECER');

                    vm.set('currentSetting', records[records.length - 1]);
                    me.configurePanelBySettings();

                } else {
                    me.showAlertSetting();
                }
            }
        });
    },

    configurePanelBySettings: function () {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('displayContents'),
            currentSetting = vm.get('currentSetting');

        store.addFilter([
            {'property': 'pcn_product_id', value: currentSetting.get('cst_product')},
            {'property': 'pca_setting', value: currentSetting.get('cst_setting')}
        ]);

        store.load({
            callback: function () {
                me.onLoadProductContent(store);

            }
        });
    },

    onLoadProductContent: function (productContent) {
        var me = this,
            vm = me.getViewModel(),
            refs = me.getReferences(),
            objectsGrid = refs.targetsObjectsGrid,
            currentSetting = vm.get('currentSetting');

        // Checar se tem as associacoes obrigatorias
        if (productContent.check_ucds()) {
            objectsGrid.reconfigureGrid(productContent);

        } else {
            if (currentSetting.get('id') > 0) {
                Ext.MessageBox.show({
                    header: false,
                    closable: false,
                    msg: 'It is necessary to make association for property ID, RA and Dec.',
                    buttons: Ext.MessageBox.OK,
                    fn: function () {
                        me.showWizard();
                    }
                });
            } else {
                me.showAlertSetting();
            }

        }
    },

    showAlertSetting: function () {
        var me = this,
            msg;

        msg = '<p>' +
            'This catalog needs to have its columns associated to a default set of properties.' +
            '</br></br>' +
            'When clicking OK, a Wizard will assist you on the process of associating columns and selecting the ones you want to display.' +
            '</br></br>' +
            'Association of ID, RA, and Dec is mandatory in order to display the targets.' + '</br>' +
            'You will not be able to visualize your catalog without choosing a configuration.'  + '</br>' +
            'You can create different configurations.'  + '</br>' +
            'Configurations are specific to a given catalog.'  + '</br>' +
            'But each catalog can have more than one configuration.'  + '</br>' +
            'Configurations are set by a user, but you can also pick from a public configuration (if a colleague is also working with same catalog).' + '</p>';

        // msg = '<p>' +
        //     'É Necessario fazer uma configuração para visualizar este catalogo.' +
        //     '</br></br>' +
        //     'ao Clicar em Ok, sera exibido um Wizard que lhe ajudara ' +
        //     'a fazer as configurações necessárias como associar as propriedades do seu catalogo com ' +
        //     'propriedades comumente usadas para a mesma classe ou escolher as propriedades que deseja visualizar.' +
        //     '</br></br>' +
        //     'Neste Wizard você poderá escolher ou criar um conjunto de configurações.' + '</br>' +
        //     'Dicas:' + '</br>' +
        //     'As configurações são especificas por catalogos.' + '</br>' +
        //     'Podem ser criadas mais de uma configuração para o mesmo catalogo.' + '</br>' +
        //     'As configurações são por usuario mais é possivel escolher configurações que foram marcadas como publicas.' + '</br>' +
        //     'Não é possivel visualizar o catalogo sem escolher uma configuração.' + '</br>' +
        //     'É obrigatorio fazer associação para as propriedades ID, RA, Dec. </p>';

        Ext.MessageBox.show({
            header: false,
            closable: false,
            msg: msg,
            buttons: Ext.MessageBox.OK,
            fn: function () {
                me.showWizard();
            }
        });



        // 'It is necessary to make association for property ID, RA and Dec.'

    },

    reloadAssociation: function () {
        var me = this;

        me.loadCurrentSetting();
    },

    onLoadAssociation: function (productAssociation) {
        var me = this,
            refs = me.getReferences(),
            objectsGrid = refs.targetsObjectsGrid;

        if (productAssociation.count() > 0) {

            objectsGrid.setCatalogClassColumns(productAssociation);
        } else {
            if (!this.wizard) {
                me.showWizard();
            }
        }
    },

    onGridObjectsReady: function () {
        var me = this,
            vm = this.getViewModel(),
            catalog = vm.get('currentCatalog');

        // Filtrar a Store de Objetos
        me.loadObjects(catalog.get('id'));

    },

    loadObjects: function (catalog) {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('objects'),
            refs = me.getReferences(),
            objectsGrid = refs.targetsObjectsGrid;

        if (catalog) {

            store.getProxy().setExtraParam('product', catalog);

            store.load({
                callback: function (records, operation, success) {

                    // remover a mensagem de load do painel
                    objectsGrid.setLoading(false);

                },
                scope: this
            });
        }
    },

    clearObjects: function () {
        var vm = this.getViewModel(),
            objects = vm.getStore('objects');

        objects.removeAll(true);
        objects.clearFilter(true);
    },

    reloadObjects: function () {
        var me = this,
            vm = me.getViewModel(),
            objects = vm.getStore('objects'),
            catalog = vm.get('catalog');

        me.clearObjects();

        me.loadObjects(catalog);
    },

    onSelectObject: function (selModel, record) {
        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            refs = me.getReferences(),
            preview = refs.targetsPreviewPanel;

        // Setar o Objeto Selecionado
        preview.setCurrentRecord(record);

    },

    onUpdateObject: function (store, record, operation, modifiedFieldNames, details) {
        if (modifiedFieldNames) {
            // Caso o campo alterado seja o reject
            if (modifiedFieldNames.indexOf('_meta_reject') >= 0) {
                this.onRejectTarget(record, store);
            }

            // Caso o campo alterado seja Rating
            if (modifiedFieldNames.indexOf('_meta_rating') >= 0) {
                this.onRatingTarget(record, store);
            }
        }
    },

    onRejectTarget: function (record, store) {
        if (!record.get('_meta_reject_id')) {
            // Criar um novo registro de Reject sem ID
            reject = Ext.create('Target.model.Reject', {
                'catalog_id': record.get('_meta_catalog_id'),
                'object_id': record.get('_meta_id'),
                'reject': record.get('reject')
            });

            reject.save({
                callback: function (savedReject, operation, success) {
                    if (success) {
                        // recupera o objeto inserido no banco de dados
                        var obj = Ext.decode(operation.getResponse().responseText);

                        // seta no record da grid o atributo reject_id para que nao seja necessario
                        // o reload da grid
                        record.set('_meta_reject_id', obj.id);

                        store.commitChanges();
                    }
                }
            });
        } else {
            // Se ja tiver o registro de Reject deleta
            reject = Ext.create('Target.model.Reject', {
                'id': record.get('_meta_reject_id')
            });

            reject.erase({
                callback: function (savedReject, operation, success) {
                    if (success) {
                        store.commitChanges();

                    }
                }
            });
        }
    },

    onRatingTarget: function (record, store) {

        if (record.get('_meta_rating_id') > 0) {
            // Cria um model com o id que ja existe no banco de dados
            rating = Ext.create('Target.model.Rating', {
                'id': record.get('_meta_rating_id')
            });
            // faz o set no atributo que vai ser feito update
            rating.set('rating', record.get('_meta_rating'));

            rating.save({
                callback: function (savedRating, operation, success) {
                    if (success) {

                        store.commitChanges();

                    }
                }
            });
        } else {
            // Criar um novo registro de Rating sem ID
            rating = Ext.create('Target.model.Rating', {
                'catalog_id': record.get('_meta_catalog_id'),
                'object_id': record.get('_meta_id'),
                'rating': record.get('_meta_rating')
            });

            rating.save({
                callback: function (savedRating, operation, success) {
                    if (success) {
                        // recupera o objeto inserido no banco de dados
                        var obj = Ext.decode(operation.getResponse().responseText);

                        // seta no record da grid o atributo rating_id para que nao seja necessario
                        // o reload da grid
                        record.set('_meta_rating_id', obj.id);

                        store.commitChanges();

                    }
                }
            });
        }
    },

    onClickSettings: function () {
        var me = this;

        me.showWizard();
    },

    onClickExportCatalog: function () {
        var me = this,
            vm = me.getViewModel(),
            catalog = vm.get('currentCatalog'),
            exportPanel = null;

        this.winExport = Ext.create('Ext.window.Window', {
            title: 'Export Targets',
            layout: 'fit',
            closeAction: 'destroy',
            width: 500,
            height: 400,
            items: [{
                xtype: 'targets-catalog-export',
                record: catalog,
                listeners: {
                    scope: me,
                    submitexport: me.exportCatalog
                }
            }]
        });

        exportPanel = this.winExport.down('targets-catalog-export');
        exportPanel.setCatalog(catalog);

        this.winExport.show();
    },

    exportCatalog: function (catalog, params) {
        this.winExport.close();

        Ext.Msg.alert(
            'Background process.',
            'The creation of the file will be made in background, when finished you will receive an email containing the link to download.'
        );

        Ext.Ajax.request({
            url: '/PRJSUB/TargetViewer/exportCatalogCSV',
            params: {
                // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
                catalog_id: catalog.get('catalog_id'),
                export_params: JSON.stringify(params)
                // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
            },
            success: function (response) {
                // Recuperar a resposta e fazer o decode no json.
                var obj = Ext.decode(response.responseText);

                if (obj.success === false) {
                    Ext.Msg.alert('', obj.msg);
                }
            },
            failure: function (response) {
                if (response.status !== 0) {
                    Ext.MessageBox.show({
                        title: 'Server Side Failure',
                        msg: response.status + ' ' + response.statusText,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.WARNING
                    });
                }
            }
        });
    },

    onClickCreateCutout: function () {
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            catalog = vm.get('currentCatalog'),
            process_id = ((catalog.get('process_id') > 0) ? catalog.get('process_id') : '---'),
            numberObjects = ((catalog.get('num_objects') > 0) ? catalog.get('num_objects') : '---'),
            baseParams = {};

        baseParams = {
            summary:{
                type:[{
                    name: 'Input target catalog',
                    value: catalog.get('catalog_name')
                },{
                    name: 'Parent Process',
                    value: process_id
                },{
                    name: 'Number of Objects',
                    value: '' + numberObjects
                },{
                    name: 'Colors used in RGB',
                    value: 'irg'
                }]
            },
            inputdata:{
                type:'table',
                schema:catalog.get('schema_name'),
                table:catalog.get('table_name')
            }
            // release:{
            //     tag_id: tag_id,
            //     field_id: field_id
            // }
        };

        var w = Ext.create('Target.view.catalog.SubmitCutout', {});

        w.on('submitcutout', function (customParams) {

            if (customParams.image.size > 0) {
                baseParams.summary.type.push({
                    name: 'Cutout size',
                    value: customParams.image.size
                });
            }

            var params = Ext.Object.merge(baseParams, customParams);

            me.submitCutoutPypeline(params);

        }, this);

        w.show();

        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    },

    submitCutoutPypeline: function (params) {
        Ext.Ajax.request({
            url: '/PRJSUB/TileViewer/submitCutoutPypeline',
            params: {
                data: JSON.stringify(params)
            },
            success: function (response) {
                // Recuperar a resposta e fazer o decode no json.
                var obj = Ext.decode(response.responseText);

                if (obj.success === true) {
                    msg = 'The cutout process is running in background. You will receive an e-mail  notification  when it is done.  If needed clean the browser cache to load the most recent images.';
                    Ext.Msg.alert('Process Id: ' + obj.process_id, msg);

                } else {
                    Ext.Msg.alert('Sorry!', obj.msg);
                }

            },
            failure: function (response, opts) {
                Ext.MessageBox.show({
                    title: 'Server Side Failure',
                    msg: response.status + ' ' + response.statusText,
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.WARNING
                });
            }
        });
    },

    onChangeInObjects: function (argument) {
        // toda vez que houver uma modificacao no objeto ex. comentarios
        // atualiza a store de objetos
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('objects');

        store.load({
            scope: this,
            callback: function (records, operation, success) {
                // Todo caso seja necessario selecionar o record que estava selecionado antes
            }
        });
    },

    showWizard: function () {
        var me = this,
            vm = me.getViewModel(),
            catalog = vm.get('catalog'),
            currentSetting = vm.get('currentSetting');

        this.wizard = Ext.create('Ext.window.Window', {
            title: 'Settings Wizard',
            layout: 'fit',
            closable: false,
            closeAction: 'destroy',
            width: 880,
            height: 620,
            modal:true,
            items: [{
                xtype: 'targets-wizard',
                product: catalog,
                listeners: {
                    scope: me,
                    finish: 'onFinishWizard'
                }
            }]
        });

        if (currentSetting.get('id') > 0) {
            this.wizard.down('targets-wizard').setCurrentSetting(currentSetting);
        }

        this.wizard.show();

    },

    onFinishWizard: function () {
        this.wizard.close();

        this.loadCurrentSetting();

    }

});
