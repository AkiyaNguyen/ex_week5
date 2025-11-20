import { useState } from "react";
import './styles.css';

type SearchBarProps = {
  placeholder?: string;
  passProps: (center: locationFormat, poiRes: any) => void;
};

type locationFormat = {
  id: number;
  lat: number;
  lon: number;
  display_name: string;
};

async function searchPosition(keyword: string) {
  const url = `https://nominatim.openstreetmap.org/search?q=${keyword}&format=json&addressdetails=1&limit=5&accept-language=en`;
  const res = await fetch(url, { headers: { "User-Agent": "simpleWeb" } });
  const data = await res.json();
  const firstResult = data[0];
  return { id: firstResult.id, lat: firstResult.lat, lon: firstResult.lon, display_name: firstResult.display_name };
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  const deltaLat = (lat2 - lat1) * Math.PI / 180;
  const deltaLon = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

async function searchPOI(center: locationFormat) {
  const allowed_radius = 500;
  const QL = `[out:json][timeout:60];nwr(around:${allowed_radius},${center['lat']},${center['lon']}); out center 1000;`;
  const url = `https://overpass.kumi.systems/api/interpreter`;
  const poiRes = await fetch(url, {
    method: 'POST',
    headers: {
      "User-Agent": "simpleWeb",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `data=${encodeURIComponent(QL)}`,
  });

  if (!poiRes.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await poiRes.json();
  const poi_with_distance: any[] = data.elements.map((e: any) => {
    const displayName = e.tags?.name || "(no name)";
    const dist = calculateDistance(e.lat, e.lon, center['lat'], center['lon']);
    return { 'id': e.id, 'lat': e.lat, 'lon': e.lon, 'display_name': displayName, 'dist': dist };
  });

  poi_with_distance.sort((a, b) => {
    if (a.display_name === '(no name)' || a.id == center.id) {
      return 1;
    } else if (b.display_name === '(no name)' || b.id == center.id) {
      return -1;
    }
    return a.dist - b.dist;
  });

  return poi_with_distance.slice(0, 5);
}

export default function SearchBar({ placeholder, passProps }: SearchBarProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      setLoading(true);  // Bắt đầu quá trình tìm kiếm, hiển thị spinner
      try {
        const result = await searchPosition(value);
        const poiRes = await searchPOI(result);
        passProps(result, poiRes);
      } catch (error) {
        console.error("Error during search:", error);
      } finally {
        setLoading(false);  // Ẩn spinner sau khi tìm kiếm xong
      }
    }
  };

  return (
    <div style={styles.container} className="search-bar">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Search..."}
        style={styles.input}
      />
      {loading && <div className="spinner"></div>} {/* Hiển thị spinner khi đang tìm kiếm */}
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    maxWidth: 400,
    margin: "10px auto"
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }
} as const;
