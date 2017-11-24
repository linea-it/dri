Ext.define('Explorer.view.system.Cmd', {
    extend: 'Explorer.view.system.D3SvgComponent',

    xtype: 'system-cmd',
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
            .domain([
                d3.min(data, function(d){return d.x}),
                d3.max(data, function(d){return d.x})
            ])
            .range([0, width]);

        // var bins = d3.histogram()
        //     .domain(x.domain())
        //     .thresholds(x.ticks(15))
        //     (data);

        // var y = d3.scaleLinear()
        //     .domain([0, d3.max(bins, function(d) {
        //         return d.length})])
        //     .range([height, 0]);

        var y = d3.scaleLinear()
        .domain([
                d3.min(data, function(d){return d.y}),
                d3.max(data, function(d){return d.y})
            ])
        .range([height, 0]);

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


       scene.selectAll(".dot")
           .data(data)
         .enter().append("circle")
           .attr("class", "dot")
           .attr("r", 3.5)
           .attr("cx", function(d) { return x(d.x); })
           .attr("cy", function(d) { return y(d.y); })
           .attr("fill", "steelblue")
    },

    loadData: function (store) {
        // console.log('loadData(%o)', store)
        var me = this,
            data = [];

        store.each(function (record) {
            console.log(record)
            var mag_r = parseFloat(record.get('mag_r')),
                mag_g = parseFloat(record.get('mag_g'));

            data.push({
                "x": mag_r,
                "y": mag_g - mag_r
            })
        })

        return data;
    }
});
