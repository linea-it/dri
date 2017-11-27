Ext.define('Explorer.view.system.MagDistribution', {
    extend: 'Explorer.view.system.D3SvgComponent',

    xtype: 'system-mag-distribution',

    plotTitle: 'Mag Distribution',
    xAxisTitle: 'Mag',
    yAxisTitle: 'N',

    performLayout: function (scene, rect) {
        console.log('performLayout(%o, %o)', scene, rect);

        var me = this,
            width = rect.width,
            height = rect.height,
            data = me.processData(me.getStore()),
            svgMargin = me.getSvgMargin();

        // console.log(data)

        // var data = d3.range(128).map(d3.randomBates(10));
        var x = d3.scaleLinear()
            .domain([d3.min(data), d3.max(data)])
            // .domain([0, 1])
            .range([0, width]);

        var bins = d3.histogram()
            .domain(x.domain())
            .thresholds(x.ticks(15))
            (data);

        var y = d3.scaleLinear()
            .domain([0, d3.max(bins, function(d) {
                return d.length})])
            .range([height, 0]);



        // Step Line: https://github.com/d3/d3-shape#lines
        var line = d3.line()
            .x(function (d, i) {
                return x(d.x0)
            })
            .y(function (d, i) {
                return y(d.length)
            })
            .curve(d3.curveStepAfter) // Transforma a linha em Steps


       // X Axis Group
       scene.append("g")
           .attr("class", "axis axis--x")
           .attr("transform", "translate(0," + height + ")")
           .call(d3.axisBottom(x));

       // Y Axis Group
       scene.append("g")
           .attr("class", "axis axis--y")
           .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format("d")));

       scene.append("path")
           .attr("class", "line")
           .attr("d", line(bins))
           .attr("fill", "none")
           .attr("stroke", "steelblue")
           .attr("stroke-width", "2px")

        // Adiciona as Labels nos Axis
        me.createAxisTitles();

        // Adiciona o Titulo do Plot
        me.createPlotTitle()
    },

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
