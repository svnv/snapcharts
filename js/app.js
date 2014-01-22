console.log('Starting app.js');

var options = {
	type:'bar',
	labels:['jan','feb','mar','apr','may','jun','jul','aug'],
	data:[{
			values: [.90,.20,.40,.35,.37,.50,.50,.50],
			color: 'rgba(0,175,255,.5)'
		}
	]
};
var chart = SnapChart('#bar-chart',options);
var options = {
	height:250,
	width:500,
	type:'line',
	labels:['jan','feb','mar','apr','may','jun','jul','aug'],
	data:[
		{
			values: [.90,.20,.40,.35,.37,.50,.50,.50],
			color: 'rgba(0,175,255,.5)'
		},
		{
			values: [.10,.25,.6,.7,.4,.9,.7,.8],
			color: 'rgba(0,0,100,.5)'
		}
	]
};
var chart = SnapChart('#line-chart',options);
var options = {
	height:250,
	width:500,
	type:'area',
	labels:['jan','feb','mar','apr','may','jun','jul','aug'],
	data:[
		{
			values: [.90,.20,.40,.35,.37,.50,.50,.50],
			color: 'rgba(0,175,255,.5)'
		}
	]
};
var chart = SnapChart('#area-chart',options);

  var options = {
    type:'pie',
    data:[{
      values: [.1],
      color: 'rgba(0,0,0,.1)',
      name: 'Segment A'
    },
    {
      values: [.2],
      color: 'rgba(0,0,0,.2)',
      name: 'Segment B'
    },

    {
      values: [.3],
      color: 'rgba(0,0,0,.3)',
      name: 'Segment C'
    }

    ]
  }
  var chart = SnapChart('#pie-chart',options);

// reloading site on focus so i don't have to press cmd-r
window.addEventListener("focus", function(event) {
	window.location.reload();
 }, false);

console.log('End of app.js');
