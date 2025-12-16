// Deep Ocean Data Archives
const oceanLabs = [
    // 1. Sunlight Zone (Upper Ocean) - 0-200m
    {
        id: 'shark',
        title: 'Great White Shark',
        title_zh: '大白鲨',
        description: 'The apex predator of the temperate seas. Capable of detecting blood from miles away.',
        description_zh: '温带海域的顶级掠食者。能从数英里外探测到微量的血液。',
        category: 'Sunlight Zone',
        url: 'https://sketchfab.com/models/14065d836412495392237e6f6630b983/embed', // Verified
        thumbnail: 'https://images.unsplash.com/photo-1560275619-4662e36fa65c?q=80&w=800',
        source: "Sketchfab",
        type: "3D Model",
        embeddable: true
    },
    {
        id: 'turtle',
        title: 'Green Sea Turtle',
        title_zh: '绿海龟',
        description: 'Ancient mariners that migrate thousands of miles across open oceans.',
        description_zh: '穿越开阔海域迁徙数千英里的古代航海者。',
        category: 'Sunlight Zone',
        url: 'https://sketchfab.com/models/808620b67d584e09b173512aaf0aec63/embed',
        thumbnail: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?q=80&w=800',
        source: "Sketchfab",
        type: "3D Model",
        embeddable: true
    },

    // 2. Twilight Zone (200-1000m)
    {
        id: 'squid',
        title: 'Giant Squid',
        title_zh: '大王乌贼',
        description: 'Elusive deep-sea giants with eyes the size of dinner plates to see in the dark.',
        description_zh: '难以捉摸的深海巨兽，拥有餐盘大小的眼睛以便在黑暗中视物。',
        category: 'Twilight Zone',
        url: 'https://sketchfab.com/models/a60a4f5539bd46d389334cc42d547d25/embed',
        thumbnail: 'https://plus.unsplash.com/premium_photo-1661963032332-6a6c023d7d7b?q=80&w=800',
        source: "Sketchfab",
        type: "3D Model",
        embeddable: true
    },

    // 3. Midnight Zone (1000m-4000m)
    {
        id: 'angler',
        title: 'Deep Sea Anglerfish',
        title_zh: '深海鮟鱇',
        description: 'Uses a bioluminescent lure to attract prey in the crushing darkness of the abyss.',
        description_zh: '在深渊的重压与黑暗中，利用生物发光诱饵吸引猎物。',
        category: 'Midnight Zone',
        url: 'https://sketchfab.com/models/191262d9426f49479679f049add90729/embed',
        thumbnail: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?q=80&w=800',
        source: "Sketchfab",
        type: "3D Model",
        embeddable: true
    },

    // 4. The Abyss (4000m+)
    {
        title: "Hydrothermal Vent",
        title_zh: "热液喷口",
        category: "The Abyss",
        description: "Underwater geysers hosting unique ecosystems relying on chemosynthesis.",
        description_zh: "拥有依赖化学合成的独特生态系统的水下喷泉。",
        url: "https://www.whoi.edu/know-your-ocean/ocean-topics/seafloor-geology/hydrothermal-vents/",
        thumbnail: "assets/images/ocean/vents.jpg",
        source: "WHOI",
        type: "Simulation",
        embeddable: false
    }
];

// Encyclopedia Data (Gamification)
const oceanEncyclopedia = [
    {
        id: "shark",
        name: "Great White",
        name_zh: "大白鲨",
        codeName: "JAWS",
        codeName_zh: "深海阎王",
        dangerLevel: 5,
        stats: { power: 95, defense: 60, speed: 85, intel: 70 },
        facts: {
            depth: "0-1200 m",
            weight: "2 tons",
            diet: "Carnivore",
            lifespan: "70 years"
        },
        funFact: "They can detect a drop of blood in 25 gallons of water.",
        funFact_zh: "它们可以在 25 加仑的水中检测到一滴血。",
        image: "assets/images/ocean/shark.jpg"
    },
    {
        id: "squid",
        name: "Giant Squid",
        name_zh: "大王乌贼",
        codeName: "KRAKEN",
        codeName_zh: "克拉肯",
        dangerLevel: 4,
        stats: { power: 80, defense: 40, speed: 70, intel: 85 },
        facts: {
            depth: "300-1000 m",
            weight: "275 kg",
            diet: "Carnivore",
            lifespan: "5 years"
        },
        funFact: "They have the largest eyes in the animal kingdom, the size of dinner plates!",
        funFact_zh: "它们拥有动物界最大的眼睛，有餐盘那么大！",
        image: "assets/images/ocean/squid.jpg"
    }
];

// Expose to window
window.oceanLabs = oceanLabs;
window.oceanEncyclopedia = oceanEncyclopedia;
