console.log('Starting app.js');

var options = {
	height:200,
	width:200,
	type:'area',
	labels:['jan','feb','mar','apr','may','jun','jul','aug'],
	data:[.90,.20,.40,.35,.37,.50,.50,.50]
}
var chart = SnapChart('#bar-chart',options);

// reloading site on focus so i don't have to press cmd-r
window.addEventListener("focus", function(event) {
	window.location.reload();
 }, false);

console.log('End of app.js');
