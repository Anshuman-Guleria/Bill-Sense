import { useEffect, useRef } from "react";

export default function NeonShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") as WebGLRenderingContext | null;
    if (!gl) {
      console.warn("WebGL not supported, falling back to static gradient background.");
      return;
    }

    let animationFrameId: number;

    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float time = u_time * 0.15;
        
        // Deep, dark Frosted Glass slate base (#0a0c12)
        vec3 color = vec3(0.0392, 0.0470, 0.0705); 
        
        // Subtle organic neon flows
        float n1 = sin(uv.x * 2.5 + time) * 0.5 + 0.5;
        float n2 = cos(uv.y * 2.0 - time * 0.7) * 0.5 + 0.5;
        float n3 = sin((uv.x + uv.y) * 1.5 + time * 0.5) * 0.5 + 0.5;
        
        vec3 neonIndigo = vec3(0.31, 0.27, 0.90); // Indigo-600
        vec3 neonEmerald = vec3(0.06, 0.70, 0.44); // Emerald-500
        vec3 neonPurple = vec3(0.58, 0.16, 0.82); // Purple-600
        
        // Position variables matching the requested layout config
        float glow1 = smoothstep(0.65, 0.0, length(uv - vec3(0.1, 0.9, 0.0).xy));
        float glow2 = smoothstep(0.70, 0.0, length(uv - vec3(0.9, 0.1, 0.0).xy));
        float glow3 = smoothstep(0.50, 0.0, length(uv - vec3(0.8, 0.7, 0.0).xy));
        
        color += neonIndigo * glow1 * 0.22 * n1;
        color += neonEmerald * glow2 * 0.18 * n2;
        color += neonPurple * glow3 * 0.15 * n3;
        
        // Fine micro-noise organic texture
        float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
        color += noise * 0.008;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compiles failed:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Link failed:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionIdx = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionIdx);
    gl.vertexAttribPointer(positionIdx, 2, gl.FLOAT, false, 0, 0);

    const uTimeLoc = gl.getUniformLocation(program, "u_time");
    const uResolutionLoc = gl.getUniformLocation(program, "u_resolution");

    function handleResize() {
      if (!canvas) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      canvas.width = width;
      canvas.height = height;
      gl!.viewport(0, 0, width, height);
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    function render(time: number) {
      if (!gl) return;
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(uTimeLoc, time * 0.001);
      gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  return (
    <canvas
      id="neon-shader-bg"
      className="fixed inset-0 w-full h-full -z-20 pointer-events-none opacity-90 bg-[#0a0c12]"
      ref={canvasRef}
    />
  );
}
