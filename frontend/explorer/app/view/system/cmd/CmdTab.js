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
                {
                    itemId: 'cmd-iz',
                    plotTitle: '(i-z) vs. z',
                    xAxisTitle: 'z',
                    yAxisTitle: 'i-z',
                    dataSeries: {
                        vaciz: {
                            id: 'vac_i-z',
                            title: 'VAC',
                            opacity: .6,
                            values: []
                        },
                        iz: {
                            id: 'i-z',
                            title: '(i-z) vs. z',
                            opacity: 1,
                            values: []
                        },
                    }
                },
                {
                    itemId: 'cmd-zy',
                    plotTitle: '(z-y) vs. Y',
                    xAxisTitle: 'Y',
                    yAxisTitle: 'z-Y',
                    dataSeries: {
                        vaczy: {
                            id: 'vac_z-y',
                            title: 'VAC',
                            opacity: .6,
                            values: []
                        },
                        zy: {
                            id: 'z-y',
                            title: '(z-y) vs. Y',
                            opacity: 1,
                            values: []
                        },
                    }
                },
            ]
        });

        me.callParent(arguments);
    },

    getMembersData: function () {
        var me = this,
            members = me.getMembers(),
            membersData = {
                gr: [],
                ri: [],
                iz: [],
                zy: []
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

            // i-z Serie
            membersData.iz.push({
                "id": record.get('_meta_id'),
                "x": mag_z,
                "y": mag_i - mag_z,
                "serie": "i-z"
            })

            // z-Y Serie
            membersData.zy.push({
                "id": record.get('_meta_id'),
                "x": mag_y,
                "y": mag_z - mag_y,
                "serie": "z-y"
            })

        });

        return membersData;
    },

    getVacsData: function () {
        var me = this,
            vacs = me.getVacs(),
            vacsData = {
                vacgr: [],
                vacri: [],
                vaciz: [],
                vaczy: []
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

            // r-i Serie
            vacsData.vacri.push({
                    "id": record.get('_meta_id'),
                    "x": mag_i,
                    "y": mag_r - mag_i,
                    "serie": "vac_r-i"
                })

            // i-z Serie
            vacsData.vaciz.push({
                    "id": record.get('_meta_id'),
                    "x": mag_z,
                    "y": mag_i - mag_z,
                    "serie": "vac_i-z"
                })

            // z-Y Serie
            vacsData.vaczy.push({
                    "id": record.get('_meta_id'),
                    "x": mag_y,
                    "y": mag_z - mag_y,
                    "serie": "vac_z-y"
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
