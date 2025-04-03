"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Hotspot } from "@/models/VirtualTour";

interface PanoramaViewerProps {
  tour: {
    _id: string;
    panoramaUrl: string;
    hotspots: Hotspot[];
    name: string;
  };
}

export function PanoramaViewer({ tour }: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Dynamically import Three.js to avoid SSR issues
    const initPanorama = async () => {
      if (!containerRef.current) return;

      // Import necessary Three.js modules
      const THREE = await import('three');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

      // Get container dimensions
      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;

      // Setup renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      container.innerHTML = ''; // Clear container before adding
      container.appendChild(renderer.domElement);

      // Setup scene and camera
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.set(0, 0, 0.1); // Small offset from center

      // Setup OrbitControls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true; // Smooth camera movement
      controls.dampingFactor = 0.05;
      controls.rotateSpeed = 0.5;
      controls.enableZoom = false; // Disable zoom for panorama view
      controls.enablePan = false; // Disable panning
      controls.autoRotate = false; // Optional: set to true for automatic rotation

      // Create panorama sphere
      const geometry = new THREE.SphereGeometry(500, 60, 40);
      geometry.scale(-1, 1, 1); // Invert the sphere for inside view

      // Load panorama texture
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        tour.panoramaUrl,
        (texture) => {
          const material = new THREE.MeshBasicMaterial({ map: texture });
          const sphere = new THREE.Mesh(geometry, material);
          scene.add(sphere);
          setIsLoading(false);
          
          // Start animation loop after texture is loaded
          const animate = () => {
            requestAnimationFrame(animate);
            controls.update(); // Required for damping and auto-rotation
            renderer.render(scene, camera);
          };
          animate();
        },
        (progress) => {
          // Optional: Handle loading progress
          console.log(`Loading: ${Math.round((progress.loaded / progress.total) * 100)}%`);
        },
        (error) => {
          console.error('Error loading panorama texture:', error);
          setIsLoading(false);
        }
      );

      // Handle window resize
      const handleResize = () => {
        if (!containerRef.current) return;
        
        const newWidth = containerRef.current.clientWidth;
        const newHeight = containerRef.current.clientHeight;
        
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      };
      
      window.addEventListener('resize', handleResize);

      // Cleanup on unmount
      return () => {
        window.removeEventListener('resize', handleResize);
        controls.dispose();
        
        if (geometry) geometry.dispose();
        scene.clear();
        renderer.dispose();
        
        if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
          containerRef.current.removeChild(renderer.domElement);
        }
      };
    };

    // Initialize panorama
    initPanorama().catch(error => {
      console.error("Failed to initialize panorama:", error);
      setIsLoading(false);
    });
  }, [tour]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading panorama...</p>
          </div>
        </div>
      )}
    </div>
  );
}