"use client"

import { useEffect, useRef } from "react"

/**
 * Point interface representing a point in the liquid effect
 */
interface PointProps {
  x: number // Current x position
  y: number // Current y position
  ix: number // Initial/target x position
  iy: number // Initial/target y position
  vx: number // Velocity x component
  vy: number // Velocity y component
  cx1: number // Control point 1 x for bezier curve
  cy1: number // Control point 1 y for bezier curve
  cx2: number // Control point 2 x for bezier curve (unused in current implementation)
  cy2: number // Control point 2 y for bezier curve (unused in current implementation)
  level: number // Level determines the "stiffness" of the point (higher = stiffer)
}

interface LiquidButtonProps {
  text?: string;
  onClick?: () => void;
  disabled?: boolean;
  width?: number;
  height?: number;
  backgroundColor?: string;
  gradientColorInner?: string;
  gradientColorOuter?: string;
}

export default function LiquidButton({ 
  text = "Bouton liquide",
  onClick,
  disabled = false,
  width = 240,
  height = 60,
  backgroundColor = "#1CE2D8",
  gradientColorInner = "#E406D6",
  gradientColorOuter = "#102ce5" 
}: LiquidButtonProps) {
  // Refs for DOM elements
  const buttonRef = useRef<HTMLButtonElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Refs for points that form the liquid shape
  const pointsARef = useRef<PointProps[]>([]) // Background layer points
  const pointsBRef = useRef<PointProps[]>([]) // Foreground layer points

  // Ref for animation frame
  const rafRef = useRef<number | null>(null)

  // Mouse/touch tracking refs
  const pointerPos = useRef({ x: 0, y: 0 }) // Current pointer position
  const pointerLastPos = useRef({ x: 0, y: 0 }) // Previous pointer position (for speed calculation)
  const pointerDir = useRef({ x: 0, y: 0 }) // Pointer direction (-1, 0, or 1 for each axis)
  const pointerSpeed = useRef({ x: 0, y: 0 }) // Pointer speed (pixels per interval)
  const relPointerPos = useRef({ x: 0, y: 0 }) // Pointer position relative to canvas
  const canvasOffset = useRef({ left: 0, top: 0 }) // Canvas position offset
  const isTouching = useRef(false) // Whether the user is currently touching the screen

  //=============================================================================
  // CONFIGURATION PARAMETERS
  //=============================================================================

  // Number of points to create around the button
  // Higher values create a smoother shape but increase computation
  const POINTS = 6

  // Viscosity controls how quickly points return to their original position
  // Higher values = slower return (more viscous)
  const VISCOSITY = 30

  // Maximum distance at which the pointer influences points
  // Higher values = wider area of influence
  const POINTER_DIST = 30

  // Damping factor for point movement
  // Higher values = more damping (less oscillation)
  const DAMPING = 0.15

  // Canvas padding around the button (pixels)
  // Provides space for the liquid effect to expand
  const CANVAS_PADDING = 30

  // Speed at which pointer velocity is measured (milliseconds)
  // Lower values = more responsive but potentially jittery
  const POINTER_SPEED_UPDATE_INTERVAL = 30

  // Colors for the liquid effect
  const BACKGROUND_COLOR = backgroundColor // Base layer color
  const GRADIENT_COLOR_INNER = gradientColorInner // Inner gradient color
  const GRADIENT_COLOR_OUTER = gradientColorOuter // Outer gradient color

  // Mobile-specific parameters
  const TOUCH_INFLUENCE_MULTIPLIER = 0.8 // Increase touch influence for better mobile experience

  //=============================================================================
  // UTILITY FUNCTIONS
  //=============================================================================

  /**
   * Detects if the device is a mobile/touch device
   */
  const isMobileDevice = () => {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0
  }

  /**
   * Updates the canvas offset position
   * This is called on init, resize, and scroll to ensure accurate pointer position calculation
   */
  const updateCanvasOffset = () => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      canvasOffset.current = {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
      }
    }
  }

  /**
   * Updates pointer position and direction based on event
   * Works with both mouse and touch events
   */
  const updatePointerPosition = (clientX: number, clientY: number) => {
    // Get page coordinates (including scroll)
    const pageX = clientX + window.scrollX
    const pageY = clientY + window.scrollY

    // Update pointer direction based on movement
    if (pointerPos.current.x < pageX) pointerDir.current.x = 1
    else if (pointerPos.current.x > pageX) pointerDir.current.x = -1
    else pointerDir.current.x = 0

    if (pointerPos.current.y < pageY) pointerDir.current.y = 1
    else if (pointerPos.current.y > pageY) pointerDir.current.y = -1
    else pointerDir.current.y = 0

    // Update current pointer position
    pointerPos.current = { x: pageX, y: pageY }

    // Calculate pointer position relative to canvas
    relPointerPos.current = {
      x: pointerPos.current.x - canvasOffset.current.left,
      y: pointerPos.current.y - canvasOffset.current.top,
    }
  }

  //=============================================================================
  // LIFECYCLE & EVENT HANDLERS
  //=============================================================================

  useEffect(() => {
    if (buttonRef.current && canvasRef.current) {
      // Initialize the button and canvas
      initButton()
      updateCanvasOffset()

      // Add event listeners for responsive positioning
      window.addEventListener("resize", updateCanvasOffset)
      window.addEventListener("scroll", updateCanvasOffset)
      window.addEventListener("orientationchange", updateCanvasOffset)
    }

    /**
     * Mouse event handlers
     */
    const handleMouseMove = (e: MouseEvent) => {
      // Only process mouse events if not currently touching
      // This prevents conflicts between touch and mouse events
      if (!isTouching.current) {
        updatePointerPosition(e.clientX, e.clientY)
      }
    }

    /**
     * Touch event handlers
     */
    const handleTouchStart = (e: TouchEvent) => {
      isTouching.current = true
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        updatePointerPosition(touch.clientX, touch.clientY)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        updatePointerPosition(touch.clientX, touch.clientY)
      }
    }

    const handleTouchEnd = () => {
      isTouching.current = false
      // Reset pointer speed when touch ends
      pointerSpeed.current = { x: 0, y: 0 }
    }

    // Add event listeners for both mouse and touch
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("touchstart", handleTouchStart)
    document.addEventListener("touchmove", handleTouchMove, { passive: true })
    document.addEventListener("touchend", handleTouchEnd)
    document.addEventListener("touchcancel", handleTouchEnd)

    /**
     * Pointer speed calculation interval
     * Calculates pointer speed by measuring distance moved since last update
     */
    const pointerSpeedInterval = setInterval(() => {
      pointerSpeed.current = {
        x: pointerPos.current.x - pointerLastPos.current.x,
        y: pointerPos.current.y - pointerLastPos.current.y,
      }
      pointerLastPos.current = { ...pointerPos.current }
    }, POINTER_SPEED_UPDATE_INTERVAL)

    // Start the animation loop
    renderCanvas()

    // Cleanup function
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
      document.removeEventListener("touchcancel", handleTouchEnd)
      window.removeEventListener("resize", updateCanvasOffset)
      window.removeEventListener("scroll", updateCanvasOffset)
      window.removeEventListener("orientationchange", updateCanvasOffset)
      clearInterval(pointerSpeedInterval)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  //=============================================================================
  // INITIALIZATION
  //=============================================================================

  /**
   * Initialize the button and canvas
   * Creates points around the button perimeter to form the liquid shape
   */
  const initButton = () => {
    if (!buttonRef.current || !canvasRef.current) return

    const button = buttonRef.current
    const canvas = canvasRef.current
    const buttonWidth = button.offsetWidth
    const buttonHeight = button.offsetHeight

    // Set canvas dimensions with padding for the liquid effect
    canvas.width = buttonWidth + CANVAS_PADDING * 2
    canvas.height = buttonHeight + CANVAS_PADDING * 2

    // Reset points arrays
    pointsARef.current = []
    pointsBRef.current = []

    // Create points around the button in a rounded rectangle shape
    // This specific point arrangement creates the pill/capsule shape
    const x = buttonHeight / 2

    // Top edge points
    for (let j = 1; j < POINTS; j++) {
      addPoints(x + ((buttonWidth - buttonHeight) / POINTS) * j, 0)
    }

    // Top right corner
    addPoints(buttonWidth - buttonHeight / 5, 0)

    // Right edge
    addPoints(buttonWidth + buttonHeight / 10, buttonHeight / 2)

    // Bottom right corner
    addPoints(buttonWidth - buttonHeight / 5, buttonHeight)

    // Bottom edge points
    for (let j = POINTS - 1; j > 0; j--) {
      addPoints(x + ((buttonWidth - buttonHeight) / POINTS) * j, buttonHeight)
    }

    // Bottom left corner
    addPoints(buttonHeight / 5, buttonHeight)

    // Left edge
    addPoints(-buttonHeight / 10, buttonHeight / 2)

    // Top left corner
    addPoints(buttonHeight / 5, 0)
  }

  /**
   * Add a pair of points (one for each layer) at the specified position
   */
  const addPoints = (x: number, y: number) => {
    pointsARef.current.push(createPoint(x, y, 1)) // Background layer point
    pointsBRef.current.push(createPoint(x, y, 2)) // Foreground layer point (stiffer)
  }

  /**
   * Create a point with initial properties
   * @param x X coordinate relative to button
   * @param y Y coordinate relative to button
   * @param level Stiffness level (higher = stiffer)
   */
  const createPoint = (x: number, y: number, level: number): PointProps => {
    // Add CANVAS_PADDING to position points relative to canvas
    return {
      x: CANVAS_PADDING + x,
      y: CANVAS_PADDING + y,
      ix: CANVAS_PADDING + x, // Initial x (target position)
      iy: CANVAS_PADDING + y, // Initial y (target position)
      vx: 0, // Initial x velocity
      vy: 0, // Initial y velocity
      cx1: 0, // Control point 1 x
      cy1: 0, // Control point 1 y
      cx2: 0, // Control point 2 x (unused)
      cy2: 0, // Control point 2 y (unused)
      level, // Stiffness level
    }
  }

  //=============================================================================
  // PHYSICS & ANIMATION
  //=============================================================================

  /**
   * Move a point based on physics simulation
   * Applies spring force toward original position and pointer influence
   * @param point The point to move
   * @returns Updated point with new position and velocity
   */
  const movePoint = (point: PointProps): PointProps => {
    // Create a copy to avoid reference issues
    const newPoint = { ...point }

    // Spring force pulling point back to original position
    // Force is proportional to distance and inversely proportional to viscosity*level
    newPoint.vx += (newPoint.ix - newPoint.x) / (VISCOSITY * newPoint.level)
    newPoint.vy += (newPoint.iy - newPoint.y) / (VISCOSITY * newPoint.level)

    // Calculate distance from pointer to point's original position
    const dx = newPoint.ix - relPointerPos.current.x
    const dy = newPoint.iy - relPointerPos.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    // Normalized distance factor (1 when pointer is at point, 0 when beyond POINTER_DIST)
    const relDist = 1 - Math.min(dist / POINTER_DIST, 1)

    // Apply pointer influence ONLY when pointer is moving toward the point
    // This creates the "pushing" effect as the pointer moves

    // Determine influence multiplier based on device type
    const influenceMultiplier = isTouching.current ? TOUCH_INFLUENCE_MULTIPLIER : 0.6

    // X-axis influence
    if (
      (pointerDir.current.x > 0 && relPointerPos.current.x > newPoint.x) || // Pointer moving right and is right of point
      (pointerDir.current.x < 0 && relPointerPos.current.x < newPoint.x) // Pointer moving left and is left of point
    ) {
      if (relDist > 0 && relDist < 1) {
        // Apply velocity proportional to pointer speed and distance
        newPoint.vx = (pointerSpeed.current.x / 8) * relDist * influenceMultiplier
      }
    }

    // Y-axis influence (same logic as x-axis)
    if (
      (pointerDir.current.y > 0 && relPointerPos.current.y > newPoint.y) ||
      (pointerDir.current.y < 0 && relPointerPos.current.y < newPoint.y)
    ) {
      if (relDist > 0 && relDist < 1) {
        newPoint.vy = (pointerSpeed.current.y / 8) * relDist * influenceMultiplier
      }
    }

    // Apply damping to velocity (reduces oscillation)
    newPoint.vx *= 1 - DAMPING
    newPoint.vy *= 1 - DAMPING

    // Update position based on velocity
    newPoint.x += newPoint.vx
    newPoint.y += newPoint.vy

    return newPoint
  }

  /**
   * Render the canvas with the liquid effect
   * This is called recursively via requestAnimationFrame
   */
  const renderCanvas = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const context = canvas.getContext("2d", { alpha: true })
    if (!context) return

    // Clear canvas with transparency
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Update all points' positions
    pointsARef.current = pointsARef.current.map(movePoint)
    pointsBRef.current = pointsBRef.current.map(movePoint)

    // Create dynamic gradient based on pointer position
    // This creates the "light following the pointer" effect
    const gradientX = Math.min(Math.max(pointerPos.current.x - canvasOffset.current.left, 0), canvas.width)
    const gradientY = Math.min(Math.max(pointerPos.current.y - canvasOffset.current.top, 0), canvas.height)

    // Calculate normalized distance from center for gradient size
    const distance =
      Math.sqrt(Math.pow(gradientX - canvas.width / 2, 2) + Math.pow(gradientY - canvas.height / 2, 2)) /
      Math.sqrt(Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2))

    // Create radial gradient
    const gradient = context.createRadialGradient(
      gradientX, // Center X
      gradientY, // Center Y
      300 + 300 * distance, // Outer radius (larger when pointer is far from center)
      gradientX, // Same center X
      gradientY, // Same center Y
      0, // Inner radius
    )
    gradient.addColorStop(0, GRADIENT_COLOR_OUTER) // Outer color
    gradient.addColorStop(1, GRADIENT_COLOR_INNER) // Inner color

    // Draw both layers of the liquid effect
    const groups = [pointsARef.current, pointsBRef.current]

    for (let j = 0; j <= 1; j++) {
      const points = groups[j]

      // Set fill style based on layer
      if (j === 0) {
        // Background layer (solid color)
        context.fillStyle = BACKGROUND_COLOR
      } else {
        // Foreground layer (gradient)
        context.fillStyle = gradient
      }

      // Begin drawing the shape
      context.beginPath()
      context.moveTo(points[0].x, points[0].y)

      // Draw bezier curves between points to create smooth shape
      for (let i = 0; i < points.length; i++) {
        const p = points[i]
        const nextP = points[i + 1] || points[0] // Loop back to first point

        // Calculate midpoint for control point
        p.cx1 = (p.x + nextP.x) / 2
        p.cy1 = (p.y + nextP.y) / 2

        // Draw bezier curve
        // This specific bezier implementation creates the liquid effect
        // The end point is the same as the control point, creating a "pull" toward the next point
        context.bezierCurveTo(p.x, p.y, p.cx1, p.cy1, p.cx1, p.cy1)
      }

      // Fill the shape
      context.fill()
    }

    // Continue animation loop
    rafRef.current = requestAnimationFrame(renderCanvas)
  }

  //=============================================================================
  // RENDER
  //=============================================================================

  return (
    <div className="inline-block">
      <button
        ref={buttonRef}
        onClick={onClick}
        disabled={disabled}
        className="relative inline-block rounded-full text-white font-bold text-[14px] leading-[60px] tracking-[0.05em] text-center no-underline uppercase border-none bg-transparent cursor-pointer"
        style={{
          fontFamily: "'Droid Sans', sans-serif",
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        {/* Button text */}
        <span className="relative z-[2]">{text}</span>

        {/* Canvas for liquid effect */}
        <canvas ref={canvasRef} className="absolute top-[-30px] right-[-30px] bottom-[-30px] left-[-30px] z-[1]" />
      </button>
    </div>
  )
}
