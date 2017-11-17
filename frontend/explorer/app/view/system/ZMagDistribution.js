Ext.define('Explorer.view.system.ZMagDistribution', {
    extend: 'Explorer.view.main.D3Component',

    xtype: 'system-zmag-distribution',
    width: 400,
    height:300,

    padding: {
        top: 20,
        left: 40,
        right: 40,
        bottom: 40
    },

    onSceneResize: function (scene, rect) {
        console.log('onSceneResize(%o, %o)', scene, rect);

        var me = this,
            width = rect.width,
            height = rect.height,
            padding = me.getPadding(),
            data = me.loadData(me.getStore());

        console.log(data)

        // var data = d3.range(128).map(d3.randomBates(10));
        var x = d3.scaleLinear()
            // .domain([0, d3.max(data)])
            .domain([0, 1])
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
        var medianLine = d3.line()
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

       // text label for the x axis
       scene.append("text")
           .attr("transform",
                 "translate(" + (width/2) + " ," +
                                (height + 40) + ")")
           .style("text-anchor", "middle")
           .text("Redshift");

       // Y Axis Group
       scene.append("g")
           .attr("class", "axis axis--y")
           .call(d3.axisLeft(y));

       // text label for the y axis
       scene.append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", 0 - padding.left)
           .attr("x",0 - (height / 2))
           .attr("dy", "1em")
           .style("text-anchor", "middle")
           .text("N");

       scene.append("path")
           .attr("class", "line")
           .attr("d", medianLine(bins))
           .attr("fill", "none")
           .attr("stroke", "steelblue")
           .attr("stroke-width", "2px")

    },

    loadData: function (store) {
        console.log('loadData(%o)', store)
        var me = this,
            data = [],
            values = [];

        // store.each(function (record) {
        //     values.push(record.get('zp'))
        // })
        data = d3.range(store.count()).map(function(d){
            console.log(d)
            record = store.getAt(d);
            console.log(record)
            return record.get('zp');
        });
        // console.log(data)
        // me.setData(data);

        return data;
    }
});
