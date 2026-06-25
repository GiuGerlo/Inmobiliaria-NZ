'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { APIProvider, Map, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { MapPin, Compass } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { AnimatedText } from '@/components/AnimatedText';
import type { SaleProperty } from '@/lib/types';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTER = { lat: -32.9468, lng: -60.6393 };

// Paleta cálida — tierra/cream sobre fondo, agua celeste suave,
// rutas principales en gold de la marca.
const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#ede8df' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#1a2231' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f7f4ee' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#a8c0d0' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#05172d' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#e0d8cc' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#c5a572' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#b08848' }, { weight: 1 }] },
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#f0ebe2' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#c8ddb8', visibility: 'on' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#e8e2d8' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#ede8df' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c5a572' }, { weight: 1 }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#05172d' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

interface Located {
  property: SaleProperty;
  lat: number;
  lng: number;
}

function locatable(properties: SaleProperty[]): Located[] {
  return properties
    .filter((p) => !p.is_sold && p.latitude && p.longitude)
    .map((p) => ({ property: p, lat: Number(p.latitude), lng: Number(p.longitude) }))
    .filter((l) => !Number.isNaN(l.lat) && !Number.isNaN(l.lng));
}

function Markers({ points, onSelect }: { points: Located[]; onSelect: (l: Located) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    const markers = points.map((l) => {
      const marker = new google.maps.Marker({
        position: { lat: l.lat, lng: l.lng },
        title: l.property.title ?? '',
        icon: { url: '/img/marker.svg', scaledSize: new google.maps.Size(40, 40) },
      });
      marker.addListener('click', () => onSelect(l));
      return marker;
    });

    const clusterer = new MarkerClusterer({ map, markers });

    const bounds = new google.maps.LatLngBounds();
    markers.forEach((m) => {
      const pos = m.getPosition();
      if (pos) bounds.extend(pos);
    });
    map.fitBounds(bounds, 80);

    return () => {
      clusterer.clearMarkers();
      markers.forEach((m) => m.setMap(null));
    };
  }, [map, points, onSelect]);

  return null;
}

export function PropertiesMap({ properties }: { properties: SaleProperty[] }) {
  const [selected, setSelected] = useState<Located | null>(null);
  const points = locatable(properties);
  const availableCount = properties.filter((p) => !p.is_sold).length;

  return (
    <section className="relative overflow-hidden bg-navy py-24 lg:py-32">
      {/* blobs decorativos */}
      <div className="pointer-events-none absolute -right-32 -top-20 h-96 w-96 rounded-full bg-gold/8 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-20 left-0 h-64 w-64 rounded-full bg-gold/5 blur-[80px]" />

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.7fr] lg:items-start">

          {/* columna izquierda — titular + contador */}
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <div className="flex items-center gap-2">
                <Compass size={14} className="text-gold" />
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                  Dónde estamos
                </span>
              </div>

              <AnimatedText
                as="h2"
                text={"Mapa de\npropiedades"}
                className="mt-4 font-display text-4xl leading-none text-cream lg:text-5xl"
              />

              <p className="mt-5 max-w-xs leading-relaxed text-cream/55">
                Ubicación de nuestras propiedades disponibles.
              </p>

              <div className="mt-8 h-px w-12 bg-gold/40" />

              {availableCount > 0 && (
                <div className="mt-7 inline-flex items-center gap-2.5 rounded-full border border-gold/25 bg-gold/10 px-5 py-2.5">
                  <MapPin size={14} className="text-gold" />
                  <span className="text-sm font-semibold text-gold">
                    {availableCount} propiedades disponibles
                  </span>
                </div>
              )}

              <p className="mt-8 text-xs leading-relaxed text-cream/30">
                Hacé clic en un marcador para ver los detalles de la propiedad.
              </p>
            </div>
          </Reveal>

          {/* columna derecha — mapa */}
          <Reveal delay={0.1}>
            <div className="relative h-[480px] overflow-hidden rounded-card border border-white/10 shadow-lift lg:h-[580px]">
              {apiKey ? (
                <APIProvider apiKey={apiKey} language="es" region="AR">
                  <Map
                    defaultCenter={DEFAULT_CENTER}
                    defaultZoom={7}
                    gestureHandling="cooperative"
                    mapTypeControl={false}
                    streetViewControl={false}
                    fullscreenControl={false}
                    zoomControl
                    className="h-full w-full"
                    // @ts-expect-error — styles deprecated en v3.54+ pero funcional
                    styles={MAP_STYLES}
                  >
                    <Markers points={points} onSelect={setSelected} />
                    {selected && (
                      <InfoWindow
                        position={{ lat: selected.lat, lng: selected.lng }}
                        onCloseClick={() => setSelected(null)}
                      >
                        <div style={{ maxWidth: 220, padding: '6px 4px 4px' }}>
                          <p style={{ fontWeight: 600, color: '#05172d', fontSize: 13, margin: 0 }}>
                            {selected.property.title}
                          </p>
                          {selected.property.locality && (
                            <p style={{ marginTop: 4, fontSize: 11, color: '#5b6675' }}>
                              {selected.property.locality}
                            </p>
                          )}
                          <Link
                            href={`/propiedades/${selected.property.slug}`}
                            style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#c5a572', textDecoration: 'none' }}
                          >
                            Ver propiedad →
                          </Link>
                        </div>
                      </InfoWindow>
                    )}
                  </Map>
                </APIProvider>
              ) : (
                <div className="grid h-full place-items-center bg-navy/60 px-6 text-center">
                  <div>
                    <MapPin size={36} className="mx-auto text-gold/60" />
                    <p className="mt-3 font-display text-lg text-cream">Mapa no disponible</p>
                    <p className="mt-1 text-sm text-cream/40">
                      Configurá{' '}
                      <code className="rounded bg-white/5 px-1.5 py-0.5 text-gold">
                        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                      </code>{' '}
                      para activar el mapa interactivo.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
