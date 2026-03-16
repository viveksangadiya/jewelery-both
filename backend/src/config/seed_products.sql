-- ============================================================
-- DUMMY PRODUCTS SEED — 30 per category
-- Run: psql your_database_name < src/config/seed_products.sql
-- ============================================================

-- Insert categories first (skip if already exist)
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Rings',      'rings',      'Beautiful rings for every occasion',       1),
  ('Necklaces',  'necklaces',  'Elegant necklaces and pendants',           2),
  ('Earrings',   'earrings',   'Stunning earrings for every style',        3),
  ('Bracelets',  'bracelets',  'Gorgeous bracelets and bangles',           4),
  ('Mangalsutra','mangalsutra','Traditional and modern mangalsutras',      5),
  ('Sets',       'sets',       'Matching jewelry sets',                    6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Helper: we'll use a DO block to insert with category lookups
-- ============================================================
DO $$
DECLARE
  cat_rings      INTEGER;
  cat_necklaces  INTEGER;
  cat_earrings   INTEGER;
  cat_bracelets  INTEGER;
  cat_mangal     INTEGER;
  cat_sets       INTEGER;
BEGIN

SELECT id INTO cat_rings      FROM categories WHERE slug = 'rings';
SELECT id INTO cat_necklaces  FROM categories WHERE slug = 'necklaces';
SELECT id INTO cat_earrings   FROM categories WHERE slug = 'earrings';
SELECT id INTO cat_bracelets  FROM categories WHERE slug = 'bracelets';
SELECT id INTO cat_mangal     FROM categories WHERE slug = 'mangalsutra';
SELECT id INTO cat_sets       FROM categories WHERE slug = 'sets';

-- ════════════════════════════════════════════════════════════
-- RINGS (30)
-- ════════════════════════════════════════════════════════════
INSERT INTO products (name, slug, description, short_description, category_id, base_price, sale_price, material, stock, is_featured, tags) VALUES
('Gold Solitaire Ring',         'gold-solitaire-ring',          'Classic solitaire ring with a brilliant cut diamond set in 18k gold.',           'Timeless solitaire ring in 18k gold.',         cat_rings, 24999, 21999, 'Gold',     45, true,  ARRAY['solitaire','gold','diamond']),
('Diamond Halo Ring',           'diamond-halo-ring',            'Stunning halo ring with central diamond surrounded by smaller diamonds.',         'Brilliant halo diamond ring.',                 cat_rings, 34999, 29999, 'Diamond',  30, true,  ARRAY['halo','diamond','engagement']),
('Rose Gold Twisted Band',      'rose-gold-twisted-band',       'Elegantly twisted rose gold band with a modern aesthetic.',                       'Modern twisted rose gold band.',               cat_rings, 8999,  7499,  'Rose Gold', 60, false, ARRAY['band','rose-gold','daily']),
('Emerald Statement Ring',      'emerald-statement-ring',       'Bold statement ring featuring a rich emerald gemstone set in yellow gold.',       'Emerald gemstone statement ring.',             cat_rings, 18999, NULL,  'Gold',     25, true,  ARRAY['emerald','gemstone','statement']),
('Silver Stackable Ring',       'silver-stackable-ring',        'Delicate sterling silver ring perfect for stacking.',                             'Minimalist stackable silver ring.',            cat_rings, 1499,  999,   'Silver',   120, false, ARRAY['silver','stackable','minimal']),
('Platinum Wedding Band',       'platinum-wedding-band',        'Classic platinum wedding band with a polished finish.',                           'Polished platinum wedding band.',              cat_rings, 45999, NULL,  'Platinum', 20, true,  ARRAY['wedding','platinum','band']),
('Ruby Cocktail Ring',          'ruby-cocktail-ring',           'Vibrant ruby set in a cocktail ring design with diamond accents.',               'Bold ruby cocktail ring.',                     cat_rings, 22999, 19999, 'Gold',     35, true,  ARRAY['ruby','cocktail','gemstone']),
('Pearl Cluster Ring',          'pearl-cluster-ring',           'Cluster of freshwater pearls set in 14k gold.',                                  'Elegant pearl cluster ring.',                  cat_rings, 7999,  6499,  'Gold',     50, false, ARRAY['pearl','cluster','classic']),
('Sapphire Eternity Band',      'sapphire-eternity-band',       'Channel set sapphires all around in an eternity band design.',                   'Sapphire eternity band.',                      cat_rings, 29999, 24999, 'Gold',     28, true,  ARRAY['sapphire','eternity','band']),
('Diamond Tennis Ring',         'diamond-tennis-ring',          'Row of pavé diamonds running across the entire band.',                           'Pavé diamond tennis ring.',                    cat_rings, 39999, 34999, 'Diamond',  15, true,  ARRAY['diamond','tennis','pave']),
('Gold Midi Ring Set',          'gold-midi-ring-set',           'Set of 3 minimalist gold midi rings in different widths.',                       'Set of 3 gold midi rings.',                    cat_rings, 3499,  2799,  'Gold',     80, false, ARRAY['midi','set','minimal']),
('Antique Filigree Ring',       'antique-filigree-ring',        'Intricate filigree work inspired by vintage jewelry design.',                    'Vintage-inspired filigree ring.',              cat_rings, 5999,  4999,  'Silver',   40, false, ARRAY['filigree','antique','vintage']),
('Diamond Solitaire Platinum',  'diamond-solitaire-platinum',   'Timeless solitaire engagement ring in platinum with GIA certified diamond.',     'Platinum solitaire engagement ring.',          cat_rings, 89999, NULL,  'Platinum', 10, true,  ARRAY['solitaire','platinum','engagement']),
('Kundan Bridal Ring',          'kundan-bridal-ring',           'Traditional kundan ring with colorful gemstones, perfect for weddings.',         'Traditional kundan bridal ring.',              cat_rings, 6999,  5999,  'Gold',     55, false, ARRAY['kundan','bridal','traditional']),
('Infinity Love Ring',          'infinity-love-ring',           'Infinity symbol ring crafted in 18k rose gold with diamond accents.',            'Rose gold infinity ring.',                     cat_rings, 11999, 9999,  'Rose Gold', 45, true,  ARRAY['infinity','love','rose-gold']),
('Birthstone Ring January',     'birthstone-ring-january',      'Garnet birthstone ring set in sterling silver, perfect for January birthdays.',  'Garnet birthstone ring.',                      cat_rings, 2999,  2499,  'Silver',   70, false, ARRAY['birthstone','garnet','gift']),
('Gold Chain Ring',             'gold-chain-ring',              'Unique chain-link design ring in 14k yellow gold.',                              'Chain-link design gold ring.',                 cat_rings, 9999,  8499,  'Gold',     38, false, ARRAY['chain','unique','gold']),
('Black Diamond Ring',          'black-diamond-ring',           'Bold black diamond set in a sleek blackened gold band.',                         'Black diamond statement ring.',                cat_rings, 27999, 23999, 'Gold',     22, true,  ARRAY['black-diamond','bold','statement']),
('Floral Diamond Ring',         'floral-diamond-ring',          'Flower-shaped ring with diamonds forming each petal.',                           'Diamond floral ring.',                         cat_rings, 19999, 16999, 'Gold',     30, true,  ARRAY['floral','diamond','flower']),
('Simple Gold Band',            'simple-gold-band',             'Everyday wear simple gold band in 18k yellow gold.',                             'Simple 18k gold daily wear band.',             cat_rings, 5499,  NULL,  'Gold',     90, false, ARRAY['simple','band','daily']),
('Moonstone Ring',              'moonstone-ring',               'Ethereal moonstone set in a delicate silver bezel setting.',                     'Dreamy moonstone silver ring.',                cat_rings, 3999,  3299,  'Silver',   65, false, ARRAY['moonstone','ethereal','silver']),
('Diamond Pear Solitaire',      'diamond-pear-solitaire',       'Pear-shaped diamond solitaire in prong setting with 18k gold band.',            'Pear diamond solitaire ring.',                 cat_rings, 44999, 38999, 'Diamond',  18, true,  ARRAY['pear','solitaire','diamond']),
('Vintage Cameo Ring',          'vintage-cameo-ring',           'Victorian-inspired cameo ring with shell cameo in gold frame.',                  'Victorian cameo ring.',                        cat_rings, 4499,  3799,  'Gold',     42, false, ARRAY['cameo','vintage','victorian']),
('Multi Gemstone Ring',         'multi-gemstone-ring',          'Rainbow ring featuring seven different colored gemstones.',                      'Rainbow multi-gemstone ring.',                 cat_rings, 8999,  7499,  'Gold',     48, true,  ARRAY['multistone','rainbow','colorful']),
('Twisted Diamond Band',        'twisted-diamond-band',         'Twisted gold band with pavé diamonds on the twists.',                            'Twisted pavé diamond band.',                   cat_rings, 21999, 18999, 'Diamond',  25, true,  ARRAY['twisted','diamond','pave']),
('Silver Toe Ring',             'silver-toe-ring',              'Traditional Indian silver toe ring with floral motifs.',                          'Traditional silver toe ring.',                 cat_rings, 799,   599,   'Silver',   150, false, ARRAY['toe','traditional','silver']),
('Gold Dome Ring',              'gold-dome-ring',               'Bold dome-shaped gold ring with hammered texture.',                              'Hammered gold dome ring.',                     cat_rings, 12999, NULL,  'Gold',     35, false, ARRAY['dome','bold','textured']),
('Diamond Three Stone Ring',    'diamond-three-stone-ring',     'Past, present, future three stone diamond ring in white gold.',                  'Three stone diamond ring.',                    cat_rings, 52999, 45999, 'Diamond',  12, true,  ARRAY['three-stone','diamond','engagement']),
('Adjustable Silver Ring',      'adjustable-silver-ring',       'Open band adjustable silver ring with heart charm.',                             'Adjustable silver heart ring.',                cat_rings, 1299,  999,   'Silver',   100, false, ARRAY['adjustable','heart','silver']),
('Oxidised Silver Ring',        'oxidised-silver-ring',         'Bohemian style oxidised silver ring with tribal patterns.',                      'Boho oxidised silver ring.',                   cat_rings, 1799,  1299,  'Silver',   85, false, ARRAY['oxidised','boho','tribal'])
ON CONFLICT (slug) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- NECKLACES (30)
-- ════════════════════════════════════════════════════════════
INSERT INTO products (name, slug, description, short_description, category_id, base_price, sale_price, material, stock, is_featured, tags) VALUES
('Diamond Solitaire Pendant',   'diamond-solitaire-pendant',    'Single brilliant diamond pendant on an 18k gold chain.',                         'Classic diamond solitaire pendant.',           cat_necklaces, 19999, 16999, 'Diamond',  35, true,  ARRAY['pendant','diamond','solitaire']),
('Gold Layered Chain Set',      'gold-layered-chain-set',       'Set of three layered gold chains in different lengths.',                         'Triple layered gold chain set.',               cat_necklaces, 14999, 12499, 'Gold',     45, true,  ARRAY['layered','chain','set']),
('Pearl Strand Necklace',       'pearl-strand-necklace',        'Classic single strand freshwater pearl necklace with gold clasp.',               'Single strand pearl necklace.',                cat_necklaces, 9999,  8499,  'Gold',     40, false, ARRAY['pearl','strand','classic']),
('Emerald Drop Pendant',        'emerald-drop-pendant',         'Vibrant emerald drop pendant with diamond halo in yellow gold.',                 'Emerald halo drop pendant.',                   cat_necklaces, 24999, NULL,  'Gold',     22, true,  ARRAY['emerald','drop','pendant']),
('Gold Mangalsutra Chain',      'gold-mangalsutra-chain',       'Traditional 22k gold mangalsutra chain with black beads.',                       'Traditional gold mangalsutra.',                cat_necklaces, 32999, NULL,  'Gold',     30, true,  ARRAY['mangalsutra','traditional','gold']),
('Diamond Bar Necklace',        'diamond-bar-necklace',         'Minimalist horizontal bar pendant with pavé diamonds.',                          'Diamond bar pendant necklace.',                cat_necklaces, 12999, 10999, 'Diamond',  50, true,  ARRAY['bar','diamond','minimal']),
('Silver Choker Necklace',      'silver-choker-necklace',       'Delicate silver choker with floral motifs.',                                     'Floral silver choker.',                        cat_necklaces, 2999,  2399,  'Silver',   75, false, ARRAY['choker','silver','floral']),
('Ruby Heart Pendant',          'ruby-heart-pendant',           'Heart-shaped ruby pendant with diamond border in rose gold.',                    'Ruby heart pendant in rose gold.',             cat_necklaces, 16999, 13999, 'Rose Gold', 28, true,  ARRAY['ruby','heart','pendant']),
('Gold Coin Necklace',          'gold-coin-necklace',           '22k gold coin pendant with Laxmi deity on a gold chain.',                        'Gold Laxmi coin pendant.',                     cat_necklaces, 22999, NULL,  'Gold',     35, false, ARRAY['coin','laxmi','traditional']),
('Diamond Tennis Necklace',     'diamond-tennis-necklace',      'Row of diamonds all around in a classic tennis necklace design.',               'Diamond tennis necklace.',                     cat_necklaces, 89999, 79999, 'Diamond',  10, true,  ARRAY['tennis','diamond','luxury']),
('Gold Om Pendant',             'gold-om-pendant',              'Sacred Om symbol pendant in 18k gold with diamond accent.',                      'Gold Om symbol pendant.',                      cat_necklaces, 8999,  7499,  'Gold',     60, false, ARRAY['om','spiritual','gold']),
('Sapphire Teardrop Pendant',   'sapphire-teardrop-pendant',    'Ceylon sapphire teardrop pendant on a white gold chain.',                        'Sapphire teardrop pendant.',                   cat_necklaces, 21999, 18999, 'Gold',     25, true,  ARRAY['sapphire','teardrop','pendant']),
('Layered Beaded Necklace',     'layered-beaded-necklace',      'Bohemian layered necklace with turquoise and gold beads.',                       'Boho layered beaded necklace.',                cat_necklaces, 4999,  3999,  'Gold',     55, false, ARRAY['beaded','boho','layered']),
('Diamond Infinity Pendant',    'diamond-infinity-pendant',     'Infinity symbol pendant encrusted with diamonds in 18k white gold.',             'Diamond infinity pendant.',                    cat_necklaces, 17999, 14999, 'Diamond',  32, true,  ARRAY['infinity','diamond','pendant']),
('Antique Gold Necklace',       'antique-gold-necklace',        'Intricate antique-style gold necklace with meenakari work.',                     'Antique meenakari gold necklace.',             cat_necklaces, 38999, NULL,  'Gold',     18, true,  ARRAY['antique','meenakari','traditional']),
('Silver Chain Necklace',       'silver-chain-necklace',        'Simple 925 sterling silver link chain, everyday wear.',                          'Sterling silver link chain.',                  cat_necklaces, 1999,  1599,  'Silver',   100, false, ARRAY['chain','silver','daily']),
('Kundan Collar Necklace',      'kundan-collar-necklace',       'Elaborate kundan collar necklace perfect for bridal wear.',                      'Kundan bridal collar necklace.',               cat_necklaces, 12999, 10999, 'Gold',     20, true,  ARRAY['kundan','bridal','collar']),
('Pearl Pendant Necklace',      'pearl-pendant-necklace',       'Single south sea pearl pendant on a delicate gold chain.',                       'South sea pearl pendant.',                     cat_necklaces, 11999, NULL,  'Gold',     30, false, ARRAY['pearl','pendant','south-sea']),
('Diamond Crescent Pendant',    'diamond-crescent-pendant',     'Celestial crescent moon pendant studded with diamonds.',                         'Diamond crescent moon pendant.',               cat_necklaces, 15999, 13499, 'Diamond',  35, true,  ARRAY['crescent','moon','diamond']),
('Gold Butterfly Pendant',      'gold-butterfly-pendant',       'Delicate butterfly pendant in 14k gold with enamel wings.',                      'Enamel butterfly gold pendant.',               cat_necklaces, 6999,  5799,  'Gold',     48, false, ARRAY['butterfly','enamel','pendant']),
('Temple Jewellery Necklace',   'temple-jewellery-necklace',    'South Indian temple jewellery necklace in gold with deity motifs.',              'South Indian temple necklace.',                cat_necklaces, 28999, NULL,  'Gold',     15, true,  ARRAY['temple','south-indian','traditional']),
('Rose Gold Chain Necklace',    'rose-gold-chain-necklace',     'Delicate rose gold chain with a tiny heart charm.',                              'Rose gold heart charm necklace.',              cat_necklaces, 7999,  6499,  'Rose Gold', 55, false, ARRAY['rose-gold','heart','chain']),
('Diamond Flower Pendant',      'diamond-flower-pendant',       'Five-petal flower pendant with diamond centre and gold petals.',                 'Diamond flower pendant.',                      cat_necklaces, 22999, 19499, 'Diamond',  28, true,  ARRAY['flower','diamond','pendant']),
('Oxidised Silver Necklace',    'oxidised-silver-necklace',     'Tribal-inspired oxidised silver necklace with turquoise stones.',                'Tribal oxidised silver necklace.',             cat_necklaces, 3499,  2799,  'Silver',   65, false, ARRAY['oxidised','tribal','silver']),
('Gold Star Pendant',           'gold-star-pendant',            'Tiny North Star pendant in 14k yellow gold — perfect everyday wear.',            'Gold North Star pendant.',                     cat_necklaces, 5999,  4999,  'Gold',     70, false, ARRAY['star','minimal','gold']),
('Diamond Pear Pendant',        'diamond-pear-pendant',         'Pear-shaped diamond pendant in classic prong setting.',                          'Pear diamond pendant.',                        cat_necklaces, 31999, 27999, 'Diamond',  20, true,  ARRAY['pear','diamond','pendant']),
('Terracotta Beads Necklace',   'terracotta-beads-necklace',    'Handcrafted terracotta beads necklace with gold-plated accents.',                'Handcrafted terracotta necklace.',             cat_necklaces, 1299,  999,   'Gold',     80, false, ARRAY['terracotta','handcrafted','boho']),
('Amethyst Pendant Necklace',   'amethyst-pendant-necklace',    'Rich purple amethyst pendant in sterling silver setting.',                       'Purple amethyst pendant.',                     cat_necklaces, 4499,  3699,  'Silver',   58, false, ARRAY['amethyst','purple','gemstone']),
('Gold Ganesha Pendant',        'gold-ganesha-pendant',         'Lord Ganesha pendant in 22k gold — auspicious and beautiful.',                   'Gold Ganesha pendant.',                        cat_necklaces, 15999, NULL,  'Gold',     40, true,  ARRAY['ganesha','spiritual','gold']),
('Citrine Drop Necklace',       'citrine-drop-necklace',        'Warm citrine drop pendant with gold bezel setting.',                             'Citrine drop pendant necklace.',               cat_necklaces, 5499,  4499,  'Gold',     45, false, ARRAY['citrine','drop','gemstone'])
ON CONFLICT (slug) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- EARRINGS (30)
-- ════════════════════════════════════════════════════════════
INSERT INTO products (name, slug, description, short_description, category_id, base_price, sale_price, material, stock, is_featured, tags) VALUES
('Diamond Stud Earrings',       'diamond-stud-earrings',        'Classic round brilliant diamond studs in 18k white gold.',                       'Classic diamond stud earrings.',               cat_earrings, 19999, 16999, 'Diamond',  40, true,  ARRAY['studs','diamond','classic']),
('Gold Jhumka Earrings',        'gold-jhumka-earrings',         'Traditional gold jhumka earrings with intricate filigree work.',                 'Traditional gold jhumka earrings.',            cat_earrings, 12999, 10999, 'Gold',     50, true,  ARRAY['jhumka','traditional','gold']),
('Pearl Drop Earrings',         'pearl-drop-earrings',          'Elegant freshwater pearl drops on gold hooks.',                                  'Freshwater pearl drop earrings.',              cat_earrings, 5999,  4999,  'Gold',     60, false, ARRAY['pearl','drop','elegant']),
('Diamond Huggie Hoops',        'diamond-huggie-hoops',         'Pavé diamond huggie hoop earrings in 18k yellow gold.',                          'Diamond huggie hoop earrings.',                cat_earrings, 22999, 19499, 'Diamond',  35, true,  ARRAY['huggie','hoop','diamond']),
('Ruby Chandelier Earrings',    'ruby-chandelier-earrings',     'Dramatic ruby chandelier earrings with diamond accents.',                        'Ruby chandelier earrings.',                    cat_earrings, 18999, 15999, 'Gold',     25, true,  ARRAY['chandelier','ruby','dramatic']),
('Silver Hoop Earrings',        'silver-hoop-earrings',         'Classic medium silver hoop earrings — everyday essentials.',                     'Classic silver hoop earrings.',                cat_earrings, 1999,  1499,  'Silver',   100, false, ARRAY['hoop','silver','daily']),
('Kundan Dangler Earrings',     'kundan-dangler-earrings',      'Colorful kundan dangler earrings for festive occasions.',                        'Festive kundan dangler earrings.',             cat_earrings, 7999,  6499,  'Gold',     45, true,  ARRAY['kundan','festive','dangler']),
('Sapphire Stud Earrings',      'sapphire-stud-earrings',       'Round sapphire studs set in 14k white gold.',                                    'Sapphire stud earrings.',                      cat_earrings, 12999, NULL,  'Gold',     38, false, ARRAY['sapphire','studs','blue']),
('Gold Chain Tassel Earrings',  'gold-chain-tassel-earrings',   'Statement tassel earrings made of fine gold chains.',                            'Gold tassel chain earrings.',                  cat_earrings, 8999,  7499,  'Gold',     42, false, ARRAY['tassel','chain','statement']),
('Emerald Ear Cuffs',           'emerald-ear-cuffs',            'Non-piercing emerald ear cuffs in gold.',                                        'Emerald gold ear cuffs.',                      cat_earrings, 5499,  4499,  'Gold',     55, true,  ARRAY['ear-cuff','emerald','non-piercing']),
('Diamond Ear Climbers',        'diamond-ear-climbers',         'Trendy diamond ear climbers that crawl up the ear.',                             'Diamond ear climber earrings.',                cat_earrings, 16999, 13999, 'Diamond',  30, true,  ARRAY['climber','diamond','trendy']),
('Oxidised Jhumka Set',         'oxidised-jhumka-set',          'Boho oxidised silver jhumka with mirror work.',                                  'Oxidised silver jhumka earrings.',             cat_earrings, 2999,  2399,  'Silver',   70, false, ARRAY['oxidised','jhumka','boho']),
('Rose Gold Teardrop Earrings', 'rose-gold-teardrop-earrings',  'Delicate teardrop rose gold earrings with a single diamond.',                    'Rose gold teardrop earrings.',                 cat_earrings, 9999,  8499,  'Rose Gold', 45, true,  ARRAY['teardrop','rose-gold','diamond']),
('Pearl Stud Earrings',         'pearl-stud-earrings',          'Classic south sea pearl studs in 14k gold.',                                     'South sea pearl stud earrings.',               cat_earrings, 7999,  NULL,  'Gold',     50, false, ARRAY['pearl','studs','classic']),
('Temple Jhumka Earrings',      'temple-jhumka-earrings',       'South Indian temple-style gold jhumka with goddess motifs.',                     'South Indian temple jhumka.',                  cat_earrings, 15999, NULL,  'Gold',     28, true,  ARRAY['temple','jhumka','south-indian']),
('Tiny Gold Star Studs',        'tiny-gold-star-studs',         'Dainty 14k gold star-shaped stud earrings.',                                     'Tiny gold star studs.',                        cat_earrings, 2999,  2499,  'Gold',     90, false, ARRAY['star','studs','dainty']),
('Diamond Flower Studs',        'diamond-flower-studs',         'Flower-shaped studs with diamond centre and gold petals.',                       'Diamond flower stud earrings.',                cat_earrings, 13999, 11499, 'Diamond',  35, true,  ARRAY['flower','diamond','studs']),
('Amethyst Drop Earrings',      'amethyst-drop-earrings',       'Purple amethyst drop earrings in sterling silver.',                              'Amethyst drop earrings.',                      cat_earrings, 4499,  3699,  'Silver',   55, false, ARRAY['amethyst','drop','purple']),
('Gold Bali Earrings',          'gold-bali-earrings',           'Traditional Indian bali earrings in 22k gold.',                                  'Traditional gold bali earrings.',              cat_earrings, 11999, NULL,  'Gold',     40, false, ARRAY['bali','traditional','gold']),
('Crystal Drop Earrings',       'crystal-drop-earrings',        'Sparkling Swarovski crystal drop earrings on gold hooks.',                       'Swarovski crystal drop earrings.',             cat_earrings, 3999,  3299,  'Gold',     65, false, ARRAY['crystal','drop','sparkle']),
('Diamond Crescent Studs',      'diamond-crescent-studs',       'Celestial crescent moon stud earrings with diamonds.',                           'Diamond crescent moon studs.',                 cat_earrings, 10999, 9499,  'Diamond',  40, true,  ARRAY['crescent','moon','diamond']),
('Long Chain Earrings',         'long-chain-earrings',          'Trendy long chain earrings in gold with geometric pendants.',                    'Long gold chain earrings.',                    cat_earrings, 6999,  5799,  'Gold',     48, false, ARRAY['long','chain','geometric']),
('Silver Tribal Earrings',      'silver-tribal-earrings',       'Handcrafted tribal silver earrings with turquoise inlay.',                       'Tribal silver turquoise earrings.',            cat_earrings, 2499,  1999,  'Silver',   75, false, ARRAY['tribal','silver','handcrafted']),
('Ruby Stud Earrings',          'ruby-stud-earrings',           'Vivid ruby studs set in 18k yellow gold.',                                       'Ruby gold stud earrings.',                     cat_earrings, 11999, 9999,  'Gold',     32, true,  ARRAY['ruby','studs','vivid']),
('Gold Lotus Earrings',         'gold-lotus-earrings',          'Lotus flower-shaped earrings in 18k gold with enamel.',                          'Gold lotus enamel earrings.',                  cat_earrings, 8999,  7499,  'Gold',     42, false, ARRAY['lotus','enamel','gold']),
('Diamond Solitaire Studs',     'diamond-solitaire-studs',      '0.5 carat solitaire diamond studs in platinum.',                                 'Platinum diamond solitaire studs.',            cat_earrings, 38999, 34999, 'Platinum', 15, true,  ARRAY['solitaire','diamond','platinum']),
('Meenakari Jhumka',            'meenakari-jhumka',             'Colorful meenakari jhumka earrings in 22k gold.',                                'Colorful meenakari gold jhumka.',              cat_earrings, 9999,  NULL,  'Gold',     38, true,  ARRAY['meenakari','jhumka','colorful']),
('Rose Gold Huggie Hoops',      'rose-gold-huggie-hoops',       'Small rose gold huggie hoops — perfect for everyday wear.',                      'Rose gold huggie hoop earrings.',              cat_earrings, 7499,  6299,  'Rose Gold', 60, false, ARRAY['huggie','rose-gold','daily']),
('Citrine Dangle Earrings',     'citrine-dangle-earrings',      'Warm citrine dangle earrings with gold accents.',                                'Citrine gold dangle earrings.',                cat_earrings, 5999,  4999,  'Gold',     48, false, ARRAY['citrine','dangle','gemstone']),
('Geometric Gold Earrings',     'geometric-gold-earrings',      'Modern geometric drop earrings in 14k gold.',                                    'Modern geometric gold earrings.',              cat_earrings, 6499,  5499,  'Gold',     52, false, ARRAY['geometric','modern','gold'])
ON CONFLICT (slug) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- BRACELETS (30)
-- ════════════════════════════════════════════════════════════
INSERT INTO products (name, slug, description, short_description, category_id, base_price, sale_price, material, stock, is_featured, tags) VALUES
('Diamond Tennis Bracelet',     'diamond-tennis-bracelet',      'Classic diamond tennis bracelet with 3 carats total weight in 18k gold.',        'Classic diamond tennis bracelet.',             cat_bracelets, 69999, 59999, 'Diamond',  15, true,  ARRAY['tennis','diamond','classic']),
('Gold Bangle Set',             'gold-bangle-set',              'Set of 6 traditional 22k gold bangles with intricate work.',                     'Set of 6 gold bangles.',                       cat_bracelets, 42999, NULL,  'Gold',     25, true,  ARRAY['bangles','set','traditional']),
('Pearl Bracelet',              'pearl-bracelet',               'Single strand freshwater pearl bracelet with gold clasp.',                       'Freshwater pearl bracelet.',                   cat_bracelets, 8999,  7499,  'Gold',     45, false, ARRAY['pearl','strand','elegant']),
('Silver Charm Bracelet',       'silver-charm-bracelet',        'Sterling silver charm bracelet with 5 pre-set charms.',                          'Silver charm bracelet.',                       cat_bracelets, 3999,  3299,  'Silver',   70, true,  ARRAY['charm','silver','gift']),
('Gold Chain Bracelet',         'gold-chain-bracelet',          'Delicate 18k gold chain bracelet with lobster clasp.',                           'Delicate gold chain bracelet.',                cat_bracelets, 9999,  8499,  'Gold',     55, false, ARRAY['chain','gold','delicate']),
('Diamond Bangle',              'diamond-bangle',               'Slim 18k gold bangle with pavé diamonds all around.',                            'Diamond pavé bangle.',                         cat_bracelets, 34999, 29999, 'Diamond',  20, true,  ARRAY['bangle','diamond','pave']),
('Kundan Bangle Set',           'kundan-bangle-set',            'Elaborate kundan bangles set of 2 for festive occasions.',                       'Kundan bangle set.',                           cat_bracelets, 7999,  6499,  'Gold',     40, true,  ARRAY['kundan','festive','bangles']),
('Rose Gold Cuff Bracelet',     'rose-gold-cuff-bracelet',      'Open rose gold cuff bracelet with diamond accent.',                              'Rose gold diamond cuff bracelet.',             cat_bracelets, 15999, 13499, 'Rose Gold', 30, true,  ARRAY['cuff','rose-gold','diamond']),
('Sapphire Link Bracelet',      'sapphire-link-bracelet',       'Blue sapphire and gold link bracelet.',                                          'Sapphire gold link bracelet.',                 cat_bracelets, 22999, NULL,  'Gold',     22, false, ARRAY['sapphire','link','blue']),
('Silver Bangle Plain',         'silver-bangle-plain',          'Classic plain silver bangle — minimalist and elegant.',                          'Plain silver bangle.',                         cat_bracelets, 1999,  1599,  'Silver',   90, false, ARRAY['bangle','plain','silver']),
('Antique Gold Kada',           'antique-gold-kada',            'Traditional antique gold kada with floral carvings.',                            'Antique gold kada bracelet.',                  cat_bracelets, 28999, NULL,  'Gold',     18, true,  ARRAY['kada','antique','traditional']),
('Diamond ID Bracelet',         'diamond-id-bracelet',          'Personalized ID bracelet in gold with diamond accents.',                         'Diamond gold ID bracelet.',                    cat_bracelets, 18999, 15999, 'Diamond',  25, false, ARRAY['id','personalized','diamond']),
('Oxidised Silver Bracelet',    'oxidised-silver-bracelet',     'Bohemian oxidised silver bracelet with turquoise stones.',                       'Oxidised silver boho bracelet.',               cat_bracelets, 2499,  1999,  'Silver',   75, false, ARRAY['oxidised','boho','turquoise']),
('Gold Heart Bracelet',         'gold-heart-bracelet',          'Delicate gold chain bracelet with small heart charms.',                          'Gold heart charm bracelet.',                   cat_bracelets, 6999,  5799,  'Gold',     50, true,  ARRAY['heart','charm','gold']),
('Ruby Gold Bracelet',          'ruby-gold-bracelet',           'Ruby and gold link bracelet, perfect for special occasions.',                    'Ruby gold link bracelet.',                     cat_bracelets, 19999, 16999, 'Gold',     28, true,  ARRAY['ruby','link','bracelet']),
('Beaded Mala Bracelet',        'beaded-mala-bracelet',         'Rudraksha and gold bead mala bracelet.',                                         'Rudraksha gold mala bracelet.',                cat_bracelets, 3499,  2799,  'Gold',     60, false, ARRAY['mala','rudraksha','spiritual']),
('Diamond Infinity Bracelet',   'diamond-infinity-bracelet',    'Infinity symbol diamond bracelet in 18k white gold.',                            'Diamond infinity bracelet.',                   cat_bracelets, 24999, 21499, 'Diamond',  22, true,  ARRAY['infinity','diamond','white-gold']),
('Gold Mesh Bracelet',          'gold-mesh-bracelet',           'Flexible gold mesh bracelet with secure clasp.',                                 'Gold mesh bracelet.',                          cat_bracelets, 11999, NULL,  'Gold',     35, false, ARRAY['mesh','flexible','gold']),
('Temple Gold Bangles',         'temple-gold-bangles',          'South Indian temple-style gold bangles with deity engravings.',                  'Temple style gold bangles.',                   cat_bracelets, 35999, NULL,  'Gold',     15, true,  ARRAY['temple','south-indian','bangles']),
('Silver Anklet Bracelet',      'silver-anklet-bracelet',       'Delicate silver anklet with tiny bell charms.',                                  'Silver anklet with bells.',                    cat_bracelets, 1499,  1199,  'Silver',   85, false, ARRAY['anklet','bells','silver']),
('Emerald Gold Bracelet',       'emerald-gold-bracelet',        'Columbian emerald bezel set in a gold bracelet.',                                'Emerald bezel gold bracelet.',                 cat_bracelets, 32999, 27999, 'Gold',     18, true,  ARRAY['emerald','bezel','gold']),
('Leather Gold Bracelet',       'leather-gold-bracelet',        'Brown leather bracelet with gold clasp — perfect for men and women.',            'Leather and gold bracelet.',                   cat_bracelets, 2999,  2499,  'Gold',     65, false, ARRAY['leather','unisex','casual']),
('Platinum Diamond Bracelet',   'platinum-diamond-bracelet',    'Elegant platinum bracelet with channel-set diamonds.',                           'Platinum channel diamond bracelet.',           cat_bracelets, 54999, 47999, 'Platinum', 12, true,  ARRAY['platinum','diamond','channel']),
('Seed Bead Bracelet',          'seed-bead-bracelet',           'Colorful seed bead bracelet with gold accent beads.',                            'Colorful seed bead bracelet.',                 cat_bracelets, 999,   799,   'Gold',     120, false, ARRAY['beaded','colorful','casual']),
('Gold Twisted Bangle',         'gold-twisted-bangle',          'Twisted rope design gold bangle — classic and elegant.',                         'Twisted gold bangle.',                         cat_bracelets, 13999, NULL,  'Gold',     40, false, ARRAY['twisted','bangle','gold']),
('Diamond Stackable Bracelet',  'diamond-stackable-bracelet',   'Slim diamond bracelet perfect for stacking.',                                    'Stackable diamond bracelet.',                  cat_bracelets, 17999, 15499, 'Diamond',  30, true,  ARRAY['stackable','diamond','slim']),
('Meenakari Bangle',            'meenakari-bangle',             'Vibrant meenakari bangle in 22k gold with colorful enamel.',                     'Colorful meenakari gold bangle.',              cat_bracelets, 8999,  7499,  'Gold',     42, false, ARRAY['meenakari','enamel','colorful']),
('Crystal Charm Bracelet',      'crystal-charm-bracelet',       'Silver bracelet with Swarovski crystal charms.',                                 'Crystal charm bracelet.',                      cat_bracelets, 3999,  3299,  'Silver',   58, false, ARRAY['crystal','charm','sparkle']),
('Gold Adjustable Bracelet',    'gold-adjustable-bracelet',     'Adjustable 14k gold chain bracelet — one size fits all.',                        'Adjustable gold chain bracelet.',              cat_bracelets, 5999,  4999,  'Gold',     70, false, ARRAY['adjustable','gold','daily']),
('Amethyst Bead Bracelet',      'amethyst-bead-bracelet',       'Natural amethyst bead bracelet with gold spacers.',                              'Amethyst bead bracelet.',                      cat_bracelets, 2999,  2399,  'Gold',     65, false, ARRAY['amethyst','beaded','healing'])
ON CONFLICT (slug) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- MANGALSUTRA (30)
-- ════════════════════════════════════════════════════════════
INSERT INTO products (name, slug, description, short_description, category_id, base_price, sale_price, material, stock, is_featured, tags) VALUES
('Classic Gold Mangalsutra',        'classic-gold-mangalsutra',         'Traditional 22k gold mangalsutra with black beads and gold pendant.',          'Classic gold mangalsutra.',                    cat_mangal, 24999, NULL,  'Gold',     35, true,  ARRAY['classic','traditional','gold']),
('Diamond Mangalsutra',             'diamond-mangalsutra',              'Modern diamond mangalsutra with a sleek pendant and black beads.',              'Diamond pendant mangalsutra.',                 cat_mangal, 42999, 37999, 'Diamond',  20, true,  ARRAY['diamond','modern','pendant']),
('Short Mangalsutra',               'short-mangalsutra',                'Trendy short mangalsutra — perfect for office wear.',                           'Short modern mangalsutra.',                    cat_mangal, 12999, 10999, 'Gold',     45, true,  ARRAY['short','office-wear','modern']),
('Maharashtrian Mangalsutra',       'maharashtrian-mangalsutra',        'Traditional Maharashtrian vati mangalsutra in 22k gold.',                       'Maharashtrian vati mangalsutra.',              cat_mangal, 32999, NULL,  'Gold',     25, true,  ARRAY['maharashtrian','vati','traditional']),
('Gold Diamond Mangalsutra',        'gold-diamond-mangalsutra',         '18k gold mangalsutra with diamond-set pendant.',                                'Gold diamond mangalsutra.',                    cat_mangal, 38999, 33999, 'Diamond',  18, true,  ARRAY['diamond','gold','pendant']),
('South Indian Mangalsutra',        'south-indian-mangalsutra',         'Traditional South Indian thali mangalsutra in 22k gold.',                       'South Indian thali mangalsutra.',              cat_mangal, 28999, NULL,  'Gold',     22, false, ARRAY['south-indian','thali','traditional']),
('Modern Sleek Mangalsutra',        'modern-sleek-mangalsutra',         'Minimalist sleek mangalsutra in 18k gold — perfect for daily wear.',            'Minimalist daily wear mangalsutra.',           cat_mangal, 15999, 13499, 'Gold',     50, true,  ARRAY['minimalist','daily','sleek']),
('Ruby Diamond Mangalsutra',        'ruby-diamond-mangalsutra',         'Elegant mangalsutra with ruby and diamond pendant in gold.',                    'Ruby diamond mangalsutra.',                    cat_mangal, 35999, NULL,  'Gold',     15, true,  ARRAY['ruby','diamond','elegant']),
('Bengali Mangalsutra',             'bengali-mangalsutra',              'Traditional Bengali loha mangalsutra design.',                                  'Bengali loha mangalsutra.',                    cat_mangal, 8999,  7499,  'Gold',     40, false, ARRAY['bengali','loha','traditional']),
('Diamond Heart Mangalsutra',       'diamond-heart-mangalsutra',        'Heart-shaped diamond pendant mangalsutra in rose gold.',                        'Diamond heart mangalsutra.',                   cat_mangal, 29999, 25999, 'Diamond',  25, true,  ARRAY['heart','diamond','rose-gold']),
('Temple Mangalsutra',              'temple-mangalsutra',               'Temple-style gold mangalsutra with goddess Lakshmi pendant.',                   'Temple style Lakshmi mangalsutra.',            cat_mangal, 22999, NULL,  'Gold',     28, true,  ARRAY['temple','lakshmi','traditional']),
('Light Weight Mangalsutra',        'light-weight-mangalsutra',         'Lightweight 18k gold mangalsutra for daily comfortable wear.',                  'Lightweight daily wear mangalsutra.',          cat_mangal, 10999, 9499,  'Gold',     55, false, ARRAY['lightweight','daily','comfort']),
('Navratna Mangalsutra',            'navratna-mangalsutra',             'Mangalsutra with navratna gemstone pendant in gold.',                           'Navratna gemstone mangalsutra.',               cat_mangal, 18999, 15999, 'Gold',     30, true,  ARRAY['navratna','gemstone','colorful']),
('Diamond Solitaire Mangalsutra',   'diamond-solitaire-mangalsutra',    'Single solitaire diamond pendant on a thin gold chain.',                        'Diamond solitaire mangalsutra.',               cat_mangal, 44999, 38999, 'Diamond',  15, true,  ARRAY['solitaire','diamond','minimalist']),
('Rajasthani Mangalsutra',          'rajasthani-mangalsutra',           'Traditional Rajasthani kundan mangalsutra with colorful stones.',               'Rajasthani kundan mangalsutra.',               cat_mangal, 9999,  8299,  'Gold',     35, false, ARRAY['rajasthani','kundan','colorful']),
('Double Line Mangalsutra',         'double-line-mangalsutra',          'Double line black bead gold mangalsutra — classic look.',                       'Double line gold mangalsutra.',                cat_mangal, 19999, NULL,  'Gold',     32, false, ARRAY['double-line','classic','gold']),
('Sapphire Mangalsutra',            'sapphire-mangalsutra',             'Deep blue sapphire pendant mangalsutra in 18k gold.',                           'Sapphire pendant mangalsutra.',                cat_mangal, 26999, 22999, 'Gold',     20, true,  ARRAY['sapphire','blue','pendant']),
('Antique Mangalsutra',             'antique-mangalsutra',              'Antique gold finish mangalsutra with traditional motifs.',                      'Antique gold mangalsutra.',                    cat_mangal, 16999, NULL,  'Gold',     28, false, ARRAY['antique','traditional','motifs']),
('Single Line Mangalsutra',         'single-line-mangalsutra',          'Simple single line black bead mangalsutra in 22k gold.',                        'Simple single line mangalsutra.',              cat_mangal, 13999, 11999, 'Gold',     40, false, ARRAY['single-line','simple','daily']),
('Platinum Mangalsutra',            'platinum-mangalsutra',             'Modern platinum mangalsutra with diamond pendant.',                             'Platinum diamond mangalsutra.',                cat_mangal, 55999, 47999, 'Platinum', 10, true,  ARRAY['platinum','diamond','modern']),
('Gold Coin Mangalsutra',           'gold-coin-mangalsutra',            'Mangalsutra with 22k gold coin pendant and black beads.',                       'Gold coin pendant mangalsutra.',               cat_mangal, 21999, NULL,  'Gold',     30, false, ARRAY['coin','pendant','traditional']),
('Emerald Mangalsutra',             'emerald-mangalsutra',              'Green emerald pendant mangalsutra in 18k yellow gold.',                         'Emerald pendant mangalsutra.',                 cat_mangal, 31999, 27499, 'Gold',     18, true,  ARRAY['emerald','green','pendant']),
('Baby Mangalsutra',                'baby-mangalsutra',                 'Small delicate mangalsutra for everyday office wear.',                          'Tiny delicate mangalsutra.',                   cat_mangal, 8999,  7499,  'Gold',     48, false, ARRAY['tiny','delicate','office']),
('Kolhapuri Mangalsutra',           'kolhapuri-mangalsutra',            'Traditional Kolhapuri style mangalsutra with bold pendant.',                    'Kolhapuri style mangalsutra.',                 cat_mangal, 17999, NULL,  'Gold',     25, false, ARRAY['kolhapuri','bold','traditional']),
('Rose Gold Mangalsutra',           'rose-gold-mangalsutra',            'Trendy rose gold mangalsutra with diamond pendant.',                            'Rose gold mangalsutra.',                       cat_mangal, 27999, 23999, 'Diamond',  22, true,  ARRAY['rose-gold','diamond','trendy']),
('Diamond Floral Mangalsutra',      'diamond-floral-mangalsutra',       'Floral diamond pendant mangalsutra in 18k gold.',                               'Diamond floral mangalsutra.',                  cat_mangal, 36999, 31999, 'Diamond',  16, true,  ARRAY['floral','diamond','pendant']),
('Long Chain Mangalsutra',          'long-chain-mangalsutra',           'Long 24 inch black bead mangalsutra with gold pendant.',                        'Long chain gold mangalsutra.',                 cat_mangal, 22999, NULL,  'Gold',     30, false, ARRAY['long','chain','traditional']),
('Dual Pendant Mangalsutra',        'dual-pendant-mangalsutra',         'Unique dual pendant mangalsutra in 18k gold.',                                  'Dual pendant gold mangalsutra.',               cat_mangal, 19999, 16999, 'Gold',     28, false, ARRAY['dual-pendant','unique','modern']),
('Lotus Mangalsutra',               'lotus-mangalsutra',                'Lotus flower pendant mangalsutra in 22k gold.',                                 'Lotus pendant mangalsutra.',                   cat_mangal, 23999, NULL,  'Gold',     32, true,  ARRAY['lotus','flower','spiritual']),
('Diamond Om Mangalsutra',          'diamond-om-mangalsutra',           'Sacred Om pendant mangalsutra with diamonds in white gold.',                    'Diamond Om mangalsutra.',                      cat_mangal, 33999, 28999, 'Diamond',  20, true,  ARRAY['om','spiritual','diamond'])
ON CONFLICT (slug) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- SETS (30)
-- ════════════════════════════════════════════════════════════
INSERT INTO products (name, slug, description, short_description, category_id, base_price, sale_price, material, stock, is_featured, tags) VALUES
('Bridal Kundan Set',               'bridal-kundan-set',                'Complete bridal kundan jewelry set — necklace, earrings, maang tikka.',         'Bridal kundan jewelry set.',                   cat_sets, 24999, 19999, 'Gold',     20, true,  ARRAY['bridal','kundan','complete']),
('Diamond Necklace Earring Set',    'diamond-necklace-earring-set',     'Matching diamond necklace and earring set in 18k gold.',                        'Diamond necklace and earring set.',            cat_sets, 54999, 47999, 'Diamond',  15, true,  ARRAY['diamond','matching','necklace']),
('Pearl Jewelry Set',               'pearl-jewelry-set',                'Three-piece pearl set — necklace, earrings, and bracelet.',                     'Three-piece pearl jewelry set.',               cat_sets, 18999, 15999, 'Gold',     25, true,  ARRAY['pearl','three-piece','classic']),
('Gold Temple Set',                 'gold-temple-set',                  'South Indian temple jewelry set with necklace and jhumka.',                     'South Indian temple jewelry set.',             cat_sets, 42999, NULL,  'Gold',     12, true,  ARRAY['temple','south-indian','bridal']),
('Silver Oxidised Set',             'silver-oxidised-set',              'Boho oxidised silver set — necklace, earrings, and bracelet.',                  'Oxidised silver jewelry set.',                 cat_sets, 4999,  3999,  'Silver',   50, false, ARRAY['oxidised','boho','silver']),
('Ruby Gold Set',                   'ruby-gold-set',                    'Ruby and diamond matching set — necklace and drop earrings.',                   'Ruby diamond jewelry set.',                    cat_sets, 38999, 33999, 'Gold',     15, true,  ARRAY['ruby','diamond','matching']),
('Meenakari Bridal Set',            'meenakari-bridal-set',             'Vibrant meenakari bridal set with necklace, earrings, and tikka.',              'Meenakari bridal jewelry set.',                cat_sets, 15999, 12999, 'Gold',     18, true,  ARRAY['meenakari','bridal','colorful']),
('Diamond Solitaire Set',           'diamond-solitaire-set',            'Classic solitaire diamond necklace and matching stud earrings.',                'Solitaire diamond set.',                       cat_sets, 64999, 55999, 'Diamond',  10, true,  ARRAY['solitaire','diamond','classic']),
('Gold Chain Set',                  'gold-chain-set',                   'Matching 22k gold chain necklace and bracelet set.',                            'Gold chain necklace and bracelet.',            cat_sets, 28999, NULL,  'Gold',     22, false, ARRAY['chain','gold','matching']),
('Emerald Bridal Set',              'emerald-bridal-set',               'Emerald and diamond bridal set — necklace, earrings, and ring.',                'Emerald bridal jewelry set.',                  cat_sets, 72999, 62999, 'Gold',     8,  true,  ARRAY['emerald','bridal','complete']),
('Sapphire Jewelry Set',            'sapphire-jewelry-set',             'Matching sapphire pendant and stud earring set in white gold.',                 'Sapphire jewelry set.',                        cat_sets, 29999, 24999, 'Gold',     18, true,  ARRAY['sapphire','matching','white-gold']),
('Antique Bridal Set',              'antique-bridal-set',               'Antique gold bridal set with necklace, earrings, bangles, and tikka.',          'Antique gold bridal set.',                     cat_sets, 55999, NULL,  'Gold',     10, true,  ARRAY['antique','bridal','complete']),
('Rose Gold Set',                   'rose-gold-set',                    'Rose gold pendant necklace and matching earring set.',                          'Rose gold jewelry set.',                       cat_sets, 19999, 16999, 'Rose Gold', 28, true,  ARRAY['rose-gold','pendant','matching']),
('Silver Gift Set',                 'silver-gift-set',                  'Sterling silver necklace and earring gift set in a beautiful box.',             'Silver gift jewelry set.',                     cat_sets, 5999,  4999,  'Silver',   45, false, ARRAY['silver','gift','boxed']),
('Coral Jewelry Set',               'coral-jewelry-set',                'Traditional coral and gold set — necklace and earrings.',                       'Coral gold jewelry set.',                      cat_sets, 12999, 10999, 'Gold',     30, false, ARRAY['coral','traditional','colorful']),
('Diamond Halo Set',                'diamond-halo-set',                 'Matching halo diamond pendant and earring set in 18k gold.',                    'Diamond halo jewelry set.',                    cat_sets, 44999, 38999, 'Diamond',  12, true,  ARRAY['halo','diamond','matching']),
('Navratna Jewelry Set',            'navratna-jewelry-set',             'Navratna gemstone set — necklace and earrings in gold.',                        'Navratna gemstone set.',                       cat_sets, 22999, 18999, 'Gold',     20, true,  ARRAY['navratna','gemstone','colorful']),
('Gold Bangles Ring Set',           'gold-bangles-ring-set',            'Matching gold bangles and ring set for weddings.',                              'Gold bangles and ring bridal set.',            cat_sets, 35999, NULL,  'Gold',     15, false, ARRAY['bangles','ring','bridal']),
('Kundan Choker Set',               'kundan-choker-set',                'Kundan choker necklace with matching jhumka earrings.',                         'Kundan choker jewelry set.',                   cat_sets, 9999,  8299,  'Gold',     35, true,  ARRAY['kundan','choker','jhumka']),
('Pearl Bridal Set',                'pearl-bridal-set',                 'Complete south sea pearl bridal set — necklace, earrings, and bracelet.',       'South sea pearl bridal set.',                  cat_sets, 34999, NULL,  'Gold',     12, true,  ARRAY['pearl','bridal','south-sea']),
('Amethyst Silver Set',             'amethyst-silver-set',              'Purple amethyst necklace and earring set in sterling silver.',                  'Amethyst silver jewelry set.',                 cat_sets, 6999,  5799,  'Silver',   40, false, ARRAY['amethyst','silver','purple']),
('Diamond Infinity Set',            'diamond-infinity-set',             'Infinity symbol diamond necklace and matching earrings.',                       'Diamond infinity jewelry set.',                cat_sets, 31999, 27499, 'Diamond',  18, true,  ARRAY['infinity','diamond','modern']),
('Rajasthani Folk Set',             'rajasthani-folk-set',              'Colorful Rajasthani folk jewelry set with necklace and earrings.',              'Rajasthani folk jewelry set.',                 cat_sets, 3999,  3299,  'Gold',     55, false, ARRAY['rajasthani','folk','colorful']),
('White Gold Diamond Set',          'white-gold-diamond-set',           'Elegant white gold and diamond necklace with earring set.',                     'White gold diamond set.',                      cat_sets, 49999, 42999, 'Diamond',  10, true,  ARRAY['white-gold','diamond','elegant']),
('Platinum Jewelry Set',            'platinum-jewelry-set',             'Matching platinum pendant and stud earring set.',                               'Platinum jewelry set.',                        cat_sets, 68999, 59999, 'Platinum', 8,  true,  ARRAY['platinum','matching','luxury']),
('Floral Gold Set',                 'floral-gold-set',                  'Flower-themed gold necklace and earring set.',                                  'Floral gold jewelry set.',                     cat_sets, 16999, 13999, 'Gold',     25, true,  ARRAY['floral','flower','gold']),
('Budget Silver Set',               'budget-silver-set',                'Affordable sterling silver necklace and earring set — perfect gift.',           'Budget silver gift set.',                      cat_sets, 2999,  2399,  'Silver',   60, false, ARRAY['budget','silver','gift']),
('Tanzanite Gold Set',              'tanzanite-gold-set',               'Rare tanzanite pendant and stud set in 18k gold.',                              'Tanzanite gold jewelry set.',                  cat_sets, 27999, NULL,  'Gold',     15, true,  ARRAY['tanzanite','rare','pendant']),
('Festive Necklace Set',            'festive-necklace-set',             'Lightweight gold necklace and earring set for festivals.',                      'Festive gold jewelry set.',                    cat_sets, 11999, 9999,  'Gold',     38, true,  ARRAY['festive','lightweight','gold']),
('Wedding Jewelry Set',             'wedding-jewelry-set',              'Complete wedding set — necklace, earrings, maang tikka, and nose ring.',        'Complete wedding jewelry set.',                cat_sets, 48999, 41999, 'Gold',     10, true,  ARRAY['wedding','complete','bridal'])
ON CONFLICT (slug) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- Add primary images for all products (Unsplash jewelry photos)
-- ════════════════════════════════════════════════════════════
INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
SELECT p.id,
  CASE
    WHEN p.category_id = (SELECT id FROM categories WHERE slug='rings')
      THEN 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80'
    WHEN p.category_id = (SELECT id FROM categories WHERE slug='necklaces')
      THEN 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'
    WHEN p.category_id = (SELECT id FROM categories WHERE slug='earrings')
      THEN 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80'
    WHEN p.category_id = (SELECT id FROM categories WHERE slug='bracelets')
      THEN 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80'
    WHEN p.category_id = (SELECT id FROM categories WHERE slug='mangalsutra')
      THEN 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80'
    WHEN p.category_id = (SELECT id FROM categories WHERE slug='sets')
      THEN 'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?w=800&q=80'
    ELSE 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'
  END,
  true, 0
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true
);

END $$;

SELECT
  c.name AS category,
  COUNT(p.id) AS product_count
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.name
ORDER BY c.name;
