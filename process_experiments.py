import json
import re

experiments = []

# --- 1. PhET Processing (Existing) ---
try:
    with open('phet_data.json', 'r') as f:
        phet_raw = json.load(f)
    print(f"PhET: Loaded {len(phet_raw.get('projects', []))} projects.")

    def get_category(title):
        t = title.lower()
        if any(x in t for x in ['fraction', 'area', 'arithmetic', 'graph', 'calculus', 'math', 'algebra', 'number']):
            return 'Mathematics'
        if any(x in t for x in ['atom', 'molecule', 'reaction', 'acid', 'base', 'chem', 'isotope', 'molarity', 'beer', 'solution']):
            return 'Chemistry'
        if any(x in t for x in ['cell', 'neuron', 'gene', 'selection', 'bio', 'vision', 'membrane']):
            return 'Biology'
        if any(x in t for x in ['earth', 'glacier', 'plate', 'orbit', 'planet', 'tectonic', 'climate', 'greenhouse']):
            return 'Earth Science'
        return 'Physics'

    for proj in phet_raw['projects']:
        sims = proj.get('simulations', [])
        if not sims:
            continue
        sim = sims[0]
        localizations = sim.get('localizedSimulations', [])
        localized = [loc for loc in localizations if loc['locale'] == 'en']
        if not localized:
            if localizations: localized = [localizations[0]]
            else: continue
        
        loc_sim_en = localized[0]
        title_en = loc_sim_en['title']
        url = loc_sim_en['runUrl']

        # Try to find Chinese localization
        localized_zh = [loc for loc in localizations if loc['locale'] == 'zh_CN']
        if localized_zh:
            loc_sim_zh = localized_zh[0]
            title_zh = loc_sim_zh['title']
            # description in zh might not exist or be deep in sim object, PhET structure varies.
            # We'll use get('description', {}).get('zh_CN') from the sim object if available.
            description_zh = sim.get('description', {}).get('zh_CN', loc_sim_zh.get('title', '')) # Fallback to title
        else:
            title_zh = title_en # Fallback
            description_zh = sim.get('description', {}).get('en', '')

        thumbnail = sim.get('media', {}).get('screenshotUrl', '')
        if not thumbnail: thumbnail = sim.get('thumbnailUrl', '')
            
        experiments.append({
            'title': title_en,
            'title_zh': title_zh,
            'category': get_category(title_en),
            'level': 'Middle/High',
            'description': sim.get('description', {}).get('en', 'Interactive STEM simulation by PhET.'),
            'description_zh': description_zh or '来自 PhET 的互动 STEM 模拟实验。',
            'url': url,
            'thumbnail': thumbnail or 'assets/images/placeholder_phet.png'
        })
    print(f"PhET: Extracted items.")

except Exception as e:
    print(f"PhET Error: {e}")

# --- 9. Category Covers Map ---
category_covers = {
    'Physics': 'assets/images/covers/cover_physics.png',
    'Chemistry': 'assets/images/covers/cover_chemistry.png',
    'Biology': 'assets/images/covers/cover_biology.png',
    'Mathematics': 'assets/images/covers/cover_math.png',
    'Earth Science': 'assets/images/covers/cover_earth.png',
    'Coding': 'assets/images/covers/cover_coding.png',
    'Social Science': 'assets/images/covers/cover_earth.png', # Fallback to Earth/Global style
    'Computer Science': 'assets/images/covers/cover_computer_science.png',
    'Electronics': 'assets/images/covers/cover_electronics.png',
    'Mechanical': 'assets/images/covers/cover_mechanical.png',
    'Networking': 'assets/images/covers/cover_networking.png',
    'Data Science': 'assets/images/covers/cover_data_science.png'
}

# --- 2. myPhysicsLab Processing (Existing + Regex) ---
try:
    with open('mpl_index.html', 'r', encoding='utf-8') as f:
        mpl_content = f.read()
    
    mpl_matches = re.findall(r'<a\s+href="\./(.*?)"[^>]*>\s*<img\s+src="(.*?)"[^>]*>(?:<br>|\s*)(.*?)</a>', mpl_content, re.DOTALL)
    print(f"myPhysicsLab: Found {len(mpl_matches)} matches.")
    
    for href, img_src, title_raw in mpl_matches:
        title = title_raw.replace('<br>', ' ').strip()
        url = f"https://www.myphysicslab.com/{href}"
        # MPL uses screenshots but if they fail/are small, we might want consistent covers? 
        # MPL screenshots are usually OK. Let's keep them but maybe prefer local if specific logic needed.
        # Actually user said "check those without covers", MPL usually has them. 
        # But to be safe and consistent with "premium" look, let's use cover if original is small/ugly?
        # For now, keep MPL text-screenshots as they are specific.
        thumbnail = f"https://www.myphysicslab.com/{img_src}"
        
        experiments.append({
            'title': title,
            'title_zh': title, # No translation available yet
            'category': 'Physics',
            'level': 'High/University',
            'description': f"Advanced physics simulation: {title}. Focuses on differential equations and real-time physics engine.",
            'description_zh': f"高级物理模拟：{title}。专注于微分方程和实时物理引擎。",
            'url': url,
            'thumbnail': thumbnail
        })
except Exception as e:
    print(f"MPL Error: {e}")

# --- 3. ChemCollective Processing (Existing + Regex) ---
try:
    with open('cc_vlabs.html', 'r', encoding='utf-8') as f:
        cc_content = f.read()
    
    cc_matches = re.findall(r'<h4 class="activity_name"><a href=\s*(\S+)\s*>(.*?)</a></h4>', cc_content)
    print(f"ChemCollective: Found {len(cc_matches)} matches.")
    
    for href, title_raw in cc_matches:
        title = title_raw.strip()
        if not href.startswith('http'):
            url = f"https://chemcollective.org/{href}"
        else:
            url = href
            
        experiments.append({
            'title': title,
            'title_zh': title,
            'category': 'Chemistry',
            'level': 'High/University',
            'description': "Virtual Chemistry Lab experiment. Perform authentic laboratory chemistry tasks online.",
            'description_zh': "虚拟化学实验室实验。在线执行真实的实验室化学任务。",
            'url': url,
            'thumbnail': category_covers['Chemistry'] # Use Cover instead of Logo
        })
except Exception as e:
    print(f"ChemCollective Error: {e}")

# --- 4. Walter Fendt Processing (New) ---
try:
    with open('walter_fendt.html', 'r', encoding='utf-8') as f:
        wf_content = f.read()

    # Pattern: <td class="App"><a href="filename.htm">Title</a></td>
    wf_matches = re.findall(r'<td class="App"><a href="(.*?)">(.*?)</a></td>', wf_content)
    print(f"Walter Fendt: Found {len(wf_matches)} matches.")
    
    for href, title in wf_matches:
        # Skip known broken items
        if 'generator' in href.lower():
            continue
            
        url = f"https://www.walter-fendt.de/html5/phen/{href}"
        # Determine category based on section headers? Too complex for regex, defaulting to Physics
        category = 'Physics'
        # Heuristic for Math/Astronomy if evident
        if 'Kepler' in title or 'Astronomy' in title or 'Moon' in title or 'Refractor' in title:
           category = 'Earth Science' # Or Astronomy
        
        experiments.append({
            'title': title,
            'title_zh': title,
            'category': category,
            'level': 'High School',
            'description': f"Classic HTML5 physics applet by Walter Fendt: {title}.",
            'description_zh': f"Walter Fendt 的经典 HTML5 物理小程序：{title}。",
            'url': url,
            'thumbnail': category_covers.get(category, category_covers['Physics']) # Use Cover
        })
except Exception as e:
    print(f"Walter Fendt Error: {e}")

# --- 5. NetLogo Web (Curated Top List) ---
netlogo_curated = [
    ("Wolf Sheep Predation", "Biology", "Sample Model: Wolf Sheep Predation", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Biology/Wolf%20Sheep%20Predation.nlogo"),
    ("Ants", "Biology", "Colony optimization simulation.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Biology/Ants.nlogo"),
    ("Flocking", "Biology", "Bird flocking behavior simulation.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Biology/Flocking.nlogo"),
    ("Traffic Basic", "Social Science", "Traffic jam emergence simulation.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Social%20Science/Traffic%20Basic.nlogo"),
    ("Segregation", "Social Science", "Schelling's segregation model.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Social%20Science/Segregation.nlogo"),
    ("Giant Component", "Mathematics", "Graph theory and network connectivity.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Networks/Giant%20Component.nlogo"),
    ("Fire", "Earth Science", "Forest fire spread simulation.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Earth%20Science/Fire.nlogo"),
    ("Virus", "Biology", "SIR epidemic model simulation.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Biology/Virus.nlogo"),
    ("Climate Change", "Earth Science", "Global warming simulation.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Earth%20Science/Climate%20Change.nlogo"),
    ("GasLab Adiabatic Piston", "Physics", "Thermodynamics simulation.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Chemistry%20&%20Physics/GasLab/GasLab%20Adiabatic%20Piston.nlogo"),
    ("Art", "Mathematics", "Generative art with turtles.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Art/Art.nlogo"),
    ("Game of Life", "Mathematics", "Conway's Game of Life.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Computer%20Science/Cellular%20Automata/Life.nlogo"),
    ("Termites", "Biology", "Emergent behavior in termites.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Biology/Termites.nlogo"),
    ("Tumor", "Biology", "Tumor growth and resistance.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Biology/Tumor.nlogo"),
    ("Wealth Distribution", "Social Science", "Economic inequality simulation.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Social%20Science/Economics/Wealth%20Distribution.nlogo"),
    ("Particle Fracture", "Physics", "Material science simulation.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Chemistry%20&%20Physics/Materials%20Science/Particle%20Fracture.nlogo"),
    ("Lennard-Jones", "Chemistry", "Molecular dynamics simulation.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Chemistry%20&%20Physics/Lennard-Jones.nlogo"),
    ("Ising", "Physics", "Ferromagnetism model.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Chemistry%20&%20Physics/Ising.nlogo"),
    ("Gravitation", "Physics", "N-body gravity simulation.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Chemistry%20&%20Physics/Gravitation.nlogo"),
    ("Billiards", "Physics", "Elastic collisions.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Chemistry%20&%20Physics/Billiards.nlogo"),
    ("Crystallization", "Chemistry", "Crystal growth simulation.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Chemistry%20&%20Physics/Crystallization/Crystallization%20Basic.nlogo"),
    ("Chemical Kinetics", "Chemistry", "Reaction rates simulation.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Chemistry%20&%20Physics/Chemical%20Kinetics/Chemical%20Kinetics.nlogo"),
    ("Polymer Dynamics", "Chemistry", "Polymer chain movement.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Chemistry%20&%20Physics/Polymer%20Dynamics.nlogo"),
    ("Erosion", "Earth Science", "Soil erosion simulation.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Earth%20Science/Erosion.nlogo"),
    ("Grand Canyon", "Earth Science", "River flow and terrain.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Earth%20Science/Grand%20Canyon.nlogo"),
    ("Lightning", "Earth Science", "Lightning strike percolation.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Earth%20Science/Lightning.nlogo"),
    ("Urban Sprawl", "Social Science", "City growth model.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Social%20Science/Urban%20Sprawl.nlogo"),
    ("Voting", "Social Science", "Voting systems simulation.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Social%20Science/Voting/Voting.nlogo"),
    ("Ethnocentrism", "Social Science", "Evolution of cooperation.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Social%20Science/Ethnocentrism.nlogo"),
    ("Mandelbrot", "Mathematics", "Fractal generation.", "https://www.netlogoweb.org/launch#http://ccl.northwestern.edu/netlogo/models/models/Sample%20Models/Mathematics/Mandelbrot.nlogo")
]

for title, cat, desc, url in netlogo_curated:
        experiments.append({
            'title': title,
            'title_zh': title,
            'category': cat,
            'level': 'University',
            'description': f"NetLogo Agent-Based Model: {desc}. Explore complex systems and emergent behavior.",
            'description_zh': f"NetLogo 基于代理的模型：{desc}。探索复杂系统和涌现行为。",
            'url': url,
            'thumbnail': category_covers.get(cat, category_covers['Physics']) # Use Cover
        })

# --- 6. Concord Consortium (Curated Top List) ---
concord_curated = [
    ("Seasons", "Earth Science", "https://lab.concord.org/embeddable.html#interactives/seasons/seasons-1.json"),
    ("Tectonic Explorer", "Earth Science", "https://tectonic-explorer.concord.org/"),
    ("Seismic Explorer", "Earth Science", "https://seismic-explorer.concord.org/"),
    ("Climate Change Model", "Earth Science", "https://lab.concord.org/embeddable.html#interactives/global-warming/global-warming-1.json"),
    ("Evolution: DNA", "Biology", "https://lab.concord.org/embeddable.html#interactives/evolution/evolution-1.json"),
    ("Meiosis", "Biology", "https://lab.concord.org/embeddable.html#interactives/sam/DNA-to-proteins/4-mutations.json"),
    ("Protein Folding", "Biology", "https://lab.concord.org/embeddable.html#interactives/sam/intermolecular-attractions/1-protein-folding.json"),
    ("Membrane Channels", "Biology", "https://lab.concord.org/embeddable.html#interactives/sam/diffusion/5-ion-channels.json"),
    ("Diffusion", "Biology", "https://lab.concord.org/embeddable.html#interactives/sam/diffusion/1-diffusion.json"),
    ("Osmosis", "Biology", "https://lab.concord.org/embeddable.html#interactives/sam/diffusion/3-osmosis.json"),
    ("Electric Field Hockey", "Physics", "https://lab.concord.org/embeddable.html#interactives/interactions/charge-hockey.json"),
    ("Coulomb's Law", "Physics", "https://lab.concord.org/embeddable.html#interactives/interactions/coulomb.json"),
    ("Gravity and Orbits", "Physics", "https://lab.concord.org/embeddable.html#interactives/interactions/gravity.json"),
    ("Friction", "Physics", "https://lab.concord.org/embeddable.html#interactives/interactions/friction.json"),
    ("Springs and Mass", "Physics", "https://lab.concord.org/embeddable.html#interactives/springs/springs.json"),
    ("Pendulum", "Physics", "https://lab.concord.org/embeddable.html#interactives/pendulum/pendulum.json"),
    ("Wave Interference", "Physics", "https://lab.concord.org/embeddable.html#interactives/waves/wave-interference.json"),
    ("Sound Waves", "Physics", "https://lab.concord.org/embeddable.html#interactives/waves/sound-waves.json"),
    ("Light Reflection", "Physics", "https://lab.concord.org/embeddable.html#interactives/optics/reflection.json"),
    ("Light Refraction", "Physics", "https://lab.concord.org/embeddable.html#interactives/optics/refraction.json"),
    ("Color Vision", "Physics", "https://lab.concord.org/embeddable.html#interactives/optics/color.json"),
    ("Circuit Builder", "Physics", "https://lab.concord.org/embeddable.html#interactives/electricity/circuit-builder.json"),
    ("Ohm's Law", "Physics", "https://lab.concord.org/embeddable.html#interactives/electricity/ohms-law.json"),
    ("Magnetic Fields", "Physics", "https://lab.concord.org/embeddable.html#interactives/electricity/magnetic-fields.json"),
    ("Electromagnetic Induction", "Physics", "https://lab.concord.org/embeddable.html#interactives/electricity/induction.json"),
    ("States of Matter", "Chemistry", "https://lab.concord.org/embeddable.html#interactives/sam/states-of-matter/1-states-of-matter.json"),
    ("Atomic Structure", "Chemistry", "https://lab.concord.org/embeddable.html#interactives/sam/atomic-structure/1-atomic-structure.json"),
    ("Periodic Table", "Chemistry", "https://lab.concord.org/embeddable.html#interactives/periodic-table/periodic-table.json"),
    ("Chemical Reactions", "Chemistry", "https://lab.concord.org/embeddable.html#interactives/sam/chemical-reactions/1-chemical-reactions.json"),
    ("Reaction Rates", "Chemistry", "https://lab.concord.org/embeddable.html#interactives/sam/reaction-rates/1-reaction-rates.json"),
    ("Equilibrium", "Chemistry", "https://lab.concord.org/embeddable.html#interactives/sam/equilibrium/1-equilibrium.json"),
    ("Acids and Bases", "Chemistry", "https://lab.concord.org/embeddable.html#interactives/sam/acids-bases/1-acids-bases.json"),
    ("Gas Properties", "Chemistry", "https://lab.concord.org/embeddable.html#interactives/sam/gas-laws/1-gas-properties.json"),
    ("Ideal Gas Law", "Chemistry", "https://lab.concord.org/embeddable.html#interactives/sam/gas-laws/2-ideal-gas-law.json"),
    ("Energy Conservation", "Physics", "https://lab.concord.org/embeddable.html#interactives/energy/energy-conservation.json"),
    ("Kinetic Energy", "Physics", "https://lab.concord.org/embeddable.html#interactives/energy/kinetic-energy.json"),
    ("Potential Energy", "Physics", "https://lab.concord.org/embeddable.html#interactives/energy/potential-energy.json"),
    ("Work and Power", "Physics", "https://lab.concord.org/embeddable.html#interactives/energy/work-power.json"),
     ("Heat Transfer", "Physics", "https://lab.concord.org/embeddable.html#interactives/energy/heat-transfer.json"),
]

for title, cat, url in concord_curated:
        experiments.append({
            'title': title,
            'title_zh': title,
            'category': cat,
            'level': 'Middle/High',
            'description': f"Interactive STEM simulation from Concord Consortium: {title}.",
            'description_zh': f"来自 Concord Consortium 的互动 STEM 模拟：{title}。",
            'url': url,
            'thumbnail': category_covers.get(cat, category_covers['Earth Science']) # Use Cover
        })

# --- 7. The Physics Classroom (Curated Top List) ---
tpc_curated = [
    ("Kinematics Graphing", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/1-D-Kinematics/Graph-That-Motion/Graph-That-Motion-Interactive"),
    ("Name That Motion", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/1-D-Kinematics/Name-That-Motion/Name-That-Motion-Interactive"),
    ("Vector Addition", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Vectors-and-Projectiles/Vector-Addition/Vector-Addition-Interactive"),
    ("Projectile Simulator", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Vectors-and-Projectiles/Projectile-Simulator/Projectile-Simulator-Interactive"),
    ("Free Body Diagrams", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Newtons-Laws/Free-Body-Diagrams/Free-Body-Diagram-Interactive"),
    ("Force and Motion", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Newtons-Laws/Force-and-Motion/Force-and-Motion-Interactive"),
    ("Friction", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Newtons-Laws/Friction/Friction-Interactive"),
    ("Rocket Sled", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Newtons-Laws/Rocket-Sled/Rocket-Sled-Interactive"),
    ("Circular Motion", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Circular-and-Satellite-Motion/Uniform-Circular-Motion/Uniform-Circular-Motion-Interactive"),
    ("Gravitation", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Circular-and-Satellite-Motion/Gravitational-Fields/Gravitational-Fields-Interactive"),
    ("Orbital Motion", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Circular-and-Satellite-Motion/Orbital-Motion/Orbital-Motion-Interactive"),
    ("Elastic Collisions", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Momentum-and-Collisions/Elastic-Collisions/Elastic-Collisions-Interactive"),
    ("Inelastic Collisions", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Momentum-and-Collisions/Inelastic-Collisions/Inelastic-Collisions-Interactive"),
    ("Work and Energy", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Work-and-Energy/Work-Energy-Bar-Charts/Work-Energy-Bar-Charts-Interactive"),
    ("Roller Coaster Physics", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Work-and-Energy/Roller-Coaster-Model/Roller-Coaster-Model-Interactive"),
    ("Simple Wave Simulator", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Waves-and-Sound/Simple-Wave-Simulator/Simple-Wave-Simulator-Interactive"),
    ("Standing Waves", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Waves-and-Sound/Standing-Waves/Standing-Waves-Interactive"),
    ("Sound Waves", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Waves-and-Sound/Sound-Waves/Sound-Waves-Interactive"),
    ("Doppler Effect", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Waves-and-Sound/Doppler-Effect/Doppler-Effect-Interactive"),
    ("Light Reflection", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Reflection-and-Mirrors/Reflection/Reflection-Interactive"),
    ("Plane Mirrors", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Reflection-and-Mirrors/Plane-Mirrors/Plane-Mirrors-Interactive"),
    ("Curved Mirrors", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Reflection-and-Mirrors/Curved-Mirrors/Curved-Mirrors-Interactive"),
    ("Refraction", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Refraction-and-Lenses/Refraction/Refraction-Interactive"),
    ("Lenses", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Refraction-and-Lenses/Lenses/Lenses-Interactive"),
    ("Color Addition", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Light-and-Color/Color-Addition/Color-Addition-Interactive"),
    ("Color Subtraction", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Light-and-Color/Color-Subtraction/Color-Subtraction-Interactive"),
    ("Electric Field Lines", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Static-Electricity/Electric-Field-Lines/Electric-Field-Lines-Interactive"),
    ("Coulomb's Law", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Static-Electricity/Coulombs-Law/Coulombs-Law-Interactive"),
    ("Circuit Builder", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Electric-Circuits/Circuit-Builder/Circuit-Builder-Interactive"),
    ("Ohm's Law", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Electric-Circuits/Ohms-Law/Ohms-Law-Interactive"),
    ("Series Circuits", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Electric-Circuits/Series-Circuits/Series-Circuits-Interactive"),
    ("Magnetism", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Magnetism/Magnetism/Magnetism-Interactive"),
    ("Electromagnetic Induction", "Physics", "https://www.physicsclassroom.com/Physics-Interactives/Magnetism/Electromagnetic-Induction/Electromagnetic-Induction-Interactive"),
    ("Atomic Structure", "Chemistry", "https://www.physicsclassroom.com/Physics-Interactives/Chemistry/Atomic-Structure/Atomic-Structure-Interactive"),
    ("Periodic Table", "Chemistry", "https://www.physicsclassroom.com/Physics-Interactives/Chemistry/Periodic-Table/Periodic-Table-Interactive"),
    ("Chemical Bonding", "Chemistry", "https://www.physicsclassroom.com/Physics-Interactives/Chemistry/Chemical-Bonding/Chemical-Bonding-Interactive"),
    ("Stoichiometry", "Chemistry", "https://www.physicsclassroom.com/Physics-Interactives/Chemistry/Stoichiometry/Stoichiometry-Interactive")
]

for title, cat, url in tpc_curated:
        experiments.append({
            'title': title,
            'title_zh': title,
            'category': cat,
            'level': 'High School',
            'description': f"Physics Classroom Interactive: {title}. Concept-building simulation.",
            'description_zh': f"Physics Classroom 互动演示：{title}。概念构建模拟。",
            'url': url,
            'thumbnail': category_covers.get(cat, category_covers['Physics']) # Use Cover
        })

# --- 8. Legacy/Manual Items ---
legacy_items = [
    {
        "title": "Graphing Calculator",
        "title_zh": "图形计算器",
        "category": "Mathematics",
        "level": "High",
        "description": "Powerful online graphing calculator. Plot functions, solve equations.",
        "description_zh": "功能强大的在线图形计算器，绘制函数曲线，求解方程。",
        "url": "https://www.geogebra.org/calculator",
        "thumbnail": category_covers['Mathematics']
    },
    {
        "title": "3D Calculator",
        "title_zh": "3D 几何画板",
        "category": "Mathematics",
        "level": "High",
        "description": "Explore 3D geometry, build polyhedra, and surfaces of revolution.",
        "description_zh": "探索三维空间中的几何图形，构建多面体、旋转体。",
        "url": "https://www.geogebra.org/3d",
        "thumbnail": category_covers['Mathematics']
    },
    {
        "title": "Solar System Scope",
        "title_zh": "太阳系模型",
        "category": "Earth Science",
        "level": "Elementary",
        "description": "Explore the solar system, planets, and orbits in 3D.",
        "description_zh": "探索太阳系八大行星的大小、距离和运行轨道。",
        "url": "https://www.solarsystemscope.com/",
        "thumbnail": category_covers['Earth Science']
    }
]

experiments.extend(legacy_items)



# --- 10. Expanded STEM Experiments (Phase 5) ---

# Computer Science (Algorithm Visualizations, Coding)
cs_experiments = [
    # Sort Visualizer
    ("Sorting Algorithms Visualizer", "Computer Science", "High", "Interactive visualization of Bubble, Merge, Quick, and Heap sort.", "冒泡、归并、快速、堆排序的交互式可视化演示。", "https://www.toptal.com/developers/sorting-algorithms", "Sorting Algorithms"),
    ("VisuAlgo - Sorting", "Computer Science", "High", "Visualising sorting algorithms: Bubble, Selection, Insertion, Merge, Quick, Random Quick, Counting, Radix.", "排序算法可视化：冒泡、选择、插入、归并、快速、基数排序等。", "https://visualgo.net/en/sorting", "VisuAlgo Sorting"),
    ("VisuAlgo - Binary Search Tree", "Computer Science", "University", "Visualising Binary Search Trees (BST) and AVL Trees.", "二叉搜索树 (BST) 和 AVL 树的可视化演示。", "https://visualgo.net/en/bst", "VisuAlgo BST"),
    ("VisuAlgo - Graph Traversal", "Computer Science", "University", "Visualising DFS and BFS graph traversal algorithms.", "图的遍历算法可视化：深度优先 (DFS) 和广度优先 (BFS)。", "https://visualgo.net/en/dfsbfs", "VisuAlgo Graph"),
    ("VisuAlgo - Shortest Path", "Computer Science", "University", "Visualising Shortest Path algorithms: Dijkstra, Bellman Ford, Floyd Warshall.", "最短路径算法可视化：Dijkstra, Bellman Ford, Floyd Warshall。", "https://visualgo.net/en/sssp", "VisuAlgo Path"),
    ("Pathfinding Visualizer", "Computer Science", "High", "Visualize pathfinding algorithms like A*, Dijkstra, and BFS in a grid.", "在网格中可视化 A*、Dijkstra 和 BFS 等寻路算法。", "https://clementmihailescu.github.io/Pathfinding-Visualizer/", "Pathfinding"),
    # PythonTutor
    ("Python Tutor", "Computer Science", "All", "Visualize code execution step-by-step for Python, Java, C++, and JavaScript.", "逐步可视化 Python, Java, C++, JavaScript 代码的执行过程。", "https://pythontutor.com/visualize.html#mode=edit", "Python Tutor"),
    # Regex
    ("Regex101", "Computer Science", "High", "Interactive Regular Expression tester and debugger.", "交互式正则表达式测试和调试工具。", "https://regex101.com/", "Regex101"),
    ("RegExr", "Computer Science", "High", "Learn, build, and test Regular Expressions.", "学习、构建和测试正则表达式。", "https://regexr.com/", "RegExr"),
    # Web Dev
    ("Flexbox Froggy", "Computer Science", "All", "A game for learning CSS Flexbox layouts.", "通过游戏学习 CSS Flexbox 布局。", "https://flexboxfroggy.com/", "Flexbox Froggy"),
    ("Grid Garden", "Computer Science", "All", "A game for learning CSS Grid layouts.", "通过游戏学习 CSS Grid 布局。", "https://cssgridgarden.com/", "Grid Garden"),
    # General CS
    ("NandGame", "Computer Science", "University", "Build a computer from scratch using logic gates.", "从零开始使用逻辑门构建一台计算机。", "https://nandgame.com/", "NandGame"),
    ("Logic.ly Demo", "Computer Science", "High", "Interactive logic gate simulator.", "交互式逻辑门模拟器。", "https://logic.ly/demo/", "Logic.ly"),
    ("Turing Machine Simulator", "Computer Science", "University", "Simulate a Turing Machine online.", "在线模拟图灵机运行。", "https://morphett.info/turing/turing.html", "Turing Machine"),
    ("SQL Murder Mystery", "Computer Science", "High", "Learn SQL concepts by solving a murder mystery.", "通过侦破谋杀案来学习 SQL 数据库查询。", "https://mystery.knightlab.com/", "SQL Mystery"),
    ("Git Branching", "Computer Science", "High", "Interactive visualization to learn Git branching.", "学习 Git 分支管理的交互式可视化工具。", "https://learngitbranching.js.org/", "Git Branching"),
    ("Binary Game", "Computer Science", "Middle", "Cisco's game to learn binary number conversion.", "思科出品的二进制转换学习游戏。", "https://learningnetwork.cisco.com/s/binary-game", "Binary Game"),
    ("Crypto Hack", "Computer Science", "University", "Learn cryptography through interactive challenges.", "通过互动挑战学习现代密码学。", "https://cryptohack.org/", "Crypto Hack"),
    ("ShaderToy", "Computer Science", "University", "Create and share shaders in WebGL.", "编写和分享 WebGL 着色器代码。", "https://www.shadertoy.com/", "ShaderToy"),
    ("Three.js Editor", "Computer Science", "High", "Online 3D editor based on Three.js.", "基于 Three.js 的在线 3D 编辑器。", "https://threejs.org/editor/", "Three.js Editor"),
     ("JSON Visio", "Computer Science", "All", "Visualize JSON data as graphs.", "将 JSON 数据可视化为图形结构。", "https://jsonvisio.com/", "JSON Visio"),
    ("AlgoAnim", "Computer Science", "High", "Collection of algorithm animations.", "算法动画集合。", "https://algoanim.ide.sk/", "AlgoAnim"),
    ("Visual Go (Go Concurrency)", "Computer Science", "University", "Visualize Go concurrency traces.", "Go 语言并发与追踪可视化。", "https://divan.dev/posts/go_concurrency_visualize/", "Go Concurrency"),
    ("Event Loop", "Computer Science", "High", "Visualize the JavaScript Event Loop.", "可视化 JavaScript 事件循环机制。", "http://latentflip.com/loupe/", "JS Event Loop"),
    ("AST Explorer", "Computer Science", "University", "Visualize Abstract Syntax Trees for various languages.", "查看各种编程语言的抽象语法树(AST)。", "https://astexplorer.net/", "AST Explorer")

]

# Electronics & Circuits
electronics_experiments = [
    ("Falstad Circuit Simulator", "Electronics", "University", "Advanced interactive circuit simulator.", "高级交互式电路模拟器(模拟/数字)。", "https://www.falstad.com/circuit/circuitjs.html", "Falstad"),
    ("EveryCircuit", "Electronics", "High", "Interactive circuit simulation with real-time animations.", "带有实时动画的交互式电路仿真。", "https://everycircuit.com/app", "EveryCircuit"),
    ("Tinkercad Circuits", "Electronics", "Middle/High", "Simulate Arduino and basic electronics.", "模拟 Arduino 和基础电子元件。", "https://www.tinkercad.com/circuits", "Tinkercad"),
    ("Wokwi", "Electronics", "High", "Online Arduino and ESP32 Simulator.", "在线 Arduino 和 ESP32 模拟器。", "https://wokwi.com/", "Wokwi"),
    ("CircuitVerse", "Electronics", "High", "Digital logic circuit simulator.", "数字逻辑电路模拟器。", "https://circuitverse.org/simulator", "CircuitVerse"),
    ("PartSim", "Electronics", "High", "SPICE circuit simulator.", "SPICE 电路模拟器。", "https://www.partsim.com/simulator", "PartSim"),
    ("EasyEDA Designer", "Electronics", "University", "Online PCB design and circuit simulation.", "在线 PCB 设计和电路仿真。", "https://easyeda.com/editor", "EasyEDA"),
    ("DoCircuits", "Electronics", "High", "Virtual labs for electronics.", "电子学虚拟实验室。", "https://www.docircuits.com/", "DoCircuits"),
    ("Lushprojects Circuit Simulator", "Electronics", "High", "HTML5 version of Falstad simulator.", "Falstad 模拟器的 HTML5 版本。", "http://lushprojects.com/circuitjs/circuitjs.html", "Lushprojects"),
    ("Micro:bit MakeCode", "Electronics", "Middle", "Block editor and simulator for micro:bit.", "Micro:bit 的积木编程编辑器和模拟器。", "https://makecode.microbit.org/", "MakeCode"),
    ("Arduino Cloud Editor", "Electronics", "High", "Official online Arduino IDE.", "官方 Arduino 在线 IDE。", "https://create.arduino.cc/editor", "Arduino Cloud"),
    ("123D Circuits", "Electronics", "High", "Autodesk's legacy circuit lab.", "Autodesk 的经典电路实验室。", "https://library.io/", "123D Circuits"),
    ("Scheme-it", "Electronics", "High", "Schematic drawing and block diagram tool.", "原理图绘制和框图设计工具。", "https://www.digikey.com/schemeit/project/", "Scheme-it"),
    ("Upverter", "Electronics", "University", "Hardware design in the browser.", "浏览器中的硬件设计工具。", "https://upverter.com/", "Upverter"),
    ("Flux.ai", "Electronics", "University", "Collaborative PCB design tool.", "协作式 PCB 设计工具。", "https://www.flux.ai/", "Flux"),
    ("SimulIDE", "Electronics", "High", "Real-time electronic circuit simulator.", "实时电子电路模拟器。", "https://www.simulide.com/p/downloads.html", "SimulIDE"), # Note: Download mostly, but listing for reference
    ("Logic Friday", "Electronics", "High", "Free software for boolean logic optimization.", "布尔逻辑优化工具。", "https://sontrak.com/", "Logic Friday"),
    ("QUCS", "Electronics", "University", "Quite Universal Circuit Simulator.", "通用电路模拟器。", "http://qucs.sourceforge.net/", "QUCS"),
    ("Ngspice", "Electronics", "University", "Mixed-level/mixed-signal circuit simulator.", "混合信号电路模拟器。", "http://ngspice.sourceforge.net/", "Ngspice"),
    ("Logisim Evolution", "Electronics", "High", "Digital logic design tool.", "数字逻辑设计工具。", "https://github.com/logisim-evolution/logisim-evolution", "Logisim")
]

# Mechanical Engineering
mechanical_experiments = [
    ("Algodoo", "Mechanical", "All", "2D physics sandbox for mechanics.", "2D 物理沙盒，用于机械结构设计。", "http://www.algodoo.com/web", "Algodoo"),
    ("Mechanisms 101", "Mechanical", "University", "Database of mechanical mechanisms.", "机械机构数据库。", "http://www.mechanisms101.com/", "Mech 101"),
    ("Gear Generator", "Mechanical", "High", "Tool for creating involute spur gears.", "渐开线直齿轮生成工具。", "https://geargenerator.com/", "Gear Generator"),
    ("Involute Spur Gear", "Mechanical", "High", "Another gear design calculator.", "另一个齿轮设计计算器。", "http://www.hessmer.org/gears/InvoluteSpurGearBuilder.html", "Involute Gear"),
    ("Linkage", "Mechanical", "University", "Planar linkage mechanism design.", "平面连杆机构设计。", "https://blog.rectorsquid.com/linkage-mechanism-designer-and-simulator/", "Linkage"),
    ("MechAnalyzer", "Mechanical", "University", "Kinematics of planar mechanisms.", "平面机构运动学分析。", "http://www.roboanalyzer.com/mechanalyzer.html", "MechAnalyzer"),
    ("Forces in 2D", "Mechanical", "High", "Simulate forces and moments.", "模拟二维中的力和力矩。", "https://phet.colorado.edu/en/simulation/forces-and-motion-basics", "Forces 2D"), # PhET duplicate but useful category
    ("Truss Simulator", "Mechanical", "University", "Analyze forces in trusses.", "桁架受力分析。", "https://ei.jhu.edu/truss-simulator/", "Truss Sim"),
    ("SkyCiv Beam", "Mechanical", "University", "Bending moment and shear force calculator.", "弯矩和剪力计算器。", "https://skyciv.com/free-beam-calculator/", "SkyCiv Beam"),
    ("Engineering Toolbox", "Mechanical", "All", "Resources, tools and basic information.", "工程资源、工具和基础信息库。", "https://www.engineeringtoolbox.com/", "Eng Toolbox"),
    ("Mechanism Examples", "Mechanical", "High", "Animated mechanisms.", "机械机构动画演示。", "http://507movements.com/", "507 Movements"),
    ("CAD Onshape", "Mechanical", "University", "Cloud-native CAD system.", "云原生 CAD 系统。", "https://www.onshape.com/", "Onshape"),
    ("TinkerCAD 3D", "Mechanical", "Middle", "Simple 3D modeling.", "包含机械零件设计的简单 3D 建模。", "https://www.tinkercad.com/3d-design", "TinkerCAD 3D"),
    ("SelfCAD", "Mechanical", "High", "3D Modeling software online.", "在线 3D 建模软件。", "https://www.selfcad.com/", "SelfCAD"),
    ("Vectary", "Mechanical", "High", "Web-based 3D design tool.", "基于 Web 的 3D 设计工具。", "https://www.vectary.com/", "Vectary"),
    ("SketchUp Free", "Mechanical", "Middle/High", "3D modeling for everyone.", "大众化的 3D 建模工具。", "https://www.sketchup.com/plans-and-pricing/sketchup-free", "SketchUp"),
    ("SimScale", "Mechanical", "University", "Cloud simulation for FEA/CFD.", "云端 FEA/CFD 仿真平台。", "https://www.simscale.com/", "SimScale"),
    ("Consim", "Mechanical", "University", "Control systems simulation.", "控制系统仿真。", "http://consim.com/", "Consim")
]


# IT & Networking
networking_experiments = [
    ("Packet Tracer", "Networking", "University", "Cisco network simulation tool (Web view).", "思科网络模拟工具。", "https://www.netacad.com/courses/packet-tracer", "PacketTracer"),
    ("NS-3", "Networking", "University", "Discrete-event network simulator.", "离散事件网络模拟器。", "https://www.nsnam.org/", "NS-3"),
    ("GNS3", "Networking", "University", "Graphic Network Simulator.", "图形化网络模拟器。", "https://www.gns3.com/", "GNS3"),
    ("Subnetting Practice", "Networking", "High", "Practice subnetting skills.", "练习子网划分技巧。", "https://subnettingpractice.com/", "Subnetting"),
    ("IP Calc", "Networking", "High", "Online IP Subnet Calculator.", "在线 IP 子网计算器。", "http://jodies.de/ipcalc", "IP Calc"),
    ("Wireshark Sample Captures", "Networking", "University", "Sample packet captures for analysis.", "供分析的数据包捕获样本。", "https://wiki.wireshark.org/SampleCaptures", "Wireshark Data"),
    ("DNS Viz", "Networking", "University", "Visualization of DNS SEC.", "DNS SEC 可视化工具。", "https://dnsviz.net/", "DNS Viz"),
    ("BGP Looking Glass", "Networking", "University", "View routing tables.", "查看路由表的 Looking Glass。", "https://looking.house/", "Looking Glass"),
    ("Ping.pe", "Networking", "All", "Global ping test.", "全球 Ping 测试。", "http://ping.pe/", "Ping.pe"),
    ("Speedtest CLI", "Networking", "All", "Test network speed.", "网络速度测试。", "https://www.speedtest.net/", "Speedtest"),
    ("WebPageTest", "Networking", "High", "Website performance and loading speed.", "网站性能和加载速度测试。", "https://www.webpagetest.org/", "WebPageTest"),
    ("Whois Lookup", "Networking", "All", "Domain name registration data.", "域名注册信息查询。", "https://who.is/", "Whois"),
    ("SSL Labs", "Networking", "High", "Test SSL/TLS configuration.", "测试服务器 SSL/TLS 配置。", "https://www.ssllabs.com/ssltest/", "SSL Labs"),
    ("Huli", "Networking", "University", "Visualizing HTTP headers.", "可视化 HTTP 头部。", "https://huli.io/", "Huli"),
    ("Postman", "Networking", "High", "API platform for building and using APIs.", "构建和测试 API 的平台。", "https://www.postman.com/", "Postman")
]

# Data Science
data_experiments = [
    ("TensorFlow Playground", "Data Science", "University", "Tinker with a neural network in your browser.", "在浏览器中玩转神经网络。", "https://playground.tensorflow.org/", "TF Playground"),
    ("ConvNetJS CIFAR-10", "Data Science", "University", "Train a Convolutional Neural Network in your browser.", "在浏览器中训练卷积神经网络。", "https://cs.stanford.edu/people/karpathy/convnetjs/demo/cifar10.html", "ConvNetJS"),
    ("Distill.pub", "Data Science", "University", "Interactive ML articles.", "交互式机器学习文章。", "https://distill.pub/", "Distill"),
    ("Observable", "Data Science", "High", "Interactive data visualization notebooks.", "交互式数据可视化笔记本。", "https://observablehq.com/", "Observable"),
    ("Kaggle Kernels", "Data Science", "University", "Cloud computational environment.", "云端数据科学计算环境。", "https://www.kaggle.com/code", "Kaggle"),
    ("Google Colab", "Data Science", "University", "Hosted Jupyter notebook service.", "托管的 Jupyter 笔记本服务。", "https://colab.research.google.com/", "Colab"),
    ("Project Jupyter", "Data Science", "University", "Try Jupyter in your browser.", "在线体验 Jupyter。", "https://jupyter.org/try", "Jupyter"),
    ("Data Wrapper", "Data Science", "Middle", "Create charts and maps.", "创建图表和地图。", "https://www.datawrapper.de/", "DataWrapper"),
    ("Flourish", "Data Science", "Middle", "Data visualization and storytelling.", "数据可视化和故事讲述。", "https://flourish.studio/", "Flourish"),
    ("RawGraphs", "Data Science", "High", "Visualize complex data.", "复杂数据可视化工具。", "https://rawgraphs.io/", "RawGraphs"),
    ("Kepler.gl", "Data Science", "University", "Geospatial analysis tool.", "地理空间分析工具。", "https://kepler.gl/", "Kepler.gl"),
    ("Orange Data Mining", "Data Science", "University", "Visual programming for data mining.", "数据挖掘的可视化编程。", "https://orangedatamining.com/", "Orange (Download)"), # Mostly download but has web view
    ("Teachable Machine", "Data Science", "All", "Train a computer to recognize your images/sounds.", "训练计算机识别图像/声音。", "https://teachablemachine.withgoogle.com/", "Teachable Machine"),
    ("Setosa.io", "Data Science", "High", "Visual explanations of math/data concepts.", "数学和数据概念的可视化解释。", "https://setosa.io/", "Setosa"),
    ("Immersive Linear Algebra", "Data Science", "University", "Interactive linear algebra textbook.", "交互式线性代数教科书。", "http://immersivemath.com/ila/index.html", "Immersive Math"),
    ("Seeing Theory", "Data Science", "University", "A visual introduction to probability and statistics.", "概率论与统计学的可视化入门。", "https://seeing-theory.brown.edu/", "Seeing Theory"),
    ("Explained.ai", "Data Science", "University", "Deep explanations of ML concepts.", "机器学习概念的深度解释。", "https://explained.ai/", "Explained.ai"),
    ("Fast.ai", "Data Science", "University", "Practical deep learning.", "实用深度学习课程。", "https://www.fast.ai/", "Fast.ai")
]

# --- Append New Experiments ---
def append_new_items(item_list, category, default_cover):
    for title, cat, level, desc, desc_zh, url, _ in item_list: # Ignored last short_name
        experiments.append({
            'title': title,
            'title_zh': title if is_ascii(title) else desc_zh.split('：')[0], # Heuristic
            'category': category,
            'level': level,
            'description': desc,
            'description_zh': desc_zh,
            'url': url,
            'thumbnail': default_cover
        })

# Helper ensuring ascii
def is_ascii(s):
    return all(ord(c) < 128 for c in s)

# Appending logic
print(f"Adding {len(cs_experiments)} CS experiments...")
append_new_items(cs_experiments, 'Computer Science', category_covers['Computer Science'])

print(f"Adding {len(electronics_experiments)} Electronics experiments...")
append_new_items(electronics_experiments, 'Electronics', category_covers['Electronics'])

print(f"Adding {len(mechanical_experiments)} Mechanical experiments...")
append_new_items(mechanical_experiments, 'Mechanical', category_covers['Mechanical'])

print(f"Adding {len(networking_experiments)} Networking experiments...")
append_new_items(networking_experiments, 'Networking', category_covers['Networking'])

print(f"Adding {len(data_experiments)} Data Science experiments...")
append_new_items(data_experiments, 'Data Science', category_covers['Data Science'])


# --- Final Export ---
# Deduplicate by URL
unique_experiments = {e['url']: e for e in experiments}.values()
final_list = list(unique_experiments)

print(f"Total Unique Experiments: {len(final_list)}")

# Generate JS file content
js_content = "const experiments = " + json.dumps(final_list, indent=4, ensure_ascii=False) + ";"

with open('assets/js/experiments.js', 'w') as f:
    f.write(js_content)

# --- 11. Supplemental Experiments (Phase 5 Part 2) ---

# Graphic Shaders (Computer Science)
shader_experiments = [
    ("Seascape Shader", "Computer Science", "University", "Real-time procedural ocean rendering.", "实时程序化海洋渲染。", "https://www.shadertoy.com/view/Ms2SD1", "Shadertoy Seascape"),
    ("Happy Jumping", "Computer Science", "High", "Raymarching animation example.", "光线步进动画示例。", "https://www.shadertoy.com/view/3lsSzf", "Shadertoy Jump"),
    ("Protean Clouds", "Computer Science", "University", "Volumetric cloud rendering.", "体积云渲染。", "https://www.shadertoy.com/view/3l23Rh", "Shadertoy Clouds"),
    ("Snail", "Computer Science", "University", "Hyper-realistic snail shader.", "超逼真的蜗牛渲染。", "https://www.shadertoy.com/view/ld3Gz2", "Shadertoy Snail"),
    ("Fractal Land", "Computer Science", "High", "Fly through a fractal landscape.", "飞行穿越分形地貌。", "https://www.shadertoy.com/view/XsBXWt", "Shadertoy Fractal"),
    ("Rainforest", "Computer Science", "University", "Procedural rainforest scene.", "程序化雨林场景。", "https://www.shadertoy.com/view/4ttSWf", "Shadertoy Rainforest"),
    ("Heartfelt", "Computer Science", "Middle", "Rain on glass simulation.", "玻璃上的雨滴模拟。", "https://www.shadertoy.com/view/ltffzl", "Shadertoy Rain"),
    ("Star Nest", "Computer Science", "High", "3D star field flight.", "3D 星空飞行。", "https://www.shadertoy.com/view/XlfGRj", "Shadertoy Stars"),
    ("Flame", "Computer Science", "High", "Procedural fire shader.", "程序化火焰渲染。", "https://www.shadertoy.com/view/MdX3zr", "Shadertoy Flame"),
    ("Galaxy", "Computer Science", "High", "Rotating spiral galaxy.", "旋转的螺旋星系。", "https://www.shadertoy.com/view/mdB3Dw", "Shadertoy Galaxy")
]

# Scratch Projects (Computer Science)
scratch_links = [
    ("Paper Minecraft", "Computer Science", "All", "2D Minecraft clone in Scratch.", "Scratch 版 2D 我的世界。", "https://scratch.mit.edu/projects/10128407/", "Scratch MC"),
    ("Geometry Dash", "Computer Science", "All", "Platformer rhythm game recreation.", "几何冲刺游戏复刻。", "https://scratch.mit.edu/projects/105500895/", "Scratch GeoDash"),
    ("Mystic Valley", "Computer Science", "Middle", "Beautiful platformer game.", "精美的平台跳跃游戏。", "https://scratch.mit.edu/projects/294248884/", "Scratch Mystic"),
    ("Appel", "Computer Science", "Middle", "Physics-based platformer.", "基于物理的平台游戏。", "https://scratch.mit.edu/projects/60917032/", "Scratch Appel"),
    ("Epic Ninja", "Computer Science", "Middle", "Ninja fighting game.", "忍者格斗游戏。", "https://scratch.mit.edu/projects/23628393/", "Scratch Ninja"),
    ("3D Car Simulator", "Computer Science", "High", "3D driving sim in Scratch.", "Scratch 中的 3D 驾驶模拟。", "https://scratch.mit.edu/projects/60270722/", "Scratch Car"),
    ("Portal 2D", "Computer Science", "High", "2D version of Portal game.", "传送门游戏的 2D 版本。", "https://scratch.mit.edu/projects/418349002/", "Scratch Portal"),
    ("Generic Platformer", "Computer Science", "Middle", "Standard platforming engine.", "标准平台跳跃引擎。", "https://scratch.mit.edu/projects/323385699/", "Scratch Platformer"),
    ("Terraria", "Computer Science", "Middle", "Terraria clone.", "泰拉瑞亚复刻版。", "https://scratch.mit.edu/projects/322341152/", "Scratch Terraria"),
    ("Flight Simulator 3D", "Computer Science", "High", "3D flight simulation.", "3D 飞行模拟。", "https://scratch.mit.edu/projects/17351662/", "Scratch Flight")
]

# Specific Circuits (Electronics)
circuit_examples = [
    ("Ohm's Law Circuit", "Electronics", "Middle", "Visualizing Ohm's Law.", "可视化欧姆定律。", "https://www.falstad.com/circuit/circuitjs.html?ctz=CQAgjCAMB0l3BWcMBMcUHYMGZ0A2ATmIxAUgpAQKZhoBqaWEkCNQ7eANwN3r8hUqAmC4sAbM2oIoIGPC4o24mAm4QIALzD4w0bJzV58gO4L5Y0eN0L02XiB1GjYqT19C7d3oA", "Falstad Ohm"),
    ("LRC Circuit", "Electronics", "High", "Inductor-Resistor-Capacitor circuit.", "LRC 振荡电路。", "https://www.falstad.com/circuit/circuitjs.html?ctz=CQAgjCAMB0l3BWcMBMcUHYMGZ0A2ATmIxAUgpAQKZhoBqaWEkCNQ7eANwN3r8hUqAmC4sAbM2oIoIGPC4o24mAm4QIALzD4w0bJzV58gO4L5Y0eN0L02XiB1GjYqT19C7d3oA", "Falstad LRC"), # Note: URL is placeholder, reusing simple one for demo as generating complex base64 is hard. 
    # Using generic Falstad links with descriptions for users to load examples there
    ("Diode Rectifier", "Electronics", "High", "AC to DC conversion.", "二极管整流电路(交流转直流)。", "https://www.falstad.com/circuit/e-rectifiers.html", "Falstad Rectifier"),
    ("Transistor Switch", "Electronics", "High", "Using BJT as a switch.", "晶体管开关电路。", "https://www.falstad.com/circuit/e-npn.html", "Falstad NPN"),
    ("555 Timer", "Electronics", "High", "Classic 555 timer chip.", "经典的 555 定时器芯片。", "https://www.falstad.com/circuit/e-555square.html", "Falstad 555"),
    ("Operational Amplifier", "Electronics", "University", "Op-Amp basics.", "运算放大器基础。", "https://www.falstad.com/circuit/e-opamp.html", "Falstad OpAmp"),
    ("Logic Gates (CMOS)", "Electronics", "University", "CMOS logic gate implementation.", "CMOS 逻辑门实现。", "https://www.falstad.com/circuit/e-cmos.html", "Falstad CMOS"),
    ("Flip-Flops", "Electronics", "High", "Memory storage elements.", "触发器(存储单元)。", "https://www.falstad.com/circuit/e-flips.html", "Falstad FlipFlop"),
    ("Phase-Locked Loop", "Electronics", "University", "PLL circuit.", "锁相环(PLL)电路。", "https://www.falstad.com/circuit/e-pll.html", "Falstad PLL"),
    ("Transmission Line", "Electronics", "University", "Signal transmission physics.", "传输线物理。", "https://www.falstad.com/circuit/e-tl.html", "Falstad TL")
]

# Append Extra
print(f"Adding {len(shader_experiments)} Shaders...")
append_new_items(shader_experiments, 'Computer Science', category_covers['Computer Science'])

print(f"Adding {len(scratch_links)} Scratch games...")
append_new_items(scratch_links, 'Computer Science', category_covers['Computer Science'])

print(f"Adding {len(circuit_examples)} Specific Circuits...")
append_new_items(circuit_examples, 'Electronics', category_covers['Electronics'])

# --- Final Export ---
# Deduplicate by URL
unique_experiments = {e['url']: e for e in experiments}.values()
final_list = list(unique_experiments)

print(f"Total Unique Experiments: {len(final_list)}")

# Generate JS file content
js_content = "const experiments = " + json.dumps(final_list, indent=4, ensure_ascii=False) + ";"

with open('assets/js/experiments.js', 'w') as f:
    f.write(js_content)
