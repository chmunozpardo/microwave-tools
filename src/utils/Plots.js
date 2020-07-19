import * as d3 from 'd3';
import {arrayFactor} from './PhasedArray';

export function plotRectangularGrid(svg, horLines, verLines, start, stop){
  let horScale = d3.scaleLinear()
                   .domain([0, horLines])
                   .range([start.x, stop.x]);
  let verScale = d3.scaleLinear()
                   .domain([0, verLines])
                   .range([start.y, stop.y]);
  for(let i = 0; i <= horLines; i++){
    svg.append('line')
       .attr('x1', horScale(0))
       .attr('y1', verScale(i))
       .attr('x2', horScale(horLines))
       .attr('y2', verScale(i))
       .attr('fill', 'none')
       .attr('stroke', 'lightgray')
       .attr('stroke-width', 2)
       .attr('stroke-dasharray', 8)
    if(i > 0)
    svg.append('line')
       .attr('x1', horScale(0))
       .attr('y1', verScale(i-1/2))
       .attr('x2', horScale(horLines))
       .attr('y2', verScale(i-1/2))
       .attr('fill', 'none')
       .attr('stroke', 'lightgray')
       .attr('stroke-width', 2)
       .attr('stroke-dasharray', 3)
  }
  for(let i = 0; i <= verLines; i++){
    svg.append('line')
       .attr('x1', horScale(i))
       .attr('y1', verScale(0))
       .attr('x2', horScale(i))
       .attr('y2', verScale(verLines))
       .attr('fill', 'none')
       .attr('stroke', 'lightgray')
       .attr('stroke-width', 2)
       .attr('stroke-dasharray', 5)
    if(i > 0)
    svg.append('line')
      .attr('x1', horScale(i-1/2))
      .attr('y1', verScale(0))
      .attr('x2', horScale(i-1/2))
      .attr('y2', verScale(verLines))
      .attr('fill', 'none')
      .attr('stroke', 'lightgray')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', 3)
  }
}

export function plotPolarGrid(svg, rings, angles, center, radius){
  let radScale = d3.scaleLinear()
                   .domain([0, rings])
                   .range([0, radius]);
  let angScale = d3.scaleLinear()
                   .domain([0, angles])
                   .range([0, 2*Math.PI]);
  for(let i = 0; i < rings; i++){
    svg.append('circle')
       .attr('r' , radScale(i+1))
       .attr('cx', center.x)
       .attr('cy', center.y)
       .attr('fill', 'none')
       .attr('stroke', 'lightgray')
       .attr('stroke-width', 2)
       .attr('stroke-dasharray', 5)
  }
  for(let i = 0; i < angles; i++){
    svg.append('line')
       .attr('x1', center.x)
       .attr('y1', center.y)
       .attr('x2', center.x + radius*Math.cos(angScale(i)))
       .attr('y2', center.y + radius*Math.sin(angScale(i)))
       .attr('stroke', 'lightgray')
       .attr('stroke-width', 2)
  }
}

export function plotPolarLabels(svg, rings, angles, center, radius, val){
  let radScale = d3.scaleLinear()
                   .domain([rings, 0])
                   .range([0, radius]);
  let angScale = d3.scaleLinear()
                   .domain([0, angles])
                   .range([0, 2*Math.PI]);
  let labScale = d3.scaleLinear()
                   .domain([0, rings])
                   .range([val.max, val.min]);
  svg.selectAll('#gridText').remove();
  for(let i = 0; i < angles; i++){
    for(let j = 0; j < rings; j++){
      svg.append('text')
         .attr('id', 'gridText')
         .attr('x', center.x + radScale(j)*Math.cos(angScale(i)))
         .attr('y', center.y + radScale(j)*Math.sin(angScale(i)))
         .attr('fill', 'gray')
         .attr('font-size', '14px')
         .text(labScale(j));
    }
  }
}

export function plotPolarMarker(svg, center, radius, val, level){
  let radScale = d3.scaleLinear()
                   .domain([val.min, val.max])
                   .range([0, radius]);
  svg.selectAll('#level_marker').remove();
  svg.append('circle')
     .attr('id', 'level_marker')
     .attr('r' , radScale(level))
     .attr('cx', center.x)
     .attr('cy', center.y)
     .attr('fill', 'none')
     .attr('stroke', 'red')
     .attr('stroke-width', 2)
     .attr('stroke-dasharray', 5)
}

export function plotPolarElements(svg, elements, horLines, verLines, center, radius){
  let mean = {x: 0, y: 0}
  var element;
  for(element of elements){
    mean.x += element.x;
    mean.y += element.y;
  }
  mean.x /= elements.length;
  mean.y /= elements.length;
  let horScale = d3.scaleLinear()
                   .domain([-horLines/2, horLines/2])
                   .range([center.x-radius, center.x+radius]);
  let verScale = d3.scaleLinear()
                   .domain([-verLines/2, verLines/2])
                   .range([center.y+radius, center.y-radius]);
  svg.selectAll('.plot_element').remove();
  svg.selectAll()
       .data(elements)
       .enter()
       .append('circle')
       .attr('class', 'plot_element')
       .attr('r' , 4)
       .attr('cx', function(d) {return horScale(d.x-mean.x); })
       .attr('cy', function(d) {return verScale(d.y-mean.y); })
       .attr('fill', 'darkblue');
}

export function plotGridElements(svg, elements, horLines, verLines, start, stop, callback=null){
  let horScale = d3.scaleLinear()
                   .domain([-horLines/2, horLines/2])
                   .range([start.x, stop.x]);
  let verScale = d3.scaleLinear()
                   .domain([-verLines/2, verLines/2])
                   .range([stop.y, start.y]);

  function dragstarted(d) {
    d3.select(this).raise().attr("stroke", "black");
  }

  function dragged(d) {
    d3.select(this)
      .attr('cx',
        function(d){
          d.x += horLines*d3.event.dx/(stop.x-start.x)
          return horScale(d.x);
        }
      )
      .attr('cy',
        function(d){
          d.y += verLines*d3.event.dy/(start.y-stop.y)
          return verScale(d.y);
        }
      );
  }

  function dragended(d) {
    d3.select(this)
      .attr('cx',
        function(d){
          d.x = Number(d.x.toFixed(3))
          return horScale(d.x);
        }
      )
      .attr('cy',
        function(d){
          d.y = Number(d.y.toFixed(3))
          return verScale(d.y);
        }
      );
      callback();
  }
  svg.selectAll('.grid_element').remove();
  svg.selectAll()
     .data(elements)
     .enter()
     .append('circle')
     .attr('class', 'grid_element')
     .attr('r' , 4)
     .attr('cx', function(d){return horScale(d.x);})
     .attr('cy', function(d){return verScale(d.y);})
     .attr('fill', 'darkblue')
     .call(
         d3.drag()
           .on("start", dragstarted)
           .on("drag", dragged)
           .on("end", dragended)
     );
}

function plotLogPolar(svg, data, center, radius, val){
  let radScale = d3.scaleLinear()
                   .domain([val.min, val.max])
                   .range([0, radius]);
  let angScale = d3.scaleLinear()
                   .domain([0, 360.0])
                   .range([0, 2*Math.PI]);
  let lineFunction =
    d3.line()
      .x(function(d){
        return  radScale(d.amplitude)*Math.cos(angScale(d.angle)) + center.x;
      })
      .y(function(d){
        return -radScale(d.amplitude)*Math.sin(angScale(d.angle)) + center.y;
      })
      .curve(d3.curveLinearClosed);
  svg.select('#path_phased').remove();
  svg.append('path')
     .attr('id', 'path_phased')
     .attr('d', lineFunction(data))
     .attr('stroke', 'black')
     .attr('stroke-width', 2)
     .attr('fill', 'none');
}

export function plotLinearPolar(svg, data, center, radius){
  let radScale = d3.scaleLinear()
                   .domain([0, 1])
                   .range([0, radius]);
  let angScale = d3.scaleLinear()
                   .domain([0, 360.0])
                   .range([0, 2*Math.PI]);
  let lineFunction =
    d3.line()
      .x(function(d){
        return  radScale(d.amplitude)*Math.cos(angScale(d.angle)) + center.x;
      })
      .y(function(d){
        return -radScale(d.amplitude)*Math.sin(angScale(d.angle)) + center.y;
      })
      .curve(d3.curveLinearClosed);
  svg.select('#path_phased').remove();
  svg.append('path')
     .attr('id', 'path_phased')
     .attr('d', lineFunction(data))
     .attr('stroke', 'black')
     .attr('stroke-width', 2)
     .attr('fill', 'none');
}

export function plotLinearAF(svg, elements, center, radius, val){
  let dataAF = arrayFactor(elements);
  dataAF = normalizeData(dataAF);
  plotLinearPolar(svg, dataAF, center, radius, val);
}

export function plotLogAF(svg, elements, center, radius, val){
  let dataAF = arrayFactor(elements)
  dataAF = normalizeData(dataAF);
  let dataLogAF = linearToLog(dataAF, val)
  plotLogPolar(svg, dataLogAF, center, radius, val);
}

function normalizeData(dataList){
  let out = [];
  let data;
  let max = -200;
  for(data of dataList){
    max = Math.max(data.amplitude, max);
  }
  for(data of dataList){
    out.push({
      angle:data.angle,
      amplitude:data.amplitude/max
    })
  }
  return out;
}

function linearToLog(dataList, val){
  let out = [];
  let data;
  for(data of dataList){
    let amp = 10*Math.log10(data.amplitude);
    if(amp < -50){
      amp = val.min;
    }
    out.push({
      angle:data.angle,
      amplitude:amp
    })
  }
  return out;
}
