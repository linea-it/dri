/**
 *
 */
Ext.define('Sky.view.mosaic.MosaicController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.mosaic',

    /**
     * executado toda vez que store e carregada,
     * recupera o filtro selecionado e executa o metodo filter Mosaic.
     */
    onLoad: function () {
        var me = this,
            panel = this.getView(),
            bandfilter = panel.lookupReference('bandfilter'),
            filter = bandfilter.getFilter();

        this.filterMosaic(filter);

    },

    /**
     * executado ao clicar em um dos botoes de filtro
     * @param  {String} [filter] filtro/banda selecionada
     */
    onFilterChange: function (filter) {
        this.filterMosaic(filter);

    },

    /**
     * Altera a url das imagens de acordo com o filtro selecionado.
     * para cada record na store altera o atributo default_img com o
     * valor da url correspondente ao filtro.
     * caso nao seja passado um filtro o valor padrao definido no componente
     * BandFilter sera usado.
     * @param {String} [filter] Nome da banda/filtro que vai ser exibida
     */
    filterMosaic: function (filter) {
        var me = this,
            panel = this.getView(),
            store = panel.getStore(),
            bandfilter = panel.lookupReference('bandfilter'),
            view = panel.lookupReference('mosaicview');

        if (!filter) {
            // Recuperar o filtro padrao
            filter = bandfilter.getFilter();
        }

        store.each(function (record) {
            // recupero o valor do atributo indexado pelo filtro
            //ex: record.get(rgb) e seta o atributo default_img
            record.set('default_img', record.get(filter));
        });

        // Atualiza a view
        view.refresh();
    }

});
