// Pre-recorded realistic GPS routes with realistic speeds and stops
export const SAMPLE_ROUTES = [
  {
    id: "route-airport",
    name: "Airport Ride & Courier Run (14.2 mi)",
    durationEstimate: "22 mins",
    distanceMiles: 14.2,
    description: "Highway cruise from Downtown to International Airport with highway merging and exit ramps.",
    points: [
      { lat: 37.7749, lng: -122.4194, speedMps: 0, pause: true, label: "Downtown Pickup" },
      { lat: 37.7725, lng: -122.4180, speedMps: 6.2 },
      { lat: 37.7690, lng: -122.4150, speedMps: 11.5 },
      { lat: 37.7650, lng: -122.4110, speedMps: 0.1, pause: true, label: "Red Light - Market St" }, // Red light test
      { lat: 37.7600, lng: -122.4080, speedMps: 12.0 },
      { lat: 37.7530, lng: -122.4040, speedMps: 24.5 }, // Highway US-101 S
      { lat: 37.7420, lng: -122.4000, speedMps: 28.0 },
      { lat: 37.7280, lng: -122.3950, speedMps: 29.5 },
      { lat: 37.7120, lng: -122.3920, speedMps: 28.5 },
      { lat: 37.6950, lng: -122.3890, speedMps: 29.0 },
      { lat: 37.6750, lng: -122.3860, speedMps: 27.5 },
      { lat: 37.6550, lng: -122.3880, speedMps: 25.0 },
      { lat: 37.6380, lng: -122.3950, speedMps: 18.0 },
      { lat: 37.6250, lng: -122.4020, speedMps: 12.0 },
      { lat: 37.6190, lng: -122.3816, speedMps: 4.5 },
      { lat: 37.6155, lng: -122.3890, speedMps: 0.0, pause: true, label: "Terminal 2 Drop-off" }
    ]
  },
  {
    id: "route-delivery",
    name: "Downtown Courier Delivery (3.8 mi)",
    durationEstimate: "11 mins",
    distanceMiles: 3.8,
    description: "Urban grid driving with stop-and-go delivery points and parking cooldowns.",
    points: [
      { lat: 37.7885, lng: -122.4075, speedMps: 0, label: "Restaurant Pickup" },
      { lat: 37.7892, lng: -122.4018, speedMps: 7.5 },
      { lat: 37.7915, lng: -122.3985, speedMps: 8.2 },
      { lat: 37.7942, lng: -122.3965, speedMps: 0.2, pause: true, label: "Traffic Signal" },
      { lat: 37.7968, lng: -122.3942, speedMps: 6.8 },
      { lat: 37.8010, lng: -122.4005, speedMps: 7.2 },
      { lat: 37.8035, lng: -122.4055, speedMps: 5.5 },
      { lat: 37.8055, lng: -122.4095, speedMps: 0.0, pause: true, label: "Customer Delivery Point" }
    ]
  },
  {
    id: "route-suburban",
    name: "Suburban Client Meeting (7.6 mi)",
    durationEstimate: "16 mins",
    distanceMiles: 7.6,
    description: "Residential departure transitioning to arterial expressways.",
    points: [
      { lat: 37.7500, lng: -122.4450, speedMps: 0, label: "Home Office" },
      { lat: 37.7450, lng: -122.4410, speedMps: 8.5 },
      { lat: 37.7380, lng: -122.4350, speedMps: 14.0 },
      { lat: 37.7300, lng: -122.4280, speedMps: 18.5 },
      { lat: 37.7200, lng: -122.4200, speedMps: 22.0 },
      { lat: 37.7080, lng: -122.4150, speedMps: 21.5 },
      { lat: 37.6980, lng: -122.4120, speedMps: 15.0 },
      { lat: 37.6890, lng: -122.4080, speedMps: 0.0, label: "Client Office Park" }
    ]
  }
];
