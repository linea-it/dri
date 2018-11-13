Ext.define('Target.view.settings.CutoutJobForm', {
    extend: 'Ext.window.Window',

    requires: [
        'Target.view.settings.CutoutJobController',
        'Target.view.settings.CutoutJobModel'
    ],

    xtype: 'target-cutoutjob-form',

    title: 'Create Mosaic',
    width: 450,
    height: 540,
    layout: 'fit',
    modal: true,

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
            me.availableReleases = Settings.DES_CUTOUT_SERVICE__AVAILABLE_RELEASES
        }
        catch (err) {
            console.warn("Setting DES_CUTOUT_SERVICE__AVAILABLE_RELEASES not loaded.");
        }

        // recupera do settings a quantidade maxima de objetos que podem
        // ser enviadas para o descut
        try {
            me.maxObjects = Settings.DES_CUTOUT_SERVICE__MAX_OBJECTS
        }
        catch (err) {
            console.warn("Setting DES_CUTOUT_SERVICE__MAX_OBJECTS not loaded.");
        }

        // Desabilitar outros releases caso esteja definido no settings no Backend
        // Na secao DES_CUTOUT_SERVICE
        toBeRemoved = []
        if (me.availableReleases != null){
            vm.set('enableRelease', true);
            if ((Array.isArray(me.availableReleases)) &&
                (me.availableReleases.length > 0)){

                tags.each(function (record) {
                    if (me.availableReleases.indexOf(record.get('name')) == -1) {
                        toBeRemoved.push(record);
                    }
                })

                tags.remove(toBeRemoved);
            }
        } else {
            // Esconde a combobox de Releases
            vm.set('enableRelease', false);
        }

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
                            reference: 'CmbReleaseTag',
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
                            xtype: 'radiogroup',
                            fieldLabel: 'Image Formats',
                            cls: 'x-check-group-alt',
                            name: 'image_formats',
                            items: [
                                {boxLabel: 'only PNGs (fast)', inputValue: 'png', checked: true},
                                {boxLabel: 'PNGs and Fits', inputValue: 'png,fits'}
                            ]
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

    afterRender: function () {
        console.log('afterRender')
        var me = this,
            vm = me.getViewModel(),
            se = me.lookup('rdSingleEpoch'),
            cmbTag = me.lookup('CmbReleaseTag');

        me.callParent(arguments);

        // Esconder a combobox Tag de acordo com a settings no Backend
        // Outra regra interfere na visibilidade da combo e a selecao de Single
        // Epoch
        if ((vm.get('enableRelease')) && (!se.checked)) {
            cmbTag.setVisible(true)
        } else {
            cmbTag.setVisible(false)
        }
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
