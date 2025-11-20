import "./styles.css";
import Map from "./Map.tsx";
import SearchBar from "./SearchBar.tsx";
import { useState } from "react"

export default function App() {
  const [poiResults, setPoiResults] = useState<any[]>([]);
  const [center, setCenter] = useState<any>(null);

  const handleSearch = (result: any, results: any[]) => {
    setPoiResults(results); 
    setCenter(result);
  };

  return (
    <div className="App">
      <Map result = {center} poiResults = {poiResults}/>
      <SearchBar placeholder="Search..." passProps = {handleSearch}/>
    </div>
  );
}
