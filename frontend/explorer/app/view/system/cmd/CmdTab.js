Ext.define('Explorer.view.system.cmd.CmdTab', {
    extend: 'Ext.panel.Panel',

    xtype: 'cmd-tab',

    requires: [
        'Ext.ux.layout.ResponsiveColumn',
        'Explorer.view.system.cmd.CmdBase'
    ],

    config: {
        members: null,
        vacs: null
    },

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            layout: 'responsivecolumn',
            defaults: {
                xtype: 'system-cmd',
                height: 300,
                layout: 'fit',
                userCls: 'big-50 small-100',
                listeners: {
                    scope: me,
                    clickpoint: 'onCmdClickPoint'
                }
            },
            items: [
                {
                    itemId: 'cmd-gr',
                    plotTitle: '(g-r) vs. r',
                    xAxisTitle: 'r',
                    yAxisTitle: 'g-r',
                    dataSeries: {
                        vacgr: {
                            id: 'vac_g-r',
                            title: 'VAC',
                            opacity: .6,
                            values: []
                        },
                        gr: {
                            id: 'g-r',
                            title: '(g-r) vs. r',
                            opacity: 1,
                            values: []
                        },
                    }
                },
                {
                    itemId: 'cmd-ri',
                    plotTitle: '(r-i) vs. i',
                    xAxisTitle: 'i',
                    yAxisTitle: 'r-i',
                    dataSeries: {
                        vacri: {
                            id: 'vac_r-i',
                            title: 'VAC',
                            opacity: .6,
                            values: []
                        },
                        ri: {
                            id: 'r-i',
                            title: '(r-i) vs. i',
                            opacity: 1,
                            values: []
                        },
                    }
                },
                // {
                //     itemId: 'cmd-ri',
                //     plotTitle: '(r-i) vs. i',
                //     dataSeries: {
                //         ri: {
                //             id: 'r-i',
                //             title: '(r-i) vs. i',
                //             xAxisTitle: 'i',
                //             yAxisTitle: 'r-i',
                //             values: []
                //         },
                //     },
                // },
                // {
                //     itemId: 'cmd-iz',
                //     plotTitle: '(i-z) vs. z',
                //     dataSeries: {
                //         iz: {
                //             id: 'i-z',
                //             title: '(i-z) vs. z',
                //             xAxisTitle: 'z',
                //             yAxisTitle: 'i-z',
                //             values: []
                //         },
                //     },
                // },
                // {
                //     itemId: 'cmd-zy',
                //     plotTitle: '(i-z) vs. z',
                //     dataSeries: {
                //         zy: {
                //             id: 'z-y',
                //             title: '(z-y) vs. Y',
                //             xAxisTitle: 'Y',
                //             yAxisTitle: 'z-Y',
                //             values: []
                //         }
                //     },
                // }
            ]
        });

        me.callParent(arguments);
    },

    getMembersData: function () {
        var me = this,
            members = me.getMembers(),
            membersData = {
                gr: [],
                ri: []
            };

        members.each(function (record) {
            var mag_g = parseFloat(record.get('mag_g')),
                mag_r = parseFloat(record.get('mag_r')),
                mag_i = parseFloat(record.get('mag_i')),
                mag_z = parseFloat(record.get('mag_r')),
                mag_y = parseFloat(record.get('mag_y'));

            // g-r Serie
            membersData.gr.push({
                    "id": record.get('_meta_id'),
                    "x": mag_r,
                    "y": mag_g - mag_r,
                    "serie": "g-r"
                })

            // r-i Serie
            membersData.ri.push({
                "id": record.get('_meta_id'),
                "x": mag_i,
                "y": mag_r - mag_i,
                "serie": "r-i"
            })

        });

        return membersData;
    },

    getVacsData: function () {
        var me = this,
            vacs = me.getVacs(),
            vacsData = {
                vacgr: [],
                vacri: []
            };

        vacs.each(function (record) {
            var mag_g = parseFloat(record.get('mag_g')),
                mag_r = parseFloat(record.get('mag_r')),
                mag_i = parseFloat(record.get('mag_i')),
                mag_z = parseFloat(record.get('mag_r')),
                mag_y = parseFloat(record.get('mag_y'));

            // g-r Serie
            vacsData.vacgr.push({
                    "id": record.get('_meta_id'),
                    "x": mag_r,
                    "y": mag_g - mag_r,
                    "serie": "vac_g-r"
                })

            vacsData.vacri.push({
                    "id": record.get('_meta_id'),
                    "x": mag_i,
                    "y": mag_r - mag_i,
                    "serie": "vac_r-i"
                })
        });

        return vacsData;
    },

    reloadPlots: function () {
        var me = this,
            items = me.items,
            membersData = me.getMembersData(),
            vacsData = me.getVacsData();

        items.each(function (item) {
            item.setMembers(membersData);
            item.setVacs(vacsData);

            item.reloadData();
        })
    },

    onCmdClickPoint: function (id, serie, plot) {
        var me = this,
            members = me.getMembers(),
            vacs = me.getVacs(),
            type = 'member',
            record;

        if (serie.indexOf('vac_') != -1) {
            type = 'vac';
            record = vacs.findRecord("_meta_id", id);
        } else {
            record = members.findRecord("_meta_id", id);
        }

        me.fireEvent('clickpoint', record, type, me);
    }

});
