import os

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
        print(f"Le répertoire {folder} n'existe pas.")
        continue

    for filename in os.listdir(folder):
        if filename.endswith('.jpg'):
            file_path = os.path.join(folder, filename)

            try:
                os.remove(file_path)
                print(f'Fichier {filename} dans {folder} supprimé avec succès.')
            except Exception as e:
                print(f'Erreur lors de la suppression du fichier {filename} dans {folder}: {e}')
