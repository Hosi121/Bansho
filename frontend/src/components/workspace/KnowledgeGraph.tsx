"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { KnowledgeGraphProps } from '@/types/graph';
import { Document } from '@/types/document';
import gsap from 'gsap';

interface NodeMesh extends THREE.Mesh {
  geometry: THREE.SphereGeometry;
  material: THREE.MeshPhysicalMaterial;
  userData: {
    id: string;
    documentInfo: Document;
  };
  glow?: THREE.Mesh;
}

const COLORS = {
  BACKGROUND: 0x1a1b23,
  NODE: {
    DEFAULT: 0x7B8CDE,
    HOVER: 0x8E9DE5,
    SELECTED: 0xFFFFFF,
    GLOW: 0x7B8CDE
  },
  EDGE: {
    DEFAULT: 0x2A2B32,
    ACTIVE: 0x7B8CDE
  }
};

// グロー効果用のカスタムシェーダー
const createGlowMaterial = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      c: { value: 0.2 },
      p: { value: 1.4 },
      glowColor: { value: new THREE.Color(COLORS.NODE.GLOW) }
    },
    vertexShader: `
      varying float intensity;
      void main() {
        vec3 vNormal = normalize(normalMatrix * normal);
        intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      varying float intensity;
      void main() {
        vec3 glow = glowColor * intensity;
        gl_FragColor = vec4(glow, 1.0);
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
  });
};

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  data,
  onNodeClick,
  selectedNodeId
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const nodeObjectsRef = useRef<NodeMesh[]>([]);
  
  const [hoveredNode, setHoveredNode] = useState<Document | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup previous renderer
    if (rendererRef.current) {
      rendererRef.current.dispose();
      const oldCanvas = containerRef.current.querySelector('canvas');
      if (oldCanvas) {
        containerRef.current.removeChild(oldCanvas);
      }
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.BACKGROUND);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 7;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.enablePan = true;
    controls.panSpeed = 0.5;
    controls.enableZoom = true;
    controls.zoomSpeed = 0.5;
    controls.minDistance = 3;
    controls.maxDistance = 20;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const createNodeMesh = (
      node: { id: string; position: { x: number; y: number; z: number }; documentInfo: Document },
      isSelected: boolean
    ): NodeMesh => {
      const geometry = new THREE.SphereGeometry(0.4, 32, 32);
      const material = new THREE.MeshPhysicalMaterial({
        color: isSelected ? COLORS.NODE.SELECTED : COLORS.NODE.DEFAULT,
        metalness: 0.2,
        roughness: 0.5,
        clearcoat: 0.3,
        clearcoatRoughness: 0.25,
        emissive: isSelected ? COLORS.NODE.GLOW : 0x000000,
        emissiveIntensity: 0.3,
      });
    
      const mesh = new THREE.Mesh(geometry, material) as unknown as NodeMesh;
      mesh.position.set(node.position.x, node.position.y, node.position.z);
      mesh.userData = {
        id: node.id,
        documentInfo: node.documentInfo
      };
    
      if (isSelected) {
        const glowGeometry = new THREE.SphereGeometry(0.6, 32, 32);
        const glowMaterial = createGlowMaterial();
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        mesh.glow = glowMesh;
        mesh.add(glowMesh);
      }
    
      return mesh;
    };
    
    nodeObjectsRef.current = data.nodes.map(node => {
      const mesh = createNodeMesh(node, node.id === selectedNodeId);
      scene.add(mesh);
      return mesh;
    });

    data.edges.forEach(edge => {
      const sourceNode = data.nodes.find(n => n.id === edge.sourceId);
      const targetNode = data.nodes.find(n => n.id === edge.targetId);
      
      if (sourceNode && targetNode) {
        const start = new THREE.Vector3(
          sourceNode.position.x,
          sourceNode.position.y,
          sourceNode.position.z
        );
        const end = new THREE.Vector3(
          targetNode.position.x,
          targetNode.position.y,
          targetNode.position.z
        );
        
        const direction = end.clone().sub(start);
        const length = direction.length();
        
        const geometry = new THREE.CylinderGeometry(0.03, 0.03, length, 8);
        const material = new THREE.MeshPhysicalMaterial({
          color: COLORS.EDGE.DEFAULT,
          transparent: true,
          opacity: 0.3,
          metalness: 0.1,
          roughness: 0.8,
          clearcoat: 0.1,
        });
        
        const edgeMesh = new THREE.Mesh(geometry, material);
        edgeMesh.position.copy(start.clone().add(direction.multiplyScalar(0.5)));
        edgeMesh.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction.normalize()
        );
        
        scene.add(edgeMesh);
      }
    });

    // Raycaster setup
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
    
      setMousePosition({ x: event.clientX, y: event.clientY });
    
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeObjectsRef.current);
    
      nodeObjectsRef.current.forEach(node => {
        const material = Array.isArray(node.material)
          ? node.material.find(mat => mat instanceof THREE.MeshPhysicalMaterial)
          : node.material;
    
        if (material instanceof THREE.MeshPhysicalMaterial) {
          material.color.setHex(COLORS.NODE.DEFAULT);
        }
      });
    
      if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object as NodeMesh;
        if (hoveredMesh.userData.id !== selectedNodeId) {
          const material = hoveredMesh.material as THREE.MeshPhysicalMaterial;
          if (material && material.color) {
            material.color.setHex(COLORS.NODE.HOVER);
          }
        }
        setHoveredNode(hoveredMesh.userData.documentInfo);
      } else {
        setHoveredNode(null);
      }
    };

    const handleClick = (event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
    
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeObjectsRef.current);
    
      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as NodeMesh;
        onNodeClick(clickedMesh.userData.id);
    
        // カメラを選択ノードにスムーズに移動
        const targetPosition = clickedMesh.position.clone();
    
        gsap.to(camera.position, {
          x: targetPosition.x + 3, // 適切なオフセットを加える
          y: targetPosition.y + 3,
          z: targetPosition.z + 3,
          duration: 1.5,
          ease: "power2.out",
          onUpdate: () => {
            controls.update(); // カメラ更新後に OrbitControls を再描画
          },
        });
    
        gsap.to(controls.target, {
          x: targetPosition.x,
          y: targetPosition.y,
          z: targetPosition.z,
          duration: 1.5,
          ease: "power2.out",
          onUpdate: () => {
            controls.update();
          },
        });
      }
    };    

    const handleNodeClick = (nodeId: string) => {
      const clickedNode = nodeObjectsRef.current.find(node => node.userData.id === nodeId);
      if (clickedNode && controlsRef.current) {
        const { x, y, z } = clickedNode.position;
  
        // カメラのスムーズな移動
        gsap.to(camera.position, {
          x: x + 3,
          y: y + 3,
          z: z + 5,
          duration: 1.5,
          onUpdate: () => {
            controlsRef.current?.update();
          }
        });
  
        // OrbitControls のターゲット更新
        gsap.to(controlsRef.current.target, {
          x: x,
          y: y,
          z: z,
          duration: 1.5
        });
      }
  
      onNodeClick(nodeId); // 他の選択処理も引き継ぐ
    };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Event listeners
    const canvas = renderer.domElement;
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      controls.dispose();

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      renderer.dispose();
    };
  }, [data, onNodeClick, selectedNodeId]);

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full absolute inset-0" />
      {hoveredNode && (
        <div
          className="absolute z-10 bg-[#232429]/90 backdrop-blur-sm text-white p-4 rounded-xl 
          shadow-xl max-w-xs pointer-events-none border border-white/10"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y + 10,
          }}
        >
          <h3 className="font-medium mb-2">{hoveredNode.title}</h3>
          <p className="text-sm text-gray-300">{hoveredNode.excerpt}</p>
          <div className="mt-3 flex gap-2">
            {hoveredNode.tags.map(tag => (
              <span 
                key={tag} 
                className="text-xs bg-[#7B8CDE]/20 text-[#7B8CDE] px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraph;