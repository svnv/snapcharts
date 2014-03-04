console.log('Starting app.js');

var options = {
    type:'bar',
    labels:['jan','feb','mar','apr','may','jun','jul','aug'],
    data:[{
            values: [0.7, 0.2, 0.4, 0.35, 0.37, 0.50, 0.50,0.50],
            color: 'rgba(0,175,255,.5)'
        },
        {
            values: [ 0.10, 0.25, 0.6, 0.7, 0.4, 0.9, 0.7, 0.8],
            color: 'rgba(0,255,235,.6)',
        }
    ]
};
var chart = new SnapChart('#bar-chart',options);
var options = {
    type:'line',
    labels:['jan','feb','mar','apr','may','jun','jul','aug'],
    data:[
        {
            values: [ 0.90, 0.20, 0.40, 0.35, 0.37, 0.50, 0.50, 0.50],
            color: 'rgba(0,175,255,.6)'
        },
        {
            values: [ 0.10, 0.25, 0.6, 0.7, 0.4, 0.9, 0.7, 0.8],
            color: 'rgba(0,255,235,.6)'
        }
    ]
};
var chart = new SnapChart('#line-chart',options);
var options = {
    type:'area',
    labels:['jan','feb','mar','apr','may','jun','jul','aug'],
    data:[
        {
            values: [0.90,0.20,0.40,0.35,0.37,0.50,0.50,0.50],
            color: 'rgba(0,175,255,.3)',
        },
        {
            values: [ 0.10, 0.25, 0.6, 0.7, 0.4, 0.9, 0.7, 0.8],
            color: 'rgba(0,255,235,.3)',
        }
    ]
};
var chart = new SnapChart('#area-chart',options);

  var options = {
    type: 'pie',
    data: [
        {
          values: [0.1],
          color: 'rgba(0,175,255,.6)',
          name: 'Segment A',
          pattern:'triangles'
        },
        {
          values: [0.2],
          color: 'rgba(0,175,255,.4)',
          name: 'Segment B',
          pattern:'stripes'
        },

        {
          values: [0.255],
          color: 'rgba(0,175,255,.2)',
          name: 'Segment C',
          pattern:'dots'     
        }
    ]
  };

  var chart = new SnapChart('#pie-chart',options);
  var legend = new SnapLegend('#legend',options);

// reloading site on focus so i don't have to press cmd-r
// window.addEventListener("focus", function(event) {
//  window.location.reload();
//  }, false);

// window.onresize = function(event) {
//   var chart = SnapChart('#pie-chart',options);
// };
console.log('End of app.js');
