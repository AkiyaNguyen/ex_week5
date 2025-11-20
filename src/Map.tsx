import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

type MapProps = {
  result: {id: number, lat: number, lon: number, display_name: string},
  poiResults: any[];
};

export default function Map({result, poiResults }: MapProps) {
  const mapRef = useRef<any>(null);

useEffect(() => {
  if (poiResults.length > 0 && mapRef.current) {
    const allCoordinates = [
      ...poiResults.map((poi) => [parseFloat(poi.lat), parseFloat(poi.lon)]),
      result ? [result.lat, result.lon] : null
    ].filter(coord => coord !== null); 

    mapRef.current.fitBounds(allCoordinates);
  }
}, [poiResults, result]);

    useEffect(() => {
    console.log("poiResults:", poiResults);
  }, [poiResults]);

  return (
    <MapContainer
      center={[10.7628, 106.6825]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ width: "100%", height: "100vh" }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {Array.isArray(poiResults) && poiResults.map((poi) => (
        <Marker
          key={poi.id}
          position={[parseFloat(poi['lat']), parseFloat(poi.lon)]}
          icon={new L.Icon({ iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png" })}
        >
          <Popup>{poi.display_name}</Popup>
        </Marker>
      ))}
            {result && (
        <Marker
          key="result-marker"
          position={[result.lat, result.lon]}
          icon={new L.Icon({
            iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png"
          })}
        >
          <Popup>{result.display_name}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
