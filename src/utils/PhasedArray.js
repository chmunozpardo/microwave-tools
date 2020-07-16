export function arrayFactor(elements, svgGraph){
  let dataOut = [];
  let degreeRange = 360.0;
  let max_val = 0;
  let discretizationNumber = 512;
  let d2r = Math.PI/180.0;
  for(let i = 0; i < discretizationNumber; i++){
    let x = (degreeRange/discretizationNumber)*i;
    let out_real = 0;
    let out_imag = 0;
    for(let j = 0; j < elements.length; j++){
      let r_vec = [
        Math.cos(x*d2r),
        Math.sin(x*d2r)
      ];
      let k_vec = [
        elements[j].position[0],
        elements[j].position[1]
      ];
      let prod = 2*Math.PI*(r_vec[0]*k_vec[0] + r_vec[1]*k_vec[1]);
      let complexAngle = (prod + elements[j].phase*d2r)
      out_real += elements[j].amplitude*Math.cos(-complexAngle);
      out_imag += elements[j].amplitude*Math.sin(-complexAngle);
    }
    let y = Math.sqrt(out_real**2 + out_imag**2);
    max_val = Math.max(y, max_val);
    dataOut.push({
      'x': x,
      'y': y
    })
  }
  var data;
  for(data of dataOut){
    let tmp_x = data.x
    let tmp_y = data.y
    let tmp_a = tmp_y/max_val;
    let tmp_r = 0;
    if(svgGraph.logEnabled){
      let tmp_val = Math.max(svgGraph.minVal, 20*Math.log10(tmp_a));
      tmp_r = (1-tmp_val/svgGraph.minVal)*svgGraph.graphHeight/2;
    } else {
      tmp_r = tmp_a*svgGraph.graphHeight/2;;
    }
    data.x =  tmp_r*Math.cos(tmp_x*d2r) + svgGraph.width/2;
    data.y = -tmp_r*Math.sin(tmp_x*d2r) + svgGraph.height/2;
  }
  return dataOut;
}