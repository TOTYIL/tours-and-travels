async function test() {
  const minLat = 29.35; const maxLat = 29.39;
  const minLon = 79.45; const maxLon = 79.55;
  const viewbox = `${minLon-0.1},${maxLat+0.1},${maxLon+0.1},${minLat-0.1}`;
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=tourism&viewbox=${viewbox}&bounded=1&limit=5`);
  const data = await res.json();
  console.log(data);
}
test();
