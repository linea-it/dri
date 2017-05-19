Ext.define('Target.view.settings.CutoutJobs', {
    extend: 'Ext.grid.Panel',

    xtype: 'targets-cutout-jobs',

    initComponent: function () {
        var me = this;
        Ext.apply(this, {
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
                    dataIndex: 'cjb_status',
                    renderer : function (val) {
                        var status = '';
                        switch (val) {
                            case 'st':
                                status = 'Start';
                                break;
                            case 'bs':
                                status = 'Submit Job';
                                break;
                            case 'rn':
                                status = 'Running';
                                break;
                            case 'ok':
                                status = 'Done';
                                break;
                            case 'er':
                                status = 'Error';
                                break;
                            case 'job_error':
                                status = 'Job Error';
                                break;
                        }
                        return status;
                    }
                }
            ]
        });

        me.callParent(arguments);
    }

});
