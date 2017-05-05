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

        } else {
            refs.btnRadius.setVisible(false);
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
            btnRadius = refs.btnRadius;

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
    }

});
