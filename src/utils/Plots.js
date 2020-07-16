export function plotGrid(svgGraph){
  let horizontalDiscretization = svgGraph.graphWidth/(svgGraph.rings-1);
  let verticalDiscretization = svgGraph.graphHeight/(svgGraph.lines-1);
  let svg = svgGraph.svgGrid;
  let marginBottom = svgGraph.svgMargin;
  let marginTop = svgGraph.width - svgGraph.svgMargin;
  for(let i = 0; i <= svgGraph.lines; i++){
    svg.append('line')
       .attr('x1', marginBottom)
       .attr('y1', marginBottom + verticalDiscretization*i)
       .attr('x2', marginTop)
       .attr('y2', marginBottom + verticalDiscretization*i)
       .attr('fill', 'none')
       .attr('stroke', 'lightgray')
       .attr('stroke-width', 2)
       .attr('stroke-dasharray', 5)
  }
  let marginLeft = svgGraph.svgMargin;
  let marginRight = svgGraph.height - svgGraph.svgMargin;
  for(let i = 0; i <= svgGraph.rings; i++){
    svg.append('line')
       .attr('x1', marginLeft + horizontalDiscretization*i)
       .attr('y1', marginLeft)
       .attr('x2', marginLeft + horizontalDiscretization*i)
       .attr('y2', marginRight)
       .attr('fill', 'none')
       .attr('stroke', 'lightgray')
       .attr('stroke-width', 2)
       .attr('stroke-dasharray', 5)
  }
}

export function plotElements(elements, svgGraph){
  let svg = svgGraph.svg;
  svg.selectAll('.grid_element').remove();
  var element;
  let mean_x = 0;
  let mean_y = 0;
  for(element of elements){
    mean_x += element.position[0];
    mean_y += element.position[1];
  }
  mean_x /= elements.length;
  mean_y /= elements.length;
  for(element of elements){
    let x = element.position[0];
    let y = element.position[1];
    let pos_x = ((x-mean_x)/(svgGraph.rings) + 0.5)*svgGraph.graphWidth+svgGraph.svgMargin;
    let pos_y = (svgGraph.height-svgGraph.svgMargin)-((y-mean_y)/(svgGraph.lines)+0.5)*svgGraph.graphHeight;
    svg.append('circle')
       .attr('class', 'grid_element')
       .attr('r' , 4)
       .attr('cx', pos_x)
       .attr('cy', pos_y)
       .attr('fill', 'darkblue')
  }
}

export function plotRings(svgGraph){
  let ringsDiscretization = 0.5*(svgGraph.graphHeight/svgGraph.rings);
  let outerRing           = 0.5*svgGraph.graphHeight;
  let svg = svgGraph.svg;
  for(let i = 0; i < svgGraph.rings; i++){
    svg.append('circle')
       .attr('r' , ringsDiscretization*(i+1))
       .attr('cx', svgGraph.width/2)
       .attr('cy', svgGraph.height/2)
       .attr('fill', 'none')
       .attr('stroke', 'lightgray')
       .attr('stroke-width', 2)
       .attr('stroke-dasharray', 5)
  }
  for(let i = 0; i < svgGraph.lines; i++){
    let step = (2*Math.PI)*i/svgGraph.lines;
    svg.append('line')
       .attr('x1', svgGraph.width/2)
       .attr('y1', svgGraph.height/2)
       .attr('x2', svgGraph.width/2  + outerRing*Math.cos(step))
       .attr('y2', svgGraph.height/2 + outerRing*Math.sin(step))
       .attr('stroke', 'lightgray')
       .attr('stroke-width', 2)
       plotLabels(svgGraph);
  }
}

export function plotLabels(svgGraph){
  let svg = svgGraph.svg;
  let outerRing           = 0.5*svgGraph.graphHeight;
  let ringsDiscretization = 0.5*(svgGraph.graphHeight/svgGraph.rings);
  svg.selectAll('#gridText').remove();
  for(let i = 0; i < svgGraph.lines; i++){
    let step = (2*Math.PI)*i/svgGraph.lines;
    for(let j = 0; j < svgGraph.rings; j++){
      svg.append('text')
         .attr('id', 'gridText')
         .attr('x', svgGraph.width/2 + ringsDiscretization*(svgGraph.rings-j)*Math.cos(step))
         .attr('y', svgGraph.height/2 + ringsDiscretization*(svgGraph.rings-j)*Math.sin(step))
         .attr('fill', 'gray')
         .attr('font-size', '14px')
         .text(
            j*(svgGraph.minVal - svgGraph.maxVal)/svgGraph.rings + svgGraph.maxVal
          );
    }
  }
  let levelMarker = svgGraph.logEnabled ? -3: 0.5;
  svg.selectAll('#level_marker').remove();
  svg.append('circle')
     .attr('id', 'level_marker')
     .attr('r' , outerRing*(levelMarker-svgGraph.minVal)/(svgGraph.maxVal-svgGraph.minVal))
     .attr('cx', svgGraph.width/2)
     .attr('cy', svgGraph.height/2)
     .attr('fill', 'none')
     .attr('stroke', 'red')
     .attr('stroke-width', 2)
     .attr('stroke-dasharray', 5)
}