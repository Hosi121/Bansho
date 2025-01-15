import * as THREE from 'three';
import { Document } from './document';

export interface NodeUserData {
    id: string;
    documentInfo: Document;
}

export interface NodeMesh extends THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial> {
    userData: NodeUserData;
}