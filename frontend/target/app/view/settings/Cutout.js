Ext.define('Target.view.settings.Cutout', {
    extend: 'Ext.panel.Panel',

    requires: [
        'Target.view.settings.CutoutController',
        'Target.view.settings.CutoutModel',
        'Target.view.settings.CutoutJobs',
        'Target.view.settings.CutoutJobForm'
    ],

    xtype: 'targets-cutout',

    controller: 'cutout',

    viewModel: 'cutout',

    config: {
        currentCatalog: null
    },

    initComponent: function () {
        var me = this;
        Ext.apply(this, {
            bodyPadding: 20,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'targets-cutout-jobs',
                    reference: 'cutoutJobsGrid',
                    flex: 1,
                    bind: {
                        store: '{cutoutjobs}',
                        selection: '{cutoutJob}'
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
                                // disabled: '{!cutoutJobsGrid.selection.ready_to_download}'
                            }
                        },
                        {
                            tooltip:'Remove Cutout Job',
                            iconCls: 'x-fa fa-trash',
                            ui: 'soft-red',
                            handler: 'onRemoveCutoutJob',
                            disabled: true,
                            bind: {
                                disabled: '{!cutoutJobsGrid.selection}'
                            }
                        }
                    ]
                }
            ],
            buttons: [
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
        var me = this,
            vm = me.getViewModel();

        me.currentCatalog = catalog;

        vm.set('currentCatalog', catalog);

        me.fireEvent('changecatalog', catalog, me);

    }
});
