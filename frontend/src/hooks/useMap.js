import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import { MAP_CONFIG } from '../config/map'

const protocol = new Protocol()
maplibregl.addProtocol('pmtiles', protocol.tile)
maplibregl.prewarm()

class YardsMilesScaleControl {
  constructor() {
    this._map = null
    this._container = null
  }

  onAdd(map) {
    this._map = map
    this._container = document.createElement('div')
    this._container.className = 'maplibregl-ctrl maplibregl-ctrl-scale'
    this._update()
    this._map.on('zoom', this._update)
    this._map.on('move', this._update)
    return this._container
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container)
    this._map.off('zoom', this._update)
    this._map.off('move', this._update)
    this._map = undefined
  }

  _update = () => {
    const map = this._map
    const container = this._container
    const y = map.getContainer().clientHeight - 10
    const leftLngLat = map.unproject([0, y])
    const rightLngLat = map.unproject([100, y])
    const meters = leftLngLat.distanceTo(rightLngLat)
    const feet = meters * 3.28084
    const yards = feet / 3

    let text, barWidth
    if (yards < 1760) {
      const niceYards = this._roundToNiceNumber(yards)
      text = `${niceYards} yd`
      const yardsWidth = (niceYards / yards) * 100
      barWidth = Math.max(20, Math.min(100, yardsWidth))
    } else {
      const miles = yards / 1760
      const niceMiles = this._roundToNiceNumber(miles, true)
      text = `${niceMiles} mi`
      const milesWidth = (niceMiles / miles) * 100
      barWidth = Math.max(20, Math.min(100, milesWidth))
    }

    container.style.width = `${barWidth}px`
    container.textContent = text
  }

  _roundToNiceNumber(value, isMiles = false) {
    if (isMiles) {
      const rounded = Math.round(value * 10) / 10
      return rounded % 1 === 0 ? rounded : rounded.toFixed(1)
    }
    const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
    const normalized = value / magnitude
    let nice
    if (normalized < 1.5) nice = 1
    else if (normalized < 3.5) nice = 2
    else if (normalized < 7.5) nice = 5
    else nice = 10
    return nice * magnitude
  }
}

export function useMap(containerRef) {
  const mapRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [map, setMap] = useState(null)

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      ...MAP_CONFIG,
      cancelPendingTileRequestsWhileZooming: true,
    })

    mapRef.current.addControl(
      new YardsMilesScaleControl(),
      'bottom-left'
    )

    mapRef.current.on('load', () => {
      setMap(mapRef.current)
      setIsLoaded(true)
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [containerRef])

  return { map, isLoaded }
}
