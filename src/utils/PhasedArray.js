export function arrayFactor(elements){
  let dataOut = [];
  let discretizationNumber = 512;
  let degreeRange = 360.0;
  let d2r = Math.PI/180.0;
  for(let i = 0; i < discretizationNumber; i++){
    let x = (degreeRange/discretizationNumber)*i;
    let out_real = 0;
    let out_imag = 0;
    let element;
    for(element of elements){
      let prod = 2*Math.PI*(Math.cos(x*d2r)*element.x + Math.sin(x*d2r)*element.y);
      let complexAngle = (prod + element.phase*d2r)
      out_real += element.amplitude*Math.cos(-complexAngle);
      out_imag += element.amplitude*Math.sin(-complexAngle);
    }
    let y = Math.sqrt(out_real**2 + out_imag**2);
    dataOut.push({
      angle: x,
      amplitude: y
    })
  }
  return dataOut;
}