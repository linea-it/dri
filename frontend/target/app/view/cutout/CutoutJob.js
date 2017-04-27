Ext.define('Target.view.cutout.CutoutJob', {
    extend: 'Ext.panel.Panel',

    requires: [
        'Target.view.cutout.CutoutJobController',
        'Target.view.cutout.CutoutJobModel',
        'Target.view.cutout.Jobs',
        'Target.view.cutout.AddJobWindow'
    ],

    xtype: 'targets-cutoutjob',

    controller: 'cutoutjob',

    viewModel: 'cutoutjob',

    config: {
        currentCatalog: null
    },

    initComponent: function () {
        var me = this;
        Ext.apply(this, {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'panel',
                    // region: 'north',
                    height: 80,
                    bodyPadding: 10,
                    html: [
                        'TEXTO Explicativo'
                        // '</br>' + 'The list can be public or private in this case only the users selected or who are part of a group can access it.' +
                        // '</br>' + 'You can create workgroups.'
                    ]
                },
                {
                    xtype: 'targets-cutout-jobs',
                    reference: 'cutoutJobsGrid',
                    flex: 1,
                    bind: {
                        store: '{cutoutjobs}'
                    },
                    tbar: [
                        {
                            text: 'Create Cutouts',
                            iconCls: 'x-fa fa-picture-o',
                            ui: 'soft-green',
                            tooltip: 'Create cutouts for this catalog',
                            handler: 'onClickCreate'
                        },
                        {
                            text: 'Download',
                            iconCls: 'x-fa fa-download ',
                            tooltip: 'Download list of files',
                            handler: 'onClickDownload',
                            disabled: true,
                            bind: {
                                disabled: '{!cutoutJobsGrid.selection.ready_to_download}'
                            }
                        }

                    ]
                }
            ],
            buttons: [
                {
                    text: 'Previous',
                    scope: me,
                    handler: function () {
                        this.fireEvent('previous');
                    }
                },
                {
                    text: 'Next',
                    scope: me,
                    handler: function () {
                        this.fireEvent('next');
                    }
                },
                {
                    text: 'Finish',
                    ui: 'soft-green',
                    scope: me,
                    handler: function () {
                        this.fireEvent('finish', this);
                    }
                }
            ]
        });

        me.callParent(arguments);
    },

    setCurrentCatalog: function (catalog) {
        var me = this;

        me.currentCatalog = catalog;

        me.fireEvent('changecatalog', catalog, me);

    }
});
