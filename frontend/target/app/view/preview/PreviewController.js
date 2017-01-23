/**
 *
 */
Ext.define('Target.view.preview.PreviewController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.preview',

    requires: [
        //'common.comment.CommentsObject'
    ],

    listen: {
        component: {
            'targets-preview': {
                changerecord: 'onChangeRecord'
                // compareimages: 'onCompareImages',
                // changeimages: 'onChangeImages'
            },
            'targets-visiomatic': {
                changeimage: 'onChangeImage'
            }
        },
        store: {
            '#datasets': {
                load: 'onLoadDatasets'
            }
            // '#coaddObjects': {
            //     load: 'onLoadCoaddObjects'
            // }
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

    onChangeImage: function () {
        var me = this,
            vm = me.getViewModel(),
            object = vm.get('currentRecord'),
            visiomatic = me.lookupReference('visiomatic'),
            fov = 0.05;

        visiomatic.setView(
            object.get('_meta_ra'),
            object.get('_meta_dec'),
            fov);

    },

    onCenterTarget: function (visiomatic) {
        var me = this,
            visiomatic = me.lookupReference('visiomatic'),
            vm = me.getViewModel(),
            object = vm.get('currentRecord');

        visiomatic.setView(object.get('_meta_ra'), object.get('_meta_dec'), 0.05);
    }

    // onComment: function (btn) {
    //     // console.log('onComment(%o)', btn);

    //     var me = this,
    //         view = me.getView(),
    //         vm = view.getViewModel(),
    //         record = vm.get('currentRecord'),
    //         catalog,
    //         id;

    //     if ((!record) || (!record.get('_meta_id'))) {
    //         console.log('nenhum objeto selecionado');
    //         return false;

    //     }

    //     catalog = record.get('_meta_catalog_id'),
    //     id = record.get('_meta_id');

    //     var comment = Ext.create('Ext.window.Window', {
    //         title: 'Comments',
    //         iconCls: 'x-fa fa-comments',
    //         layout: 'fit',
    //         closeAction: 'destroy',
    //         constrainHeader:true,
    //         width: 500,
    //         height: 500,
    //         items: [
    //             {
    //                 xtype: 'comments-object',
    //                 listeners: {
    //                     scope: this,
    //                     changecomments: 'onChangeComments'
    //                 }
    //             }
    //         ]
    //     });

    //     comment.down('comments-object').getController().loadComments(catalog, id);

    //     comment.show();
    // },

    // onChangeComments: function (argument) {
    //     // console.log('onChangeComments');

    //     var me = this,
    //         view = me.getView();

    //     view.fireEvent('changeinobject');
    // }

});
