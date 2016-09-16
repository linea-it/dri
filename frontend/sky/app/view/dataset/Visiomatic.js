Ext.define('Sky.view.dataset.Visiomatic', {
    extend: 'visiomatic.Visiomatic',

    xtype: 'sky-visiomatic',

    requires: [
        'visiomatic.Visiomatic'
    ],

    config: {
        // Available datasets (store)
        datasets: null,

        // Current Dataset
        currentDataset: null
    },

    bind: {
        currentDataset: '{currentDataset}'
    },

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            auxTools: [{
                xtype: 'button',
                itemId: 'CompareDataset',
                tooltip: 'Compare images between releases.',
                iconCls: 'x-fa fa-object-ungroup ',
                text: 'Compare',
                scope: me,
                handler: 'compareImages',
                bind: {
                    disabled: '{disablecompare}'
                },
                menu: []
            }]
        });

        me.callParent(arguments);
    },

    setCurrentDataset: function (dataset) {
        var me = this,
        title;

        me.currentDataset = dataset;

        // Setar o titulo do Painel
        title = dataset.get('release_display_name') + ' - ' + dataset.get('tag_display_name') + ' - ' + dataset.get('tli_tilename');
        me.setTitle(title);

    },

    setDatasets: function (store) {
        var me = this;

        me.datasets = store;

        me.updateCompareOptions();

    },

    updateCompareOptions: function () {
        var me = this,
            store = me.getDatasets(),
            btn = me.down('#CompareDataset'),
            currentDataset = me.getCurrentDataset(),
            items = [],
            item;

        // Limpar os menus anteriores
        btn.getMenu().removeAll();

        // Desabilita o botao
        btn.disable();

        if (!currentDataset) {
            return false;
        }

        if (store.count() > 1) {
            store.each(function (dataset) {
                if (dataset.get('id') != currentDataset.get('id')) {
                    item = {
                        xtype: 'menucheckitem',
                        text: dataset.get('release_display_name') + ' - ' + dataset.get('tag_display_name'),
                        group: 'compareDatasets',
                        dataset: dataset,
                        scope: me,
                        checkHandler: me.compareImages
                    };

                    items.push(item);
                }
            });

            // Adicionar o botao magnetic
            items.push('-');
            items.push({
                xtype: 'menucheckitem',
                text: 'Magnetic',
                iconCls: 'x-fa fa-magnet',
                itemId: 'btnMagnetic'
                // checked: true
            });


            // Adicionar os novos items
            btn.getMenu().add(items);

            // Habilita o botao
            btn.enable();

        }
    },

    compareImages: function (item) {
        if (item.dataset) {
            this.fireEvent('compare', item.dataset, this);

        }
    }

});
