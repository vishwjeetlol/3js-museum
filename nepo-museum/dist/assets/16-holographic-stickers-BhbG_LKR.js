import{G as v,P as u,S as m,D as d,a as c,l as f,M as y}from"./index-DPi1QeAo.js";let e=null,r=null,s=[];function h(a,o){e=new v,e.position.set(o.x,o.y+2.8,o.z);const l=new u(2.4,3.2),i=new m({uniforms:{uTime:{value:0}},vertexShader:`
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 pos = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-pos.xyz);
        gl_Position = projectionMatrix * pos;
      }
    `,fragmentShader:`
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec2 vUv;
      void main() {
        float fresnel = abs(dot(vNormal, vViewDir));
        float hue = fract(fresnel * 3.0 + vUv.x * 2.0 + sin(uTime * 1.5) * 0.4);
        vec3 col = 0.5 + 0.5 * cos(6.28318 * (hue + vec3(0.0, 0.33, 0.67)));
        col = mix(vec3(0.9), col, 0.6);
        gl_FragColor = vec4(col, 1.0);
      }
    `,side:d});return r=new c(l,i),e.add(r),s=[],[{type:"star",color:16768601,x:-.6,y:.8},{type:"heart",color:13566046,x:.6,y:.8},{type:"cyber",color:6087142,x:-.6,y:-.6},{type:"logo",color:12451666,x:.6,y:-.6}].forEach(t=>{const n=new c(new f(.42,24),new y({color:t.color,metalness:.6,roughness:.2}));n.position.set(t.x,t.y,.02),r.add(n),s.push(n)}),a.add(e),e}function g(a,o,l,i){e&&(r&&r.material.uniforms&&(r.material.uniforms.uTime.value=o),i||(e.rotation.y=Math.sin(o*1.2)*.4,e.rotation.x=Math.cos(o*.9)*.2))}function w(a){}function M(a){e&&(a.remove(e),e=null,r=null,s=[])}export{M as dispose,h as init,w as setFocus,g as update};
