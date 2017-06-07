Ext.define('Target.view.settings.CutoutJobForm', {
    extend: 'Ext.window.Window',

    requires: [
        'Ext.slider.Single',
        'Target.view.settings.CutoutJobController',
        'Target.view.settings.CutoutJobModel'
    ],

    xtype: 'target-cutoutjob-form',

    title: 'Create Cutout',
    width: 600,
    height: 580,
    layout: 'fit',
    modal: true,

    controller: 'cutoutjob',
    viewModel: 'cutoutjob',

    closeAction: 'hide',

    config: {
        currentProduct: null
    },

    initComponent: function () {
        var me = this;
        Ext.apply(this, {

            items: [
                {
                    xtype: 'form',
                    bodyPadding: 40,
                    defaults: {
                        labelWidth: 125,
                        anchor: '95%',
                        margin: '0 0 10 0'
                    },
                    items: [
                        {
                            xtype: 'textfield',
                            fieldLabel: 'Job Name',
                            name: 'job_name',
                            allowBlank: false,
                            maxLength: 40,
                            value: 'TESTE'
                        },
                        {
                            xtype: 'radiogroup',
                            fieldLabel: 'Job Type',
                            cls: 'x-check-group-alt',
                            name: 'job_type',
                            items: [
                                {boxLabel: 'Coadd Images', inputValue: 'coadd', checked: true},
                                {boxLabel: 'Single Epoch', inputValue: 'single', reference: 'rdSingleEpoch'}
                            ]
                        },
                        {
                            xtype: 'slider',
                            fieldLabel: 'X Size (arcmin)',
                            value: 1,
                            name: 'xsize',
                            minValue: 1,
                            maxValue: 10
                        },
                        {
                            xtype: 'slider',
                            fieldLabel: 'Y Size (arcmin)',
                            value: 1,
                            name: 'ysize',
                            minValue: 1,
                            maxValue: 10
                        },
                        {
                            xtype: 'combobox',
                            name: 'tag',
                            fieldLabel: 'Release TAG',
                            emptyText: 'Release tag for coadd cutouts jobs',
                            publishes: 'name',
                            displayField: 'displayName',
                            minChars: 0,
                            queryMode: 'local',
                            editable: true,
                            bind: {
                                store: '{tags}',
                                hidden: '{rdSingleEpoch.checked}',
                                disabled: '{rdSingleEpoch.checked}'
                            }
                        },
                        {
                            xtype: 'checkboxgroup',
                            fieldLabel: 'Filters',
                            cls: 'x-check-group-alt',
                            reference: 'cbgBands',
                            items: [
                                {boxLabel: 'g', name: 'band', inputValue: 'g'},
                                {boxLabel: 'r', name: 'band', inputValue: 'r'},
                                {boxLabel: 'i', name: 'band', inputValue: 'i'},
                                {boxLabel: 'z', name: 'band', inputValue: 'z'},
                                {boxLabel: 'Y', name: 'band', inputValue: 'Y'},
                                {
                                    boxLabel: 'All',
                                    name: 'band-all',
                                    reference: 'cbAllBands',
                                    listeners: {
                                        change: 'onCheckAllBands'
                                    }
                                }
                            ],
                            bind: {
                                hidden: '{!rdSingleEpoch.checked}',
                                disabled: '{!rdSingleEpoch.checked}'

                            }
                        },
                        {
                            xtype: 'checkbox',
                            boxLabel: 'Exclude blacklisted ccds',
                            name: 'no_blacklist',
                            inputValue: true,
                            bind: {
                                hidden: '{!rdSingleEpoch.checked}',
                                disabled: '{!rdSingleEpoch.checked}'
                            }
                        },

                        {
                            xtype: 'fieldset',
                            title: 'Labels',
                            defaultType: 'textfield',
                            defaults: {
                                anchor: '100%'
                            },
                            items: [
                                {
                                    xtype: 'radiogroup',
                                    fieldLabel: 'Position',
                                    cls: 'x-check-group-alt',
                                    name: 'label_position',
                                    items: [
                                        {boxLabel: 'Inside', inputValue: 'inside'},
                                        {boxLabel: 'Outside', inputValue: 'outside', checked: true}
                                    ]
                                },
                                {
                                    xtype: 'tagfield',
                                    name: 'label_properties',
                                    fieldLabel: 'Properties',
                                    displayField: 'display_name',
                                    publishes: 'id',
                                    valueField: 'id',
                                    queryMode: 'local',
                                    allowBlank: true,
                                    growMax: 60,
                                    maxLength: 5,
                                    bind: {
                                        store: '{contents}'
                                    }
                                }
                            ]
                        }
                    ]

                }
            ],
            buttons: [
                '->',
                {
                    text: 'Cancel',
                    handler: 'onCancelAddJob'
                },
                {
                    text: 'Submit',
                    ui: 'soft-green',
                    handler: 'onSubmitJob'
                }
            ]
        });

        me.callParent(arguments);
    },

    setCurrentProduct: function (record) {
        var me = this;

        me.currentProduct = record;

        me.fireEvent('changeproduct', record, me);
    }

});
