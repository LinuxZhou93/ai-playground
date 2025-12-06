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
    'Social Science': 'assets/images/covers/cover_earth.png' # Fallback to Earth/Global style
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

# Deduplicate by URL
unique_experiments = {e['url']: e for e in experiments}.values()
final_list = list(unique_experiments)

print(f"Total Unique Experiments: {len(final_list)}")

# Generate JS file content
# Custom JSON Dump to keep file size reasonable by not indenting too much if simpler?
# Default indent is fine.
js_content = "const experiments = " + json.dumps(final_list, indent=4, ensure_ascii=False) + ";"

with open('assets/js/experiments.js', 'w') as f:
    f.write(js_content)
