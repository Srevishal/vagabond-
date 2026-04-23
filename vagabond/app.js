const apiKeyInput = document.getElementById('apiKey');
const fromLocationInput = document.getElementById('fromLocation');
const destinationInput = document.getElementById('destination');
const daysInput = document.getElementById('days');
const peopleInput = document.getElementById('people');
const generateBtn = document.getElementById('generateBtn');
const costDisplay = document.getElementById('costDisplay');
const vibeCards = document.querySelectorAll('.vibe-card');
const budgetBtns = document.querySelectorAll('.budget-btn');
const itineraryContainer = document.getElementById('itineraryContainer');

// State
let currentVibe = 'heritage';
let currentBudget = 'budget';

// Budget base rates (Daily Rate per person) & One-Time Transport
const budgetConfig = {
    'budget': { dailyRate: 1500, transportBase: 2000 },
    'comfort': { dailyRate: 4500, transportBase: 5000 },
    'elite': { dailyRate: 12000, transportBase: 15000 }
};

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

async function generateItinerary() {
    const fromCity = fromLocationInput.value.trim() || 'Origin';
    const destination = destinationInput.value.trim() || 'India';
    const days = parseInt(daysInput.value) || 1;
    const people = parseInt(peopleInput.value) || 1;
    const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';

    // Clear Previous UI & Show loading spinner
    itineraryContainer.innerHTML = '<div class="spinner"></div><p style="text-align: center; color: #333333; margin-top: 1rem; font-weight: 600;">Vagabond AI is generating your unique itinerary...</p>';
    costDisplay.classList.add('hidden');

    try {
        // Advanced Logistics Calculator
        const conf = budgetConfig[currentBudget];
        const rawTotal = (conf.dailyRate * people * days) + conf.transportBase;
        
        // Smart Budget Splitter
        const accommodation = rawTotal * 0.45;
        const food = rawTotal * 0.25;
        const transport = rawTotal * 0.30;
        const totalCost = accommodation + food + transport;
        
        costDisplay.innerHTML = `
            <div class="cost-total">Total Trip Budget: <span>${formatCurrency(totalCost)}</span></div>
            <div class="cost-breakdown">
                <div class="cost-item"><span>🏨 Stay</span> <strong>${formatCurrency(accommodation)}</strong></div>
                <div class="cost-item"><span>🍴 Food</span> <strong>${formatCurrency(food)}</strong></div>
                <div class="cost-item"><span>🚕 Travel</span> <strong>${formatCurrency(transport)}</strong></div>
            </div>
        `;
        costDisplay.classList.remove('hidden');

        let cityDataArray = [];

        if (apiKey) {
            // Gemini API Prompt Construction
            const prompt = `
You are Vagabond AI, a senior travel architect.
Create a highly detailed ${days}-day travel itinerary for a trip from ${fromCity} to ${destination}.
The group consists of ${people} people.
The vibe of the trip is: ${currentVibe}.
The budget tier is: ${currentBudget}.

Return the itinerary STRICTLY as a JSON array where each element represents a single day. 
DO NOT wrap the output in markdown blocks (e.g., \`\`\`json). Return ONLY the raw JSON array.
Each day object MUST have the exact following structure:
[
  {
    "dayTitle": "Title of the day",
    "slots": [
      {
        "timePrefix": "09:00",
        "timeSuffix": "AM",
        "desc": "Description of the activity.",
        "location": "Name of Location",
        "fee": "Free"
      },
      ... generate exactly 4 slots (morning, noon, afternoon, evening)
    ],
    "mustEat": "Local dish recommendation",
    "proTip": "Helpful tip for the day"
  }
]
`;
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7 } })
            });

            if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
            const data = await response.json();
            let rawJsonText = data.candidates[0].content.parts[0].text;
            rawJsonText = rawJsonText.replace(/```json/g, '').replace(/```/g, '').trim();
            cityDataArray = JSON.parse(rawJsonText);
        } else {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Hard-coded Unique Day Sequencing
            const coreDays = [
                {
                    dayTitle: "Arrival & Local Heritage",
                    slots: [
                        { timePrefix: "09:00", timeSuffix: "AM", desc: `Arrive from ${fromCity} and check in to your accommodation. Freshen up and grab breakfast.`, location: `${destination} Center`, fee: "Free" },
                        { timePrefix: "01:00", timeSuffix: "PM", desc: `Visit the central heritage monument and learn about local history.`, location: `Heritage Museum`, fee: "₹150" },
                        { timePrefix: "04:00", timeSuffix: "PM", desc: `Walk through the old town alleyways and capture photos.`, location: `Old Town Square`, fee: "Free" },
                        { timePrefix: "07:30", timeSuffix: "PM", desc: `Welcome dinner at a highly rated traditional restaurant.`, location: `Heritage Dining`, fee: "₹800" }
                    ],
                    mustEat: "Try the iconic local thali for a complete culinary introduction.",
                    proTip: "Book monument tickets online in advance to skip the queues."
                },
                {
                    dayTitle: "Nature & Iconic Landmarks",
                    slots: [
                        { timePrefix: "06:00", timeSuffix: "AM", desc: `Sunrise hike or nature walk at a prominent viewpoint.`, location: `Sunrise Point`, fee: "Free" },
                        { timePrefix: "11:00", timeSuffix: "AM", desc: `Visit the most iconic landmark of the region.`, location: `Iconic Landmark`, fee: "₹250" },
                        { timePrefix: "03:00", timeSuffix: "PM", desc: `Relax at a scenic garden, lake, or beach front.`, location: `Botanical Garden`, fee: "₹50" },
                        { timePrefix: "07:00", timeSuffix: "PM", desc: `Dinner with a panoramic view of the natural landscape.`, location: `Viewpoint Cafe`, fee: "₹1200" }
                    ],
                    mustEat: "Grab fresh fruits or local snacks near the landmark entrances.",
                    proTip: "Start early to avoid the mid-day heat and large tourist crowds."
                },
                {
                    dayTitle: "Off-beat Adventures",
                    slots: [
                        { timePrefix: "09:30", timeSuffix: "AM", desc: `Venture out to a hidden waterfall, cave, or forest trail.`, location: `Hidden Trail`, fee: "Free" },
                        { timePrefix: "01:30", timeSuffix: "PM", desc: `Lunch at a secluded village homestay or dhaba.`, location: `Village Dhaba`, fee: "₹300" },
                        { timePrefix: "04:00", timeSuffix: "PM", desc: `Participate in an adventure activity (zipline, boating, etc.).`, location: `Adventure Park`, fee: "₹1500" },
                        { timePrefix: "08:00", timeSuffix: "PM", desc: `Casual dinner and drinks to celebrate the day's adventure.`, location: `Bistro Bar`, fee: "₹1000" }
                    ],
                    mustEat: "Experience a rustic, wood-fired meal at the village homestay.",
                    proTip: "Wear comfortable trekking shoes and carry a reusable water bottle."
                },
                {
                    dayTitle: "Religious/Cultural immersion",
                    slots: [
                        { timePrefix: "08:00", timeSuffix: "AM", desc: `Attend morning prayers or rituals at a major temple or shrine.`, location: `Main Temple`, fee: "Free" },
                        { timePrefix: "12:00", timeSuffix: "PM", desc: `Explore local artisan workshops and cultural centers.`, location: `Artisan Village`, fee: "Free" },
                        { timePrefix: "04:00", timeSuffix: "PM", desc: `Watch a traditional dance or music performance.`, location: `Cultural Hall`, fee: "₹500" },
                        { timePrefix: "08:30", timeSuffix: "PM", desc: `Late dinner featuring historic recipes of the region.`, location: `Cultural Cafe`, fee: "₹900" }
                    ],
                    mustEat: "Prasad (offerings) at the temple and traditional sweets.",
                    proTip: "Dress modestly covering shoulders and knees when visiting religious sites."
                },
                {
                    dayTitle: "Shopping & Departure",
                    slots: [
                        { timePrefix: "10:00", timeSuffix: "AM", desc: `Souvenir shopping for handicrafts and textiles.`, location: `Main Bazaar`, fee: "Free" },
                        { timePrefix: "01:00", timeSuffix: "PM", desc: `Farewell lunch at a popular local joint.`, location: `City Center Diner`, fee: "₹600" },
                        { timePrefix: "03:00", timeSuffix: "PM", desc: `Last-minute sightseeing or relaxing at a central cafe.`, location: `Central Plaza`, fee: "Free" },
                        { timePrefix: "06:00", timeSuffix: "PM", desc: `Pack up and commence departure back to ${fromCity}.`, location: `Transit Hub`, fee: "Free" }
                    ],
                    mustEat: "Pick up local spices or dry snacks to take back home.",
                    proTip: "Bargain respectfully at the bazaar, starting at 50% of the quoted price."
                }
            ];

            const bonusPlaces = [
                {
                    dayTitle: "Leisure & Wellness",
                    slots: [
                        { timePrefix: "10:00", timeSuffix: "AM", desc: "Relaxing spa treatment or yoga session.", location: "Wellness Center", fee: "₹2000" },
                        { timePrefix: "01:00", timeSuffix: "PM", desc: "Healthy, organic lunch.", location: "Organic Cafe", fee: "₹700" },
                        { timePrefix: "04:00", timeSuffix: "PM", desc: "Leisure walk or reading at a quiet spot.", location: "Quiet Park", fee: "Free" },
                        { timePrefix: "07:30", timeSuffix: "PM", desc: "Light, refreshing dinner.", location: "Rooftop Resto", fee: "₹800" }
                    ],
                    mustEat: "Fresh detox juices available at the wellness center.",
                    proTip: "Disconnect from your phone to fully embrace the wellness day."
                },
                {
                    dayTitle: "Local Food Trail",
                    slots: [
                        { timePrefix: "09:00", timeSuffix: "AM", desc: "Morning street food breakfast tour.", location: "Food Street", fee: "₹300" },
                        { timePrefix: "01:00", timeSuffix: "PM", desc: "Culinary class or special chef's tasting menu.", location: "Culinary School", fee: "₹1500" },
                        { timePrefix: "05:00", timeSuffix: "PM", desc: "Evening snack trail across famous vendors.", location: "Vendor Alley", fee: "₹400" },
                        { timePrefix: "08:00", timeSuffix: "PM", desc: "Grand finale dinner.", location: "Premium Restaurant", fee: "₹1500" }
                    ],
                    mustEat: "Pani Puri/Chaat from the most crowded vendor on the street.",
                    proTip: "Pace yourself and drink bottled water during the food trail."
                },
                {
                    dayTitle: "Historical Walking Tour",
                    slots: [
                        { timePrefix: "08:30", timeSuffix: "AM", desc: "Guided walking tour through historic neighborhoods.", location: "Historic District", fee: "₹500" },
                        { timePrefix: "12:30", timeSuffix: "PM", desc: "Lunch at a century-old classic eatery.", location: "Vintage Diner", fee: "₹450" },
                        { timePrefix: "03:30", timeSuffix: "PM", desc: "Explore local ruins and architectural marvels.", location: "Ancient Ruins", fee: "Free" },
                        { timePrefix: "07:00", timeSuffix: "PM", desc: "Dinner while enjoying a light and sound show.", location: "Fort Complex", fee: "₹800" }
                    ],
                    mustEat: "Classic slow-cooked regional delicacies at the vintage diner.",
                    proTip: "Wear comfortable walking shoes; the streets can be uneven."
                },
                {
                    dayTitle: "Art & Crafts Immersion",
                    slots: [
                        { timePrefix: "09:30", timeSuffix: "AM", desc: "Visit local art galleries and contemporary exhibits.", location: "City Art Gallery", fee: "₹200" },
                        { timePrefix: "01:00", timeSuffix: "PM", desc: "Lunch at an artsy, bohemian cafe.", location: "Boho Cafe", fee: "₹600" },
                        { timePrefix: "03:30", timeSuffix: "PM", desc: "Participate in a pottery or painting workshop.", location: "Crafts Studio", fee: "₹1200" },
                        { timePrefix: "08:00", timeSuffix: "PM", desc: "Dinner with live acoustic music.", location: "Jazz Lounge", fee: "₹1100" }
                    ],
                    mustEat: "Artisan baked goods and fusion dishes at the boho cafe.",
                    proTip: "Book the workshop in advance as spots fill up quickly."
                },
                {
                    dayTitle: "Scenic Countryside Escape",
                    slots: [
                        { timePrefix: "07:00", timeSuffix: "AM", desc: "Early morning drive to the lush countryside.", location: "Outskirts", fee: "Free" },
                        { timePrefix: "11:30", timeSuffix: "AM", desc: "Visit a local farm or vineyard.", location: "Countryside Farm", fee: "₹400" },
                        { timePrefix: "02:00", timeSuffix: "PM", desc: "Farm-to-table lunch experience.", location: "Farm House", fee: "₹900" },
                        { timePrefix: "06:00", timeSuffix: "PM", desc: "Return to the city and have a light evening snack.", location: "City Viewpoint", fee: "₹200" }
                    ],
                    mustEat: "Freshly harvested organic produce and local cheese at the farm.",
                    proTip: "Carry a light jacket as the countryside might be breezy."
                }
            ];

            // Shuffle bonus places to ensure uniqueness per trip
            let shuffledBonus = [...bonusPlaces].sort(() => 0.5 - Math.random());

            for (let i = 0; i < days; i++) {
                if (i < 5) {
                    // Deep copy to prevent mutating the template if we modify it later
                    cityDataArray.push(JSON.parse(JSON.stringify(coreDays[i])));
                } else {
                    const bonusIndex = (i - 5) % shuffledBonus.length;
                    cityDataArray.push(JSON.parse(JSON.stringify(shuffledBonus[bonusIndex])));
                }
            }
        }

        // Hyper-Local Context Logic for Transit
        let transportMode = "Auto-rickshaw";
        if (currentBudget === 'budget') {
            transportMode = "Public Bus / Shared Auto";
        } else if (currentBudget === 'comfort') {
            transportMode = "Private Cab / Ola";
        } else if (currentBudget === 'elite') {
            transportMode = "Chauffeur-driven Premium SUV";
        }

        // Generate Day Cards
        itineraryContainer.innerHTML = '';
        
        cityDataArray.forEach((dayData, i) => {
            // Create the Day Node Container
            const dayEl = document.createElement('div');
            dayEl.className = 'day-node-container';

            // Generate the rows for each activity inside the day card
            let slotsHTML = '';
            dayData.slots.forEach((slot, index) => {
                // Determine transit mode based on slot index
                let modeLabel = '';
                if (index < 2) modeLabel = `<span class="badge-mode">🚀 ${transportMode}</span>`;
                else if (index === 2) modeLabel = `<span class="badge-mode">🚶 Short walk</span>`;
                
                let feeLabel = slot.fee ? `<span class="badge-fee">💰 ${slot.fee}</span>` : '';
                
                slotsHTML += `
                    <div class="activity-row">
                        <div class="time-col">
                            <i class="time-icon">🕒</i>
                            <span>${slot.timePrefix}</span>
                            <span>${slot.timeSuffix}</span>
                        </div>
                        <div class="content-col">
                            <p class="activity-desc">${slot.desc}</p>
                            <div class="activity-location">
                                <span class="badge-location">📍 ${slot.location}</span>
                                ${feeLabel}
                            </div>
                            ${modeLabel}
                        </div>
                    </div>
                `;
            });

            let extrasHTML = '';
            if (dayData.mustEat) {
                extrasHTML += `<div class="must-eat"><strong>Must-Eat:</strong> ${dayData.mustEat}</div>`;
            }
            if (dayData.proTip) {
                extrasHTML += `<div class="pro-tip"><strong>Pro-Tip:</strong> ${dayData.proTip}</div>`;
            }

            dayEl.innerHTML = `
                <div class="day-node-dot"></div>
                <div class="day-card">
                    <h3 class="day-title">Day ${i + 1}: ${dayData.dayTitle}</h3>
                    <div class="activities-list">
                        ${slotsHTML}
                    </div>
                    ${extrasHTML}
                </div>
            `;
            
            itineraryContainer.appendChild(dayEl);
        });

    } catch (error) {
        console.error("Error generating itinerary:", error);
        itineraryContainer.innerHTML = `<div class="day-card" style="text-align: center; color: red;">
            <h3>Error generating itinerary</h3>
            <p>${error.message}</p>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">Please check if your API key is valid.</p>
        </div>`;
    }
}

// Event Listeners
vibeCards.forEach(card => {
    card.addEventListener('click', () => {
        vibeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        currentVibe = card.dataset.vibe;
    });
});

budgetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        budgetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentBudget = btn.dataset.budget;
    });
});

generateBtn.addEventListener('click', generateItinerary);

// Remove Initial Render call to allow the user to input first
itineraryContainer.innerHTML = '<p style="text-align: center; color: #666; font-size: 1.1rem; padding-left: 2rem;">Enter your origin, destination, duration, and guest count, then click <b>Generate Plan</b>.</p>';
