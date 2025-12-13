import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { API_BASE_URL } from "../config"

const GlobeViz = () => {
    const canvasRef = useRef(null)
    const [tooltip, setTooltip] = useState(null);

    const [locations, setLocations] = useState([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/node-locations`, {
                    headers: { 'ngrok-skip-browser-warning': 'true' }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setLocations(data);
                    }
                }
            } catch (err) {
                console.error("Failed to load node locations", err);
            }
        };
        fetchLocations();
        const interval = setInterval(fetchLocations, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    // Fallback if no real connections yet (so globe isn't empty)
    const activeLocations = locations.length > 0 ? locations : [
        // Minimal Fallback
        { city: 'Waiting for Nodes...', lat: 0, lng: 0, count: 0 }
    ];

    useEffect(() => {
        if (!canvasRef.current) return

        const canvas = canvasRef.current
        const context = canvas.getContext("2d", { alpha: false })
        if (!context) return

        // Dimensions
        const width = window.innerWidth
        const height = window.innerHeight
        const radius = Math.min(width, height) / 2.5

        const dpr = window.devicePixelRatio || 1
        canvas.width = width * dpr
        canvas.height = height * dpr
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        context.scale(dpr, dpr)

        // Projection
        const projection = d3
            .geoOrthographic()
            .scale(radius)
            .translate([width / 2, height / 2])
            .clipAngle(90)

        const path = d3.geoPath().projection(projection).context(context)

        // Mutable State (Refs) for max performance
        const state = {
            rotation: [0, 0], // [lambda, phi]
            isDragging: false,
            autoRotate: true
        };

        const rotationSpeed = 0.2

        // --- Helper Functions ---
        const pointInPolygon = (point, polygon) => {
            const [x, y] = point
            let inside = false
            for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                const [xi, yi] = polygon[i]
                const [xj, yj] = polygon[j]
                if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
                    inside = !inside
                }
            }
            return inside
        }

        const pointInFeature = (point, feature) => {
            const geometry = feature.geometry
            if (geometry.type === "Polygon") {
                const coordinates = geometry.coordinates
                if (!pointInPolygon(point, coordinates[0])) return false
                for (let i = 1; i < coordinates.length; i++) {
                    if (pointInPolygon(point, coordinates[i])) return false
                }
                return true
            } else if (geometry.type === "MultiPolygon") {
                for (const polygon of geometry.coordinates) {
                    if (pointInPolygon(point, polygon[0])) {
                        let inHole = false
                        for (let i = 1; i < polygon.length; i++) {
                            if (pointInPolygon(point, polygon[i])) {
                                inHole = true
                                break
                            }
                        }
                        if (!inHole) return true
                    }
                }
                return false
            }
            return false
        }

        const generateDotsInPolygon = (feature, dotSpacing = 24) => {
            const dots = []
            const bounds = d3.geoBounds(feature)
            const [[minLng, minLat], [maxLng, maxLat]] = bounds
            const stepSize = dotSpacing * 0.08

            for (let lng = minLng; lng <= maxLng; lng += stepSize) {
                for (let lat = minLat; lat <= maxLat; lat += stepSize) {
                    const point = [lng, lat]
                    if (pointInFeature(point, feature)) {
                        dots.push({ lng, lat })
                    }
                }
            }
            return dots
        }

        let allDots = []

        const render = () => {
            context.fillStyle = "#050505";
            context.fillRect(0, 0, width, height);

            const currentScale = projection.scale()
            const scaleFactor = currentScale / radius

            projection.rotate(state.rotation);

            const graticule = d3.geoGraticule()
            context.beginPath()
            path(graticule())
            context.strokeStyle = "rgba(255, 255, 255, 0.08)"
            context.lineWidth = 1 * scaleFactor
            context.stroke()

            const center = [-state.rotation[0], -state.rotation[1]];
            context.fillStyle = "rgba(100, 100, 100, 0.6)"
            context.beginPath();

            for (let i = 0; i < allDots.length; i++) {
                const dot = allDots[i];
                const d = d3.geoDistance([dot.lng, dot.lat], center);
                if (d < 1.57) {
                    const projected = projection([dot.lng, dot.lat]);
                    if (projected) {
                        context.moveTo(projected[0], projected[1]);
                        context.arc(projected[0], projected[1], 1.2 * scaleFactor, 0, 2 * Math.PI)
                    }
                }
            }
            context.fill();

            activeLocations.forEach(city => {
                const d = d3.geoDistance([city.lng, city.lat], center);
                if (d < 1.57) {
                    const [x, y] = projection([city.lng, city.lat])

                    context.beginPath()
                    context.arc(x, y, 6 * scaleFactor, 0, 2 * Math.PI)
                    context.fillStyle = "rgba(74, 222, 128, 0.3)"
                    context.fill()

                    context.beginPath()
                    context.arc(x, y, 2.5 * scaleFactor, 0, 2 * Math.PI)
                    context.fillStyle = "#ffffff"
                    context.fill()
                }
            })

            context.beginPath()
            context.arc(width / 2, height / 2, currentScale, 0, 2 * Math.PI)
            context.strokeStyle = "rgba(255, 255, 255, 0.15)"
            context.lineWidth = 2 * scaleFactor
            context.stroke()
        }

        const loadWorldData = async () => {
            try {
                const response = await fetch("https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json")
                if (!response.ok) throw new Error("Failed to load land data")

                const landFeatures = await response.json()
                landFeatures.features.forEach((feature) => {
                    const dots = generateDotsInPolygon(feature, 24)
                    dots.forEach((dot) => {
                        allDots.push(dot)
                    })
                })

                const timer = d3.timer(() => {
                    if (state.autoRotate && !state.isDragging) {
                        state.rotation[0] += rotationSpeed
                    }
                    render()
                });

                return () => timer.stop()
            } catch (err) {
                console.error("Failed to load map", err)
            }
        }

        // --- Interaction ---
        const handleMouseDown = (event) => {
            state.isDragging = true;
            state.autoRotate = false;

            const startX = event.clientX
            const startY = event.clientY
            const startRotation = [...state.rotation]

            const handleDragMove = (moveEvent) => {
                const sensitivity = 0.25
                const dx = moveEvent.clientX - startX
                const dy = moveEvent.clientY - startY

                state.rotation[0] = startRotation[0] + dx * sensitivity
                state.rotation[1] = startRotation[1] - dy * sensitivity
                state.rotation[1] = Math.max(-90, Math.min(90, state.rotation[1]))
            }

            const handleMouseUp = () => {
                state.isDragging = false;
                document.removeEventListener("mousemove", handleDragMove)
                document.removeEventListener("mouseup", handleMouseUp)
                setTimeout(() => { if (!state.isDragging) state.autoRotate = true }, 600)
            }

            document.addEventListener("mousemove", handleDragMove)
            document.addEventListener("mouseup", handleMouseUp)
        }

        const onCanvasMouseMove = (e) => {
            if (state.isDragging) return;

            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            let found = null;
            const center = [-state.rotation[0], -state.rotation[1]];

            // We need to invert logic slightly or use pre-calculated locations from render?
            // Re-calculating projection here is expensive but accurate.
            for (const city of activeLocations) {
                const d = d3.geoDistance([city.lng, city.lat], center);
                if (d < 1.57) {
                    const coords = projection([city.lng, city.lat]);
                    if (coords) {
                        const [cx, cy] = coords;
                        if (Math.hypot(cx - mouseX, cy - mouseY) < 15) {
                            found = { ...city, x: e.clientX, y: e.clientY };
                            canvas.style.cursor = 'pointer';
                            break;
                        }
                    }
                }
            }

            if (!found) canvas.style.cursor = 'grab';
            setTooltip(found);
        };

        canvas.addEventListener("mousedown", handleMouseDown)
        canvas.addEventListener("mousemove", onCanvasMouseMove)

        const handleWheel = (event) => {
            event.preventDefault();
            const sc = projection.scale();
            const nextScale = sc - event.deltaY * 0.5;
            if (nextScale > 50 && nextScale < 4000) projection.scale(nextScale);
        }
        canvas.addEventListener("wheel", handleWheel, { passive: false })

        const cleanup = loadWorldData()

        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("mousemove", onCanvasMouseMove);
            canvas.removeEventListener("wheel", handleWheel);
        }
    }, [])

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <canvas
                ref={canvasRef}
                style={{ cursor: 'grab', display: 'block' }}
            />
            {tooltip && (
                <div style={{
                    position: 'absolute',
                    top: tooltip.y - 40,
                    left: tooltip.x,
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    pointerEvents: 'none',
                    zIndex: 20,
                    whiteSpace: 'nowrap'
                }}>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{tooltip.city}</div>
                    <div style={{ color: '#4ade80', fontSize: '0.8rem' }}>{tooltip.count} Active Nodes</div>
                </div>
            )}
        </div>
    )
}

export default GlobeViz
