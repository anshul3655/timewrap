"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

export default function VoidGridBackground() {
  const gridRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let touchStartX = 0
    let touchStartY = 0
    let isDragging = false

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - window.innerWidth / 2) / window.innerWidth
      mouseY = (e.clientY - window.innerHeight / 2) / window.innerHeight

      // Calculate target position with increased movement range
      targetX = mouseX * 400
      targetY = mouseY * 400
    }

    // Smooth animation loop
    const animate = () => {
      // Smooth interpolation
      currentX += (targetX - currentX) * 0.05
      currentY += (targetY - currentY) * 0.05

      // Apply transform with perspective effect
      if (grid) {
        grid.style.transform = `translate(-50%, -50%) 
                              translate3d(${currentX}px, ${currentY}px, 0)
                              rotateX(${-mouseY * 3}deg) 
                              rotateY(${mouseX * 3}deg)`
      }

      requestAnimationFrame(animate)
    }

    // Handle touch devices
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
      isDragging = true
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return

      const touchX = e.touches[0].clientX
      const touchY = e.touches[0].clientY

      const deltaX = (touchX - touchStartX) / window.innerWidth
      const deltaY = (touchY - touchStartY) / window.innerHeight

      targetX += deltaX * 400
      targetY += deltaY * 400

      touchStartX = touchX
      touchStartY = touchY

      e.preventDefault()
    }

    const handleTouchEnd = () => {
      isDragging = false
    }

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("touchstart", handleTouchStart)
    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd)

    // Start animation
    animate()

    // Cleanup
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen perspective-1000 z-0 bg-background dark:bg-black"
      style={{ perspective: "1000px" }}
    >
      <div
        ref={gridRef}
        className="absolute top-1/2 left-1/2 w-[1000vw] h-[1000vh] transform-gpu -translate-x-1/2 -translate-y-1/2"
        style={
          {
            transformStyle: "preserve-3d",
            backgroundImage: `
            radial-gradient(circle at 0 0, var(--grid-dot-color) 1px, transparent 1px),
            linear-gradient(var(--grid-line-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-line-color) 1px, transparent 1px)
          `,
            backgroundSize: "100px 100px, 100px 100px, 100px 100px",
            backgroundPosition: "0 0, 0 0, 0 0",
            "--grid-dot-color": "rgba(128, 128, 128, 0.5)",
            "--grid-line-color": "rgba(128, 128, 128, 0.15)",
          } as React.CSSProperties
        }
      />
    </div>
  )
}

