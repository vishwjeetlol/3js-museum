import{G as n,P as s,S as c,D as v,b as i,a as d}from"./index-DPi1QeAo.js";let o=null,e=null,l=0;function m(t,r){o=new n,o.position.set(r.x,r.y+2.8,r.z);const u=new s(2.2,3,48,48),a=new c({uniforms:{uCurl:{value:0},uColorFront:{value:new i(16768601)},uColorBack:{value:new i(13566046)}},vertexShader:`
      uniform float uCurl;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 p = position;
        float dist = p.x + 1.1;
        float theta = dist * 2.0 * uCurl;
        p.z += sin(theta) * 0.75 * uCurl;
        p.x = -1.1 + (dist - (1.0 - cos(theta)) * 0.35 * uCurl);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,fragmentShader:`
      uniform vec3 uColorFront;
      uniform vec3 uColorBack;
      varying vec2 vUv;
      void main() {
        vec3 col = gl_FrontFacing ? uColorFront : uColorBack;
        col *= (0.75 + 0.25 * vUv.x);
        gl_FragColor = vec4(col, 1.0);
      }
    `,side:v});return e=new d(u,a),o.add(e),t.add(o),o}function C(t,r,u,a){e&&(a||(l=Math.sin(r*1.5)*.5+.5,e.material.uniforms.uCurl.value=l,o.rotation.y=Math.sin(r*.6)*.3))}function p(t){}function g(t){o&&(t.remove(o),e&&(e.geometry.dispose(),e.material.dispose()),o=null,e=null)}export{g as dispose,m as init,p as setFocus,C as update};
