/* Transfer search & availability data
   Kept separate from UI so real pricing/availability can be connected later. */
(function () {
  "use strict";

  var VEHICLES = [
    {
      id: "exec-sedan-es",
      category: "Executive",
      type: "Sedan",
      name: "Lexus ES",
      similar: true,
      maxPassengers: 3,
      luggage: 2,
      price: 65,
      discount: null,
      freeWaiting: "60 min airport pickup",
      includedFees: ["Meet & greet", "Tolls & fuel", "All taxes"],
      image: "assets/img/1.png",
      description: "Comfortable executive sedan for up to 3 passengers."
    },
    {
      id: "first-eclass",
      category: "First Class",
      type: "Sedan",
      name: "Mercedes-Benz E-Class",
      similar: true,
      maxPassengers: 3,
      luggage: 2,
      price: 85,
      discount: 10,
      freeWaiting: "60 min airport pickup",
      includedFees: ["Meet & greet", "Tolls & fuel", "All taxes"],
      image: "assets/img/1.png",
      description: "Premium first-class sedan with extra comfort."
    },
    {
      id: "exec-suv-highlander",
      category: "Executive",
      type: "SUV",
      name: "Toyota Highlander",
      similar: true,
      maxPassengers: 5,
      luggage: 4,
      price: 95,
      discount: null,
      freeWaiting: "60 min airport pickup",
      includedFees: ["Meet & greet", "Tolls & fuel", "All taxes"],
      image: "assets/img/4.png",
      description: "Spacious SUV ideal for families and extra luggage."
    },
    {
      id: "vip-suv-gls",
      category: "VIP",
      type: "SUV",
      name: "Mercedes-Benz GLS",
      similar: true,
      maxPassengers: 6,
      luggage: 5,
      price: 140,
      discount: null,
      freeWaiting: "60 min airport pickup",
      includedFees: ["Meet & greet", "Tolls & fuel", "All taxes", "Bottled water"],
      image: "assets/img/4.png",
      description: "Luxury VIP SUV with generous space and comfort."
    },
    {
      id: "exec-van-vclass",
      category: "Executive",
      type: "Van",
      name: "Mercedes V-Class",
      similar: true,
      maxPassengers: 7,
      luggage: 7,
      price: 120,
      discount: 15,
      freeWaiting: "60 min airport pickup",
      includedFees: ["Meet & greet", "Tolls & fuel", "All taxes"],
      image: "assets/img/2.png",
      description: "Executive van with flexible seating for groups."
    },
    {
      id: "vip-van-vclass",
      category: "VIP",
      type: "Van",
      name: "Mercedes V-Class VIP",
      similar: true,
      maxPassengers: 7,
      luggage: 7,
      price: 160,
      discount: null,
      freeWaiting: "60 min airport pickup",
      includedFees: ["Meet & greet", "Tolls & fuel", "All taxes", "Bottled water"],
      image: "assets/img/2.png",
      description: "VIP-configured van for premium group travel."
    },
    {
      id: "exec-minibus-sprinter",
      category: "Executive",
      type: "Minibus",
      name: "Mercedes Sprinter",
      similar: true,
      maxPassengers: 16,
      luggage: 16,
      price: 220,
      discount: null,
      freeWaiting: "60 min airport pickup",
      includedFees: ["Meet & greet", "Tolls & fuel", "All taxes"],
      image: "assets/img/3.webp",
      description: "Minibus for larger groups with ample luggage space."
    },
    {
      id: "vip-minibus-sprinter",
      category: "VIP",
      type: "Minibus",
      name: "Mercedes Sprinter VIP",
      similar: true,
      maxPassengers: 16,
      luggage: 16,
      price: 280,
      discount: null,
      freeWaiting: "60 min airport pickup",
      includedFees: ["Meet & greet", "Tolls & fuel", "All taxes", "Bottled water"],
      image: "assets/img/3.webp",
      description: "VIP minibus for large groups seeking extra comfort."
    }
  ];

  function estimateRoute(from, to) {
    var a = String(from || "").toLowerCase();
    var b = String(to || "").toLowerCase();
    var text = a + " " + b;
    if (!from || !to) return { distance: null, duration: null };
    if (/(airport|esu|rak|aga|cmn)/.test(text)) {
      return { distance: "~25 km", duration: "~35 min" };
    }
    if (/(marrakech)/.test(text) && /(essaouira)/.test(text)) {
      return { distance: "~190 km", duration: "~2h 45m" };
    }
    if (/(agadir)/.test(text) && /(essaouira)/.test(text)) {
      return { distance: "~175 km", duration: "~2h 30m" };
    }
    if (/(casablanca)/.test(text) && /(essaouira)/.test(text)) {
      return { distance: "~360 km", duration: "~4h 30m" };
    }
    return { distance: "On request", duration: "On request" };
  }

  window.TTE_TRANSFER_DATA = {
    vehicles: VEHICLES,
    estimateRoute: estimateRoute
  };
})();