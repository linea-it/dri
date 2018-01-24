Ext.define('Explorer.view.system.cmd.CmdTab', {
    extend: 'Ext.panel.Panel',

    xtype: 'cmd-tab',

    requires: [
        'Ext.ux.layout.ResponsiveColumn',
        'Explorer.view.system.cmd.CmdBase'
    ],

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            layout: 'responsivecolumn',
            defaults: {
                xtype: 'system-cmd',
                height: 300,
                layout: 'fit',
                userCls: 'big-50 small-100',
                bind: {
                    store: "{members}",
                    vacObjects: "{vacObjects}"
                },
                listeners: {
                    clickpoint: 'onCmdClickPoint'
                }
            },
            items: [
                {
                    itemId: 'cmd-gr',
                    plotTitle: '(g-r) vs. r',
                    dataSeries: {
                        gr: {
                            id: 'g-r',
                            title: '(g-r) vs. r',
                            xAxisTitle: 'r',
                            yAxisTitle: 'g-r',
                            values: []
                        },
                        vacgr: {
                            id: 'vac_g-r',
                            title: 'VAC',
                            xAxisTitle: 'r',
                            yAxisTitle: 'g-r',
                            values: []
                        },
                    },
                },
                {
                    itemId: 'cmd-ri',
                    plotTitle: '(r-i) vs. i',
                    dataSeries: {
                        ri: {
                            id: 'r-i',
                            title: '(r-i) vs. i',
                            xAxisTitle: 'i',
                            yAxisTitle: 'r-i',
                            values: []
                        },
                    },
                },
                {
                    itemId: 'cmd-iz',
                    plotTitle: '(i-z) vs. z',
                    dataSeries: {
                        iz: {
                            id: 'i-z',
                            title: '(i-z) vs. z',
                            xAxisTitle: 'z',
                            yAxisTitle: 'i-z',
                            values: []
                        },
                    },
                },
                {
                    itemId: 'cmd-zy',
                    plotTitle: '(i-z) vs. z',
                    dataSeries: {
                        zy: {
                            id: 'z-y',
                            title: '(z-y) vs. Y',
                            xAxisTitle: 'Y',
                            yAxisTitle: 'z-Y',
                            values: []
                        }
                    },
                }
            ]
        });

        me.callParent(arguments);
    },

    reloadPlots: function () {
        var me = this;
            items = me.items;

        console.log(items)
        items.each(function (item) {

            item.reloadData();
        })
    }
});
