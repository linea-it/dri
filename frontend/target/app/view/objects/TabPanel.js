/**
 *
 */
Ext.define('Target.view.objects.TabPanel', {
    extend: 'Ext.panel.Panel',

    xtype: 'targets-objects-tabpanel',

    requires: [
        'Ext.panel.Panel',
        'Target.view.objects.Mosaic',
        'Target.view.objects.Grid'
    ],

    /**
    * @event ready
    * Evento disparado depois que todos os componentes estao prontos
    * este evento marca o momento em que a store de objtos pode ser carregada.
    * @param {Target.view.objects.TabPanel} [this] this panel
    */

    // activeTab: 1,

    config: {
        ready: false
    },

    layout: 'border',

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            items: [
                // {
                //     xtype: 'targets-objects-mosaic',
                //     // title: 'Mosaic',
                //     itemId: 'CatalogMosaic',
                //     bind: {
                //         store: '{objects}'
                //     },
                //     listeners: {
                //         scope: this,
                //         ready: this.onItemReady,
                //         select: this.onSelectItem,
                //         rowdblclick: this.onDbClickItem
                //     },
                //     hidden: true
                // },
                // {
                //     xtype: 'targets-objects-grid',
                //     region: 'center',
                //     // title: 'Class Properties',
                //     itemId: 'CatalogClassGrid',
                //     bind: {
                //         store: '{objects}'
                //     },
                //     listeners: {
                //         scope: this,
                //         ready: this.onItemReady,
                //         select: this.onSelectItem,
                //         rowdblclick: this.onDbClickItem
                //     }
                // }
                {
                    xtype: 'targets-objects-grid',
                    // title: 'Catalog Properties',
                    itemId: 'CatalogPropertiesGrid',
                    bind: {
                        store: '{objects}'
                    },
                    listeners: {
                        scope: this,
                        ready: this.onItemReady,
                        select: this.onSelectItem
                    },
                    hidden: true
                }
            ],

            bbar: Ext.create('Ext.PagingToolbar', {
                reference: 'pagingtoolbar',
                bind: {
                    store: '{objects}'
                },
                displayInfo: true,
                displayMsg: 'Displaying {0} - {1} of {2}',
                emptyMsg: 'No data to display'
            })
        });

        me.callParent(arguments);
    },

    /**
     * Guarda instancia da store com todas as colunas do catalogo
     * Esta Store vai ser usada para gerar os fields para a store deste Painel
     *
     */
    setCatalogColumns: function (catalogColumns) {

        var me = this;

        // Recupera a grid com todas as colunas do catalogo
        grid = this.down('#CatalogPropertiesGrid');

        // Executa o metodo que crias as colunas dinamicamente na grid
        grid.reconfigureGrid(catalogColumns);

    },

    setCatalogClassColumns: function (catalogClassColumns) {

        var me = this;

        // Recupera a grid com todas as colunas do catalogo
        grid = this.down('#CatalogClassGrid');

        // Executa o metodo que crias as colunas dinamicamente na grid
        grid.reconfigureGrid(catalogClassColumns);

    },

    /**
     * quando um dos items dispara o evento ready verifica se os demais items,
     * estao ready.
     * @param  {'Target.view.objects.Grid'} item somente as grids disparam o
     * evendo ready o componente mosaic sempre esta como ready.
     */
    onItemReady: function (item) {
        var ready = this.isReady();

        if (ready) {
            this.setReady(ready);
            this.fireEvent('ready', this);
        }
    },

    /**
     * verifica se todos os items deste painel estao com atributo ready igual a true
     * @return {Boolean}
     */
    isReady: function () {

        var me = this,
            items = this.items,
            states = [],
            isReady = true;

        items.each(function (item) {
            states.push(item.getReady());
        });

        if (states.indexOf(false) != -1) {
            //  Se tiver pelo menos um not ready return False
            isReady = false;
        }

        return isReady;
    },

    showHideTilename: function (visible) {

        var me = this;

        me.down('#CatalogPropertiesGrid').showHideTilename(visible);
        me.down('#CatalogClassGrid').showHideTilename(visible);

    },

    onSelectItem: function (selModel, record, index) {
        // console.log('onSelectItem(%o, %o, %o)', selModel, record, index);

        var me = this,
            mosaic = this.down('#CatalogMosaic'),
            classgrid = this.down('#CatalogClassGrid'),
            cataloggrid = this.down('#CatalogPropertiesGrid');

        // ATENCAO: Necessario passar o patametro supressEvent como true,
        // para nao gerar um loop infinito.

        // Seleciona o record nas Grids
        classgrid.getSelectionModel().select(record, false, true);
        cataloggrid.getSelectionModel().select(record, false, true);

        // Seleciona o record no Mosaic
        selmodelMosaic = mosaic.getSelectionModel();
        if (selmodelMosaic) {
            selmodelMosaic.select(record, false, true);
        }

        this.fireEvent('select', record, this);

    },

    onDbClickItem: function (selModel, record, index) {

        this.fireEvent('rowdblclick', record, this);
    }
});

