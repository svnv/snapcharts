var SnapChart = function(domId, options){
	var that = this,
		snap = Snap(domId),
		extremes = {},
		axis = {},
		plots = [],
		yLabelTransform = options.yLabelTransform || function(y){return y.toString();},
		domNode = document.getElementById(domId.replace('#',''));

	this.types = {
		bar: 'bar',
		line: 'line',
		pie: 'pie',
		area: 'area'
	}

	var implemetations = {
		'bar': drawBar,
		'line': drawLine,
		'area': drawArea
	}

	function init(){
		populateExtremes(options);
		drawAxis(options.type);
		for (var i = 0, len = options.data.length; i< len; i++){
			var dataSet = options.data[i];
			drawChart(dataSet);
		}
	}

	function populateExtremes(options){
		
		var dataLimits = getDataLimits(options.data);
		console.log(dataLimits);

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
		console.log(extremes);

	};

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
		var numSteps,
			min,
			max,
			steps = [];

		var dataLimitMaxString = extremes.data.limits.max.toString();
		if(extremes.data.limits.max > 1){
			var mostSignificantDigit = parseInt(dataLimitMaxString[0]);
			var numSteps = mostSignificantDigit + 1;
			// var exponent = dataLimitMaxString.length == 1 ? 1 : dataLimitMaxString.length - 1;
			var exponent = Math.floor(Math.log(extremes.data.limits.max)/Math.log(10))
			var significantMagnitude = Math.pow(10, exponent);
			steps = [];
			for (var i = 0; i <= numSteps; i++){
				var step = i*significantMagnitude;
				steps.push(step);
			}
			min = steps[0];
			max = steps[steps.length-1];
		} else if (extremes.data.limits.max>0){
			var significantIndex = 2,
				digit = '';
			for(; significantIndex < dataLimitMaxString.length; significantIndex++){
				digit = dataLimitMaxString[significantIndex];
				if(dataLimitMaxString !== '0'){
					break;
				}
			}
			var significantMagnitude = Math.pow(10,significantIndex-1);
			var numSteps = parseInt(digit)+1;
			for (var i = 0; i <= numSteps; i++){
				var step = i/significantMagnitude;
				steps.push(step);
			}
			min = steps[0];
			max = steps[steps.length-1];
		}
		return {
			numberOfSteps: numSteps,
			steps: steps,
			min: min,
			max: max
		}
	}

	function calculteScaledY(y){
		var ratio = y / extremes.yLabels.max;
		return (extremes.positions.axis.max.y - extremes.positions.axis.min.y)*ratio;
	}

	function drawAxis(type){
		if(type === 'pie') return;
		var axisLineOptions = {stroke:'rgba(0,0,0,.5)', strokeWidth:1} 
		
		axis.y = snap.line(
			extremes.positions.axis.min.x,
			extremes.positions.axis.min.y,
			extremes.positions.axis.min.x,
			extremes.positions.axis.max.y);
		axis.y.attr(axisLineOptions);

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
			text.attr({'text-anchor':'middle'})
			return text;
		});

		// yaxis labels		
		axis.yLabels = _.map(extremes.yLabels.steps, function(step, i){
			console.log(step);
			var x = extremes.positions.axis.min.x - 5;
			var y = extremes.positions.axis.max.y - calculteScaledY(step);
			var label = yLabelTransform(step);
			var text = snap.text(x, y, label);
			text.attr({'text-anchor':'end', 'dominant-baseline':'middle'});
			return text;
		});

		// yaxis gridlines
		var axisGridLineOptions = {stroke:'rgba(0,0,0,.1)', strokeWidth:1} 

		axis.yGridLines = _.map(extremes.yLabels.steps, function(step, i){
			if(step === 0) return;
			var y = extremes.positions.axis.max.y - calculteScaledY(step);
			var line = snap.line(extremes.positions.axis.min.x, y, extremes.positions.axis.max.x, y);
			line.attr(axisGridLineOptions);
		})

	};

	function drawChart(dataSet){
		var type = options.type || that.types.bar;
		implemetations[type](dataSet);
	};

	function drawBar(dataSet){
		var barWidthRatio = .9;
		var barMarginRatio = .05;

		var barWidth = extremes.plots.width*barWidthRatio;
		var barMarginWidth = extremes.plots.width*barMarginRatio;

		plots = _.map(dataSet.values, function(value, key){
			var x = extremes.positions.axis.min.x + (key*barWidth) + (key*2*barMarginWidth) + barMarginWidth;
			var y = extremes.positions.axis.max.y
			var width = barWidth;
			var height = (calculteScaledY(value));
			// var bar = snap.rect(x, y - height, width, height);
			var bar = snap.rect(x, y, width, 0);
			bar.attr({fill:dataSet.color});
			bar.animate({y:y-height,height:height}, 350, mina.easeout);
			return bar;
		});
	};

	function drawLine(dataSet){
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
		var path = snap.path(preAnimationPlots.join(','))
		path.attr({fill:'transparent', stroke:dataSet.color,strokeWidth:3})
		path.animate({d: dataPlots.join(',')}, 350, mina.easeout);

	};
	
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
		var path = snap.path(preAnimationPlots.join(','))
		path.attr({fill:dataSet.color})
		path.animate({d: dataPlots.join(',')}, 350, mina.easeout);
	};
	function drawPie(){
		console.log('pie chart not implemented yet');
	};

	this.update = function(options){
		console.log('not implemeted yet');
	}

	init();
	return that;
}