/**
 *
 */
Ext.define('Target.view.preview.PreviewController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.preview',

    requires: [
        'common.comment.CommentsObject'
    ],

    listen: {
        component: {
            'targets-preview': {
                changerecord: 'onChangeRecord'
            },
            'targets-visiomatic': {
                changeimage: 'showTarget'
            }
        },
        store: {
            '#datasets': {
                load: 'onLoadDatasets'
            }
        }
    },

    onChangeRecord: function (record) {
        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            datasets = vm.getStore('datasets'),
            ra = record.get('_meta_ra'),
            dec = record.get('_meta_dec'),
            position;

        vm.set('currentRecord', record);

        vm.set('overlayMembers', null);

        position = String(ra) + ',' + String(dec);

        // descobrir as tiles do objeto usando as coordenadas do objeto
        datasets.addFilter([{
            property: 'position',
            value: position
        }]);
    },

    onLoadDatasets: function (store) {
        // console.log('onLoadTiles(%o)', store);

        var me = this,
            view = me.getView(),
            refs = me.getReferences(),
            cmb = refs.currentDataset,
            vm = me.getViewModel(),
            catalog = vm.get('currentCatalog'),
            dataset;

        // Apenas uma tile na coordenada do objeto,
        if (store.count() == 1) {
            // setar essa tile no imagepreview
            me.changeImage(store.first());

            cmb.select(store.first());

            // Desabilitar a combobox Image
            cmb.setReadOnly(true);

        } else if (store.count() > 1) {
            // Se o catalogo tiver um release seleciona por default o release do catalogo.
            if (catalog.get('release_id') > 0) {

                store.each(function (record) {
                    if (record.get('release') == catalog.get('release_id')) {
                        dataset = record;
                        return false;
                    }

                }, this);

                if (dataset) {
                    me.changeImage(dataset);

                    cmb.select(dataset);

                } else {
                    me.changeImage(null);
                }

            } else {
                // Seleciona a primeira tile disponivel
                me.changeImage(store.first());

                cmb.select(store.first());
            }

            // Habilitar a combobox Image
            cmb.setReadOnly(false);

        } else {
            // Nenhuma tile encontrada para o objeto
            me.changeImage(null);
        }


        // Configurar a barra de botoes
        if (vm.get('is_system')) {
            refs.btnRadius.setVisible(true);
            refs.btnMembers.setVisible(true);

        } else {
            refs.btnRadius.setVisible(false);
            refs.btnMembers.setVisible(true);
        }

    },

    onChangeDataset: function (combo) {
        var me = this,
            dataset = combo.getSelectedRecord();

        me.changeImage(dataset);
    },

    changeImage: function (dataset) {
        var me = this,
            visiomatic = me.lookupReference('visiomatic'),
            url;

        if (dataset) {
            url = dataset.get('image_src_ptif');
            if (url !== '') {
                visiomatic.setImage(url);

            } else {
                visiomatic.removeImageLayer();

            }

        } else {
            visiomatic.removeImageLayer();
        }
    },

    showTarget: function () {
        var me = this,
            vm = me.getViewModel(),
            object = vm.get('currentRecord'),
            visiomatic = me.lookupReference('visiomatic');


        // Checar se o catalogo representa single objects ou sistemas
        if (vm.get('is_system')) {
            me.targetIsSystem();
        } else {
            me.targetIsSingleObject();
        }

    },

    targetIsSingleObject: function () {
        // console.log('targetIsSingleObject');
        var me = this,
            vm = me.getViewModel(),
            object = vm.get('currentRecord'),
            visiomatic = me.lookupReference('visiomatic');

        // Centraliza a imagem no target
        me.onCenterTarget();
    },

    targetIsSystem: function () {
        var me = this,
            vm = me.getViewModel(),
            object = vm.get('currentRecord'),
            visiomatic = me.lookupReference('visiomatic'),
            refs = me.getReferences(),
            btnRadius = refs.btnRadius,
            btnMembers = refs.btnMembers;

        // Centraliza a imagem no target
        me.onCenterTarget();

        // TODO Descobrir a unidade do raio
        var unit = 'arcmin';

        // Desenhar Raio
        visiomatic.drawRadius(
            object.get('_meta_ra'),
            object.get('_meta_dec'),
            object.get('_meta_radius'),
            unit);

        visiomatic.showHideRadius(btnRadius.pressed);

        // Load System Members
        if (btnMembers.pressed) {
            me.loadSystemMembers();
        }

    },

    onCenterTarget: function () {
        var me = this,
            visiomatic = me.lookupReference('visiomatic'),
            vm = me.getViewModel(),
            object = vm.get('currentRecord'),
            fov = 0.05;

        if (vm.get('is_system')) {
            fov = 0.10;
        }

        visiomatic.setView(
            object.get('_meta_ra'),
            object.get('_meta_dec'),
            fov);
    },

    showHideRadius: function (btn, state) {
        var me = this,
            visiomatic = me.lookupReference('visiomatic'),
            vm = me.getViewModel(),
            object = vm.get('currentRecord'),
            fov = 0.05;

        visiomatic.showHideRadius(state);
    },

    onComment: function () {
        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            object = vm.get('currentRecord'),
            catalog = vm.get('currentCatalog'),
            id;

        if ((!object) || (!object.get('_meta_id'))) {
            return false;

        }

        catalog = catalog.get('id');
        id = object.get('_meta_id');

        if (id > 0) {

            var comment = Ext.create('Ext.window.Window', {
                title: 'Comments',
                iconCls: 'x-fa fa-comments',
                layout: 'fit',
                closeAction: 'destroy',
                constrainHeader:true,
                width: 500,
                height: 500,
                autoShow:true,
                items: [
                    {
                        xtype: 'comments-object',
                        listeners: {
                            scope: this,
                            changecomments: 'onChangeComments'
                        }
                    }
                ]
            });

            comment.down('comments-object').getController().loadComments(catalog, id);
        }

    },

    onChangeComments: function () {
        var me = this,
           view = me.getView();

        view.fireEvent('changeinobject');
    },

    loadSystemMembers: function () {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            object = vm.get('currentRecord'),
            productRelated = vm.get('productRelated'),
            relateds = vm.getStore('productRelateds'),
            members = vm.getStore('members'),
            refs = me.getReferences(),
            btnMembers = refs.btnMembers;

        // Verificar se tem um produto relacioando ao catalogo
        if ((productRelated.get('id') > 0) && (productRelated.get('prl_product') === currentCatalog.get('id'))) {
            members.clearFilter();
            members.removeAll(true);

            members.getProxy().setExtraParam('product', productRelated.get('prl_related'));

            if ((productRelated.get('prl_cross_identification') !== null) && (productRelated.get('prl_cross_identification') > 0)) {

                // Colocar o botão em load
                btnMembers.setIconCls('x-fa fa-spinner fa-spin fa-fw');

                members.addFilter({
                    property: productRelated.get('prl_cross_name'),
                    value: object.get('_meta_id')
                });

                // Adicionar um filtro pela propriedade cross identification
                // members.getProxy().setExtraParam(currentCatalog.get('prl_cross_name'), currentRecord.get('id'));

                members.load({
                    callback: function () {
                        // Remover o load do botao
                        btnMembers.setIconCls('x-fa fa-dot-circle-o');
                        // Exibir os objetos membros
                        me.onLoadSystemMembers(this);

                    }
                });

            }

        } else {
            // relateds.clearFilter();
            relateds.removeAll(true);

            relateds.addFilter({
                property: 'prl_product',
                value: currentCatalog.get('id')
            });
            relateds.load({
                callback: function () {
                    if (this.count() > 0) {
                        vm.set('productRelated', this.first());
                        me.loadSystemMembers();

                    }
                }
            });
        }
    },

    onLoadSystemMembers: function (members) {
        var me = this,
            vm = me.getViewModel(),
            visiomatic = me.lookupReference('visiomatic'),
            lmembers;

        lmembers = visiomatic.overlayCatalog('catalog_teste', members);

        vm.set('overlayMembers', lmembers);
    },

    showHideMembers: function (btn, state) {
        var me = this,
            visiomatic = me.lookupReference('visiomatic'),
            vm = me.getViewModel(),
            lmembers = vm.get('overlayMembers');

        visiomatic.showHideLayer(lmembers, state);

    }

});
