/**
 *
 */
Ext.define('Target.view.preview.PreviewController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.preview',

    /**
     * @requires common.comment.CommentsObject
     */
    requires: [
        //'common.comment.CommentsObject'
    ],

    listen: {
        component: {
            'targets-preview-panel': {
                beforeload: 'onBeforeLoad',
                compareimages: 'onCompareImages',
                changeimages: 'onChangeImages'
            }
        },
        store: {
            '#coaddObjects': {
                load: 'onLoadCoaddObjects'
            },
            '#tiles': {
                load: 'onLoadTiles'
            }
        }
    },

    onBeforeLoad: function (record) {
        // console.log('onBeforeLoad(%o)', arguments);

        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            tiles = vm.getStore('tiles'),
            ra = record.get('_meta_ra'),
            dec = record.get('_meta_dec');

        // descobrir se as tiles do objeto usando as coordenadas do objeto
        tiles.addFilter([{
            property: 'ra',
            value: ra
        },{
            property: 'dec',
            value: dec
        }]);
    },

    /**
     * @method onLoadTiles [description]

     * @return {void}
     */
    onLoadTiles: function (store) {
        // console.log('onLoadTiles(%o)', store);

        var me = this,
            view = me.getView();

        view.setImages(store);
    },

    getCoaddObject: function (ra, dec, release, field) {
        // console.log('getCoaddObject(%o)', arguments);

        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            store = vm.getStore('coaddObjects'),
            refs = view.getReferences(),
            properties = refs.CoaddProperties;

        // adicioanar loading o painel coadd properties
        properties.setLoading({
            store: store
        });

        // Release e Field estao como atributos do painel preview,
        // que sao atualizados pelo bind
        store.filter([
            {property: 'tag_id', value: release},
            {property: 'field_id', value: field},
            {property: '_meta_ra', value: ra},
            {property: '_meta_dec', value: dec}
        ]);
    },

    /**
     * @method onLoadCoaddObjects Este metodo e executado toda vez que a store
     * CoaddObjectes fizer um load. verifica se a store contem apenas 1 objeto
     * nesse caso carrega seta o viewModel com o coaddObject carregado.
     * caso contrario cria uma instancia vazia.
     */
    onLoadCoaddObjects: function (store) {
        // console.log('onLoadCoaddObjects(%o)', arguments);

        var me = this,
            view = me.getView(),
            vm = view.getViewModel();

        if (store.count() == 1) {

            vm.set('currentCoaddRecord', store.first());

        } else {
            // recupera o model antigo setado apenas para criar uma instancia
            // vazia da mesma classe.
            record = Ext.create('Target.model.CatalogObject', {});

            vm.set('currentCoaddRecord', record);
        }
    },

    /**
     * @method onCompareImages [description]

     * @return {void}
     */
    onCompareImages: function (tiles, object) {
        console.log('onCompareImages(%o)', arguments);

    },

    onChangeImages: function (view, image) {

        var me = this,
            current = view.getCurrentRecord();

        // ao trocar a imagem atualizar o coadd properties
        me.getCoaddObject(
            current.get('_meta_ra'),
            current.get('_meta_dec'),
            image.get('tag_id'),
            image.get('field_id')
        );

    },

    onComment: function (btn) {
        // console.log('onComment(%o)', btn);

        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            record = vm.get('currentRecord'),
            catalog,
            id;

        if ((!record) || (!record.get('_meta_id'))) {
            console.log('nenhum objeto selecionado');
            return false;

        }

        catalog = record.get('_meta_catalog_id'),
        id = record.get('_meta_id');

        var comment = Ext.create('Ext.window.Window', {
            title: 'Comments',
            iconCls: 'x-fa fa-comments',
            layout: 'fit',
            closeAction: 'destroy',
            constrainHeader:true,
            width: 500,
            height: 500,
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

        comment.show();
    },

    onChangeComments: function (argument) {
        // console.log('onChangeComments');

        var me = this,
            view = me.getView();

        view.fireEvent('changeinobject');
    }

});
