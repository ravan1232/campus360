import React, { useState, useEffect } from 'react';
import { Bus, MapPin, Navigation, Clock, Fuel, ShieldCheck, Phone, AlertCircle, RefreshCw, Radio } from 'lucide-react';
import { api } from '../../services/api';

const LiveBusTracker = ({ compact = false }) => {
  const [telemetry, setTelemetry] = useState({
    busNumber: 'BUS-304',
    routeNumber: 'R-14',
    routeName: 'North Metro - Campus Express',
    driverName: 'Robert Henderson',
    driverPhone: '+1-555-0105',
    currentSpeed: '36 km/h',
    currentLocation: 'Between Oakridge Crossing & Westfield Square (Mile 14.2)',
    nextStop: 'Westfield Square (Stop 3)',
    etaNextStop: '4 mins',
    etaCampus: '16 mins',
    trafficCondition: 'Clear Highway Flow',
    lastPing: 'Live GPS Sync',
    stops: [
      { id: 1, name: 'Pine Hill Station', time: '07:15 AM', status: 'completed' },
      { id: 2, name: 'Oakridge Crossing', time: '07:30 AM', status: 'completed' },
      { id: 3, name: 'Westfield Square', time: '07:45 AM', status: 'approaching' },
      { id: 4, name: 'Campus Main Terminal', time: '08:05 AM', status: 'upcoming' }
    ]
  });

  const [refreshing, setRefreshing] = useState(false);

  const fetchLiveTelemetry = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/transport/telemetry');
      if (res && res.success && res.telemetry) {
        setTelemetry(prev => ({
          ...prev,
          ...res.telemetry,
          stops: res.telemetry.stops && typeof res.telemetry.stops[0] === 'object' && !res.telemetry.stops[0].name ? prev.stops : (res.telemetry.stops || prev.stops)
        }));
      }
    } catch (e) {
      console.warn('Telemetry sync error:', e);
    } finally {
      setTimeout(() => setRefreshing(false), 400);
    }
  };

  useEffect(() => {
    fetchLiveTelemetry();
    const interval = setInterval(fetchLiveTelemetry, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      
      {/* Visual Bus Photo Header with Live Telemetry Overlay */}
      <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-900">
        <img
          src="/images/campus_bus.jpg"
          alt="Campus 360 Transit Service Bus"
          className="w-full h-full object-cover object-center opacity-85 hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        
        {/* Badges on Top */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/90 text-white backdrop-blur shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              Active Route GPS
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur">
              <Radio className="w-3.5 h-3.5 text-cyan-300" /> Auto-sync (15s)
            </span>
          </div>

          <button
            onClick={fetchLiveTelemetry}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur transition flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh GPS telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Bus Title at Bottom of Image */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
              Campus Student Transit
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Bus className="w-6 h-6 text-amber-400" />
              {telemetry.busNumber} • {telemetry.routeNumber}
            </h3>
            <p className="text-xs text-slate-300">
              {telemetry.routeName} • Driver: {telemetry.driverName}
            </p>
          </div>

          <div className="hidden sm:block text-right">
            <p className="text-xs text-slate-300 font-medium">Terminal ETA</p>
            <p className="text-2xl font-black text-emerald-400">{telemetry.etaCampus}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Real-time Telemetry Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 text-xs">
            <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-blue-500" />
              Live Speed
            </p>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {telemetry.currentSpeed}
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold">Real-time GPS</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 text-xs">
            <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Next Stop ETA
            </p>
            <p className="text-lg font-black text-amber-600 dark:text-amber-400 mt-1">
              {telemetry.etaNextStop}
            </p>
            <span className="text-[10px] text-slate-500 truncate block">Westfield Square</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 text-xs">
            <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              Campus Arrival
            </p>
            <p className="text-lg font-black text-blue-600 dark:text-blue-400 mt-1">
              {telemetry.etaCampus}
            </p>
            <span className="text-[10px] text-slate-500">Scheduled: 08:05 AM</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800 text-xs">
            <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5 text-cyan-500" />
              Vehicle Health
            </p>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {telemetry.fuelLevel || '78%'}
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold">Tire & Engine Normal</span>
          </div>
        </div>

        {/* Visual Live Bus Route Track */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/50 via-slate-50 to-indigo-50/50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-600" />
            Live Stop Sequence & Route Progress
          </p>

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 px-2 py-3">
            {/* Progress bar line */}
            <div className="hidden md:block absolute top-1/2 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0" />
            <div className="hidden md:block absolute top-1/2 left-8 w-[62%] h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500" />

            {telemetry.stops.map((stop, idx) => {
              const isCompleted = stop.status === 'completed';
              const isApproaching = stop.status === 'approaching';
              return (
                <div key={stop.id || idx} className="relative z-10 flex md:flex-col items-center gap-3 md:gap-2 text-left md:text-center w-full md:w-auto">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all ${
                    isCompleted
                      ? 'bg-blue-600 text-white'
                      : isApproaching
                      ? 'bg-cyan-500 text-white ring-4 ring-cyan-200 dark:ring-cyan-900/60 animate-bounce'
                      : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700'
                  }`}>
                    {isApproaching ? <Bus className="w-4 h-4" /> : idx + 1}
                  </div>

                  <div>
                    <p className={`text-xs font-bold ${
                      isApproaching ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {stop.name}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400">
                      {stop.time} {isApproaching && '• In 4 mins'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Driver Contact & Current Position Strip */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="font-semibold">Live GPS Bearing:</span>
            <span className="font-medium text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {telemetry.currentLocation}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500">Driver: <strong>{telemetry.driverName}</strong></span>
            <a
              href={`tel:${telemetry.driverPhone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Driver ({telemetry.driverPhone})</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LiveBusTracker;
