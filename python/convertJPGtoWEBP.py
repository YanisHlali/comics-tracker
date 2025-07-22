import os
from PIL import Image

if os.name == 'nt':
    base_path = r'C:/Users/Yanis Hlali/code/ct/public/images'
else:
    base_path = r'./public/images'

periods = ['marvel_now', 'all_new_all_different', 'ultimate_universe']

folders = []
for period in periods:
    folders.extend([
        os.path.join(base_path, period, 'french_editions'),
        os.path.join(base_path, period, 'issues'),
        os.path.join(base_path, period, 'events'),
        os.path.join(base_path, period, 'volumes'),
    ])

for folder in folders:
    if not os.path.exists(folder):
        print(f"Dossier non trouvé : {folder}")
        continue

    for filename in os.listdir(folder):
        if filename.endswith('.jpg'):
            img_path = os.path.join(folder, filename)
            try:
                img = Image.open(img_path)

                webp_filename = filename.rsplit('.', 1)[0] + '.webp'
                img.save(os.path.join(folder, webp_filename), 'webp')
                print(f'{filename} dans {folder} converti en {webp_filename}')
            except Exception as e:
                print(f"Erreur lors de la conversion de {filename} : {e}")
