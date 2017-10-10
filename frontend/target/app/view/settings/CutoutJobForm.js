Ext.define('Target.view.settings.CutoutJobForm', {
    extend: 'Ext.window.Window',

    requires: [
        'Target.view.settings.CutoutJobController',
        'Target.view.settings.CutoutJobModel'
    ],

    xtype: 'target-cutoutjob-form',

    title: 'Create Mosaic',
    width: 450,
    height: 500,
    layout: 'fit',
    modal: true,

    controller: 'cutoutjob',
    viewModel: 'cutoutjob',

    closeAction: 'hide',

    config: {
        currentProduct: null,
        currentSetting: null
    },

    initComponent: function () {
        var me = this;
        Ext.apply(this, {

            items: [
                {
                    xtype: 'form',
                    bodyPadding: 20,
                    defaults: {
                        labelWidth: 125,
                        anchor: '95%',
                        margin: '0 0 10 0'
                    },
                    items: [
                        {
                            xtype: 'textfield',
                            fieldLabel: 'Name',
                            name: 'job_name',
                            allowBlank: false,
                            maxLength: 40
                        },
                        {
                            xtype: 'radiogroup',
                            fieldLabel: 'Type',
                            cls: 'x-check-group-alt',
                            name: 'job_type',
                            items: [
                                {boxLabel: 'Coadd Images', inputValue: 'coadd', checked: true},
                                {boxLabel: 'Single Epoch', inputValue: 'single', reference: 'rdSingleEpoch', disabled: true}
                            ]
                        },
                        {
                            xtype: 'numberfield',
                            fieldLabel: 'X Size (arcsec)',
                            value: 60,
                            name: 'xsize',
                            hideTrigger: true
                            // minValue: 1,
                            // maxValue: 10
                        },
                        {
                            xtype: 'numberfield',
                            fieldLabel: 'Y Size (arcsec)',
                            value: 60,
                            name: 'ysize',
                            hideTrigger: true
                            // minValue: 1,
                            // maxValue: 10
                        },
                        {
                            xtype: 'combobox',
                            name: 'tag',
                            fieldLabel: 'Release TAG',
                            emptyText: 'Release tag for coadd cutouts',
                            valueField: 'name',
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
                                        {boxLabel: 'Inside', inputValue: 'inside', checked: true},
                                        {boxLabel: 'Outside', inputValue: 'outside'}
                                    ]
                                },
                                {
                                    xtype: 'colorfield',
                                    fieldLabel: 'Font Color',
                                    name: 'label_color',
                                    value: '#2eadf5'
                                },
                                {
                                    xtype: 'numberfield',
                                    fieldLabel: 'Font Size',
                                    name: 'label_font_size',
                                    value: 10,
                                    // hideTrigger: true,
                                    minValue: 6,
                                    maxValue: 18
                                },
                                {
                                    xtype: 'tagfield',
                                    name: 'label_properties',
                                    fieldLabel: 'Properties',
                                    displayField: 'display_name',
                                    valueField: 'column_name',
                                    queryMode: 'local',
                                    allowBlank: true,
                                    growMax: 60,
                                    // maxLength: 5,
                                    bind: {
                                        store: '{auxcontents}'
                                    }
                                }
                            ]
                        },
                        {
                            xtype: 'textarea',
                            labelAlign: 'top',
                            fieldLabel: 'Comment',
                            name: 'cjb_description',
                            maxLength: 1024
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
    },

    setCurrentSetting: function (record) {
        var me = this;

        me.currentSetting = record;

        me.fireEvent('changesetting', record, me);
    }

});
