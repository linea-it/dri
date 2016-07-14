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
        console.log('onChangeRecord(%o)', record);

        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            datasets = vm.getStore('datasets'),
            ra = record.get('_meta_ra'),
            dec = record.get('_meta_dec'),
            position;

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
            cmb = refs.currentDataset;

        if (store.count() == 1) {
            // Apenas uma tile na coordenada do objeto,
            // setar essa tile no imagepreview
            //me.setCurrentImage(store.first());

            cmb.select(store.first());
            // Desabilitar a combobox Image
            cmb.setReadOnly(true);

        }
        // else if (store.count() > 1) {

        //     me.setTiles(store);

        //     // Desabilitar a combobox Image
        //     cmb.setReadOnly(false);

        //     // Localizar a tile para o release e field do catalogo
        //     var tile = store.findRecord('field_id', me.getField());

        //     if (tile) {
        //         me.setCurrentImage(tile);

        //     } else {
        //         // caso nao tenha no mesmo release e field
        //         me.setCurrentImage(null);

        //         //  Seta a primeira que tiver
        //         me.setCurrentImage(store.first());
        //     }

        // } else {
        //     console.log('Nenhuma tile encontrada para o objeto');
        // }

    },

    onChangeImage: function (combo) {
        console.log('onChangeImage(%o)', combo);

        var me = this,
            refs = me.getReferences(),
            visiomatic = refs.visiomatic,
            vm = me.getViewModel(),
            dataset = combo.getSelectedRecord(),
            release = vm.getStore('releases').getById(dataset.get('release')),
            tag = vm.getStore('tags').getById(dataset.get('tag'));

        if ((dataset) && (release) && (tag)) {

            // visiomatic.setImage(release, tag, dataset);
            visiomatic.setImage('http://desportal.cosmology.illinois.edu/visiomatic?FIF=data/releases/y1_supplemental_d04/images/visiomatic/DES0222-0541.ptif');

            console.log('ok');
            // me.setRelease(record.get('tag_id'));
            // me.setField(record.get('field_id'));

            // me.loadCurrentImage(record);

            // // Disparar evento que a imagem o release e o field foi alterado
            // me.fireEvent('changeimages', me, record);
        }
    }



    // getCoaddObject: function (ra, dec, release, field) {
    //     // console.log('getCoaddObject(%o)', arguments);

    //     var me = this,
    //         view = me.getView(),
    //         vm = view.getViewModel(),
    //         store = vm.getStore('coaddObjects'),
    //         refs = view.getReferences(),
    //         properties = refs.CoaddProperties;

    //     // adicioanar loading o painel coadd properties
    //     properties.setLoading({
    //         store: store
    //     });

    //     // Release e Field estao como atributos do painel preview,
    //     // que sao atualizados pelo bind
    //     store.filter([
    //         {property: 'tag_id', value: release},
    //         {property: 'field_id', value: field},
    //         {property: '_meta_ra', value: ra},
    //         {property: '_meta_dec', value: dec}
    //     ]);
    // },

    // /**
    //  * @method onLoadCoaddObjects Este metodo e executado toda vez que a store
    //  * CoaddObjectes fizer um load. verifica se a store contem apenas 1 objeto
    //  * nesse caso carrega seta o viewModel com o coaddObject carregado.
    //  * caso contrario cria uma instancia vazia.
    //  */
    // onLoadCoaddObjects: function (store) {
    //     // console.log('onLoadCoaddObjects(%o)', arguments);

    //     var me = this,
    //         view = me.getView(),
    //         vm = view.getViewModel();

    //     if (store.count() == 1) {

    //         vm.set('currentCoaddRecord', store.first());

    //     } else {
    //         // recupera o model antigo setado apenas para criar uma instancia
    //         // vazia da mesma classe.
    //         record = Ext.create('Target.model.CatalogObject', {});

    //         vm.set('currentCoaddRecord', record);
    //     }
    // },

    // /**
    //  * @method onCompareImages [description]

    //  * @return {void}
    //  */
    // onCompareImages: function (tiles, object) {
    //     console.log('onCompareImages(%o)', arguments);

    // },

    // onChangeImages: function (view, image) {

    //     var me = this,
    //         current = view.getCurrentRecord();

    //     // ao trocar a imagem atualizar o coadd properties
    //     me.getCoaddObject(
    //         current.get('_meta_ra'),
    //         current.get('_meta_dec'),
    //         image.get('tag_id'),
    //         image.get('field_id')
    //     );

    // },

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
