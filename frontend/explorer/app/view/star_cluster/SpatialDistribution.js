Ext.define('Explorer.view.star_cluster.SpatialDistribution', {
    extend: 'Explorer.view.star_cluster.D3SvgComponent',

    xtype: 'star_cluster-spatial-distribution',

    /**
     * Based on this exemples
     * Margin Examples: http://bl.ocks.org/binaworks/9dce0a385915e8953a45cc6be7fbde42#license </br>
     * Legend with color bar: https://bl.ocks.org/NGuernse/f36b4cc1b9d6860560df9245ab3c2b2b </br>
     * Heatmap in exagons: https://bl.ocks.org/NGuernse/f36b4cc1b9d6860560df9245ab3c2b2b </br>
     * Dinamic Colour Scale Legend: https://bl.ocks.org/starcalibre/6cccfa843ed254aa0a0d </br>
     */

    _outerContainer: null,

    _margin: null,
    _innerWidth: null,
    _innerHeight: null,
    _innerContainer: null,
    _padding: null,
    _height: null,
    _width: null,

    config: {
        xTicks: 6,
        yTicks: 6,
        svgMargin: {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        },
        proportionalSize: false,
        legendWidth: 20,
        legendHeight: null,
        plotData: null
    },



    performLayout: function (scene, rect) {
        // console.log('performLayout(%o, %o)', scene, rect);
        var me = this;

        me.setLoading(true);

        // Outer Container
        me._outerContainer = d3_container.container()
            .margin(5)
            .width(rect.width)
            .height(rect.height)


        me._margin = me._outerContainer.margin();
        me._innerWidth = me._outerContainer.contentWidth();
        me._innerHeight = me._outerContainer.contentHeight();

        // Inner Container
        me._innerContainer = d3_container.container().margin(10, 100, 50, 100);

        me._padding = me._innerContainer.margin();

        scene.call(me._outerContainer);

        me._content = me._outerContainer.content();

        var defs = me._content.append("defs");

        me._content.append("rect")
            .attr("class", "outer")
            .attr("width", me._innerWidth)
            .attr("height", me._innerHeight)
            .style("fill", "#fff");

        me._content.call(me._innerContainer);


        // g container
        me._g = me._innerContainer.content();
        //me._width = me._innerContainer.contentWidth(),
        // Usar a Altura do outer container como se fosse a largura para o plot ser um quadrado
        me._width = me._innerContainer.contentHeight();
        me._height = me._innerContainer.contentHeight();

        // Color Scale
        me._color = d3.scaleSequential(d3["interpolateViridis"])

        // Axis Scales
        me._xScale = d3.scaleLinear()
            .range([0, me._width]);

        me._yScale = d3.scaleLinear()
            .range([me._height, 0]);

        me._xAxis = d3.axisBottom(me._xScale)
            .ticks(me.getXTicks())
            .tickFormat(d3.format(".3f"));

        me._yAxis = d3.axisLeft(me._yScale)
            .ticks(me.getYTicks())
            .tickFormat(d3.format(".3f"));


        // Inner Box
        me._g.append("rect")
            .attr("class", "inner")
            .attr("width", me._width)
            .attr("height", me._height)
            .style("fill", "#fff");


        //Add clip path so points/line do not exceed boundaries
        me._g.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", me._width)
            .attr("height", me._height);


        // Legend Box
        me.setLegendHeight(me._height);
        me._legend = me._g.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + (me._width + 15) + ",0)");

        me._legendScale = d3.scaleLinear()
            .range([me.getLegendHeight(), 0]);


        // Tooltip
        me._tooltip = me._g.append("g")
            .attr("class", "tooltip-box")
            .attr("transform", "translate(" + (me._width + 70) + ",0)");

        me._tooltip.append("rect")
            // .attr("class", "inner")
            .attr("width", 120)
            .attr("height", 40)
            .style("fill", "lightgray")
            .style("opacity", 0);



        //Add tool tip and hide it until invoked
        // me._tooltip = d3.select(me.getEl().dom).append("div")
        //     .attr("class", "d3-tooltip")
        //     .style("top", (me._height) + "px")
        //     .style("left", (me._width + 50) + "px")
        //     .style("opacity", 1);


        me.setLoading(false);

        if (me.getPlotData() != null) {
            me.updatePlot();
        }

    },

    loadData: function (clusterSource, clusterId, vacSource, lon, lat, radius) {
        var me = this;

        params = {
            "clusterSource": clusterSource,
            "clusterId": clusterId,
            "vacSource": vacSource,
            "lon": lon,
            "lat": lat,
            "radius": radius
        }

        if (me.getPlotData() != null) {
            me.updatePlot();
        }

        me.loadingWindow = Ext.MessageBox.show({
            msg: 'Loading data, please wait...',
            progressText: 'Loagind...',
            width: 200,
            wait: {
                interval: 200
            }
        });

        me.setLoading(true);

        // Submit Catalog
        Ext.Ajax.request({
            cors: true,
            method: 'GET',
            url: '/dri/api/plugin/galaxy_cluster/',
            timeout: 9999999,
            success: function (response) {
                var data = JSON.parse(response.responseText);
                // Fechar a janela de registro
                me.setLoading(false);
                me.loadingWindow.close();

                if (data.values) {
                    me.setPlotData(data);
                    me.updatePlot()
                } else {
                    Ext.MessageBox.show({
                        title: 'Failure',
                        msg: "Sorry, there was an error in the server response.",
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.WARNING
                    });
                }
            },
            failure: function (response, opts) {
                me.setLoading(false);

                Ext.MessageBox.show({
                    title: 'Server Side Failure',
                    msg: response.status + ' ' + response.statusText,
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.WARNING
                });
            },
            // Headers necessarios para fazer um Post Autheticado no Django
            headers: {
                'Accept': 'application/json',
                'Application': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': Ext.util.Cookies.get('csrftoken')
            },
            params: params
        });
    },

    updatePlot: function () {
        // console.log("updatePlot()")
        var me = this,
            data = me.getPlotData();

        if (data) {
            // domain para a escala de cores
            me._color.domain([data.zmin, data.zmax]);

            // domain para as escalas
            me._xScale.domain([data.xmax, data.xmin]);
            me._yScale.domain([data.ymin, data.ymax]);

            // Adicionando os Axis
            me._g.append("g")
                .attr("class", "x axis axis--x")
                .attr("transform", "translate(0," + me._height + ")")
                .call(me._xAxis)

            me._g.append("g")
                .attr("class", "y axis axis--y")
                .call(me._yAxis)

            // Heatmap
            me._g.append("g")
                .attr("class", "density-map")
                .attr("clip-path", "url(#clip)")
                .selectAll("path")
                .data(data.values)
                .enter().append("rect")
                .attr('class', 'cell')
                .attr('width', 4)
                .attr('height', 4)
                .attr('x', function (d) { return me._xScale(d.x) })
                .attr('y', function (d) { return me._yScale(d.y) })
                .attr("fill", function (d) {
                    return me._color(d.z);
                })
                .style("stroke-width", 0)
                .on("mouseover", function (d) {
                    if (d.z > data.zmin) {

                        console.log("mouseover")
                        me._tooltip.selectAll("rect")
                            .style("opacity", 0.4)

                        me._tooltip.append("text")
                            .attr("class", "tootip-text label")
                            .attr("x", 30)
                            .attr("y", 15)
                            .style("text-anchor", "start")
                            .text(d.z.toFixed(3));
                    }
                })
                .on("mouseout", function (d) {
                    me._tooltip.selectAll("text").remove()
                    me._tooltip.selectAll("rect")
                        .style("opacity", 0)
                });


            // Cluster Radius
            me.drawClusterRadius();

            // MPC Radius
            me.drawMpcRadius();

            // Grid Lines
            // add the X gridlines
            me._g.append("g")
                .attr("class", "grid")
                .attr("transform", "translate(0," + me._height + ")")
                .call(me.make_x_gridlines()
                    .tickSize(-me._height)
                    .tickFormat("")
                )
                .style("stroke", "darkgrey")
                .style("stroke-opacity", 0.4)
                .style("shape-rendering", "crispEdges")
                .style("stroke-dasharray", "2 2")

            // add the Y gridlines
            me._g.append("g")
                .attr("class", "grid")
                .call(me.make_y_gridlines()
                    .tickSize(-me._width)
                    .tickFormat("")
                )
                .style("stroke", "darkgrey")
                .style("stroke-opacity", 0.4)
                .style("shape-rendering", "crispEdges")
                .style("stroke-dasharray", "2 2")

            me.updateLegend();

            me.drawAxisLabel();

            me.drawAxisLabel();

        }
    },

    updateLegend: function () {
        // console.log('updateLegend()')
        var me = this,
            data = me.getPlotData();

        if (!me._legendScale) {
            return false;
        }
        // Legend
        me._legendScale.domain(me._color.domain())

        var interval = (data.zmax - data.zmin) / me._height;

        me._legend.selectAll(".bars")
            .data(d3.range(data.zmax, data.zmin, -interval), function (d) {
                return d;
            })
            .enter().append("rect")
            .attr("class", "bars")
            .attr("x", 0)
            .attr("y", function (d, i) { return i; })
            .attr("height", 1)
            .attr("width", me.getLegendWidth())
            .style("fill", function (d, i) { return me._color(d); });

        me._legend.append("g")
            .attr("transform", "translate(" + (me.getLegendWidth()) + ", 0)")
            .attr("class", "legend-axis legend-axis-y")
            .call(d3.axisRight(me._legendScale));


        // Radius Legend
        me.drawRadiusLegendBox()

    },


    // gridlines in x axis function
    make_x_gridlines: function () {
        var me = this;
        return d3.axisBottom(me._xScale)
            .ticks(me._xTicks)
    },

    // gridlines in y axis function
    make_y_gridlines: function () {
        var me = this;
        return d3.axisLeft(me._yScale)
            .ticks(me._yTicks)
    },

    drawClusterRadius: function () {
        var me = this,
            data = me.getPlotData();

        // Cluster Radius
        me._g.append("path")
            .datum(data.radius)
            .attr("class", "cluster-radius")
            .attr("fill", "none")
            .attr("stroke", "Crimson")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "5 5")
            .attr("d", d3.line()
                .x(function (d) { return me._xScale(d.ra); })
                .y(function (d) { return me._yScale(d.dec); }));

    },

    drawMpcRadius: function () {
        var me = this,
            data = me.getPlotData();

        // Cluster Radius
        me._g.append("path")
            .datum(data.circle)
            .attr("class", "cluster-radius")
            .attr("fill", "none")
            .attr("stroke", "gold")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "5 5")
            .attr("d", d3.line()
                .x(function (d) { return me._xScale(d.ra); })
                .y(function (d) { return me._yScale(d.dec); }));

    },

    drawAxisLabel: function () {
        var me = this;

        // X Axis Label
        me._g.append("text")
            .attr("class", "label")
            .attr("x", me._width / 2)
            .attr("y", me._height + 40)
            .style("text-anchor", "middle")
            .text("RA (°)");

        // Y Axis Label
        me._g.append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("x", 0 - (me._height / 2))
            .attr("y", 0 - 55)
            .attr("text-anchor", "midle")
            .text("Dec (°)");
    },

    drawRadiusLegendBox: function () {
        var me = this;

        var lineFunction = d3.line()
            .x(function (d) { return d.x; })
            .y(function (d) { return d.y; })

        // Radius Legend
        me._radiusLegend = me._g.append("g")

        me._radiusLegend.append("rect")
            .attr("class", "inner")
            .attr("width", 120)
            .attr("height", 40)
            .style("fill", "lightgray")
            .style("opacity", 0.4)

        me._radiusLegend.append("path")
            .attr("d", lineFunction([{ "x": 5, "y": 15 }, { "x": 25, "y": 15 }]))
            .attr("fill", "none")
            .attr("stroke", "gold")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "5 5")

        me._radiusLegend.append("path")
            .attr("d", lineFunction([{ "x": 5, "y": 30 }, { "x": 25, "y": 30 }]))
            .attr("class", "cluster-radius")
            .attr("fill", "none")
            .attr("stroke", "Crimson ")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "5 5")

        me._radiusLegend.append("text")
            .attr("class", "label")
            .attr("x", 30)
            .attr("y", 15)
            .style("text-anchor", "start")
            .text("0.5 Mpc");

        me._radiusLegend.append("text")
            .attr("class", "label")
            .attr("x", 30)
            .attr("y", 30)
            .style("text-anchor", "start")
            .text("Cluster Radius");
    },

    lineFunction: function () {
        return d3.line()
            .x(function (d) { return d.x; })
            .y(function (d) { return d.y; })
    },

});
