Ext.define('Sky.view.dataset.Dataset', {
    extend: 'Ext.panel.Panel',

    xtype: 'dataset',

    requires: [
        'Sky.view.dataset.Visiomatic',
        'Sky.view.dataset.DatasetController',
        'Sky.view.dataset.DatasetModel'
    ],

    controller: 'dataset',

    viewModel: 'dataset',

    config: {
        dataset: null
    },

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            items: [
                {
                    xtype: 'sky-visiomatic',
                    reference: 'visiomatic'
                }
            ]
        });

        me.callParent(arguments);
    },

    loadPanel: function (arguments) {
        var me = this,
            dataset = me.getDataset(),
            vm = this.getViewModel();

        if (dataset > 0) {

            vm.set('dataset', dataset);

            me.setLoading(true);

            this.fireEvent('loadpanel', dataset, this);
        }
    },

    updatePanel: function (arguments) {
        var me = this,
            old = me.getDataset(),
            dataset = arguments[1],
            vm = this.getViewModel();

        if ((dataset > 0) && (dataset != old)) {
            me.setDataset(dataset);

            vm.set('dataset', dataset);

            this.fireEvent('updatePanel', dataset, this);
        }
    }
});
