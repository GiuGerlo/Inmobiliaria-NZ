'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { APIProvider, Map, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { MapPin } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import type { SaleProperty } from '@/lib/types';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTER = { lat: -32.9468, lng: -60.6393 };

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

  return (
    <section className="bg-cream pb-24 lg:pb-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Dónde estamos
            </span>
            <h2 className="mt-4 font-display text-4xl text-ink lg:text-5xl">Mapa de propiedades</h2>
            <p className="mt-5 text-muted">
              Ubicación de nuestras propiedades disponibles en la región.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 h-[500px] overflow-hidden rounded-card border border-navy/10 shadow-lift">
            {apiKey ? (
              <APIProvider apiKey={apiKey}>
                <Map
                  defaultCenter={DEFAULT_CENTER}
                  defaultZoom={7}
                  gestureHandling="cooperative"
                  disableDefaultUI={false}
                  className="h-full w-full"
                >
                  <Markers points={points} onSelect={setSelected} />
                  {selected && (
                    <InfoWindow
                      position={{ lat: selected.lat, lng: selected.lng }}
                      onCloseClick={() => setSelected(null)}
                    >
                      <div className="max-w-[220px] p-1">
                        <p className="font-semibold text-[#13294b]">{selected.property.title}</p>
                        {selected.property.locality && (
                          <p className="mt-1 text-xs text-gray-600">{selected.property.locality}</p>
                        )}
                        <Link
                          href={`/propiedades/${selected.property.slug}`}
                          className="mt-2 inline-block text-xs font-semibold text-[#c5a572]"
                        >
                          Ver detalles →
                        </Link>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
            ) : (
              <div className="grid h-full place-items-center bg-navy/5 px-6 text-center">
                <div>
                  <MapPin size={36} className="mx-auto text-gold" />
                  <p className="mt-3 font-display text-lg text-ink">Mapa no disponible</p>
                  <p className="mt-1 text-sm text-muted">
                    Configurá <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> para activar el mapa
                    interactivo.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
