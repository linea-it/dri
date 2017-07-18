/**
 *
 */
Ext.define('Target.view.objects.Mosaic', {
    extend: 'Ext.panel.Panel',

    xtype: 'targets-objects-mosaic',

    scrollable: true,

    columns: [
        Ext.create('Ext.grid.RowNumberer'),
        {text: 'Tilename',  dataIndex: 'tilename', flex: 1},
        {text: 'Count',  dataIndex: 'num_objects', width: 60}
    ],

    config: {
        store: null,
        ready: true,
        cutoutJob: null,
        labelProperties: [],
        cutouts: null,
        imagesFormat: 'png'
    },

    setStore: function (store) {
        this.store = store;

    },

    setCutoutJob: function (cutoutJob, cutouts) {
        var me = this,
            labelProperties = [],
            properties;

        if ((cutoutJob) && (cutoutJob.get('id') > 0)) {
            me.cutoutJob = cutoutJob;

            me.setCutouts(cutouts);

            properties = cutoutJob.get('cjb_label_properties');

            if ((properties) && (properties !== '')) {

                labelProperties = properties.split(',');

                if (labelProperties.length > 0) {
                    me.setLabelProperties(labelProperties);

                    me.createView();
                }
            }
        }
    },

    createView: function () {
        // console.log("Targets Mosaic - createView()");
        var me = this,
            store = me.getStore(),
            labelProperties = me.getLabelProperties(),
            cutoutJob = me.getCutoutJob(),
            labels_inside = '',
            labels_outside = '',
            labels,
            string_tpl;

        if (me._view) {
            me.remove(me._view);
            me._view = null;
        }

        if ((labelProperties) && (labelProperties.length > 0)) {
            labels = me.createLabels();

            if (cutoutJob.get('cjb_label_position') === 'inside') {
                labels_inside = labels.toString();

            } else {
                labels_outside = labels.toString();
            }
        }

        string_tpl = '<tpl for=".">' +
                        '<div class="thumb-wrap" id="target_{_meta_ra}-{_meta_dec}">' +
                            '<div class="thumb">' +
                                labels_inside +
                                '<img style="width:200px; height:200px;"' +
                                    'src="{[this.getImageSource(values._meta_id)]}"' +
                                    'title="ID: {_meta_id} RA: {[this.formatNumber(values._meta_ra)]} ' +
                                        'Dec: {[this.formatNumber(values._meta_dec)]}"' +
                                    'onError="this.onerror=null;this.src=\'resources/cutout_placeholder.png\';" >' +
                                labels_outside +
                            '</div>' +
                        '</div>' +
                    '</tpl>' +
                    '<div class="x-clear"></div>';

        var tpl =  Ext.create('Ext.XTemplate',
            string_tpl.toString(),
            {
                getImageSource: me.getImageSource,
                formatNumber: me.formatNumber,
            }, this);

        var _view = Ext.create('Ext.view.View', {
            tpl: tpl,
            store:  store,
            itemSelector: 'div.thumb-wrap',
            emptyText: 'Choose a CutoutJob',
            multiSelect: false,
            trackOver: true,
            overItemCls:'x-item-over',
            listeners: {
                scope: me,
                select: function (selModel, record, index) {
                    me.fireEvent('select', selModel, record, index);
                }
            }
        });

        me._view = _view;
        me.add(_view);

    },

    getSelectionModel: function () {
        if (this._view) {
            return this._view.getSelectionModel();

        } else {
            return null;

        }
    },

    createLabels: function () {
        var me = this,
            cutoutJob = me.getCutoutJob(),
            labelProperties = me.getLabelProperties(),
            labels = [],
            tpl_label, label_element,
            tpl_labels,
            color = '',
            class_labels = 'mosaic-labels-outside';

        if (cutoutJob.get('cjb_label_position') === 'inside') {
            class_labels = 'mosaic-labels-inside';
        }

        if (cutoutJob.get('cjb_label_colors') !== null) {
            color = Ext.String.format(
                'style="color:#{0}; font-size:{1}px;"',
                cutoutJob.get('cjb_label_colors'),
                cutoutJob.get('cjb_label_font_size'));

        }

        tpl_label = '<spam class="mosaic-labels" {0}>{1}: {[this.formatNumber(values.{1})]}</spam>',

        Ext.each(labelProperties, function (label) {
            label_element = Ext.String.format(tpl_label, color, label);

            labels.push(label_element);
        }, me);

        tpl_labels = Ext.String.format('<div class="{0}">{1}</div>', class_labels, labels.join('</br>'));

        return tpl_labels;

    },

    getImageSource: function (meta_id) {
//        console.log('getImageSource(%o)', meta_id);

        var me = this,
            cutouts = me.getCutouts(),
            imagesFormat = me.getImagesFormat(),
            imageSource;

        imageSource = cutouts.getImageSourceByObjectId(
            meta_id,
            imagesFormat, true);

        return imageSource;
    },

    formatNumber: function (value) {
        var precision = 5,
            aValue, decimal;

        if (typeof(value) === 'number') {
            if (value.toString().indexOf('.') != -1) {

                aValue = value.toString().split('.');

                decimal = aValue[1];
                if (decimal) {
                    // se tiver mais casas decimais
                    if (decimal.length > precision) {
                        value =  value.toFixed(precision);
                    }
                }
            }
        } else {
            if (typeof(value) === 'string') {
                if (value.indexOf('.') != -1) {
                    if (parseFloat(value) != 'NaN') {
                        value = parseFloat(value);
                        aValue = value.toString().split('.');

                        decimal = aValue[1];
                        if (decimal) {
                            // se tiver mais casas decimais
                            if (decimal.length > precision) {
                                value =  value.toFixed(precision);
                            }
                        }
                    }
                }
            }
        }

        return value;
    }
});

