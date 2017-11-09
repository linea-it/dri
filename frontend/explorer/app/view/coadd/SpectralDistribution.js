Ext.define('Explorer.view.coadd.SpectralDistribution', {
    extend: 'Ext.chart.CartesianChart',

    xtype: 'coadd-spectral-distribution',

    requires: [
        'Ext.chart.CartesianChart',
        'Ext.chart.axis.Numeric',
        'Ext.chart.axis.Category',
        'Ext.chart.series.Scatter',
        'Ext.chart.interactions.CrossZoom',
        'Ext.chart.interactions.ItemHighlight',
        'Ext.chart.plugin.ItemEvents'
    ],

    innerPadding: 20,

    insetPadding: {
        top: 40,
        right: 20,
        bottom: 20,
        left: 40
    },

    sprites: [{
        type: 'text',
        text: 'Spectral Distribution',
        fontSize: 22,
        width: 100,
        height: 30,
        x: 40,
        y: 20
    }],

    axes: [
        {
            type: 'numeric',
            fields: ['flux'],
            title: 'log(Flux) [counts]',
            position: 'left',
            grid: true,
        },
        {
            id: 'wavelength-axis',
            type: 'category',
            title: 'Wavelength [nm]',
            fields: 'wavelength',
            position: 'bottom',
            grid: true
        },
        // {
        //     type: 'category',
        //     position: 'top',
        //     // linkedTo: 'wavelength-axis',
        //     fields: 'property',
        //     title: {
        //         text: 'Climate data for Redwood City, California',
        //         fillStyle: 'green'
        //     },
        //     titleMargin: 20,
        //     // renderer: function (axis, label) {
        //     //
        //     // }
        // },

    ],

    series: [
        {
            type: 'scatter',
            xField: 'wavelength',
            yField: 'flux',
            marker: {
                type: 'circle',
                fill: '#3333ff',
                radius: 8,
                lineWidth: 0
            },
            highlight: {
                radius: 12,
                lineWidth: 2
            },
            tooltip: {
                trackMouse: true,
                renderer: function (tooltip, record, item) {
                    tooltip.setHtml(
                        record.get('property') + ': ' + record.get('mag_auto'));
                }
            }
        },
    ],
});
