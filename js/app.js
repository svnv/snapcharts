console.log('Starting app.js');

var options = {
	type:'bar',
	labels:['jan','feb','mar','apr','may','jun','jul','aug'],
	data:[.90,.20,.40,.35,.37,.50,.50,.50]
}
var chart = SnapChart('#bar-chart',options);
var options = {
	height:250,
	width:500,
	type:'line',
	labels:['jan','feb','mar','apr','may','jun','jul','aug'],
	data:[.90,.20,.40,.35,.37,.50,.50,.50]
}
var chart = SnapChart('#line-chart',options);
var options = {
	height:250,
	width:500,
	type:'area',
	labels:['jan','feb','mar','apr','may','jun','jul','aug'],
	data:[.90,.20,.40,.35,.37,.50,.50,.50]
}
var chart = SnapChart('#area-chart',options);

// reloading site on focus so i don't have to press cmd-r
window.addEventListener("focus", function(event) {
	window.location.reload();
 }, false);

console.log('End of app.js');
