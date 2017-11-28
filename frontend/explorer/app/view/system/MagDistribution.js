Ext.define('Explorer.view.system.MagDistribution', {
    extend: 'Explorer.view.system.ZDistribution',

    xtype: 'system-mag-distribution',

    plotTitle: 'Mag Distribution',
    xAxisTitle: 'Mag',
    yAxisTitle: 'N',

    processData: function (store) {
        // console.log('processData(%o)', store)
        var me = this,
            data = [];

        store.each(function (record) {
            data.push(record.get('mag'))
        })

        // FAKE DATA
        //data = d3.range(128).map(d3.randomBates(10));

        return data;
    },
});
