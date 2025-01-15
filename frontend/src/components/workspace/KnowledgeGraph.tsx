"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { KnowledgeGraphProps } from '@/types/graph';
import { Document } from '@/types/document';

interface NodeMesh extends THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial> {
  userData: {
    id: string;
    documentInfo: Document;
  };
}

const COLORS = {
  BACKGROUND: 0x1a1d28,
  NODE: 0x426579,
  NODE_HOVER: 0xffffff,
  EDGE: 0xffffff,
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
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // スムーズな動き
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5; // 回転速度
    controls.enablePan = true; // パン操作を有効化
    controls.panSpeed = 0.5; // パン速度
    controls.enableZoom = true; // ズーム操作を有効化
    controls.zoomSpeed = 0.5; // ズーム速度
    controls.minDistance = 3; // 最小ズーム距離
    controls.maxDistance = 20; // 最大ズーム距離
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Create nodes
    nodeObjectsRef.current = data.nodes.map(node => {
      const geometry = new THREE.SphereGeometry(0.5, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: node.id === selectedNodeId ? COLORS.NODE_HOVER : COLORS.NODE,
        metalness: 0.3,
        roughness: 0.7,
      });

      const mesh = new THREE.Mesh(geometry, material) as NodeMesh;
      mesh.position.set(node.position.x, node.position.y, node.position.z);
      mesh.userData = {
        id: node.id,
        documentInfo: node.documentInfo
      };
      scene.add(mesh);
      return mesh;
    });

    // Create edges
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
        const material = new THREE.MeshStandardMaterial({
          color: COLORS.EDGE,
          transparent: true,
          opacity: 0.6
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
        node.material.color.setHex(
          node.userData.id === selectedNodeId ? COLORS.NODE_HOVER : COLORS.NODE
        );
      });

      if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object as NodeMesh;
        if (hoveredMesh.userData.id !== selectedNodeId) {
          hoveredMesh.material.color.setHex(COLORS.NODE_HOVER);
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
      }
    };

    // Animation loop for controls update
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // OrbitControlsの更新
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
          className="absolute z-10 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-xs pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y + 10,
          }}
        >
          <h3 className="font-medium mb-2">{hoveredNode.title}</h3>
          <p className="text-sm text-gray-300">{hoveredNode.excerpt}</p>
          <div className="mt-2 flex gap-2">
            {hoveredNode.tags.map(tag => (
              <span key={tag} className="text-xs bg-gray-700 px-2 py-1 rounded">
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