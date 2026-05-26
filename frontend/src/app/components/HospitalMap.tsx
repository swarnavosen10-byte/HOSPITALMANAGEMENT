import { useEffect, useRef, useState, useMemo } from "react";
import { MapPin, Phone, Compass, AlertTriangle, Check, Info } from "lucide-react";
import { hospitals as mockHospitals } from "../data";

declare global {
  interface Window {
    google: any;
  }
}


// Haversine formula to calculate distance in km
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function HospitalMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState<number>(15); // Default 15km
  const [selectedHospital, setSelectedHospital] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);
  const [activeEmergency, setActiveEmergency] = useState<any | null>(null);

  // Markers ref to clear them
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);

  // 1. Fetch hospitals from backend or fallback to mock data
  useEffect(() => {
    const loadHospitalsData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/hospitals`);
        if (response.ok) {
          const data = await response.json();
          const mapped = data.map((h: any) => ({
            id: h.id,
            name: h.name,
            location: h.district,
            isOpen: h.beds > 0,
            bedsAvailable: h.beds,
            rating: h.rating || 4.0,
            lat: h.lat,
            lng: h.lng,
            specialties: h.id % 2 === 0 ? ["General Medicine", "Cardiology"] : ["Pediatrics", "Emergency Care"],
            emergencyStatus: h.beds > 0 ? "Active" : "Busy",
            emergencyPhone: `+91 33 ${3000 + h.id * 13} ${1000 + h.id * 7}`
          }));
          setHospitals(mapped);
        } else {
          throw new Error("Backend response error");
        }
      } catch (err) {
        console.warn("Using local mock hospitals data:", err);
        const mapped = mockHospitals.map((h: any) => ({
          ...h,
          lat: h.lat || 22.5726 + (Math.random() - 0.5) * 0.1,
          lng: h.lng || 88.3639 + (Math.random() - 0.5) * 0.1,
          emergencyPhone: `+91 33 ${3000 + h.id * 13} ${1000 + h.id * 7}`
        }));
        setHospitals(mapped);
      }
      setLoading(false);
    };

    loadHospitalsData();
  }, []);

  // 2. Request user location and load Google Maps Script dynamically
  useEffect(() => {
    const defaultCenter = { lat: 22.5726, lng: 88.3639 };

    const startGoogleMaps = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLoc = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(userLoc);
            initMap(userLoc);
          },
          (err) => {
            console.warn("Geolocation access denied or timed out:", err);
            setLocationDenied(true);
            setUserLocation(defaultCenter);
            initMap(defaultCenter);
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        setUserLocation(defaultCenter);
        initMap(defaultCenter);
      }
    };

    const initMap = async (center: { lat: number; lng: number }) => {
      if (!mapRef.current) return;

      try {
        const { Map } = await window.google.maps.importLibrary("maps");

        const mapInstance = new Map(mapRef.current, {
          center: center,
          zoom: 12,
          mapId: "DEMO_MAP_ID", // Required for AdvancedMarkerElement
        });

        try {
          const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker");

          // User location marker
          const userMarker = new AdvancedMarkerElement({
            position: center,
            map: mapInstance,
            title: "Your Location",
            gmpDraggable: true,
            content: new PinElement({
              background: "#0284c7",
              borderColor: "#ffffff",
              glyphText: "📍",
              scale: 1.1
            })
          });

          // Listen for marker drag to update location
          userMarker.addListener("dragend", () => {
            const newPos = userMarker.position;
            if (newPos) {
              setUserLocation({
                lat: typeof newPos.lat === "function" ? newPos.lat() : newPos.lat,
                lng: typeof newPos.lng === "function" ? newPos.lng() : newPos.lng
              });
            }
          });

          // Map click to place user location marker
          mapInstance.addListener("click", (e: any) => {
            if (e.latLng) {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              setUserLocation({ lat, lng });
              userMarker.position = { lat, lng };
            }
          });

          userMarkerRef.current = userMarker;
        } catch (err) {
          console.warn("Failed to load Advanced Markers library, falling back to legacy marker:", err);
          const userMarker = new window.google.maps.Marker({
            position: center,
            map: mapInstance,
            title: "Your Location",
            draggable: true
          });
          userMarker.addListener("dragend", () => {
            const newPos = userMarker.getPosition();
            if (newPos) setUserLocation({ lat: newPos.lat(), lng: newPos.lng() });
          });
          mapInstance.addListener("click", (e: any) => {
            if (e.latLng) {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              setUserLocation({ lat, lng });
              userMarker.setPosition({ lat, lng });
            }
          });
          userMarkerRef.current = userMarker;
        }

        setMap(mapInstance);
      } catch (err) {
        console.error("Failed to load Google Maps library:", err);
      }
    };

    // Load Script dynamically
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBVBCnMAeLxXqpyg1yNJ5v2J8LBcqdY8i0";
    const scriptId = "google-maps-api-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        startGoogleMaps();
      };
      document.head.appendChild(script);
    } else {
      if (window.google && window.google.maps) {
        startGoogleMaps();
      } else {
        script.addEventListener("load", startGoogleMaps);
      }
    }

    return () => {
      markersRef.current.forEach((m) => {
        if (typeof m.setMap === "function") {
          m.setMap(null);
        } else {
          m.map = null;
        }
      });
      if (userMarkerRef.current) {
        if (typeof userMarkerRef.current.setMap === "function") {
          userMarkerRef.current.setMap(null);
        } else {
          userMarkerRef.current.map = null;
        }
      }
    };
  }, []);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(loc);
        if (userMarkerRef.current) {
          if (typeof userMarkerRef.current.setPosition === "function") {
            userMarkerRef.current.setPosition(loc);
          } else {
            userMarkerRef.current.position = loc;
          }
        }
        if (map) map.panTo(loc);
      });
    }
  };

  // Process hospitals and calculate dynamic distance
  const processedHospitals = useMemo(() => {
    if (!userLocation) return [];
    return hospitals
      .map((h) => {
        const dist = calculateDistance(userLocation.lat, userLocation.lng, h.lat, h.lng);
        return { ...h, distance: dist };
      })
      .filter((h) => {
        const matchesRadius = h.distance <= radius;
        const matchesQuery = searchQuery === "" || h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.location.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesRadius && matchesQuery;
      })
      .sort((a, b) => a.distance - b.distance);
  }, [hospitals, userLocation, radius, searchQuery]);

  // Update Map Markers based on filtered list
  useEffect(() => {
    if (!map || !userLocation) return;

    markersRef.current.forEach((m) => {
      if (typeof m.setMap === "function") {
        m.setMap(null);
      } else {
        m.map = null;
      }
    });
    markersRef.current = [];

    const loadMarkers = async () => {
      try {
        const { LatLngBounds } = await window.google.maps.importLibrary("core");
        const bounds = new LatLngBounds();
        bounds.extend(userLocation);

        const { AdvancedMarkerElement, PinElement } = await window.google.maps.importLibrary("marker");

        processedHospitals.forEach((h) => {
          const isSelected = selectedHospital?.id === h.id;
          const pinColor = h.bedsAvailable > 0 ? "#10b981" : "#ef4444";
          
          const pin = new PinElement({
            background: pinColor,
            borderColor: "#ffffff",
            scale: isSelected ? 1.25 : 1.0,
            glyphText: h.bedsAvailable > 0 ? "🟢" : "🔴",
          });

          const marker = new AdvancedMarkerElement({
            position: { lat: h.lat, lng: h.lng },
            map: map,
            title: h.name,
            content: pin,
          });

          marker.addListener("gmp-click", () => {
            setSelectedHospital(h);
            map.panTo({ lat: h.lat, lng: h.lng });
            const element = document.getElementById(`hospital-card-${h.id}`);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
          });

          markersRef.current.push(marker);
          bounds.extend({ lat: h.lat, lng: h.lng });
        });

        if (processedHospitals.length > 0 && searchQuery === "") {
          map.fitBounds(bounds);
          const listener = map.addListener("idle", () => {
            if (map.getZoom()! > 15) map.setZoom(14);
            window.google.maps.event.removeListener(listener);
          });
        }
      } catch (err) {
        console.warn("Failed to load Advanced Markers, falling back to legacy markers:", err);
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(userLocation);

        processedHospitals.forEach((h) => {
          const isSelected = selectedHospital?.id === h.id;
          const marker = new window.google.maps.Marker({
            position: { lat: h.lat, lng: h.lng },
            map: map,
            title: h.name,
            icon: {
              url: h.bedsAvailable > 0
                ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
              scaledSize: isSelected ? new window.google.maps.Size(42, 42) : new window.google.maps.Size(32, 32),
            }
          });

          marker.addListener("click", () => {
            setSelectedHospital(h);
            map.panTo({ lat: h.lat, lng: h.lng });
            const element = document.getElementById(`hospital-card-${h.id}`);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
          });

          markersRef.current.push(marker);
          bounds.extend({ lat: h.lat, lng: h.lng });
        });

        if (processedHospitals.length > 0 && searchQuery === "") {
          map.fitBounds(bounds);
          const listener = map.addListener("idle", () => {
            if (map.getZoom()! > 15) map.setZoom(14);
            window.google.maps.event.removeListener(listener);
          });
        }
      }
    };

    loadMarkers();
  }, [map, processedHospitals, selectedHospital, userLocation]);

  return (
    <div className="flex flex-col h-[580px] bg-white text-slate-800 rounded-3xl overflow-hidden shadow-xl border border-slate-200">

      {/* Header and Controls */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/90 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xl font-black text-cyan-700 flex items-center gap-2">
              <Compass className="animate-spin-slow text-cyan-600" size={22} />
              <span>Real-Time Nearest Care Locator</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Drag the pointer 📍 on the map or click any spot to set your custom patient location.</p>
          </div>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 active:scale-95 transition text-xs font-bold rounded-lg border border-slate-300 text-slate-700 cursor-pointer shadow-sm"
          >
            <MapPin size={14} className="text-cyan-600" />
            <span>Use My GPS Location</span>
          </button>
        </div>

        {/* Search and Slider Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Search Hospitals</label>
            <input
              type="text"
              placeholder="Search by name, landmark, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Search Radius</label>
              <span className="text-xs font-black text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">{radius} km</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-slate-400 font-semibold">5km</span>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="flex-1 accent-cyan-600 cursor-pointer bg-slate-200 rounded-lg h-2"
              />
              <span className="text-xs text-slate-400 font-semibold">30km</span>
            </div>
          </div>
        </div>

        {locationDenied && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <Info size={14} className="shrink-0 text-amber-600" />
            <span>Location permission was denied. Defaulting to Central Kolkata. Click or drag the map to update.</span>
          </div>
        )}
      </div>

      {/* Main Split Screen Area (fixed height and scrollable) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] overflow-hidden">

        {/* Left pane: Google Map */}
        <div className="relative h-full w-full bg-slate-100 border-r border-slate-200 min-h-[300px] lg:min-h-full">
          <div ref={mapRef} className="absolute inset-0 w-full h-full" />
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-3 z-10">
              <div className="h-8 w-8 rounded-full border-4 border-cyan-600/20 border-t-cyan-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Syncing nearest clinical coordinates...</p>
            </div>
          )}
        </div>

        {/* Right pane: Sidebar Hospital List */}
        <div className="flex flex-col h-full bg-slate-50 min-h-0 overflow-hidden">

          <div className="p-3 bg-white border-b border-slate-200 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500">Hospitals in range ({processedHospitals.length})</span>
            <span className="text-[10px] text-slate-400 font-medium">🟢 Beds Available | 🔴 Full</span>
          </div>

          {/* Scrollable list inside fixed height container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {processedHospitals.map((hospital) => {
              const isSelected = selectedHospital?.id === hospital.id;
              return (
                <div
                  key={hospital.id}
                  id={`hospital-card-${hospital.id}`}
                  onClick={() => {
                    setSelectedHospital(hospital);
                    if (map) map.panTo({ lat: hospital.lat, lng: hospital.lng });
                  }}
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${isSelected
                      ? "bg-cyan-50/40 border-cyan-500 shadow-sm shadow-cyan-100 scale-[1.01]"
                      : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 leading-snug">{hospital.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{hospital.location}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                        {hospital.distance.toFixed(1)} km
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                    <div className="text-xs text-slate-600">
                      Beds Available: <span className={`font-bold ${hospital.bedsAvailable > 0 ? "text-emerald-600" : "text-rose-600"}`}>{hospital.bedsAvailable}</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Rating: <span className="font-semibold text-amber-500">★ {hospital.rating}</span>
                    </div>
                  </div>

                  {/* Contact Number and Action Buttons */}
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold mb-2.5">
                      <Phone size={13} className="text-cyan-600" />
                      <span>Emergency: <span className="text-red-600 font-bold">{hospital.emergencyPhone}</span></span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveEmergency(hospital);
                        }}
                        className="flex items-center justify-center gap-1 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 transition text-[11px] font-bold text-white rounded-lg cursor-pointer shadow-sm"
                      >
                        <AlertTriangle size={12} className="animate-pulse" />
                        <span>Emergency</span>
                      </button>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat},${userLocation?.lng}&destination=${hospital.lat},${hospital.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-1 py-1.5 bg-white hover:bg-slate-50 active:scale-95 transition text-[11px] font-bold text-slate-700 rounded-lg border border-slate-300 text-center cursor-pointer shadow-sm"
                      >
                        <Compass size={12} className="text-slate-500" />
                        <span>Get Directions</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}

            {processedHospitals.length === 0 && (
              <div className="p-8 text-center bg-white border border-dashed border-slate-200 rounded-xl">
                <MapPin size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-slate-500 font-medium">No hospitals match your radius & filter.</p>
                <p className="text-[10px] text-slate-400 mt-1">Try expanding the range slider up to 30 km.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulated Emergency Action Modal */}
      {activeEmergency && (
        <div className="absolute inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl animate-scaleUp">
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-50 border-2 border-rose-500 flex items-center justify-center text-rose-600 mb-4">
              <Phone size={28} className="animate-bounce" />
            </div>

            <h4 className="text-lg font-black text-slate-800">Connecting Emergency Desk</h4>
            <p className="text-xs text-slate-500 mt-1">{activeEmergency.name}</p>

            <div className="my-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-xl font-black text-rose-600 font-mono tracking-wide">{activeEmergency.emergencyPhone}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">Simulating cellular outbound connection...</p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              In a real emergency, this opens your dialer directly. Ambulances are routed automatically using your current telemetry coords:
              <span className="font-mono text-[10px] text-cyan-700 block mt-1">lat: {userLocation?.lat.toFixed(4)}, lng: {userLocation?.lng.toFixed(4)}</span>
            </p>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${activeEmergency.emergencyPhone}`}
                onClick={() => setActiveEmergency(null)}
                className="flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 transition text-xs font-bold text-white rounded-xl shadow-lg"
              >
                <Check size={14} />
                <span>Call Now</span>
              </a>
              <button
                type="button"
                onClick={() => setActiveEmergency(null)}
                className="py-2 bg-white hover:bg-slate-50 transition text-xs font-bold text-slate-600 rounded-xl border border-slate-300 shadow-sm"
              >
                Cancel Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
