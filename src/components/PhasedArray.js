import React, { createRef } from 'react'
import { Row, Col, Form, Container, Tabs, Tab} from 'react-bootstrap';
import * as d3 from 'd3';
import {PlotUtil} from '../utils/Plots.js'

export class PhasedArray extends React.Component{
  constructor(props){
    super(props);
    let distanceX = 0.707;
    let distanceY = 0.707;
    this.maxLog =   0.0;
    this.minLog = -40.0;
    this.maxLin =   1.0;
    this.minLin =   0.0;
    this.linMarker =  0.5;
    this.logMarker = -3.0;
    this.state = {
      divisions: 8,
      margin: 40,
      distanceX: distanceX,
      distanceY: distanceY,
      svgGridRef:    createRef(null),
      svgPolarRef:   createRef(null),
      parametersRef: createRef(null),
      maxElements: 20,
      elements: 2,
      logEnabled: true,
      arrayElements: [
        {
          amplitude: 1.0,
          phase: 0.0,
          x: 0.0,
          y: 0.0
        },
        {
          amplitude: 1.0,
          phase: 0.0,
          x: distanceX,
          y: distanceY
        }
      ]
    };
  }

  elementsOnChange = (e) => {
    let numberInput = Number(e.target.value);
    let oldInput = this.state.elements;
    if (numberInput < 2) {
      numberInput = 2;
    } else if (numberInput > this.maxElements) {
      numberInput = this.maxElements;
    }
    let tempElements = this.state.arrayElements;
    let diff = numberInput - oldInput;
    if(diff > 0){
      for(let i = 0; i < diff; i++){
        tempElements.push({
          amplitude: 1.0,
          phase: 0.0,
          x:(oldInput + i)*this.state.distanceX,
          y:(oldInput + i)*this.state.distanceY,
        });
      }
    }
    if(diff < 0){
      for(let i = 0; i < -diff; i++){
        tempElements.pop();
      }
    }
    this.setState({
        elements: numberInput,
        arrayElements: tempElements
      },
      this.plotUpdate
    );
  }

  initiateGrids = () => {
    this.state.polarPlot.plotPolarGrid();
    this.state.gridPlot.plotRectangularGrid();
  }

  updateLabels = () => {
    this.state.polarPlot.plotPolarLabels(this.state.val);
    this.state.polarPlot.plotPolarMarker(this.state.val, this.state.marker);
  }

  plotUpdate = () => {
    this.state.polarPlot.plotPolarElements(this.state.arrayElements);
    this.state.gridPlot.plotGridElements(this.state.arrayElements, this.updateState);
    if(this.state.logEnabled){
      this.state.polarPlot.plotLogAF(this.state.arrayElements, this.state.val);
    } else {
      this.state.polarPlot.plotLinearAF(this.state.arrayElements, this.state.val);
    }
  }

  updateState = () => {
    this.setState(
      {},
      this.plotUpdate
    );
  }

  componentDidMount(){
    let svgContainer = d3.select(this.state.svgPolarRef.current);
    let width  = parseFloat(svgContainer.style('width'));
    let height = parseFloat(svgContainer.style('height'));
    let svgPolar = svgContainer.append('svg')
                           .attr('width' , width)
                           .attr('height', height);
    svgContainer = d3.select(this.state.svgGridRef.current);
    let svgGrid = svgContainer.append('svg')
                          .attr('width' , width)
                          .attr('height', height);
    let val = {min:this.minLog, max:this.maxLog};
    let marker = this.logMarker;
    this.setState({
      gridPlot: new PlotUtil(svgGrid, width, height, this.state.divisions, this.state.margin),
      polarPlot: new PlotUtil(svgPolar, width, height, this.state.divisions, this.state.margin),
      val, marker
    }, () => {
      this.initiateGrids();
      this.updateLabels();
      this.plotUpdate();
    })
  };

  updateElement = (event) => {
    let splitID = event.target.id.split("_");
    let stringID = splitID[0];
    let elementID = splitID[1];
    let arrayElements = [...this.state.arrayElements];
    let singleElement = {...arrayElements[elementID]};
    if(stringID === "amplitude"){
      singleElement.amplitude = Number(event.target.value);
    } else if(stringID === "phase"){
      singleElement.phase = Number(event.target.value);
    } else if(stringID === "posX"){
      singleElement.x = Number(event.target.value);
    } else if(stringID === "posY"){
      singleElement.y = Number(event.target.value);
    }
    arrayElements[elementID] = singleElement;
    this.setState(
      {arrayElements},
      this.plotUpdate
    );
  }

  changePlotType = (event) => {
    let logEnabled = !this.state.logEnabled;
    let val = {
      min: logEnabled ? this.minLog : this.minLin,
      max: logEnabled ? this.maxLog : this.maxLin,
    };
    let marker = logEnabled ? this.logMarker : this.linMarker;
    this.setState(
      {logEnabled, val, marker},
      () => {
        this.updateLabels();
        this.plotUpdate();
      }
    )
  }

  generateParameters = () => {
    var rows = [];
    for(let i = 0; i < this.state.elements; i++){
        rows.push(
          <Row key={i} className='box-2 mt-2'>
            <Col xs={12}>
              Element Number {i+1}
            </Col>
            <Col xs={6}>
                <Form.Group controlId={"amplitude_" + i} xs={6}>
                  <Form.Label>Amplitude</Form.Label>
                  <Form.Control
                    onChange={this.updateElement}
                    type="number"
                    placeholder="Amplitude"
                    value={this.state.arrayElements && this.state.arrayElements[i].amplitude}
                    step="0.02"
                    min="-10"
                    max="10" />
                  <Form.Text
                    className="text-muted">
                    Linear amplitude of the {i + 1} element
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group controlId={"phase_" + i} xs={6}>
                  <Form.Label>Phase</Form.Label>
                  <Form.Control
                    onChange={this.updateElement}
                    type="number"
                    placeholder="Phase"
                    value={this.state.arrayElements && this.state.arrayElements[i].phase}
                    step="0.1"
                    min="-180.0"
                    max="180.0"/>
                  <Form.Text
                    className="text-muted">
                    Linear phase of the {i + 1} element
                  </Form.Text>
                </Form.Group>
              </Col><Col xs={6}>
                <Form.Group controlId={"posX_" + i} xs={6}>
                  <Form.Label>Position X</Form.Label>
                  <Form.Control
                    onChange={this.updateElement}
                    type="number"
                    placeholder="Position X"
                    value={this.state.arrayElements && this.state.arrayElements[i].x}
                    step="0.001"
                    min="-10"
                    max="10" />
                  <Form.Text
                    className="text-muted">
                    X position of the {i + 1} element
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group controlId={"posY_" + i} xs={6}>
                  <Form.Label>Position Y</Form.Label>
                  <Form.Control
                    onChange={this.updateElement}
                    type="number"
                    placeholder="Position Y"
                    value={this.state.arrayElements && this.state.arrayElements[i].y}
                    step="0.001"
                    min="-10.0"
                    max="10.0"/>
                  <Form.Text
                    className="text-muted">
                    Y position of the {i + 1} element
                  </Form.Text>
                </Form.Group>
              </Col>
          </Row>
        );
    }
    return(rows);
  }

  render() {
    return (
      <Container fluid className='mw-100 h-100'>
        <Row className='h-100'>
          <Col
            className='border-box p-0 h-100'
            xs={{span: 8, offset: 1}}>
              <Tabs defaultActiveKey='plot'>
                <Tab eventKey='plot' title='Plot'>
                  <Col
                    className='border-box p-0 h-100'
                    xs={12}
                    ref={this.state.svgPolarRef}>
                  </Col>
                </Tab>
                <Tab eventKey='grid' title='Grid'>
                <Col
                    className='border-box p-0 h-100'
                    xs={12}
                    ref={this.state.svgGridRef}>
                  </Col>
                </Tab>
              </Tabs>
          </Col>
          <Col xs= {3} className='scrollable mt-3'>
            <Form>
              <Container>
                <Row className='mt-1 box-2'>
                  <Col xs={6}>
                    <Form.Group controlId="formElem" xs={6}>
                      <Form.Label>Elements</Form.Label>
                      <Form.Control
                        onChange={this.elementsOnChange}
                        type="number"
                        value={this.state.elements}
                        min="2"
                        max={this.state.maxElements}/>
                      <Form.Text
                        className="text-muted">
                        Number of elements used in the array.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col xs={6}>
                    <Form.Group controlId="formLog">
                      <Form.Check
                        onChange={this.changePlotType}
                        checked={this.state.logEnabled}
                        type="checkbox"
                        label="Logarithmic plot" />
                    </Form.Group>
                  </Col>
                </Row>
              </Container>
              <Container ref={this.state.parametersRef}>
                {this.generateParameters()}
              </Container>
            </Form>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default PhasedArray;
