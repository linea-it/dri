Ext.define('Target.view.catalog.SubmitCutout', {
    extend: 'Ext.window.Window',

    xtype: 'targets-catalog-submitcutout',

    /**
     * @requires Ext.ux.colorpick.Field
     */
    requires: [
        'Ext.ux.colorpick.Field',
        'common.store.Filters'
    ],

    title: 'Create Cutout',

    width: 400,
    height: 550,
    layout: 'fit',
    constrainHeader: true,
    closeAction: 'destroy',

    initComponent: function () {
        var me = this,
            storeFilters = Ext.create('common.store.Filters', {});

        me.items = [{
            xtype: 'panel',
            layout: 'fit',
            items: [{
                xtype: 'form',
                bodyPadding: 10,
                scrollable: true,
                autoScroll: true,
                fieldDefaults: {
                    labelAlign: 'top'
                },
                defaults: {
                    xtype: 'textfield'
                },
                items: [{
                    xtype: 'fieldset',
                    title: 'Image',
                    items: [{
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        items: [{
                            xtype: 'numberfield',
                            fieldLabel: 'Size (arcsec)',
                            name: 'imageSize',
                            flex: 1,
                            margin: '0 10 10 0',
                            value: 55,
                            minValue: 10
                        }, {
                            xtype: 'combobox',
                            fieldLabel: 'Filter',
                            itemId: 'imageBand',
                            name: 'imageFilter',
                            width: 70,
                            store: storeFilters,
                            queryMode: 'local',
                            displayField: 'name',
                            valueField: 'filter',
                            value: 'irg',
                            readOnly: true
                        }]
                    }, {
                        xtype: 'checkboxfield',
                        boxLabel  : 'Fits Cutouts',
                        name      : 'fits',
                        inputValue: true
                    }]
                }, {
                    xtype: 'fieldset',
                    title: 'Draw Labels',
                    checkboxToggle: true,
                    checkboxName: 'labels',
                    items: [{
                        xtype: 'radiogroup',
                        fieldLabel: 'Style',
                        columns: 2,
                        vertical: true,
                        items: [
                            {boxLabel: 'Inside' , name: 'label_style', inputValue: 'inside', checked: true},
                            {boxLabel: 'Outside', name: 'label_style', inputValue: 'outside'}
                        ],
                        listeners: {
                            scope: this,
                            change: this.onChangeCutoutStyle
                        }
                    }, {
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        defaults: {
                            flex: 1
                        },
                        items: [{
                            xtype: 'colorfield',
                            fieldLabel: 'Font Color',
                            name: 'fontcolor',
                            value: '53F3DB',
                            itemId: 'field-fontcolor'
                        },{
                            xtype: 'colorfield',
                            fieldLabel: 'Background Color',
                            name: 'backgroundcolor',
                            value: 'FFFFFF',
                            itemId: 'field-backgroundcolor',
                            disabled: true
                        }]
                    },
                    {
                        xtype: 'fieldset',
                        title: 'Scale',
                        checkboxToggle: true,
                        checkboxName: 'scale',
                        items: [{
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            defaults: {
                                flex: 1
                            },
                            items: [{
                                xtype: 'numberfield',
                                fieldLabel: 'Length (arcsec)',
                                name: 'scale_value',
                                flex: 1,
                                margin: '0 10 10 0',
                                value: 10,
                                minValue: 0,
                                enableKeyEvents: true,
                                listeners: {
                                    scope: this,
                                    change: this.onKeyupScaleValue
                                }
                            },{
                                xtype: 'colorfield',
                                fieldLabel: 'Color',
                                name: 'scale_color',
                                value: '53F3DB'
                            }]
                        }]
                    }]
                }, {
                    xtype: 'textareafield',
                    name: 'comment',
                    fieldLabel: 'Comment',
                    anchor: '100%'
                }]
            }]
        }];

        me.buttons = [{
            xtype: 'button',
            text: 'Preview',
            scope: this,
            disabled: true
            // handler: this.onClickSubmit
        },{
            xtype: 'button',
            text: 'Submit',
            scope: this,
            handler: this.onClickSubmit
        }];

        me.callParent(arguments);
    },

    onKeyupImageWidth: function (field) {
        // Ao trocar o valor da scale atualizar o field legend
        // txtScaleLegend = this.down("#txtImageHeight");

        // value = field.getValue();
        // txtScaleLegend.setValue(value);
    },

    onKeyupScaleValue: function (field) {
        // Ao trocar o valor da scale atualizar o field legend
        // txtScaleLegend = this.down("#txtScaleLegend");

        // value = field.getValue();
        // if (value){
        //     txtScaleLegend.setValue(value+"\"");
        // }
        // else {
        //     txtScaleLegend.setValue("");
        // }
    },

    onChangeCutoutStyle: function (rg) {
        // console.log('SubmitCutoutWindow - onChangeStyle(%o)', rg)

        var me = this,
            value = rg.getValue(),
            fontcolor = me.down('#field-fontcolor'),
            backgroundcolor = me.down('#field-backgroundcolor');

        if (value.label_style == 'inside') {
            fontcolor.setValue('53F3DB');
            backgroundcolor.setValue('FFFFFF');
            backgroundcolor.disable();
        } else {
            fontcolor.setValue('000000');
            backgroundcolor.enable();
            backgroundcolor.setValue('FFFFFF');
        }
    },

    onClickSubmit: function () {
        // console.log("SubmitCutoutWindow - onClickSubmit()");

        var me = this,
            form = this.down('form').getForm(),
            values = form.getValues();

        params = this.formToParams(values);

        this.fireEvent('submitcutout', params);

        this.close();

    },

    formToParams: function (values) {

        params = {
            image: {
                scale: {},
                filter: null
            },
            fits: false
        };

        if ((values.imageWidth > 0) && (values.imageHeight > 0)) {
            params.image = {
                width: values.imageWidth,
                height: values.imageHeight
            };
        } else if (values.imageSize > 0) {
            params.image = {
                size: values.imageSize
            };
        }

        // Image Filter (g, r, i, z, Y ...)
        params.image.filter = values.imageFilter;

        // Include Fits cutout
        if (values.fits) {
            params.fits = values.fits;
        }

        if (values.labels == 'on') {

            params.labels = [];

            params.label = {
                style: values.label_style,
                fontcolor: '#' + values.fontcolor,
                backgroundcolor: '#' + values.backgroundcolor,
                // margin: 5,
                // linespacing: 4,
                labels: [{
                    'column': 'release_reference',
                    'position': [5, 2]
                },{
                    'column': 'reference_label',
                    'position': [5, 17]
                }]
            };

            // Scale
            if ((values.scale == 'on') && (values.scale_value > 0)) {
                params.label.scale = {
                    enable: true,
                    value: values.scale_value //in arcsec
                };
                if (values.scale_color) {
                    params.label.scale.color = '#' + values.scale_color;
                }
            }
        }

        if (values.comment) {
            params.comment = values.comment;
        }

        return params;
    }

});

