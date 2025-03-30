"use client"
import { useFrame } from "@react-three/fiber"
import { useRef, useState, useEffect } from "react"
import * as THREE from "three"

interface PanoramaSphereProps {
  imageUrl: string
}

export default function PanoramaSphere({ imageUrl }: PanoramaSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [error, setError] = useState(false)
  const [textureLoaded, setTextureLoaded] = useState(false)

  // Create a material ref to update it when texture loads
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)

  useEffect(() => {
    // Reset states when URL changes
    setError(false)
    setTextureLoaded(false)

    // Create a new texture loader
    const loader = new THREE.TextureLoader()

    // Set crossOrigin to allow loading from other domains
    loader.setCrossOrigin("anonymous")

    // Load the texture
    loader.load(
      imageUrl,
      // Success callback
      (loadedTexture) => {
        if (materialRef.current) {
          loadedTexture.mapping = THREE.EquirectangularReflectionMapping
          loadedTexture.colorSpace = THREE.SRGBColorSpace
          materialRef.current.map = loadedTexture
          materialRef.current.needsUpdate = true
          setTextureLoaded(true)
          setError(false)
        }
      },
      // Progress callback
      undefined,
      // Error callback
      (err) => {
        console.error("Failed to load panorama texture:", imageUrl, err)
        setError(true)
      },
    )
  }, [imageUrl])

  useFrame(() => {
    if (meshRef.current) {
      // Optional subtle movement
      // meshRef.current.rotation.y += 0.0005
    }
  })

  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial ref={materialRef} color={error ? "#111827" : "#FFFFFF"} side={THREE.BackSide} />
    </mesh>
  )
}

