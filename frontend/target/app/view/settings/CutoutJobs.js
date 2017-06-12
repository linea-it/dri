Ext.define('Target.view.settings.CutoutJobs', {
    extend: 'Ext.grid.Panel',

    xtype: 'targets-cutout-jobs',

    initComponent: function () {
        var me = this;
        Ext.apply(this, {
            markDirty: false,
            columns: [
                {
                    text: 'Name',
                    dataIndex: 'cjb_display_name',
                    flex: 1
                },
                {
                    text: 'Owner',
                    dataIndex: 'owner'
                },
                {
                    text: 'Type',
                    dataIndex: 'cjb_job_type'
                },
                {
                    text: 'Filters',
                    dataIndex: 'cjb_band'
                },
                // {
                //     text: 'xsize',
                //     dataIndex: 'cjb_xsize'
                // },
                // {
                //     text: 'ysize',
                //     dataIndex: 'cjb_ysize'
                // },
                {
                    text: 'Release Tag',
                    dataIndex: 'cjb_tag',
                    flex: 1
                },
                {
                    text: 'Status',
                    dataIndex: 'status'
                }
            ]
        });

        me.callParent(arguments);
    }

});
