"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { KnowledgeGraphProps } from '@/types/graph';
import { Document } from '@/types/document';
import gsap from 'gsap';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NodeMesh extends THREE.Mesh {
  geometry: THREE.SphereGeometry;
  material: THREE.MeshPhysicalMaterial;
  userData: {
    id: string;
    documentInfo: Document;
  };
}

const COLORS = {
  BACKGROUND: 0x1a1b23,
  NODE: {
    DEFAULT: 0x7B8CDE,
    HOVER: 0x8E9DE5,
    SELECTED: 0xFFFFFF,
  },
  EDGE: {
    DEFAULT: 0xFFFFFF,
  }
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

    if (rendererRef.current) {
      rendererRef.current.dispose();
      const oldCanvas = containerRef.current.querySelector('canvas');
      if (oldCanvas) {
        containerRef.current.removeChild(oldCanvas);
      }
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.BACKGROUND);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 7;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

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
        emissive: isSelected ? COLORS.NODE.DEFAULT : 0x000000,
        emissiveIntensity: isSelected ? 0.2 : 0,
      });

      const mesh = new THREE.Mesh(geometry, material) as unknown as NodeMesh;
      mesh.position.set(node.position.x, node.position.y, node.position.z);
      mesh.userData = {
        id: node.id,
        documentInfo: node.documentInfo
      };

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

        const targetPosition = clickedMesh.position.clone();

        gsap.to(camera.position, {
          x: targetPosition.x + 3,
          y: targetPosition.y + 3,
          z: targetPosition.z + 3,
          duration: 1,
          ease: "power2.out",
          onUpdate: () => {
            controls.update();
          },
        });

        gsap.to(controls.target, {
          x: targetPosition.x,
          y: targetPosition.y,
          z: targetPosition.z,
          duration: 1,
          ease: "power2.out",
          onUpdate: () => {
            controls.update();
          },
        });
      }
    };

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const canvas = renderer.domElement;
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    const handleResize = () => {
      if (!containerRef.current) return;

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

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
        <Card
          className="absolute z-10 max-w-xs pointer-events-none shadow-lg"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y + 10,
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-balance">
              {hoveredNode.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground line-clamp-2 text-pretty">
              {hoveredNode.excerpt}
            </p>
            {hoveredNode.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {hoveredNode.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KnowledgeGraph;
