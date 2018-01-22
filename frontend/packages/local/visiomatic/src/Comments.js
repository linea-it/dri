Ext.define('visiomatic.Comments', {

    /**
     * Este metodo e executado toda vez que o dataset e alterado.
     */
    loadComments: function () {
        console.log('loadComments()');
        var me = this,
            currentDataset = me.getCurrentDataset(),
            storeComments;

        if ((me.getEnableComments()) &&
                (currentDataset != null) && (currentDataset.get('id') > 0)){

            console.log("currentDataset: %o", currentDataset.get('id'));

            // Current dataset e uma instancia completa do model dataset
            // Esta Store deve apontar para a API comment/position
            storeComments = Ext.create('common.store.CommentsPosition', {});

            // Filtrar apenas pelo
            storeComments.addFilter([
                {
                    property: 'pst_dataset',
                    value: currentDataset.get('id')
                }
            ])

            storeComments.load({
                callback: function () {
                    me.onLoadComments(this);
                }
            })
        }
    },

    /**
     * Executado toda vez que a Store de Comentarios e carregada.
     */
    onLoadComments: function (store) {
        console.log('onLoadComments()');
        var me = this

        console.log("Count: %o", store.count())

        console.log("First: %o", store.first())

        if (me.getShowComments()) {
            //com os objetos carregados executar o metodo overlayCatalog
            // este metodo espera que receber uma lista de objetos que tenham
            // os atributos _meta_id, _meta_ra, _meta_dec
            // a API comments nao tem esses atributos mais eles sao adicionados
            // no model common.model.CommentPosition.

            lComments = me.overlayCatalog('comments', store, {
                // Path Options do leaflet para valores default mais no nosso caso
                // devemos criar um tipo novo.
                // pointType: 'icon'
                // pointIcon: .....
            })

            // Este pointType 'icon' nao tem ainda criar um if dentro da funcao
            // pointToLayer para este novo tipo e utilizar um metodo que desenhe
            // o icone ao invez de um poligono.

            // guardar o lComments para poder ter o controle de mostrar ou ocultar
            // os comentarios.
            me.setLComments(lComments);
        }
    },

    showHideComments: function (state) {
        console.log('showHideComments()');
        var me = this,
            map = me.getMap(),
            lComments = me.getLComments();

        if (lComments !== null) {
            me.showHideLayer(lComments, state);
        }
    }
});
