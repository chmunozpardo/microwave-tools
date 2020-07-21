import * as d3 from 'd3';
import {arrayFactor} from './PhasedArray';

export class PlotUtil{
  constructor(svg, width, height, divisions, margin){
    this.svg = svg;
    this.width = width;
    this.height = height;
    this.divisions = divisions;
    this.margin = margin;
    this.center = {
      x:this.width/2,
      y:this.height/2
    };
    this.radius = 0.5*Math.min(this.width, this.height);
  }

  plotRectangularGrid(){
    let horScale = d3.scaleLinear()
                     .domain([0, this.divisions])
                     .range([this.margin, this.width-this.margin]);
    let verScale = d3.scaleLinear()
                     .domain([0, this.divisions])
                     .range([this.margin, this.height-this.margin]);
    for(let i = 0; i <= this.divisions; i++){
      this.svg.append('line')
         .attr('x1', horScale(0))
         .attr('y1', verScale(i))
         .attr('x2', horScale(this.divisions))
         .attr('y2', verScale(i))
         .attr('fill', 'none')
         .attr('stroke', 'lightgray')
         .attr('stroke-width', 2)
         .attr('stroke-dasharray', 8)
      if(i > 0)
      this.svg.append('line')
         .attr('x1', horScale(0))
         .attr('y1', verScale(i-1/2))
         .attr('x2', horScale(this.divisions))
         .attr('y2', verScale(i-1/2))
         .attr('fill', 'none')
         .attr('stroke', 'lightgray')
         .attr('stroke-width', 2)
         .attr('stroke-dasharray', 3)
    }
    for(let i = 0; i <= this.divisions; i++){
      this.svg.append('line')
         .attr('x1', horScale(i))
         .attr('y1', verScale(0))
         .attr('x2', horScale(i))
         .attr('y2', verScale(this.divisions))
         .attr('fill', 'none')
         .attr('stroke', 'lightgray')
         .attr('stroke-width', 2)
         .attr('stroke-dasharray', 5)
      if(i > 0)
      this.svg.append('line')
        .attr('x1', horScale(i-1/2))
        .attr('y1', verScale(0))
        .attr('x2', horScale(i-1/2))
        .attr('y2', verScale(this.divisions))
        .attr('fill', 'none')
        .attr('stroke', 'lightgray')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', 3)
    }
  }

  plotPolarGrid(){
    let tempRad = this.radius-this.margin;
    let radScale = d3.scaleLinear()
                     .domain([0, this.divisions])
                     .range([0, tempRad]);
    let angScale = d3.scaleLinear()
                     .domain([0, this.divisions])
                     .range([0, 2*Math.PI]);
    for(let i = 0; i < this.divisions; i++){
      this.svg.append('circle')
         .attr('r' , radScale(i+1))
         .attr('cx', this.center.x)
         .attr('cy', this.center.y)
         .attr('fill', 'none')
         .attr('stroke', 'lightgray')
         .attr('stroke-width', 2)
         .attr('stroke-dasharray', 5)
    }
    for(let i = 0; i < this.divisions; i++){
      this.svg.append('line')
         .attr('x1', this.center.x)
         .attr('y1', this.center.y)
         .attr('x2', this.center.x + tempRad*Math.cos(angScale(i)))
         .attr('y2', this.center.y + tempRad*Math.sin(angScale(i)))
         .attr('stroke', 'lightgray')
         .attr('stroke-width', 2)
    }
  }

  plotPolarLabels(val){
    let tempRad = this.radius-this.margin;
    let radScale = d3.scaleLinear()
                     .domain([this.divisions, 0])
                     .range([0, tempRad]);
    let angScale = d3.scaleLinear()
                     .domain([0, this.divisions])
                     .range([0, 2*Math.PI]);
    let labScale = d3.scaleLinear()
                     .domain([0, this.divisions])
                     .range([val.max, val.min]);
    this.svg.selectAll('#gridText').remove();
    for(let i = 0; i < this.divisions; i++){
      for(let j = 0; j < this.divisions; j++){
        this.svg.append('text')
           .attr('id', 'gridText')
           .attr('x', this.center.x + radScale(j)*Math.cos(angScale(i)))
           .attr('y', this.center.y + radScale(j)*Math.sin(angScale(i)))
           .attr('fill', 'gray')
           .attr('font-size', '14px')
           .text(labScale(j));
      }
    }
  }

  plotPolarMarker(val, level){
    let tempRad = this.radius-this.margin;
    let radScale = d3.scaleLinear()
                     .domain([val.min, val.max])
                     .range([0, tempRad]);
    this.svg.selectAll('#level_marker').remove();
    this.svg.append('circle')
       .attr('id', 'level_marker')
       .attr('r' , radScale(level))
       .attr('cx', this.center.x)
       .attr('cy', this.center.y)
       .attr('fill', 'none')
       .attr('stroke', 'red')
       .attr('stroke-width', 2)
       .attr('stroke-dasharray', 5)
  }

  plotPolarElements(elements){
    let mean = {x: 0, y: 0}
    let tempRad = this.radius-this.margin;
    var element;
    for(element of elements){
      mean.x += element.x;
      mean.y += element.y;
    }
    mean.x /= elements.length;
    mean.y /= elements.length;
    let horScale = d3.scaleLinear()
                     .domain([-this.divisions/2, this.divisions/2])
                     .range([this.center.x-tempRad, this.center.x+tempRad]);
    let verScale = d3.scaleLinear()
                     .domain([-this.divisions/2, this.divisions/2])
                     .range([this.center.y+tempRad, this.center.y-tempRad]);
    this.svg.selectAll('.plot_element').remove();
    this.svg.selectAll()
         .data(elements)
         .enter()
         .append('circle')
         .attr('class', 'plot_element')
         .attr('r' , 4)
         .attr('cx', function(d) {return horScale(d.x-mean.x); })
         .attr('cy', function(d) {return verScale(d.y-mean.y); })
         .attr('fill', 'darkblue');
  }

  plotGridElements(elements, callbackFunction=null){
    let horScale = d3.scaleLinear()
                     .domain([-this.divisions/2, this.divisions/2])
                     .range([this.margin, this.width-this.margin]);
    let verScale = d3.scaleLinear()
                     .domain([-this.divisions/2, this.divisions/2])
                     .range([this.height-this.margin, this.margin]);

    function dragstarted(d) {
      d3.select(this).raise().attr("stroke", "black");
    }
    let obj = this;
    function dragged(d) {
      d3.select(this)
        .attr('cx',
          function(d){
            d.x += obj.divisions*d3.event.dx/(obj.width-2*obj.margin)
            return horScale(d.x);
          }
        )
        .attr('cy',
          function(d){
            d.y += obj.divisions*d3.event.dy/(2*obj.margin-obj.height)
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
        if(callbackFunction) callbackFunction();
    }
    this.svg.selectAll('.grid_element').remove();
    this.svg.selectAll()
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

  plotLogPolar(data, val){
    let tempRad = this.radius - this.margin;
    let radScale = d3.scaleLinear()
                     .domain([val.min, val.max])
                     .range([0, tempRad]);
    let angScale = d3.scaleLinear()
                     .domain([0, 360.0])
                     .range([0, 2*Math.PI]);
    let center = this.center
    let lineFunction =
      d3.line()
        .x(function(d){
          return  radScale(d.amplitude)*Math.cos(angScale(d.angle)) + center.x;
        })
        .y(function(d){
          return -radScale(d.amplitude)*Math.sin(angScale(d.angle)) + center.y;
        })
        .curve(d3.curveLinearClosed);
    this.svg.select('#path_phased').remove();
    this.svg.append('path')
       .attr('id', 'path_phased')
       .attr('d', lineFunction(data))
       .attr('stroke', 'black')
       .attr('stroke-width', 2)
       .attr('fill', 'none');
  }

  plotLinearPolar(data){
    let tempRad = this.radius-this.margin;
    let radScale = d3.scaleLinear()
                     .domain([0, 1])
                     .range([0, tempRad]);
    let angScale = d3.scaleLinear()
                     .domain([0, 360.0])
                     .range([0, 2*Math.PI]);
    let center = this.center;
    let lineFunction =
      d3.line()
        .x(function(d){
          return  radScale(d.amplitude)*Math.cos(angScale(d.angle)) + center.x;
        })
        .y(function(d){
          return -radScale(d.amplitude)*Math.sin(angScale(d.angle)) + center.y;
        })
        .curve(d3.curveLinearClosed);
    this.svg.select('#path_phased').remove();
    this.svg.append('path')
       .attr('id', 'path_phased')
       .attr('d', lineFunction(data))
       .attr('stroke', 'black')
       .attr('stroke-width', 2)
       .attr('fill', 'none');
  }

  plotLinearAF(elements, val){
    let dataAF = arrayFactor(elements);
    dataAF = this.normalizeData(dataAF);
    this.plotLinearPolar(dataAF, val);
  }

  plotLogAF(elements, val){
    let dataAF = arrayFactor(elements)
    dataAF = this.normalizeData(dataAF);
    let dataLogAF = this.linearToLog(dataAF, val)
    this.plotLogPolar(dataLogAF, val);
  }

  normalizeData(dataList){
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

  linearToLog(dataList, val){
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
}
