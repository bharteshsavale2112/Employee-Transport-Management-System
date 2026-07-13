/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  Bus, 
  ArrowLeft, 
  RefreshCw, 
  Navigation, 
  CheckCircle, 
  User, 
  Gauge, 
  TrendingUp, 
  Compass, 
  Route as RouteIcon,
  BellRing
} from 'lucide-react';
import { BajajHorizontalLogo, BajajFavouriteIndianLogo } from './BajajLogo';
import { SHIFT_ROUTES } from '../types';

interface LiveTrackingProps {
  onBack: () => void;
  initialRouteId?: string;
}

// Route Bus Details Interface
interface RouteBusDetail {
  id: string;
  name: string;
  title: string;
  shift: string;
  description: string;
  driver: string;
  busNo: string;
  capacity: string;
  stops: string[];
  path: [number, number][]; // Coordinates along the route
  totalDistance: number; // in KM
}

// Helper to calculate Haversine distance
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

const TRACKING_ROUTES: RouteBusDetail[] = (() => {
  const list: RouteBusDetail[] = [];
  const driversList = [
    "Rajesh Shinde", "Suresh Patil", "Anil Deshmukh", "Vikas Gaikwad", "Santosh Kadam", 
    "Sachin More", "Rahul Jadhav", "Sanjay Joshi", "Amol Pawar", "Sunil Bhosale",
    "Ganesh Tambe", "Ramesh Shinde", "Pradeep Kulkarni", "Deepak Thorat", "Manoj Salvi",
    "Vijay Chavan", "Sandip Pawar", "Dattatray Kale", "Karan Jagtap", "Balasaheb Shinde"
  ];
  
  const busNumbersList = [
    "MH-14-CW-2041", "MH-14-EX-1184", "MH-12-QW-5502", "MH-14-AB-1001", "MH-14-AB-1002",
    "MH-14-AB-1003", "MH-14-AB-1004", "MH-14-AB-1005", "MH-14-HU-3329", "MH-12-RT-8841",
    "MH-14-JV-9204", "MH-14-LQ-5512", "MH-12-ZK-1090", "MH-14-PP-4421", "MH-12-XW-6789"
  ];

  if (!SHIFT_ROUTES) return [];

  Object.entries(SHIFT_ROUTES).forEach(([shiftName, routesRecord]) => {
    Object.entries(routesRecord).forEach(([routeKey, stops]) => {
      // Create a unique deterministically seeded number based on the routeKey
      let seed = 0;
      for (let i = 0; i < routeKey.length; i++) {
        seed += routeKey.charCodeAt(i);
      }

      // Start somewhere in Pune area
      const startLat = 18.50 + ((seed % 100) / 100) * 0.15; // 18.50 to 18.65
      const startLng = 73.72 + (((seed * 7) % 100) / 100) * 0.20; // 73.72 to 73.92
      
      // Destination is Bajaj Auto (Akurdi or Chakan)
      const isChakan = routeKey.toLowerCase().includes('chakan') || shiftName.toLowerCase().includes('chakan') || stops.some(s => s.toLowerCase().includes('chakan') || s.toLowerCase().includes('mahalunge'));
      const destLat = isChakan ? 18.7512 : 18.6391;
      const destLng = isChakan ? 73.8510 : 73.7984;

      const path: [number, number][] = [];
      const stepsCount = Math.max(4, stops.length);
      
      for (let s = 0; s < stepsCount; s++) {
        const ratio = s / (stepsCount - 1);
        const baseLat = startLat + (destLat - startLat) * ratio;
        const baseLng = startLng + (destLng - startLng) * ratio;
        
        // Add nice sine-wave offset to make the bus route look winding and real on the map
        const offsetLat = Math.sin(ratio * Math.PI) * 0.012 * ((seed % 3) - 1);
        const offsetLng = Math.cos(ratio * Math.PI) * 0.012 * (((seed + 4) % 3) - 1);
        
        path.push([baseLat + offsetLat, baseLng + offsetLng]);
      }

      // Calculate distance along path
      let totalDistance = 0;
      for (let dIndex = 0; dIndex < path.length - 1; dIndex++) {
        totalDistance += getHaversineDistance(path[dIndex][0], path[dIndex][1], path[dIndex+1][0], path[dIndex+1][1]);
      }
      totalDistance = Math.round(totalDistance * 10) / 10 || 12;

      // Unique URL-safe and match-safe slug
      const id = `${shiftName.replace(/\s+/g, '-')}-${routeKey.replace(/[^a-zA-Z0-9]/g, '-')}`.toLowerCase();

      list.push({
        id,
        name: routeKey,
        title: routeKey,
        shift: shiftName,
        description: stops.slice(0, 3).join(' ➜ ') + (stops.length > 3 ? ` ➜ ... ➜ ${stops[stops.length-1]}` : ''),
        driver: driversList[seed % driversList.length],
        busNo: busNumbersList[(seed * 2) % busNumbersList.length],
        capacity: `${(seed % 3) === 0 ? '55' : '45'} Employees`,
        stops,
        path,
        totalDistance
      });
    });
  });

  return list;
})();

export default function LiveTracking({ onBack, initialRouteId }: LiveTrackingProps) {
  // Dynamic shift counts from SHIFT_ROUTES
  const firstShiftCount = SHIFT_ROUTES && SHIFT_ROUTES['1st Shift'] ? Object.keys(SHIFT_ROUTES['1st Shift']).length : 39;
  const secondShiftCount = SHIFT_ROUTES && SHIFT_ROUTES['2nd Shift'] ? Object.keys(SHIFT_ROUTES['2nd Shift']).length : 21;
  const thirdShiftCount = SHIFT_ROUTES && SHIFT_ROUTES['3rd Shift'] ? Object.keys(SHIFT_ROUTES['3rd Shift']).length : 10;
  const totalShiftRoutes = firstShiftCount + secondShiftCount + thirdShiftCount;

  const [selectedRoute, setSelectedRoute] = useState<RouteBusDetail | null>(null);
  const [stopsModalOpen, setStopsModalOpen] = useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  
  // Real-time Bus simulation states
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [currentCoords, setCurrentCoords] = useState<[number, number]>([18.52043, 73.856744]);
  const [busSpeed, setBusSpeed] = useState(40);
  const [busStatus, setBusStatus] = useState<'Running' | 'Stopped' | 'Offline'>('Running');
  const [eta, setEta] = useState(15);
  const [travelledDist, setTravelledDist] = useState(0);
  const [gpsAccuracy, setGpsAccuracy] = useState(4);
  const [isLoaderOpen, setIsLoaderOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState('All Shifts');

  // Filtered list of routes based on search and shift selection
  const filteredRoutes = TRACKING_ROUTES.filter(route => {
    const matchesShift = selectedShiftFilter === 'All Shifts' || route.shift === selectedShiftFilter;
    const matchesSearch = route.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          route.stops.some(stop => stop.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          route.busNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          route.driver.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesShift && matchesSearch;
  });

  // Leaflet map references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);
  const polylineRef = useRef<any | null>(null);
  const LeafletRef = useRef<any | null>(null);

  // Auto-trigger simulation when trackingModalOpen is active
  useEffect(() => {
    let timer: any = null;
    if (trackingModalOpen && selectedRoute) {
      // Setup coordinates loop
      timer = setInterval(() => {
        setCurrentPathIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % selectedRoute.path.length;
          
          // Randomize some speed and accuracy values for natural realism
          setBusSpeed(Math.floor(Math.random() * 20) + 35); // 35-55 km/h
          setGpsAccuracy(Math.floor(Math.random() * 5) + 3); // 3-8m
          setBusStatus(Math.random() > 0.9 ? 'Stopped' : 'Running');
          
          const coords = selectedRoute.path[nextIndex];
          setCurrentCoords(coords);

          // Update distance travelled
          let d = 0;
          for (let i = 0; i < nextIndex; i++) {
            const p1 = selectedRoute.path[i];
            const p2 = selectedRoute.path[i + 1];
            d += getHaversineDistance(p1[0], p1[1], p2[0], p2[1]);
          }
          setTravelledDist(d);

          // Calculate approximate ETA based on remaining distance and speed
          const remainingDistance = Math.max(0, selectedRoute.totalDistance - d);
          const calculatedEta = Math.max(1, Math.round((remainingDistance / 40) * 60));
          setEta(calculatedEta);

          return nextIndex;
        });
      }, 3000);
    } else {
      setCurrentPathIndex(0);
      setTravelledDist(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [trackingModalOpen, selectedRoute]);

  // Handle outside click close for modals
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const trackingModal = document.getElementById('trackingModal');
      const stopsModal = document.getElementById('stopsModal');
      if (e.target === trackingModal) {
        setTrackingModalOpen(false);
      }
      if (e.target === stopsModal) {
        setStopsModalOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Sync coords to Leaflet map instances
  useEffect(() => {
    if (trackingModalOpen && selectedRoute && mapInstanceRef.current && (window as any).L) {
      const L = (window as any).L;
      const latLng: [number, number] = [currentCoords[0], currentCoords[1]];
      
      // Update marker position
      if (markerRef.current) {
        markerRef.current.setLatLng(latLng);
      } else {
        // Create custom brand icon
        const customIcon = L.icon({
          iconUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Bajaj_Auto_Logo.svg/512px-Bajaj_Auto_Logo.svg.png",
          iconSize: [45, 45],
          iconAnchor: [22, 22]
        });
        markerRef.current = L.marker(latLng, { icon: customIcon }).addTo(mapInstanceRef.current);
      }

      // Smooth pan map
      mapInstanceRef.current.panTo(latLng);

      // Render polyline
      const pathCoordinates = selectedRoute.path.slice(0, currentPathIndex + 1);
      if (polylineRef.current) {
        polylineRef.current.setLatLngs(pathCoordinates);
      } else {
        polylineRef.current = L.polyline(pathCoordinates, {
          color: '#22c55e',
          weight: 6,
          opacity: 0.85
        }).addTo(mapInstanceRef.current);
      }
    }
  }, [currentCoords, trackingModalOpen, selectedRoute, currentPathIndex]);

  // Initial map loader
  const initLeafletMap = () => {
    if (!(window as any).L) {
      console.error('Leaflet is not loaded yet');
      return;
    }

    const L = (window as any).L;
    LeafletRef.current = L;

    // Destory existing map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      polylineRef.current = null;
    }

    if (!mapContainerRef.current) return;

    // Init Leaflet Map instance
    const initialLocation = selectedRoute ? selectedRoute.path[0] : [18.52043, 73.856744];
    const mapObj = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(initialLocation, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapObj);

    mapInstanceRef.current = mapObj;

    // Set first marker
    const customIcon = L.icon({
      iconUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Bajaj_Auto_Logo.svg/512px-Bajaj_Auto_Logo.svg.png",
      iconSize: [45, 45],
      iconAnchor: [22, 22]
    });

    markerRef.current = L.marker(initialLocation, { icon: customIcon }).addTo(mapObj);
    
    polylineRef.current = L.polyline([], {
      color: '#22c55e',
      weight: 6,
      opacity: 0.85
    }).addTo(mapObj);
  };

  // Open Live Tracking Modal
  const handleOpenTracking = (route: RouteBusDetail) => {
    setSelectedRoute(route);
    setCurrentCoords(route.path[0]);
    setCurrentPathIndex(0);
    setTravelledDist(0);
    setIsLoaderOpen(true);

    // Dynamic loading of Leaflet styles and scripts
    const ensureLeafletAndOpen = () => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!(window as any).L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet/dist/leaflet.js';
        script.async = true;
        script.onload = () => {
          setTimeout(() => {
            setIsLoaderOpen(false);
            setTrackingModalOpen(true);
            setTimeout(() => {
              initLeafletMap();
            }, 300);
          }, 800);
        };
        document.head.appendChild(script);
      } else {
        setTimeout(() => {
          setIsLoaderOpen(false);
          setTrackingModalOpen(true);
          setTimeout(() => {
            initLeafletMap();
          }, 300);
        }, 800);
      }
    };

    ensureLeafletAndOpen();
  };

  // Open Stops Modal
  const handleOpenStops = (route: RouteBusDetail) => {
    setSelectedRoute(route);
    setStopsModalOpen(true);
  };

  // Match initial route from props
  useEffect(() => {
    if (initialRouteId) {
      const match = TRACKING_ROUTES.find(r => r.id === initialRouteId || r.name === initialRouteId);
      if (match) {
        handleOpenTracking(match);
      }
    }
  }, [initialRouteId]);

  // Calculate current stop index mapping
  const getCurrentStopName = () => {
    if (!selectedRoute) return 'Calculating...';
    // Map path index to stops index
    const stopInterval = Math.floor(selectedRoute.path.length / selectedRoute.stops.length) || 1;
    const stopIndex = Math.min(
      selectedRoute.stops.length - 1,
      Math.floor(currentPathIndex / stopInterval)
    );
    return selectedRoute.stops[stopIndex];
  };

  const getRemainingStopsCount = () => {
    if (!selectedRoute) return 0;
    const stopInterval = Math.floor(selectedRoute.path.length / selectedRoute.stops.length) || 1;
    const stopIndex = Math.min(
      selectedRoute.stops.length - 1,
      Math.floor(currentPathIndex / stopInterval)
    );
    return Math.max(0, selectedRoute.stops.length - stopIndex - 1);
  };

  const progressPercentage = selectedRoute 
    ? Math.min(100, Math.round((travelledDist / selectedRoute.totalDistance) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans relative pb-12 overflow-x-hidden">
      {/* Watermark Background */}
      <div className="fixed inset-0 flex justify-center items-center pointer-events-none opacity-[0.03] z-0">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Bajaj_Auto_Logo.svg/512px-Bajaj_Auto_Logo.svg.png" 
          alt="Bajaj Watermark" 
          className="w-[500px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="py-8 text-center flex flex-col items-center">
          <button 
            id="btn-back-main"
            onClick={onBack}
            className="self-start mb-6 bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-2 border border-slate-700/50 cursor-pointer shadow-sm hover:scale-105"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-2 inline-flex items-center gap-2.5 mb-4 shadow-md">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 font-mono">Real-Time Satellite Dispatch</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-4">
            <BajajFavouriteIndianLogo className="scale-90 sm:scale-110 mb-2 border-none shadow-lg shadow-black/20" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight text-center">
              LIVE BUS TRACKING DISPATCH
            </h1>
          </div>
          <p className="mt-2 text-slate-400 text-xs sm:text-sm font-semibold tracking-wide text-center">
            Employee Transport Management Dispatch & Live Routing Console
          </p>
        </div>

        {/* SHIFT & ROUTE METRICS PANEL */}
        <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Card 1: Total Routes */}
          <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-5 border border-slate-700/60 flex items-center gap-4 hover:border-blue-500/50 transition-all duration-300">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <RouteIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Total Commute Routes</p>
              <h3 className="text-2xl font-black text-white mt-0.5">{totalShiftRoutes} Routes</h3>
              <p className="text-slate-500 text-[10px] font-semibold mt-0.5">Across Chakan & Pune Hubs</p>
            </div>
          </div>

          {/* Card 2: Total Active Shifts */}
          <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-5 border border-slate-700/60 flex items-center gap-4 hover:border-amber-500/50 transition-all duration-300">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
              <Gauge className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Active Shifts</p>
              <h3 className="text-2xl font-black text-white mt-0.5">3 Shifts</h3>
              <p className="text-slate-500 text-[10px] font-semibold mt-0.5">24/7 Continuous Transit</p>
            </div>
          </div>

          {/* Card 3: 1st Shift Details */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-4.5 border border-slate-700/40 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black tracking-wider text-indigo-400 uppercase bg-indigo-500/10 px-2.5 py-1 rounded-md font-mono">1st Shift</span>
              <span className="text-xs text-slate-500 font-bold">Morning</span>
            </div>
            <div className="mt-4">
              <h4 className="text-3xl font-black text-white leading-none">{firstShiftCount} <span className="text-xs font-bold text-slate-400 tracking-normal font-sans">Routes</span></h4>
              <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${((firstShiftCount / totalShiftRoutes) * 100).toFixed(0)}%` }}></div>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-2 flex justify-between">
                <span>Shift Load</span>
                <span>{((firstShiftCount / totalShiftRoutes) * 100).toFixed(1)}% of total</span>
              </p>
            </div>
          </div>

          {/* Card 4: 2nd Shift Details */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-4.5 border border-slate-700/40 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black tracking-wider text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded-md font-mono">2nd Shift</span>
              <span className="text-xs text-slate-500 font-bold">Afternoon</span>
            </div>
            <div className="mt-4">
              <h4 className="text-3xl font-black text-white leading-none">{secondShiftCount} <span className="text-xs font-bold text-slate-400 tracking-normal font-sans">Routes</span></h4>
              <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${((secondShiftCount / totalShiftRoutes) * 100).toFixed(0)}%` }}></div>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-2 flex justify-between">
                <span>Shift Load</span>
                <span>{((secondShiftCount / totalShiftRoutes) * 100).toFixed(1)}% of total</span>
              </p>
            </div>
          </div>

          {/* Card 5: 3rd Shift Details */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-4.5 border border-slate-700/40 relative overflow-hidden group hover:border-rose-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black tracking-wider text-rose-400 uppercase bg-rose-500/10 px-2.5 py-1 rounded-md font-mono">3rd Shift</span>
              <span className="text-xs text-slate-500 font-bold">Night</span>
            </div>
            <div className="mt-4">
              <h4 className="text-3xl font-black text-white leading-none">{thirdShiftCount} <span className="text-xs font-bold text-slate-400 tracking-normal font-sans">Routes</span></h4>
              <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${((thirdShiftCount / totalShiftRoutes) * 100).toFixed(0)}%` }}></div>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-2 flex justify-between">
                <span>Shift Load</span>
                <span>{((thirdShiftCount / totalShiftRoutes) * 100).toFixed(1)}% of total</span>
              </p>
            </div>
          </div>

        </div>

        {/* Search and Shift Filters */}
        <div className="mb-8 bg-slate-800/20 backdrop-blur-md rounded-2xl p-5 border border-slate-700/40 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>Commute Routes Directory</span>
                <span className="text-xs font-mono font-bold bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-full">
                  {filteredRoutes.length} of {TRACKING_ROUTES.length} Match
                </span>
              </h3>
              <p className="text-slate-400 text-xs mt-0.5 font-medium">Filter by shift or search for route names, stops, drivers, and buses</p>
            </div>
            
            {/* Search Input */}
            <div className="w-full md:w-80 relative">
              <input
                type="text"
                placeholder="Search route, stop, driver, bus no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-semibold"
              />
              <svg className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-[10px] bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Shift Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-700/30">
            {['All Shifts', '1st Shift', '2nd Shift', '3rd Shift', 'General Shift'].map((shiftOption) => {
              const count = shiftOption === 'All Shifts' 
                ? TRACKING_ROUTES.length 
                : TRACKING_ROUTES.filter(r => r.shift === shiftOption).length;
              
              const isActive = selectedShiftFilter === shiftOption;
              
              return (
                <button
                  key={shiftOption}
                  onClick={() => setSelectedShiftFilter(shiftOption)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-tight transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 border border-blue-500' 
                      : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-700/50'
                  }`}
                >
                  <span>{shiftOption}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                    isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-900/60 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Route Card Grid */}
        {filteredRoutes.length === 0 ? (
          <div className="bg-slate-800/20 rounded-3xl border border-slate-700/30 p-12 text-center mt-6">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h4 className="text-sm font-extrabold text-slate-300">No matching routes found</h4>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms or shift filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredRoutes.map((route) => (
            <div 
              key={route.id}
              id={`card-${route.id}`}
              className="bg-slate-800/40 backdrop-blur-md rounded-[24px] p-6 border border-slate-700/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:bg-slate-800/60 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-xl border border-amber-500/20 text-xs font-black tracking-wider uppercase font-mono">
                    {route.title}
                  </div>
                  <span className="bg-emerald-500/15 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black tracking-wider text-emerald-400 uppercase flex items-center gap-1.5 animate-pulse-subtle">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>LIVE</span>
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                  {route.description.split(' ➜ ').slice(-1)[0]} Shuttles
                </h3>
                
                <p className="text-slate-400 text-xs mt-1 font-medium leading-relaxed">
                  {route.description}
                </p>

                <div className="mt-5 space-y-3 pt-4 border-t border-slate-700/40 text-xs text-slate-300 font-semibold">
                  <div className="flex justify-between">
                    <span className="text-slate-500">👨‍✈️ Lead Driver</span>
                    <span>{route.driver}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">🚌 Bus Number</span>
                    <span className="text-amber-400 font-bold">{route.busNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">👥 Capacity limit</span>
                    <span>{route.capacity}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/30 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    id={`btn-stops-${route.id}`}
                    onClick={() => handleOpenStops(route)}
                    className="bg-slate-700/50 hover:bg-slate-700 hover:text-white text-slate-200 text-xs font-bold py-3 px-4 rounded-xl transition-all cursor-pointer border border-slate-600/40 text-center hover:scale-102 flex items-center justify-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Show Stops</span>
                  </button>
                  <button
                    id={`btn-track-${route.id}`}
                    onClick={() => handleOpenTracking(route)}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all cursor-pointer text-center hover:scale-102 shadow-md hover:shadow-emerald-900/35 flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-100 animate-pulse" />
                    <span>Live Tracking</span>
                  </button>
                </div>
                
                <a
                  href="https://vms-livetrack.pragatiutrack.com/home?id=0409ae0f-58ea-42d6-aded-906e7441243f"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-xs font-extrabold py-3 px-4 rounded-xl transition-all text-center flex items-center justify-center gap-2 shadow-md hover:scale-102 cursor-pointer"
                >
                  <span>🌐</span>
                  <span>Open VMS GPS (Pragatiutrack)</span>
                </a>
              </div>
            </div>
          ))}
          </div>
        )}

      </div>

      {/* =========================================
          ROUTE STOPS MODAL
          ========================================= */}
      {stopsModalOpen && selectedRoute && (
        <div 
          id="stopsModal"
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-9999 p-4"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl font-sans"
          >
            <div className="p-5 bg-slate-800/80 border-b border-slate-700/60 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-lg">
                  🚌
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">Route Stops</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{selectedRoute.title} Schedule</p>
                </div>
              </div>
              <button 
                id="btn-close-stops"
                onClick={() => setStopsModalOpen(false)}
                className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg border border-slate-700/50 transition-colors cursor-pointer"
              >
                ✖
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Shuttles will pick up registered commuters chronologically. Ensure you arrive at least 5 minutes before scheduled times.
              </p>
              
              <div className="relative border-l-2 border-slate-700/60 ml-3.5 pl-6 space-y-5 py-2">
                {selectedRoute.stops.map((stop, idx) => (
                  <div key={idx} className="relative group">
                    {/* Bullet marker */}
                    <span className="absolute -left-9.5 top-0.5 w-6 h-6 rounded-full bg-slate-800 border-2 border-amber-400 flex items-center justify-center text-[10px] font-bold text-amber-400 group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </span>
                    <div className="flex justify-between items-center bg-slate-800/40 border border-slate-800 hover:border-slate-700/60 rounded-xl p-3 transition-colors">
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">{stop}</h4>
                        <p className="text-[9px] font-mono text-slate-500 font-bold uppercase">Bajaj Bus Stop</p>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-black px-2.5 py-1 rounded-lg border border-emerald-500/20 uppercase tracking-wide">
                        Verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 border-t border-slate-700/40 text-right">
              <button 
                id="btn-close-stops-footer"
                onClick={() => setStopsModalOpen(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all shadow-sm"
              >
                Close Schedule
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* =========================================
          LIVE TRACKING MODAL (MAIN SATELLITE DISPATCH)
          ========================================= */}
      {trackingModalOpen && selectedRoute && (
        <div 
          id="trackingModal"
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center z-9999 p-4 overflow-y-auto"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-[28px] w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col font-sans max-h-[95vh] sm:max-h-[92vh]"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-slate-800/80 border-b border-slate-700/60 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-xl sm:text-2xl">📡</span>
                <div>
                  <h3 className="font-extrabold text-xs sm:text-base text-white">Live Satellite Tracking Feed</h3>
                  <p className="text-[9px] sm:text-[10px] text-amber-400 font-bold uppercase tracking-wider font-mono">{selectedRoute.title} Commuter Express</p>
                </div>
              </div>
              <button 
                id="btn-close-tracking"
                onClick={() => setTrackingModalOpen(false)}
                className="text-slate-400 hover:text-white bg-slate-800 p-1.5 sm:p-2 rounded-lg border border-slate-700/50 transition-colors cursor-pointer text-xs"
              >
                ✖
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-grow">
              
              {/* Map Canvas Frame */}
              <div className="relative">
                <div 
                  id="map"
                  ref={mapContainerRef}
                  className="w-full h-[220px] sm:h-[350px] md:h-[400px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner z-10"
                />
                
                {/* Visual compass layer */}
                <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md p-1.5 sm:p-2 rounded-xl border border-slate-700/60 text-[8px] sm:text-[10px] font-mono text-slate-400 flex items-center gap-1 sm:gap-1.5 shadow-md pointer-events-none z-50">
                  <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>GPS ENCRYPTED</span>
                </div>
              </div>

              {/* GPS Stats Widget Rows */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                <div className="bg-slate-850 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between">
                  <span className="text-slate-500 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                    <Navigation className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-400 rotate-45" /> Lat
                  </span>
                  <p className="text-sm sm:text-lg font-mono font-black text-slate-200 mt-1 sm:mt-2">
                    {currentCoords[0].toFixed(6)}
                  </p>
                </div>

                <div className="bg-slate-850 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between">
                  <span className="text-slate-500 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                    <Navigation className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-400 rotate-90" /> Lon
                  </span>
                  <p className="text-sm sm:text-lg font-mono font-black text-slate-200 mt-1 sm:mt-2">
                    {currentCoords[1].toFixed(6)}
                  </p>
                </div>

                <div className="bg-slate-850 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between">
                  <span className="text-slate-500 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                    <Gauge className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" /> Speed
                  </span>
                  <p className="text-sm sm:text-lg font-bold text-amber-400 mt-1 sm:mt-2">
                    {busSpeed} km/h
                  </p>
                </div>

                <div className="bg-slate-850 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between">
                  <span className="text-slate-500 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" /> Signal
                  </span>
                  <p className="text-sm sm:text-lg font-bold text-emerald-400 mt-1 sm:mt-2">
                    EXCELLENT
                  </p>
                </div>
              </div>

              {/* Routing detail boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Current Stop</h4>
                    <p className="text-md sm:text-lg font-black text-white mt-1.5">
                      📍 {getCurrentStopName()}
                    </p>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-xl text-xs font-bold font-mono">
                    Next Stop Approaching
                  </span>
                </div>

                <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Estimated Arrival Timing</h4>
                    <p className="text-md sm:text-lg font-black text-amber-400 mt-1.5 flex items-center gap-1.5">
                      <BellRing className="w-4 h-4 text-amber-400 animate-bounce" />
                      <span>{eta} Minutes</span>
                    </p>
                  </div>
                  <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-xl text-xs font-bold">
                    Updated 2s ago
                  </span>
                </div>
              </div>

              {/* Progress and distance dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                
                {/* Route progress meter */}
                <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 md:col-span-1">
                  <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1">
                    📊 Route Progress
                  </h4>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-1000"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-md font-bold mt-2 text-emerald-400">
                    {progressPercentage}% Completed
                  </p>
                </div>

                {/* Remaining distance */}
                <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4">
                  <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    📍 Remaining Distance
                  </h4>
                  <p className="text-xl font-black text-slate-200 mt-2">
                    {Math.max(0, Number((selectedRoute.totalDistance - travelledDist).toFixed(2)))} KM
                  </p>
                </div>

                {/* Remaining stops */}
                <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4">
                  <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    🚏 Remaining Stops
                  </h4>
                  <p className="text-xl font-black text-slate-200 mt-2">
                    {getRemainingStopsCount()} Stops
                  </p>
                </div>

                {/* GPS Accuracy */}
                <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4">
                  <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    📡 GPS Accuracy
                  </h4>
                  <p className="text-xl font-black text-slate-200 mt-2">
                    {gpsAccuracy} meters
                  </p>
                </div>

              </div>

              {/* Vehicle & personnel details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-lg shadow-sm shrink-0 border border-slate-700/50">
                    👨
                  </div>
                  <div>
                    <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Driver Name</h4>
                    <p className="text-sm font-black text-slate-200 mt-0.5">{selectedRoute.driver}</p>
                  </div>
                </div>

                <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-lg shadow-sm shrink-0 border border-slate-700/50">
                    🚌
                  </div>
                  <div>
                    <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Bus Number</h4>
                    <p className="text-sm font-black text-amber-400 font-mono mt-0.5">{selectedRoute.busNo}</p>
                  </div>
                </div>

                <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-lg shadow-sm shrink-0 border border-slate-700/50">
                    🚦
                  </div>
                  <div>
                    <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Live Status</h4>
                    <p className={`text-sm font-black mt-0.5 ${busStatus === 'Running' ? 'text-emerald-400' : 'text-amber-500'}`}>
                      ● {busStatus.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-slate-800/80 border-t border-slate-700/60 text-right shrink-0 flex flex-wrap gap-3 justify-end items-center">
              <a 
                href="https://vms-livetrack.pragatiutrack.com/home?id=0409ae0f-58ea-42d6-aded-906e7441243f"
                target="_blank"
                rel="noreferrer"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-3 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-md hover:scale-103"
              >
                <span>🌐</span>
                <span>Open VMS GPS (Pragatiutrack)</span>
              </a>
              <button 
                id="btn-refresh-tracking"
                onClick={() => {
                  setBusSpeed(Math.floor(Math.random() * 15) + 40);
                  setGpsAccuracy(Math.floor(Math.random() * 3) + 3);
                }}
                className="bg-slate-750 hover:bg-slate-700 text-white font-bold text-xs px-5 py-3 rounded-xl cursor-pointer transition-all border border-slate-700 flex items-center gap-1.5 shadow-sm hover:scale-103"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Connection</span>
              </button>
              <button 
                id="btn-close-tracking-footer"
                onClick={() => setTrackingModalOpen(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl cursor-pointer transition-all shadow-md hover:shadow-emerald-900/35 hover:scale-103"
              >
                Close Tracking Feed
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* =========================================
          GLOBAL ASYNC LOADER
          ========================================= */}
      {isLoaderOpen && (
        <div 
          id="loader"
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-999999"
        >
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center max-w-xs space-y-4 shadow-2xl">
            <div className="relative mx-auto w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800 border-t-amber-400 animate-spin" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Establishing Connection</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Reading telemetry streams, synchronizing orbits. Please wait...</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
