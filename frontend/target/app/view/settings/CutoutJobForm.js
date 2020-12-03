Ext.define('Target.view.settings.CutoutJobForm', {
    extend: 'Ext.window.Window',

    requires: [
        'Target.view.settings.CutoutJobController',
        'Target.view.settings.CutoutJobModel'
    ],

    xtype: 'target-cutoutjob-form',

    title: 'Create Cutout',
    width: 450,
    height: 600,
    layout: 'fit',
    modal: true,
    constrain: true,
    controller: 'cutoutjob',
    viewModel: 'cutoutjob',
    closeAction: 'hide',
    config: {
        currentProduct: null,
        currentSetting: null,
        availableReleases: null,
        objectsCount: null,
        maxObjects: 300
    },

    initComponent: function () {
        var me = this,
            vm = me.getViewModel(),
            tags = vm.getStore('tags');

        // recupera do settings os releases disponiveis no servico de cutout
        try {
            me.availableReleases = Settings.DESACCESS_API__AVAILABLE_RELEASES
        }
        catch (err) {
            console.warn("Setting DESACCESS_API__AVAILABLE_RELEASES not loaded.");
        }

        if (me.availableReleases != null) {
            vm.set('enableRelease', true);

            // Listar na Combobox Release apenas os releases que estão na settings. 
            if ((Array.isArray(me.availableReleases)) && (me.availableReleases.length > 0)) {
                // Para cada release aceito pelo DESaccess
                Ext.Array.each(me.availableReleases, function (release) {
                    // Adiciona na Store tags.
                    tags.add({ name: release, displayName: release });
                });
            }

        } else {
            // Esconde a combobox de Releases
            vm.set('enableRelease', false);
        }

        Ext.apply(this, {
            items: [
                {
                    xtype: 'form',
                    scrollable: 'vertical',
                    bodyPadding: 10,
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
                            xtype: 'combobox',
                            reference: 'CmbReleaseTag',
                            name: 'tag',
                            fieldLabel: 'Release TAG',
                            emptyText: 'Release tag for cutouts',
                            valueField: 'name',
                            displayField: 'displayName',
                            minChars: 0,
                            queryMode: 'local',
                            editable: true,
                            bind: {
                                store: '{tags}',
                                visible: '{enableRelease}',
                            }
                        },
                        {
                            xtype: 'fieldcontainer',
                            fieldLabel: 'Cutout Size (arcminutes)',
                            layout: 'hbox',
                            items: [
                                {
                                    xtype: 'numberfield',
                                    fieldLabel: 'X',
                                    value: 1,
                                    name: 'xsize',
                                    labelWidth: 20,
                                    minValue: 0.1,
                                    maxValue: 12,
                                    step: 0.1,
                                    flex: 1,
                                    margin: '0 10 0 0'
                                },
                                {
                                    xtype: 'numberfield',
                                    fieldLabel: 'Y',
                                    value: 1,
                                    name: 'ysize',
                                    labelWidth: 20,
                                    minValue: 0.1,
                                    maxValue: 12,
                                    step: 0.1,
                                    flex: 1
                                },
                            ]
                        },
                        {
                            xtype: 'fieldset',
                            title: 'Color Image STIFF format',
                            checkboxToggle: true,
                            checkboxName: 'makeStiff',
                            collapsed: false,
                            items: [
                                {
                                    xtype: 'checkboxgroup',
                                    fieldLabel: 'Bands',
                                    name: 'stiffColors',
                                    reference: 'cbgStiffColor',
                                    items: [
                                        { boxLabel: 'gri', inputValue: 'gri', checked: true },
                                        { boxLabel: 'rig', inputValue: 'rig' },
                                        { boxLabel: 'zgi', inputValue: 'zgi' },
                                        {
                                            boxLabel: 'All',
                                            name: 'stiffColorsAll',
                                            listeners: {
                                                change: 'onCheckAllStiffBands'
                                            }
                                        }
                                    ],
                                },
                            ],
                        },
                        {
                            xtype: 'fieldset',
                            title: 'Color Image Lupton method',
                            checkboxToggle: true,
                            checkboxName: 'makeLupton',
                            collapsed: true,
                            items: [
                                {
                                    xtype: 'checkboxgroup',
                                    fieldLabel: 'Bands',
                                    name: 'luptonColors',
                                    reference: 'cbgLuptonColor',
                                    items: [
                                        { boxLabel: 'gri', inputValue: 'gri' },
                                        { boxLabel: 'rig', inputValue: 'rig' },
                                        { boxLabel: 'zgi', inputValue: 'zgi' },
                                        {
                                            boxLabel: 'All',
                                            name: 'luptonColorsAll',
                                            listeners: {
                                                change: 'onCheckAllLuptonBands'
                                            }
                                        }
                                    ],
                                },
                            ],
                        },
                        {
                            xtype: 'fieldset',
                            title: 'Fits',
                            checkboxToggle: true,
                            checkboxName: 'makeFits',
                            collapsed: true,
                            items: [
                                {
                                    xtype: 'checkboxgroup',
                                    fieldLabel: 'Bands',
                                    name: 'fitsColors',
                                    reference: 'cbgFitsColor',
                                    items: [
                                        { boxLabel: 'g', inputValue: 'g' },
                                        { boxLabel: 'r', inputValue: 'r' },
                                        { boxLabel: 'i', inputValue: 'i' },
                                        { boxLabel: 'z', inputValue: 'z' },
                                        { boxLabel: 'Y', inputValue: 'y' },
                                        {
                                            boxLabel: 'All',
                                            name: 'fitsColorsAll',
                                            listeners: {
                                                change: 'onCheckAllFitsBands'
                                            }
                                        }
                                    ],
                                },
                            ],
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
                                        { boxLabel: 'Inside', inputValue: 'inside', checked: true },
                                        { boxLabel: 'Outside', inputValue: 'outside' }
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

    afterRender: function () {
        // console.log('afterRender')
        var me = this;
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
