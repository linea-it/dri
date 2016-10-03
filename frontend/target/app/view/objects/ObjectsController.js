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
                beforeloadcatalog: 'onBeforeLoadCatalog'
            },
            'targets-objects-tabpanel': {
                select: 'onSelectObject'
            }
        },
        store: {
            '#ProductContent': {
                load: 'onLoadProductContent',
                clear: 'onLoadProductContent'
            },
            '#Association': {
                load: 'onLoadAssociation',
                clear: 'onLoadAssociation'
            },
            '#objects': {
                update: 'onUpdateObject'
            }
        }
    },

    onBeforeLoadPanel: function (catalogId, objectsPanel) {
        var me = this,
            vm = objectsPanel.getViewModel(),
            currentCatalog = vm.get('currentCatalog');

        objectsPanel.setLoading(true);

        currentCatalog.set('id', catalogId);

        currentCatalog.load({
            callback: function (model) {
                objectsPanel.setLoading(false);
                me.onBeforeLoadCatalog(model);
            }
        });

    },

    onBeforeLoadCatalog: function (record) {
        var me = this,
            vm = me.getViewModel(),
            storeProductContent = vm.getStore('productcontent'),
            storeProductAssociation = vm.getStore('productassociation');

        // filtrar as stores de colunas
        storeProductContent.filter([
            {
                property: 'pcn_product_id',
                value: record.get('id')
            }
        ]);

        storeProductAssociation.filter([
            {
                property: 'pca_product',
                value: record.get('id')
            }
        ]);
    },

    /**
     * Toda Vez que a store productContent e carregada e passado a lista
     * com todas as colunas do catalogo para a grid que contem todas as colunas
     * do catalogo.
     * @param  {Target.store.ProductContent} productContent store com todas
     * as colunas do catalog.
     */
    onLoadProductContent: function (productContent) {
        var me = this,
            refs = me.getReferences(),
            objectsTabPanel = refs.targetsObjectsTabpanel;

        objectsTabPanel.setCatalogColumns(productContent);

    },

    reloadAssociation: function () {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog');

        me.onBeforeLoadCatalog(currentCatalog);
    },

    onLoadAssociation: function (productAssociation) {
        var me = this,
            refs = me.getReferences(),
            objectsTabPanel = refs.targetsObjectsTabpanel;

        if (productAssociation.count() > 0) {

            objectsTabPanel.setCatalogClassColumns(productAssociation);
        } else {
            if (!this.wizard) {
                me.showWizard();
            }
        }
    },

    onObjectPanelReady: function () {
        var me = this,
            vm = this.getViewModel(),
            catalog = vm.get('currentCatalog');

        // Filtrar a Store de Objetos
        me.loadObjects(catalog.get('id'));

    },

    loadObjects: function (catalog) {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('objects');

        if (catalog) {

            store.getProxy().setExtraParam('product', catalog);

            store.load({
                callback: function (records, operation, success) {
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

    onSelectObject: function (record) {
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
        if (!record.get('reject_id')) {
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
                        record.set('reject_id', obj.id);

                        store.commitChanges();
                    }
                }
            });
        } else {
            // Se ja tiver o registro de Reject deleta
            reject = Ext.create('Target.model.Reject', {
                'id': record.get('reject_id')
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

    onClickColumnAssociation: function () {
        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            catalog = vm.get('currentCatalog');

        this.winAssociation = Ext.create('Ext.window.Window', {
            title: 'Association',
            layout: 'fit',
            closeAction: 'destroy',
            width: 800,
            height: 620,
            modal: true,
            items: [{
                xtype: 'targets-association',
                listeners: {
                    scope: me
                    // todo evento que vai indicar que associacao foi finalizada
                    // submitexport: me.exportCatalog
                }
            }],
            listeners: {
                scope: me,
                close: 'reloadAssociation'
            }
        });

        this.winAssociation.show();

        this.winAssociation.down('targets-association').setProduct(catalog.get('id'));

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

    // onDbClickTarget: function (record) {
    //     var me = this,
    //         host = window.location.hostname,
    //         route = 'ps';

    //     // sys = Explorer System (cluster objects)
    //     // ps = Explorer Point Source (single object)

    //     if (record.get('_meta_is_system') === true) {
    //         route = 'sys';
    //     }

    //     var url = Ext.String.format('http://{0}/static/ws/explorer/index.html#{1}/{2}/{3}',
    //             host, route, record.get('_meta_catalog_id'), record.get('_meta_id'));

    //     window.open(url);
    // },

    showWizard: function () {
        var me = this,
            vm = me.getViewModel(),
            catalog = vm.get('catalog');

        this.wizard = Ext.create('Ext.window.Window', {
            title: 'Initial Settings Wizard',
            layout: 'fit',
            closeAction: 'destroy',
            width: 800,
            height: 620,
            modal:true,
            items: [{
                xtype: 'targets-wizard',
                product: catalog,
                listeners: {
                    scope: me
                    // todo evento que vai indicar que associacao foi finalizada
                    // submitexport: me.exportCatalog
                }
            }],
            listeners: {
                scope: me,
                close: 'reloadAssociation'
            }
        });

        this.wizard.show();

    }

});
