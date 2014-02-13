var SnapChart = function(domId, options){
	var that = this,
		domNode = document.getElementById(domId.replace('#','')),
		svgChildNode = domNode.innerHTML='<svg width="100%" height="100%"></svg>';
		snap = Snap(domId+' svg'),
		extremes = {},
		axis = {},
		plots = [],
		yLabelTransform = options.yLabelTransform || function(y){return y.toString();};

	this.types = {
		bar: 'bar',
		line: 'line',
		pie: 'pie',
		area: 'area'
	};

	var implemetations = {
		'bar': drawBar,
		'line': drawLine,
		'area': drawArea,
		'pie': drawPie
	};

	function init(){
		populateExtremes(options);  
		if(options.type === 'pie'){
			drawPie();
		} else {
			drawAxis();
			for (var i = 0, len = options.data.length; i< len; i++){
				var dataSet = options.data[i];
				drawChart(dataSet, i);
			}
		}
	}

	function populateExtremes(options){
		
		var dataLimits = getDataLimits(options.data);

		extremes = {
			positions:{
				axis:{
					min:{
						x:30,
						y:10
					},
					max:{
						x:options.width || domNode.offsetWidth -10,
						y:options.height || domNode.offsetHeight - 30,  
					}       
				},
				dom:{
					min:{
						x:0,
						y:0
					},
					max:{
						x:options.width || domNode.offsetWidth,
						y:options.height || domNode.offsetHeight,   
					}   
				}   
			},
			data:{
				limits: {
					min: dataLimits.min,
					max: dataLimits.max
				}
			}               
		};

		// adding values calulcated from initial dataset
		extremes.plots = {
			width: ((extremes.positions.axis.max.x - extremes.positions.axis.min.x) / dataLimits.len)
		};

		extremes.yLabels = calculateYaxisSteps();

	}

	function getDataLimits(data){
		var maxLen = 0;
		var maxData = data[0].values[0];
		for(var i = 0, len = data.length; i < len; i++){
			var dataSet = data[i];
			result = getDataSetLimits(dataSet);
			maxLen = maxLen < result.len ? result.len : maxLen;
			maxData = maxData < result.max ? result.max : maxData;
		}
		return {len:maxLen, max:maxData, min:0};
	}

	function getDataSetLimits(dataSet){
		var len = dataSet.values.length;
		var max = dataSet.values[0];
		for (var i = 1; i<len;i++){
			var val = dataSet.values[i];
			max = max < val ? val : max;
		}
		return {len:len, max:max};
	}

	function calculateYaxisSteps(){
		// this might seem counter intuitive but using neg significant magnitude
		// to avoid float errors for positive numbers less than 1
		var numSteps,
			min,
			max,
			steps = [],
			negSignificantMagnitude,
			significantDigit;

		var dataLimitMaxString = extremes.data.limits.max.toString();
		if(extremes.data.limits.max > 1){
			significantDigit = parseInt(dataLimitMaxString[0]);
			numSteps = significantDigit + 1;
			var exponent = Math.floor(Math.log(extremes.data.limits.max)/Math.log(10));
			negSignificantMagnitude = 1/Math.pow(10, exponent);
		} else if (extremes.data.limits.max>0){
			var negExponent = 0;
			do{
				negExponent++;
				significantDigit = Math.floor(extremes.data.limits.max*Math.pow(10,negExponent));
			} while(significantDigit < 1);
			negSignificantMagnitude = Math.pow(10,negExponent);
		}
		numSteps = significantDigit+1;  
		for (var i = 0; i <= numSteps; i++){
				var step = i/negSignificantMagnitude;
				steps.push(step);
			}
		return {
			numberOfSteps: numSteps,
			steps: steps,
			min: steps[0],
			max: steps[steps.length-1]
		};
	}

	function calculteScaledY(y){
		var ratio = y / extremes.yLabels.max;
		return (extremes.positions.axis.max.y - extremes.positions.axis.min.y)*ratio;
	}

	function drawAxis(){
		var axisLineOptions = {stroke:'rgba(0,0,0,.5)', strokeWidth:1};
		
		// axis.y = snap.line(
		//  extremes.positions.axis.min.x,
		//  extremes.positions.axis.min.y,
		//  extremes.positions.axis.min.x,
		//  extremes.positions.axis.max.y);
		// axis.y.attr(axisLineOptions);

		axis.x = snap.line(
			extremes.positions.axis.min.x,
			extremes.positions.axis.max.y,
			extremes.positions.axis.max.x,
			extremes.positions.axis.max.y);
		axis.x.attr(axisLineOptions);

		// xaxis lables
		var xOffset = extremes.plots.width/2;
		axis.xLables = _.map(options.labels, function(label, i){
			var x = extremes.positions.axis.min.x + xOffset + (extremes.plots.width*i);
			var y = extremes.positions.axis.max.y + 15;
			var text = snap.text(x, y, label);
			text.attr({'text-anchor':'middle'});
			return text;
		});

		// yaxis labels     
		axis.yLabels = _.map(extremes.yLabels.steps, function(step, i){
			var x = extremes.positions.axis.min.x - 5;
			var y = extremes.positions.axis.max.y - calculteScaledY(step);
			var label = yLabelTransform(step);
			var text = snap.text(x, y, label);
			text.attr({'text-anchor':'end', 'dominant-baseline':'middle'});
			return text;
		});

		// yaxis gridlines
		var axisGridLineOptions = {stroke:'rgba(0,0,0,.1)', strokeWidth:1};

		axis.yGridLines = _.map(extremes.yLabels.steps, function(step, i){
			if(step === 0) return;
			var y = extremes.positions.axis.max.y - calculteScaledY(step);
			var line = snap.line(extremes.positions.axis.min.x, y, extremes.positions.axis.max.x, y);
			line.attr(axisGridLineOptions);
		});

	}

	function drawChart(dataSet, i){
		var type = options.type || that.types.bar;
		implemetations[type](dataSet,i);
	}

	function drawBar(dataSet,i){
		var numSeries = options.data.length; 

		var barWidthRatio = 0.9,
			barMarginRatio = 0.05;

		var barWidth = extremes.plots.width*barWidthRatio/numSeries;
		var barMarginWidth = extremes.plots.width*barMarginRatio;

		plots = _.map(dataSet.values, function(value, key){
			var x = extremes.positions.axis.min.x + (key*barWidth*numSeries) + (barWidth*i) + (key*2*barMarginWidth) + barMarginWidth;
			var y = extremes.positions.axis.max.y;
			var width = barWidth;
			var height = (calculteScaledY(value));
			// var bar = snap.rect(x, y - height, width, height);
			var bar = snap.rect(x, y, width, 0);
			bar.attr({fill:getFill(dataSet)});
			bar.animate({y:y-height,height:height}, 350, mina.easeout);
			return bar;
		});
	}

	function drawLine(dataSet,i){
		var plotPointWidth = extremes.plots.width;
		var path = '';
		var first = true;
		var preAnimationPlots = [];
		var dataPlots = [];
		var yMaxString = extremes.positions.axis.max.y;
		_.each(dataSet.values, function(value, key){
			var pathLetter = 'L';
			if(first){
				pathLetter = 'M';
				first = false;
			}
			var x = plotPointWidth/2 + (plotPointWidth*key) + extremes.positions.axis.min.x;
			var y = extremes.positions.axis.max.y - calculteScaledY(value);
			dataPlots.push(pathLetter + x.toString() + ',' + y.toString()); 
			preAnimationPlots.push(pathLetter + x.toString() + ',' + yMaxString);
		});
		path = snap.path(preAnimationPlots.join(','));
		path.attr({fill:'transparent', stroke:dataSet.color,strokeWidth:3});
		path.animate({d: dataPlots.join(',')}, 350, mina.easeout);

	}
	
	function drawArea(dataSet){
		var plotPointWidth = extremes.plots.width;
		var path = '';
		var preAnimationPlots = [];
		var dataPlots = [];
		var yMaxString = extremes.positions.axis.max.y;
		_.each(dataSet.values, function(value, key){
			var pathLetter = 'L';
			var x = plotPointWidth/2 + (plotPointWidth*key) + extremes.positions.axis.min.x;
			var y = extremes.positions.axis.max.y - calculteScaledY(value);
			dataPlots.push(pathLetter + x.toString() + ',' + y.toString()); 
			preAnimationPlots.push(pathLetter + x.toString() + ',' + yMaxString);
		});
		var firstPoint = (
			'M'+ 
			(plotPointWidth/2 + extremes.positions.axis.min.x).toString() +
			','  + 
			yMaxString
		);
		dataPlots.unshift(firstPoint);
		preAnimationPlots.unshift(firstPoint);

		var lastPoint = (
			'L'+ 
			(plotPointWidth/2 + (plotPointWidth * (dataSet.values.length -1)) + extremes.positions.axis.min.x).toString() +
			',' +
			yMaxString
		);
		dataPlots.push(lastPoint);
		path = snap.path(preAnimationPlots.join(','));
		path.attr({fill:getFill(dataSet)});
		path.animate({d: dataPlots.join(',')}, 350, mina.easeout);
	}

	function drawPie(){
		var sum = _.reduce(options.data, function(m,d){
			return m+ d.values[0];
		},0);

		var sumDeg = 0;
		var data = options.data;

		var origo ={
			x:((extremes.positions.dom.max.x - extremes.positions.dom.min.x)/2),
			y:((extremes.positions.dom.max.y - extremes.positions.dom.min.y)/2)
		};

		var radius = origo.x > origo.y ? origo.y - 10 : origo.x - 10;

		for (var i = 0, len = data.length; i < len; i++){
			var dataSet = data[i];
			var ratio  = dataSet.values[0]/sum;
			if (ratio < 1){
				var deg = ratio * 2 * Math.PI;
				var xto = radius*Math.cos(deg);
				var yto = radius*Math.sin(deg);
				var flag1 = deg > Math.PI ? 0:1;
				var flag2 = deg < Math.PI ? 0:1;
				var path = [
					'M'+(origo.x).toString(),
					origo.y,
					'L'+(origo.x+radius).toString(),
					origo.y,
					'A'+(radius).toString(),
					radius,
					0, flag2, 1,
					origo.x+xto,origo.y+yto,        
					'Z'
				];
				

				var p = snap.path(path.join(' '));
				p.attr({fill: getFill(dataSet)});
				p.animate( { transform: "r" + (-90+(sumDeg*180/Math.PI))  +","+origo.x+","+origo.y }, 500 );
				sumDeg += deg;
			} else{
				var c = snap.circle(origo.x, origo.y, 0);
				c.attr({fill:getFill(dataSet)});
				c.animate({r:radius},500);
			}
		}
	}

	function getFill(dataSet){
		var patterns = {
			stripes:function(){
				var p = snap.path("M10-5-10,15M15,0,0,15M0-5-20,15").attr({
					fill: "none",
					stroke: dataSet.color,
					strokeWidth: 5
				});
				return p.pattern(0, 0, 10, 10);
			},
			triangles:function(){
				var p = snap.path("M10-5-10,15").attr({
					fill: "none",
					stroke: dataSet.color,
					strokeWidth: 6
				});
				return p.pattern(0, 0, 10, 10);
			},
			zigzag:function(){
				var p = snap.path("M10-5-10,15,15,0,0,15,0-5-20,15").attr({
					fill: "none",
					stroke: dataSet.color,
					strokeWidth: 1
				});
				return p.pattern(0, 0, 10, 10);
			},
			dots:function(){
				var p = snap.circle(2.5,2.5,2).attr({
					fill: dataSet.color,
					stroke: "none",
					strokeWidth: 0
				});
				return p.pattern(0, 0, 5, 5);
			},
			none:function(){return dataSet.color;}
		};
		var fill = patterns[dataSet.pattern] || patterns.none;
		return fill();
	}

	this.update = function(options){
		console.log('not implemeted yet');
	};
	init();
	return that;
};

// function SnapLegend(domid, options){

// 	var domNode = document.getElementById(domid.replace('#',''));

// 	var series = _.map(options.data, function(s){
// 		return '<div class="series"><div class="legend-elem-color" style="background-color:'+s.color+'"></div> '+s.name + '</div>';
// 	});
// 	series.unshift('<div class="legend">');
// 	series.push('</div>');
// 	domNode.innerHTML = series.join(' ');
// }   

function SnapLegend(domid, options){
	function getFill(dataSet, snap){
		var patterns = {
			stripes:function(){
				var p = snap.path("M10-5-10,15M15,0,0,15M0-5-20,15").attr({
					fill: "none",
					stroke: dataSet.color,
					strokeWidth: 5
				});
				return p.pattern(0, 0, 10, 10);
			},
			triangles:function(){
				var p = snap.path("M10-5-10,15").attr({
					fill: "none",
					stroke: dataSet.color,
					strokeWidth: 6
				});
				return p.pattern(0, 0, 10, 10);
			},
			zigzag:function(){
				var p = snap.path("M10-5-10,15,15,0,0,15,0-5-20,15").attr({
					fill: "none",
					stroke: dataSet.color,
					strokeWidth: 1
				});
				return p.pattern(0, 0, 10, 10);
			},
			dots:function(){
				var p = snap.circle(2.5,2.5,2).attr({
					fill: dataSet.color,
					stroke: "none",
					strokeWidth: 0
				});
				return p.pattern(0, 0, 5, 5);
			},
			none:function(){return dataSet.color;}
		};
		var fill = patterns[dataSet.pattern] || patterns.none;
		return fill();
	}

	var domNode = document.getElementById(domid.replace('#',''));

	var series = _.map(options.data, function(s,k){
		return '<div class="series"><svg class="legend-elem-color data-series-'+k+'" ></svg> '+s.name + '</div>';
	});
	series.unshift('<div class="legend">');
	series.push('</div>');
	domNode.innerHTML = series.join(' ');
	_.each(options.data,function(s,k){
		var selector = domid + ' .data-series-'+k;
		var snap = Snap(selector);
		snap.rect(0,0,15,15).attr({fill:getFill(s,snap)});
	});
}   
