const astronomyLabs = [
    // 1. Solar System & Planets (太阳系与行星)
    {
        title: "Solar System Live",
        title_zh: "太阳系实时模拟",
        category: "Solar System",
        description: "Interactive 3D simulation of our solar system. Explore planets, orbits, and celestial mechanics.",
        description_zh: "太阳系的实时 3D 模拟。探索行星、轨道和天体力学。",
        url: "https://solar-system-labs.vercel.app/",
        thumbnail: "assets/images/astronomy/solar_system.jpg",
        source: "Solar System Scope"
    },
    {
        title: "NASA Eyes on the Solar System",
        title_zh: "NASA 太阳系之眼",
        category: "Solar System",
        description: "Explore the solar system, asteroids, and comets in real-time with NASA's data.",
        description_zh: "利用 NASA 的数据实时探索太阳系、小行星和彗星。",
        url: "https://eyes.nasa.gov/apps/solar-system/",
        thumbnail: "assets/images/astronomy/nasa_eyes.jpg",
        source: "NASA"
    },
    {
        title: "Mars Trek",
        title_zh: "火星漫游",
        category: "Solar System",
        description: "Interactive map of Mars using data from various spacecraft.",
        description_zh: "使用各种航天器数据的火星交互式地图。",
        url: "https://trek.nasa.gov/mars/",
        thumbnail: "assets/images/astronomy/mars_trek.jpg",
        source: "NASA"
    },
    {
        title: "Moon Trek",
        title_zh: "月球漫游",
        category: "Solar System",
        description: "Explore the Moon's surface with high-resolution imagery and data.",
        description_zh: "使用高分辨率图像和数据探索月球表面。",
        url: "https://trek.nasa.gov/moon/",
        thumbnail: "assets/images/astronomy/moon_trek.jpg",
        source: "NASA"
    },
    {
        title: "Cassini's Grand Finale",
        title_zh: "卡西尼号的最后壮举",
        category: "Solar System",
        description: "Follow the final journey of the Cassini spacecraft at Saturn.",
        description_zh: "跟随卡西尼号探测器在土星的最后旅程。",
        url: "https://saturn.jpl.nasa.gov/mission/grand-finale/overview/",
        thumbnail: "assets/images/astronomy/cassini.jpg",
        source: "NASA",
        embeddable: false
    },
    {
        title: "JunoCam",
        title_zh: "朱诺号木星相机",
        category: "Solar System",
        description: "View and process images of Jupiter from the Juno spacecraft.",
        description_zh: "查看和处理来自朱诺号探测器的木星图像。",
        url: "https://www.missionjuno.swri.edu/junocam",
        thumbnail: "assets/images/astronomy/juno.jpg",
        source: "NASA",
        embeddable: false
    },


    // 2. Stars & Constellations (恒星与星座)
    {
        title: "Holographic Star Map",
        title_zh: "全息星空图",
        category: "Stars & Constellations",
        description: "Real-time interactive star chart. Track constellations, planets, in 3D space.",
        description_zh: "实时交互式星图。在 3D 空间中追踪星座、行星。",
        url: "https://stellarium-web.org/",
        thumbnail: "assets/images/astronomy/stellarium.jpg",
        source: "Stellarium"
    },
    {
        title: "Google Sky",
        title_zh: "谷歌星空",
        category: "Stars & Constellations",
        description: "View the universe, including stars, constellations, galaxies, and planets.",
        description_zh: "查看宇宙，包括恒星、星座、星系和行星。",
        url: "https://www.google.com/sky/",
        thumbnail: "assets/images/astronomy/google_sky.jpg",
        source: "Google"
    },
    {
        title: "Constellation Guide",
        title_zh: "星座指南",
        category: "Stars & Constellations",
        description: "Learn about the 88 modern constellations and their stars.",
        description_zh: "了解 88 个现代星座及其恒星。",
        url: "https://server1.sky-map.org/",
        thumbnail: "assets/images/astronomy/sky_map.jpg",
        source: "Sky-Map.org"
    },
    {
        title: "100,000 Stars",
        title_zh: "十万恒星",
        category: "Stars & Constellations",
        description: "An interactive visualization of the stellar neighborhood created for Google Chrome.",
        description_zh: "为 Google Chrome 创建的恒星邻域交互式可视化。",
        url: "https://stars.chromeexperiments.com/",
        thumbnail: "assets/images/astronomy/100000_stars.jpg",
        source: "Google",
        embeddable: false
    },


    // 3. Exoplanets & Astrobiology (系外行星与天体生物学)
    {
        title: "Exoplanet Laboratory",
        title_zh: "系外行星实验室",
        category: "Exoplanets",
        description: "Analyze atmospheric composition and habitability data from Kepler and TESS missions.",
        description_zh: "分析来自开普勒和 TESS 任务的大气成分和宜居性数据。",
        url: "https://eyes.nasa.gov/apps/exo/",
        thumbnail: "assets/images/astronomy/exoplanet_lab.jpg",
        source: "NASA"
    },
    {
        title: "Habitable Zone Calculator",
        title_zh: "宜居带计算器",
        category: "Exoplanets",
        description: "Calculate the habitable zone for different types of stars.",
        description_zh: "计算不同类型恒星的宜居带。",
        url: "https://depts.washington.edu/naivpl/sites/default/files/hz.shtml",
        thumbnail: "assets/images/astronomy/hz_calc.jpg",
        source: "Univ. of Washington",
        embeddable: false
    },
    {
        title: "Strange New Worlds",
        title_zh: "奇异新世界",
        category: "Exoplanets",
        description: "Explore NASA's catalog of 5,000+ confirmed exoplanets.",
        description_zh: "探索 NASA 确认的 5000+ 颗系外行星目录。",
        url: "https://exoplanets.nasa.gov/alien-worlds/strange-new-worlds/",
        thumbnail: "assets/images/astronomy/alien_worlds.jpg",
        source: "NASA",
        embeddable: false
    },


    // 4. Space Exploration & Tech (太空探索与技术)
    {
        title: "SpaceX ISS Docking",
        title_zh: "SpaceX由于对接模拟",
        category: "Space Tech",
        description: "Simulator that familiarizes you with the controls of the SpaceX Dragon 2 interface.",
        description_zh: "让你熟悉 SpaceX Dragon 2 界面控制的模拟器。",
        url: "https://iss-sim.spacex.com/",
        thumbnail: "assets/images/astronomy/spacex_docking.jpg",
        source: "SpaceX"
    },
    {
        title: "Rocket Builder",
        title_zh: "火箭构建器",
        category: "Space Tech",
        description: "Design and launch your own rockets to learn about propulsion and aerodynamics.",
        description_zh: "设计并发射你自己的火箭，了解推进和空气动力学。",
        url: "https://rocket-builder.maths.org/game",
        thumbnail: "assets/images/astronomy/rocket_builder.jpg",
        source: "Nrich Maths",
        embeddable: false
    },
    {
        title: "NASA Deep Space Network",
        title_zh: "NASA 深空网络",
        category: "Space Tech",
        description: "Real-time status of communications with spacecraft exploring the solar system.",
        description_zh: "与探索太阳系的航天器通信的实时状态。",
        url: "https://eyes.nasa.gov/dsn/dsn.html",
        thumbnail: "assets/images/astronomy/dsn.jpg",
        source: "NASA"
    },
    {
        title: "James Webb Telescope",
        title_zh: "詹姆斯·韦伯望远镜",
        category: "Space Tech",
        description: "Explore the science and images from the JWST.",
        description_zh: "探索来自 JWST 的科学和图像。",
        url: "https://webb.nasa.gov/content/webbLaunch/index.html",
        thumbnail: "assets/images/astronomy/jwst.jpg",
        source: "NASA",
        embeddable: false
    },


    // 5. Deep Space & Cosmology (深空与宇宙学)
    {
        title: "Hubble Skymap",
        title_zh: "哈勃星空图",
        category: "Deep Space",
        description: "Interactive map of the sky showing Hubble Space Telescope observations.",
        description_zh: "显示哈勃太空望远镜观测结果的交互式天空地图。",
        url: "http://hubblesite.org/images/gallery",
        thumbnail: "assets/images/astronomy/hubble.jpg",
        source: "Hubble Site",
        embeddable: false
    },
    {
        title: "Chandra X-Ray Observatory",
        title_zh: "钱德拉 X 射线天文台",
        category: "Deep Space",
        description: "Explore the universe in X-ray light with data from Chandra.",
        description_zh: "使用钱德拉的数据在 X 射线光下探索宇宙。",
        url: "https://chandra.harvard.edu/",
        thumbnail: "assets/images/astronomy/chandra.jpg",
        source: "Harvard",
        embeddable: false
    },
    {
        title: "Scale of the Universe 2",
        title_zh: "宇宙的尺度 2",
        category: "Deep Space",
        description: "Zoom from the edge of the universe to the quantum foam of spacetime.",
        description_zh: "从宇宙边缘缩放到时空量子泡沫。",
        url: "https://htwins.net/scale2/",
        thumbnail: "assets/images/astronomy/scale.jpg",
        source: "Htwins"
    },
    {
        title: "ViewSpace",
        title_zh: "ViewSpace",
        category: "Deep Space",
        description: "Interactives and videos exploring the universe, Earth, and planets.",
        description_zh: "探索宇宙、地球和行星的互动内容和视频。",
        url: "https://viewspace.org/",
        thumbnail: "assets/images/astronomy/viewspace.jpg",
        source: "ViewSpace",
        embeddable: false
    },


    // 6. Astrophysics Labs (天体物理实验室)
    {
        title: "Gravity and Orbits",
        title_zh: "引力与轨道",
        category: "Astrophysics",
        description: "Move the sun, earth, moon and space station to see how it affects their gravitational forces.",
        description_zh: "移动太阳、地球、月球和空间站，看看它如何影响它们的引力。",
        url: "https://phet.colorado.edu/sims/html/gravity-and-orbits/latest/gravity-and-orbits_en.html",
        thumbnail: "assets/images/astronomy/gravity_orbits.jpg",
        source: "PhET"
    },
    {
        title: "My Solar System",
        title_zh: "我的太阳系",
        category: "Astrophysics",
        description: "Build your own solar system, set initial conditions, and watch gravity take over.",
        description_zh: "建立你自己的太阳系，设定初始条件，然后观察引力的作用。",
        url: "https://phet.colorado.edu/sims/my-solar-system/my-solar-system_en.html",
        thumbnail: "assets/images/astronomy/my_solar_system.jpg",
        source: "PhET"
    },
    {
        title: "Blackbody Spectrum",
        title_zh: "黑体辐射",
        category: "Astrophysics",
        description: "How does the blackbody spectrum of the sun compare to visible light?",
        description_zh: "太阳的黑体光谱与可见光相比如何？",
        url: "https://phet.colorado.edu/sims/html/blackbody-spectrum/latest/blackbody-spectrum_en.html",
        thumbnail: "assets/images/astronomy/blackbody.jpg",
        source: "PhET"
    },
    {
        title: "Lunar Phase Simulator",
        title_zh: "月相模拟器",
        category: "Astrophysics",
        description: "Interactive simulation for understanding the phases of the moon.",
        description_zh: "用于理解月相的交互式模拟。",
        url: "https://astro.unl.edu/classaction/animations/lunarcycles/lunarapplet.html",
        thumbnail: "assets/images/astronomy/lunar_phase.jpg",
        source: "UNL",
        embeddable: false
    }
];

// Expose to window
window.astronomyLabs = astronomyLabs;
